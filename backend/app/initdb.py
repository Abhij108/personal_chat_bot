from sqlalchemy import text

from .database import engine, Base
from .models import Document, Chunk


def init_database():

    with engine.connect() as connection:

        connection.execute(
            text("CREATE EXTENSION IF NOT EXISTS vector")
        )

        connection.commit()

    Base.metadata.create_all(
        bind=engine
    )


if __name__ == "__main__":
    init_database()

    print("Database initialized successfully.")