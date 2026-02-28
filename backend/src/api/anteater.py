from typing import Annotated

from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

router = APIRouter(prefix="/api/anteaters", tags=["anteaters"])

ALLOWED_HEALTH_INCREMENTS = {-20, -10, -5, 5, 10, 20}
MIN_HEALTH = 0

IsDeadAlias = Annotated[
	bool,
	Field(validation_alias="isDead", serialization_alias="isDead"),
]


class AnteaterCreate(BaseModel):
	name: str
	health: int = 100
	is_dead: IsDeadAlias = False
	uid: int

	model_config = ConfigDict(populate_by_name=True)


class AnteaterResponse(BaseModel):
	id: int
	name: str
	health: int
	is_dead: IsDeadAlias
	uid: int

	model_config = ConfigDict(populate_by_name=True)


class AnteaterHealthDelta(BaseModel):
	delta: int


@router.get("", response_model=list[AnteaterResponse])
async def list_anteaters(request: Request) -> list[AnteaterResponse]:
	query = text(
		"""
		SELECT id, name, health, is_dead, uid
		FROM anteater
		ORDER BY id
		"""
	)
	with request.app.state.db_engine.connect() as connection:
		rows = connection.execute(query).mappings().all()
	return [AnteaterResponse.model_validate(row) for row in rows]


@router.post("", response_model=AnteaterResponse, status_code=status.HTTP_201_CREATED)
async def create_anteater(payload: AnteaterCreate, request: Request) -> AnteaterResponse:
	query = text(
		"""
		INSERT INTO anteater (name, health, is_dead, uid)
		VALUES (:name, :health, :is_dead, :uid)
		RETURNING id, name, health, is_dead, uid
		"""
	)
	try:
		with request.app.state.db_engine.begin() as connection:
			row = connection.execute(
				query,
				{
					"name": payload.name,
					"health": payload.health,
					"is_dead": payload.is_dead,
					"uid": payload.uid,
				},
			).mappings().one()
	except IntegrityError as exc:
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail="Invalid uid or anteater data",
		) from exc

	return AnteaterResponse.model_validate(row)


@router.get("/{anteater_id}", response_model=AnteaterResponse)
async def get_anteater(anteater_id: int, request: Request) -> AnteaterResponse:
	query = text(
		"""
		SELECT id, name, health, is_dead, uid
		FROM anteater
		WHERE id = :anteater_id
		"""
	)
	with request.app.state.db_engine.connect() as connection:
		row = connection.execute(query, {"anteater_id": anteater_id}).mappings().first()

	if row is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Anteater not found")

	return AnteaterResponse.model_validate(row)

@router.patch("/{anteater_id}/health", response_model=AnteaterResponse)
async def update_anteater_health(
	anteater_id: int,
	payload: AnteaterHealthDelta,
	request: Request,
) -> AnteaterResponse:
	if payload.delta not in ALLOWED_HEALTH_INCREMENTS:
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail=(
				f"delta must be one of {sorted(ALLOWED_HEALTH_INCREMENTS)}"
			),
		)

	# Get current anteater and total ant count for user
	fetch_query = text(
		"""
		SELECT a.id, a.name, a.health, a.is_dead, a.uid,
		       COALESCE(SUM(ants.count), 0) as total_ants
		FROM anteater a
		LEFT JOIN ants ON ants.uid = a.uid
		WHERE a.id = :anteater_id
		GROUP BY a.id, a.name, a.health, a.is_dead, a.uid
		"""
	)

	with request.app.state.db_engine.connect() as connection:
		current = connection.execute(fetch_query, {"anteater_id": anteater_id}).mappings().first()

	if current is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Anteater not found")

	uid = current["uid"]
	current_health = current["health"]
	total_ants = current["total_ants"]

	# Calculate damage/healing flow
	if payload.delta < 0:
		# DAMAGE: ants absorb first, then health takes remainder
		damage = abs(payload.delta)
		ants_absorbed = min(damage, total_ants)
		remaining_damage = damage - ants_absorbed
		
		new_health = max(MIN_HEALTH, current_health - remaining_damage)
		ant_delta = -ants_absorbed
		excess_ants = 0
	else:
		# HEALING: apply to health, overflow becomes ants
		new_health = current_health + payload.delta
		excess_ants = max(0, new_health - 100)
		new_health = min(new_health, 100)
		ant_delta = excess_ants

	# Update queries
	update_anteater_query = text(
		"""
		UPDATE anteater
		SET
			health = :new_health,
			is_dead = (:new_health <= 0)
		WHERE id = :anteater_id
		RETURNING id, name, health, is_dead, uid
		"""
	)

	update_ants_query = text(
		"""
		UPDATE ants
		SET count = GREATEST(0, count + :ant_delta)
		WHERE uid = :uid
		"""
	)

	with request.app.state.db_engine.begin() as connection:
		# Update anteater health
		row = connection.execute(
			update_anteater_query,
			{
				"anteater_id": anteater_id,
				"new_health": new_health,
			},
		).mappings().first()

		# Update ant count if needed
		if ant_delta != 0:
			connection.execute(
				update_ants_query,
				{"uid": uid, "ant_delta": ant_delta},
			)

	return AnteaterResponse.model_validate(row)

@router.patch("/{anteater_id}/dead", response_model=AnteaterResponse)
async def dead_anteater(anteater_id: int, request: Request) -> AnteaterResponse:
	check_query = text(
		"""
		SELECT id, name, health, is_dead, uid
		FROM anteater
		WHERE id = :anteater_id
		"""
	)
	with request.app.state.db_engine.connect() as connection:
		existing = connection.execute(check_query, {"anteater_id": anteater_id}).mappings().first()

	if existing is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Anteater not found")

	if existing["is_dead"]:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Anteater is already dead")

	# Update to dead
	update_query = text(
		"""
		UPDATE anteater
		SET is_dead = TRUE
		WHERE id = :anteater_id
		RETURNING id, name, health, is_dead, uid
		"""
	)
	with request.app.state.db_engine.begin() as connection:
		row = connection.execute(
			update_query,
			{"anteater_id": anteater_id},
		).mappings().first()

	return AnteaterResponse.model_validate(row)
