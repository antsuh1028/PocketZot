from uuid import uuid4

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/api/users", tags=["users"])


class UserCreate(BaseModel):
	name: str
	email: EmailStr


class UserResponse(BaseModel):
	id: str
	name: str
	email: EmailStr


_users: dict[str, UserResponse] = {}


@router.get("", response_model=list[UserResponse])
async def list_users() -> list[UserResponse]:
	return list(_users.values())


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(payload: UserCreate) -> UserResponse:
	user = UserResponse(id=str(uuid4()), name=payload.name, email=payload.email)
	_users[user.id] = user
	return user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str) -> UserResponse:
	if user_id not in _users:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
	return _users[user_id]
