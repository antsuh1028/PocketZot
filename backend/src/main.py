from datetime import datetime, timezone
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .api.anteater import router as anteater_router
from .api.ants import router as ants_router
from .api.user import router as user_router
from .api.accessory import router as accessory_router
from .db import check_db_connection, get_db_engine


class EchoRequest(BaseModel):
	message: str


def create_app() -> FastAPI:
	@asynccontextmanager
	async def lifespan(app_instance: FastAPI):
		app_instance.state.db_engine = get_db_engine()
		yield
		app_instance.state.db_engine.dispose()

	app = FastAPI(
		title="PocketZot API",
		version="0.1.0",
		description="Backend template for PocketZot.",
		lifespan=lifespan,
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
		db_connected = check_db_connection(app.state.db_engine)
		return {
			"status": "healthy" if db_connected else "degraded",
			"database": "connected" if db_connected else "disconnected",
			"timestamp": datetime.now(timezone.utc).isoformat(),
		}

	@app.post("/api/echo")
	async def echo(payload: EchoRequest) -> dict[str, str]:
		return {"echo": payload.message}

	app.include_router(user_router)
	app.include_router(anteater_router)
	app.include_router(ants_router)
	app.include_router(accessory_router)

	return app


app = create_app()
