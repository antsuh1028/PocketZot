from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


class EchoRequest(BaseModel):
	message: str


def create_app() -> FastAPI:
	app = FastAPI(
		title="PocketZot API",
		version="0.1.0",
		description="Backend template for PocketZot.",
	)

	app.add_middleware(
		CORSMiddleware,
		allow_origins=["*"],
		allow_credentials=True,
		allow_methods=["*"],
		allow_headers=["*"],
	)

	@app.get("/")
	async def root() -> dict[str, str]:
		return {"service": "PocketZot API", "status": "ok"}

	@app.get("/health")
	async def health() -> dict[str, str]:
		return {
			"status": "healthy",
			"timestamp": datetime.now(timezone.utc).isoformat(),
		}

	@app.post("/api/echo")
	async def echo(payload: EchoRequest) -> dict[str, str]:
		return {"echo": payload.message}

	return app


app = create_app()
