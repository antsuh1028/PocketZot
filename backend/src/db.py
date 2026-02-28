import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

_ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(_ENV_PATH)


def get_database_url() -> str:
	database_url = os.getenv("DB_CONNECTION")
	if not database_url:
		raise RuntimeError("DB_CONNECTION is not set in backend/.env")
	return database_url


def get_db_engine() -> Engine:
	return create_engine(get_database_url(), pool_pre_ping=True)


def check_db_connection(engine: Engine) -> bool:
	try:
		with engine.connect() as connection:
			connection.execute(text("SELECT 1"))
		return True
	except Exception:
		return False
