from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy import text

router = APIRouter(prefix="/api/ants", tags=["ants"])

ALLOWED_ANT_STEPS = range(-3, 3)
ANT_HEALTH_MULTIPLIER = 12


class AntsDelta(BaseModel):
	delta: int


class PurchaseDelta(BaseModel):
	delta: int


class UserAntsResponse(BaseModel):
	id: int
	name: str
	email: str
	ants: int
	health: int
	anteater_name: str | None
	anteater_id: int | None


# Get user's ant count
@router.get("/user/{uid}")
async def get_user_ants(uid: int, request: Request) -> dict:
	query = text(
		"""
		SELECT id, name, email, ants
		FROM users
		WHERE id = :uid
		"""
	)
	with request.app.state.db_engine.connect() as connection:
		row = connection.execute(query, {"uid": uid}).mappings().first()

	if row is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

	return {
		"id": row["id"],
		"name": row["name"],
		"email": row["email"],
		"ants": row["ants"],
	}


# Update user ant count with health multiplier effects
@router.patch("/user/{uid}/count")
async def update_user_ants(uid: int, payload: AntsDelta, request: Request) -> UserAntsResponse:
	if payload.delta not in ALLOWED_ANT_STEPS:
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail=(f"delta must be one of {sorted(ALLOWED_ANT_STEPS)}")
		)

	# Get current state
	fetch_query = text(
		"""
		SELECT users.id, users.name, users.email, users.ants as current_ants,
		       COALESCE(anteater.health, 0) as current_health,
		       anteater.id as anteater_id,
		       anteater.name as anteater_name
		FROM users
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
		# HEALING: convert delta to health via multiplier, overflow back to ants
		new_health = current_health + scaled_delta
		new_ants = current_ants  # Don't add delta directly

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
			remaining_damage = multiplied_damage - current_ants
			ant_final = 0
			health_final = max(0, current_health - remaining_damage)

	# Update queries
	update_ants_query = text(
		"""
		UPDATE users
		SET ants = :count
		WHERE id = :uid
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
			update_ants_query,
			{"uid": uid, "count": int(ant_final)},
		)

		# Update anteater health if exists
		if anteater_id:
			connection.execute(
				update_anteater_query,
				{"uid": uid, "health": int(health_final)},
			)

	# Return updated state
	return UserAntsResponse(
		id=current["id"],
		name=current["name"],
		email=current["email"],
		ants=int(ant_final),
		health=int(health_final),
		anteater_name=current["anteater_name"],
		anteater_id=current["anteater_id"],
	)


# Spend ants on purchase
@router.patch("/user/{uid}/purchase")
async def purchase_ants(uid: int, payload: PurchaseDelta, request: Request) -> UserAntsResponse:
	if payload.delta < 0:
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail="delta must be a positive integer representing the number of ants to purchase",
		)

	# Get current state
	fetch_query = text(
		"""
		SELECT users.id, users.name, users.email, users.ants as current_ants,
		       COALESCE(anteater.health, 0) as current_health,
		       anteater.id as anteater_id,
		       anteater.name as anteater_name
		FROM users
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

	if current_ants - payload.delta < 0:
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail="Insufficient ants for purchase"
		)

	new_ants = current_ants - payload.delta

	# Update query
	update_ants_query = text(
		"""
		UPDATE users
		SET ants = :count
		WHERE id = :uid
		"""
	)

	with request.app.state.db_engine.begin() as connection:
		connection.execute(
			update_ants_query,
			{"uid": uid, "count": new_ants},
		)

	return UserAntsResponse(
		id=current["id"],
		name=current["name"],
		email=current["email"],
		ants=new_ants,
		health=int(current_health),
		anteater_name=current["anteater_name"],
		anteater_id=current["anteater_id"],
	)