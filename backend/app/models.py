from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    DateTime
)

from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector

from .database import Base


class Document(Base):

    __tablename__ = "documents"

    id = Column(Integer, primary_key=True)

    filename = Column(String(255), nullable=False)

    file_path = Column(String(500), nullable=False)

    status = Column(
        String(50),
        default="processing"
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )


class Chunk(Base):

    __tablename__ = "chunks"

    id = Column(Integer, primary_key=True)

    document_id = Column(
        Integer,
        ForeignKey("documents.id"),
        nullable=False
    )

    content = Column(Text, nullable=False)

    chunk_index = Column(Integer)

    page_number = Column(Integer)

    token_count = Column(Integer)

    embedding = Column(
        Vector(3072)
    )