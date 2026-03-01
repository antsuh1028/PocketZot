from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import text

router = APIRouter(prefix="/api/users", tags=["users"])


class UserCreate(BaseModel):
	name: str
	email: EmailStr


class UserResponse(BaseModel):
	id: int
	name: str
	email: EmailStr
	ants: int


@router.get("", response_model=list[UserResponse])
async def list_users(request: Request) -> list[UserResponse]:
	query = text(
		"""
		SELECT id, name, email, COALESCE(ants, 0) AS ants
		FROM users
		ORDER BY id
		"""
	)
	with request.app.state.db_engine.connect() as connection:
		rows = connection.execute(query).mappings().all()
	return [UserResponse.model_validate(row) for row in rows]


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(payload: UserCreate, request: Request) -> UserResponse:
	query = text(
		"""
		INSERT INTO users (name, email)
		VALUES (:name, :email)
		ON CONFLICT (email)
		DO UPDATE SET name = EXCLUDED.name
		RETURNING id, name, email, COALESCE(ants, 0) AS ants
		"""
	)
	with request.app.state.db_engine.begin() as connection:
		row = connection.execute(
			query,
			{"name": payload.name, "email": str(payload.email)},
		).mappings().one()

	return UserResponse.model_validate(row)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, request: Request) -> UserResponse:
	query = text(
		"""
		SELECT id, name, email, COALESCE(ants, 0) AS ants
		FROM users
		WHERE id = :user_id
		"""
	)
	with request.app.state.db_engine.connect() as connection:
		row = connection.execute(query, {"user_id": user_id}).mappings().first()

	if row is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

	return UserResponse.model_validate(row)

@router.get("/email/{email}", response_model=UserResponse)
async def get_user_by_email(email: str, request: Request) -> UserResponse:
	query = text(
		"""
		SELECT id, name, email, COALESCE(ants, 0) AS ants
		FROM users
		WHERE email = :email
		"""
	)
	with request.app.state.db_engine.connect() as connection:
		row = connection.execute(query, {"email": str(email)}).mappings().first()

	if row is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

	return UserResponse.model_validate(row)