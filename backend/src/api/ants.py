from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

router = APIRouter(prefix="/api/ants", tags=["ants"])

MIN_ANTS = 0
ALLOWED_ANT_STEPS = {-3, 2}
ANT_HEALTH_MULTIPLIER = 12


class AntCreate(BaseModel):
	uid: int


class AntResponse(BaseModel):
	id: int
	uid: int
	count: int


class AntsDelta(BaseModel):
	delta: int



@router.get("", response_model=list[AntResponse])
async def list_ants(request: Request) -> list[AntResponse]:
	query = text(
		"""
		SELECT id, uid, count
		FROM ants
		ORDER BY id
		"""
	)
	with request.app.state.db_engine.connect() as connection:
		rows = connection.execute(query).mappings().all()
	return [AntResponse.model_validate(row) for row in rows]


@router.get("/user/{uid}", response_model=list[AntResponse])
async def list_ants_by_user(uid: int, request: Request) -> list[AntResponse]:
	query = text(
		"""
		SELECT id, uid, count
		FROM ants
		WHERE uid = :uid
		ORDER BY id
		"""
	)
	with request.app.state.db_engine.connect() as connection:
		rows = connection.execute(query, {"uid": uid}).mappings().all()
	return [AntResponse.model_validate(row) for row in rows]


@router.post("", response_model=AntResponse, status_code=status.HTTP_201_CREATED)
async def create_ant(payload: AntCreate, request: Request) -> AntResponse:
	query = text(
		"""
		INSERT INTO ants (uid)
		VALUES (:uid)
		RETURNING id, uid, count
		"""
	)
	try:
		with request.app.state.db_engine.begin() as connection:
			row = connection.execute(
				query,
				{"uid": payload.uid},
			).mappings().one()
	except IntegrityError as exc:
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail="Invalid uid or ant data",
		) from exc

	return AntResponse.model_validate(row)


@router.get("/{ant_id}", response_model=AntResponse)
async def get_ant(ant_id: int, request: Request) -> AntResponse:
	query = text(
		"""
		SELECT id, uid, count
		FROM ants
		WHERE id = :ant_id
		"""
	)
	with request.app.state.db_engine.connect() as connection:
		row = connection.execute(query, {"ant_id": ant_id}).mappings().first()

	if row is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ant not found")

	return AntResponse.model_validate(row)

@router.delete("/{ant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ant(ant_id: int, request: Request) -> None:
	query = text(
		"""
		DELETE FROM ants
		WHERE id = :ant_id
		"""
	)
	with request.app.state.db_engine.begin() as connection:
		result = connection.execute(query, {"ant_id": ant_id})

	if result.rowcount == 0:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ant not found")

class UserAntsResponse(BaseModel):
	id: int
	name: str
	email: str
	count: int
	health: int
	anteater_name: str | None
	anteater_id: int | None


@router.patch("/user/{uid}/count")
async def update_user_ants(uid: int, payload: AntsDelta, request: Request) -> UserAntsResponse:
	if payload.delta not in ALLOWED_ANT_STEPS:
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail=(
				f"delta must be one of {sorted(ALLOWED_ANT_STEPS)}"
			),
		)

	# Get current state
	fetch_query = text(
		"""
		SELECT users.id, users.name, users.email,
		       COALESCE(ants.count, 0) as current_ants,
		       COALESCE(anteater.health, 0) as current_health,
		       anteater.id as anteater_id,
		       anteater.name as anteater_name
		FROM users
		LEFT JOIN ants ON users.id = ants.uid
		LEFT JOIN anteater ON anteater.uid = users.id AND anteater.is_dead = FALSE
		WHERE users.id = :uid
		"""
	)

	with request.app.state.db_engine.connect() as connection:
		current = connection.execute(fetch_query, {"uid": uid}).mappings().first()

	if current is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

	current_ants = current["current_ants"]
	current_health = current["current_health"]
	anteater_id = current["anteater_id"]
	scaled_delta = payload.delta * ANT_HEALTH_MULTIPLIER

	# Calculate final values based on healing or damage
	if payload.delta > 0:
		# HEALING: add to ants, apply scaled to health, overflow back to ants
		new_ants = current_ants + payload.delta
		new_health = current_health + scaled_delta
		
		if new_health > 100:
			excess_health = new_health - 100
			excess_ants = excess_health  # 1:1 conversion
			new_health = 100
			new_ants += excess_ants
		
		ant_final = new_ants
		health_final = new_health
	else:
		# DAMAGE: ants absorb multiplied damage first, remainder hits health
		multiplied_damage = abs(scaled_delta)

		if current_ants >= multiplied_damage:
			ant_final = current_ants - multiplied_damage
			health_final = current_health
		else:
			remaining_damage = abs(ant_final - current_ants) 
			ant_final = 0
			health_final = max(0, current_health -remaining_damage)

	# Update queries
	upsert_ants_query = text(
		"""
		INSERT INTO ants (uid, count)
		VALUES (:uid, :count)
		ON CONFLICT (uid) DO UPDATE
		SET count = :count
		"""
	)

	update_anteater_query = text(
		"""
		UPDATE anteater
		SET health = :health,
		    is_dead = (:health <= 0)
		WHERE uid = :uid AND is_dead = FALSE
		RETURNING id
		"""
	)

	with request.app.state.db_engine.begin() as connection:
		# Update ant count
		connection.execute(
			upsert_ants_query,
			{"uid": uid, "count": ant_final},
		)
		
		# Update anteater health if exists
		if anteater_id:
			connection.execute(
				update_anteater_query,
				{"uid": uid, "health": health_final},
			)

	# Return updated state
	return UserAntsResponse(
		id=current["id"],
		name=current["name"],
		email=current["email"],
		count=int(ant_final),
		health=int(health_final),
		anteater_name=current["anteater_name"],
		anteater_id=current["anteater_id"],
	)