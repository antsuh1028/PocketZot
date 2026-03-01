"""
Run the accessories migration without psql.
From project root:  python backend/scripts/run_migration.py
From backend:      python scripts/run_migration.py
"""
import sys
from pathlib import Path

# Add backend/src so we can import db
backend_src = Path(__file__).resolve().parents[1] / "src"
sys.path.insert(0, str(backend_src))

from sqlalchemy import text

from db import get_db_engine

MIGRATION_SQL = """
ALTER TABLE accessories ADD COLUMN IF NOT EXISTS type VARCHAR(50) NOT NULL DEFAULT 'hat';
UPDATE accessories SET price = 1 WHERE type = 'hat';
INSERT INTO accessories (name, price, type, image_url, description)
SELECT 'Plumber', 1, 'hat', 'dist/anteaterchar/assets/Plumber.png', 'Plumber hat'
WHERE NOT EXISTS (SELECT 1 FROM accessories WHERE name = 'Plumber');
INSERT INTO accessories (name, price, type, image_url, description)
SELECT 'Merrier', 1, 'hat', 'dist/anteaterchar/assets/Merrier.png', 'Merrier hat'
WHERE NOT EXISTS (SELECT 1 FROM accessories WHERE name = 'Merrier');
"""


def main():
    engine = get_db_engine()
    for stmt in MIGRATION_SQL.strip().split(";"):
        stmt = stmt.strip()
        if not stmt:
            continue
        try:
            with engine.begin() as conn:
                conn.execute(text(stmt))
            print("OK:", stmt[:60] + "...")
        except Exception as e:
            print("Error:", stmt[:60], "-", e)
            raise
    print("Migration done.")


if __name__ == "__main__":
    main()
