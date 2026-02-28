from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter(prefix="/api/anteaters", tags=["anteaters"])


class AnteaterCreate(BaseModel):
	name: str
	major: str | None = None


class AnteaterResponse(BaseModel):
	id: int
	name: str
	major: str | None = None


_anteaters: dict[int, AnteaterResponse] = {
	1: AnteaterResponse(id=1, name="Peter", major="Computer Science"),
	2: AnteaterResponse(id=2, name="Zot", major="Informatics"),
}


@router.get("", response_model=list[AnteaterResponse])
async def list_anteaters() -> list[AnteaterResponse]:
	return list(_anteaters.values())


@router.post("", response_model=AnteaterResponse, status_code=status.HTTP_201_CREATED)
async def create_anteater(payload: AnteaterCreate) -> AnteaterResponse:
	next_id = max(_anteaters.keys(), default=0) + 1
	created = AnteaterResponse(id=next_id, name=payload.name, major=payload.major)
	_anteaters[next_id] = created
	return created


@router.get("/{anteater_id}", response_model=AnteaterResponse)
async def get_anteater(anteater_id: int) -> AnteaterResponse:
	if anteater_id not in _anteaters:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Anteater not found")
	return _anteaters[anteater_id]
