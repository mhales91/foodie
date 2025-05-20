import os
from pathlib import Path
from dotenv import load_dotenv
import psycopg2

# point at parent .env
here       = Path(__file__).parent
dotenv_pth = here.parent / ".env"
load_dotenv(dotenv_pth)

db_url = os.getenv("DATABASE_URL")
if not db_url:
    raise SystemExit("DATABASE_URL not set")

# connect and truncate
conn = psycopg2.connect(db_url)
cur  = conn.cursor()
cur.execute("TRUNCATE TABLE recipes RESTART IDENTITY CASCADE;")
conn.commit()
cur.close()
conn.close()
print("✓ All recipes removed")