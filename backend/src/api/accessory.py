from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

router = APIRouter(prefix="/api/accessories", tags=["accessories"])


class AccessoryCreate(BaseModel):
	name: str
	price: int
	image_url: str | None = None
	description: str | None = None


class AccessoryResponse(BaseModel):
	id: int
	name: str
	price: int
	type: str
	image_url: str | None
	description: str | None


class UserAccessoryResponse(BaseModel):
	id: int
	uid: int
	accessory_id: int
	anteater_id: int | None
	name: str
	price: int
	type: str
	image_url: str | None
	description: str | None


class ShopAccessoryResponse(BaseModel):
	id: int
	name: str
	price: int
	type: str
	image_url: str | None
	description: str | None
	owned: bool
	user_accessory_id: int | None = None


class EquipRequest(BaseModel):
	pass


# Get all accessories (shop catalog)
@router.get("", response_model=list[AccessoryResponse])
async def list_accessories(request: Request) -> list[AccessoryResponse]:
	query = text(
		"""
		SELECT id, name, price, type, image_url, description
		FROM accessories
		ORDER BY id
		"""
	)
	with request.app.state.db_engine.connect() as connection:
		rows = connection.execute(query).mappings().all()
	return [AccessoryResponse.model_validate(row) for row in rows]


# Get single accessory
@router.get("/{accessory_id}", response_model=AccessoryResponse)
async def get_accessory(accessory_id: int, request: Request) -> AccessoryResponse:
	query = text(
		"""
		SELECT id, name, price, type, image_url, description
		FROM accessories
		WHERE id = :accessory_id
		"""
	)
	with request.app.state.db_engine.connect() as connection:
		row = connection.execute(query, {"accessory_id": accessory_id}).mappings().first()

	if row is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Accessory not found")

	return AccessoryResponse.model_validate(row)


# Create accessory (admin)
# @router.post("", response_model=AccessoryResponse, status_code=status.HTTP_201_CREATED)
# async def create_accessory(payload: AccessoryCreate, request: Request) -> AccessoryResponse:
# 	query = text(
# 		"""
# 		INSERT INTO accessories (name, price, image_url, description)
# 		VALUES (:name, :price, :image_url, :description)
# 		RETURNING id, name, price, image_url, description
# 		"""
# 	)
# 	try:
# 		with request.app.state.db_engine.begin() as connection:
# 			row = connection.execute(
# 				query,
# 				{
# 					"name": payload.name,
# 					"price": payload.price,
# 					"image_url": payload.image_url,
# 					"description": payload.description,
# 				},
# 			).mappings().one()
# 	except IntegrityError as exc:
# 		raise HTTPException(
# 			status_code=status.HTTP_400_BAD_REQUEST,
# 			detail="Invalid accessory data",
# 		) from exc

# 	return AccessoryResponse.model_validate(row)


# Get user's inventory
@router.get("/user/{uid}/inventory", response_model=list[UserAccessoryResponse])
async def get_user_inventory(uid: int, request: Request) -> list[UserAccessoryResponse]:
	query = text(
		"""
		SELECT ha.id, ha.uid, ha.accessory_id, ha.anteater_id,
		       a.name, a.price, a.type, a.image_url, a.description
		FROM has_accessory ha
		JOIN accessories a ON ha.accessory_id = a.id
		WHERE ha.uid = :uid
		ORDER BY ha.id DESC
		"""
	)
	with request.app.state.db_engine.connect() as connection:
		rows = connection.execute(query, {"uid": uid}).mappings().all()
	return [UserAccessoryResponse.model_validate(row) for row in rows]


# Buy accessory
@router.post("/user/{uid}/buy/{accessory_id}", response_model=UserAccessoryResponse)
async def buy_accessory(uid: int, accessory_id: int, request: Request) -> UserAccessoryResponse:
	# Get user's current ants and accessory price
	fetch_query = text(
		"""
		SELECT users.ants as current_ants
		FROM users
		WHERE users.id = :uid
		"""
	)

	with request.app.state.db_engine.connect() as connection:
		user = connection.execute(fetch_query, {"uid": uid}).mappings().first()

	if user is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

	# Get accessory price
	accessory_query = text(
		"""
		SELECT price FROM accessories WHERE id = :accessory_id
		"""
	)
	with request.app.state.db_engine.connect() as connection:
		accessory = connection.execute(accessory_query, {"accessory_id": accessory_id}).mappings().first()

	if accessory is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Accessory not found")

	price = accessory["price"]
	current_ants = user["current_ants"]

	if current_ants < price:
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail="Insufficient ants to purchase this accessory",
		)

	# Deduct ants and create has_accessory record
	update_ants_query = text(
		"""
		UPDATE users
		SET ants = ants - :price
		WHERE id = :uid
		"""
	)

	insert_accessory_query = text(
		"""
		INSERT INTO has_accessory (uid, accessory_id)
		VALUES (:uid, :accessory_id)
		RETURNING id, uid, accessory_id, anteater_id
		"""
	)

	get_accessory_details = text(
		"""
		SELECT ha.id, ha.uid, ha.accessory_id, ha.anteater_id,
		       a.name, a.price, a.type, a.image_url, a.description
		FROM has_accessory ha
		JOIN accessories a ON ha.accessory_id = a.id
		WHERE ha.id = :id
		"""
	)

	with request.app.state.db_engine.begin() as connection:
		# Deduct ants
		connection.execute(
			update_ants_query,
			{"uid": uid, "price": price},
		)

		# Create purchase record
		purchase = connection.execute(
			insert_accessory_query,
			{"uid": uid, "accessory_id": accessory_id},
		).mappings().first()

		# Get full details
		result = connection.execute(
			get_accessory_details,
			{"id": purchase["id"]},
		).mappings().first()

	return UserAccessoryResponse.model_validate(result)


# Get all accessories for shop with ownership status
@router.get("/user/{uid}/shop", response_model=list[ShopAccessoryResponse])
async def get_shop_view(uid: int, request: Request) -> list[ShopAccessoryResponse]:
	query = text(
		"""
		SELECT a.id, a.name, a.price, a.type, a.image_url, a.description,
		       CASE WHEN ha.id IS NOT NULL THEN TRUE ELSE FALSE END as owned,
		       ha.id as user_accessory_id
		FROM accessories a
		LEFT JOIN has_accessory ha ON a.id = ha.accessory_id AND ha.uid = :uid
		ORDER BY a.id
		"""
	)
	with request.app.state.db_engine.connect() as connection:
		rows = connection.execute(query, {"uid": uid}).mappings().all()
	return [ShopAccessoryResponse.model_validate(row) for row in rows]


# Equip accessory to anteater
@router.patch("/{user_accessory_id}/equip", response_model=UserAccessoryResponse)
async def equip_accessory(
	user_accessory_id: int,
	request: Request,
) -> UserAccessoryResponse:
	# Verify user_accessory exists and get uid + type
	verify_query = text(
		"""
		SELECT ha.uid, a.type
		FROM has_accessory ha
		JOIN accessories a ON ha.accessory_id = a.id
		WHERE ha.id = :id
		"""
	)
	with request.app.state.db_engine.connect() as connection:
		user_acc = connection.execute(verify_query, {"id": user_accessory_id}).mappings().first()

	if user_acc is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User accessory not found")

	uid = user_acc["uid"]
	accessory_type = user_acc["type"]

	# Find alive anteater for this user
	find_anteater = text(
		"""
		SELECT id FROM anteater WHERE uid = :uid AND is_dead = FALSE
		"""
	)
	with request.app.state.db_engine.connect() as connection:
		anteater = connection.execute(find_anteater, {"uid": uid}).mappings().first()

	if anteater is None:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User has no alive anteater")

	anteater_id = anteater["id"]

	# Unequip any existing accessory of the same type on this anteater
	unequip_same_type = text(
		"""
		UPDATE has_accessory
		SET anteater_id = NULL
		WHERE anteater_id = :anteater_id
		AND uid = :uid
		AND accessory_id IN (
			SELECT id FROM accessories WHERE type = :type
		)
		"""
	)

	# Equip the new accessory
	update_query = text(
		"""
		UPDATE has_accessory
		SET anteater_id = :anteater_id
		WHERE id = :id
		"""
	)

	get_details = text(
		"""
		SELECT ha.id, ha.uid, ha.accessory_id, ha.anteater_id,
		       a.name, a.price, a.type, a.image_url, a.description
		FROM has_accessory ha
		JOIN accessories a ON ha.accessory_id = a.id
		WHERE ha.id = :id
		"""
	)

	with request.app.state.db_engine.begin() as connection:
		# Unequip same type
		connection.execute(
			unequip_same_type,
			{"anteater_id": anteater_id, "uid": uid, "type": accessory_type},
		)
		# Equip new one
		connection.execute(
			update_query,
			{"id": user_accessory_id, "anteater_id": anteater_id},
		)
		result = connection.execute(get_details, {"id": user_accessory_id}).mappings().first()

	return UserAccessoryResponse.model_validate(result)


# Unequip accessory
@router.patch("/{user_accessory_id}/unequip", response_model=UserAccessoryResponse)
async def unequip_accessory(user_accessory_id: int, request: Request) -> UserAccessoryResponse:
	update_query = text(
		"""
		UPDATE has_accessory
		SET anteater_id = NULL
		WHERE id = :id
		"""
	)

	get_details = text(
		"""
		SELECT ha.id, ha.uid, ha.accessory_id, ha.anteater_id,
		       a.name, a.price, a.type, a.image_url, a.description
		FROM has_accessory ha
		JOIN accessories a ON ha.accessory_id = a.id
		WHERE ha.id = :id
		"""
	)

	with request.app.state.db_engine.begin() as connection:
		connection.execute(update_query, {"id": user_accessory_id})
		result = connection.execute(get_details, {"id": user_accessory_id}).mappings().first()

	if result is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User accessory not found")

	return UserAccessoryResponse.model_validate(result)


# Get anteater's equipped accessories
@router.get("/user/{uid}/equipped", response_model=list[UserAccessoryResponse])
async def get_anteater_accessories(uid: int, request: Request) -> list[UserAccessoryResponse]:
	# Find alive anteater for this user
	find_anteater = text(
		"""
		SELECT id FROM anteater WHERE uid = :uid AND is_dead = FALSE
		"""
	)
	with request.app.state.db_engine.connect() as connection:
		anteater = connection.execute(find_anteater, {"uid": uid}).mappings().first()

	if anteater is None:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User has no alive anteater")

	anteater_id = anteater["id"]

	# Get equipped accessories for this anteater
	query = text(
		"""
		SELECT ha.id, ha.uid, ha.accessory_id, ha.anteater_id,
		       a.name, a.price, a.type, a.image_url, a.description
		FROM has_accessory ha
		JOIN accessories a ON ha.accessory_id = a.id
		WHERE ha.anteater_id = :anteater_id
		ORDER BY ha.id
		"""
	)
	with request.app.state.db_engine.connect() as connection:
		rows = connection.execute(query, {"anteater_id": anteater_id}).mappings().all()
	return [UserAccessoryResponse.model_validate(row) for row in rows]

#flag
# Get specific user accessory
@router.get("/user-accessories/{id}", response_model=UserAccessoryResponse)
async def get_user_accessory(id: int, request: Request) -> UserAccessoryResponse:
	query = text(
		"""
		SELECT ha.id, ha.uid, ha.accessory_id, ha.anteater_id,
		       a.name, a.price, a.type, a.image_url, a.description
		FROM has_accessory ha
		JOIN accessories a ON ha.accessory_id = a.id
		WHERE ha.id = :id
		"""
	)
	with request.app.state.db_engine.connect() as connection:
		row = connection.execute(query, {"id": id}).mappings().first()

	if row is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User accessory not found")

	return UserAccessoryResponse.model_validate(row)


# Clear all user accessories (dev/testing)
@router.post("/user/{uid}/clear-inventory", status_code=status.HTTP_204_NO_CONTENT)
async def clear_user_inventory(uid: int, request: Request) -> None:
	query = text("DELETE FROM has_accessory WHERE uid = :uid")
	with request.app.state.db_engine.begin() as connection:
		connection.execute(query, {"uid": uid})


# Delete/sell user accessory
@router.delete("/user-accessories/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_accessory(id: int, request: Request) -> None:
	query = text(
		"""
		DELETE FROM has_accessory
		WHERE id = :id
		"""
	)
	with request.app.state.db_engine.begin() as connection:
		result = connection.execute(query, {"id": id})

	if result.rowcount == 0:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User accessory not found")
