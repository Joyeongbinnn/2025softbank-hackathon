import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

host = os.getenv("YOITANG_HOST")
username = os.getenv("DB_USER")
password = os.getenv("DB_PASSWORD")
database = os.getenv("YOITANG_DB")

DB_URL = f'postgresql://{username}:{password}@{host}/{database}'

engine = create_engine(DB_URL)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()