import os
import shutil

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    Depends,
    HTTPException
)

from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session

from .database import get_db
from .models import Document, Chunk

from .services.pdf_services import extract_pdf
from .services.chunking_services import chunk_text
from .services.embedding_services import generate_embedding
from .services.rag_services import (
    retrieve_chunks,
    generate_answer
)


app = FastAPI(
    title="Personal Knowledge Base API"
)


app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


UPLOAD_DIR = "uploads"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


@app.get("/")
def root():

    return {
        "message": "Knowledge Base API is running"
    }


@app.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    if not file.filename.lower().endswith(".pdf"):

        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported."
        )


    file_path = os.path.join(
        UPLOAD_DIR,
        file.filename
    )


    with open(file_path, "wb") as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )


    document = Document(

        filename=file.filename,

        file_path=file_path,

        status="processing"
    )


    db.add(document)

    db.commit()

    db.refresh(document)


    try:

        pages = extract_pdf(
            file_path
        )


        for page in pages:

            chunks = chunk_text(
                page["text"]
            )


            for index, content in enumerate(
                chunks
            ):

                embedding = generate_embedding(
                    content
                )


                chunk = Chunk(

                    document_id=document.id,

                    content=content,

                    chunk_index=index,

                    page_number=page[
                        "page_number"
                    ],

                    token_count=len(
                        content.split()
                    ),

                    embedding=embedding
                )


                db.add(chunk)


        document.status = "indexed"

        db.commit()


        return {

            "message": "Document indexed successfully",

            "document_id": document.id,

            "filename": document.filename
        }


    except Exception as e:

        document.status = "failed"

        db.commit()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.get("/documents")
def get_documents(
    db: Session = Depends(get_db)
):

    documents = db.query(
        Document
    ).order_by(
        Document.created_at.desc()
    ).all()


    return [

        {
            "id": doc.id,

            "filename": doc.filename,

            "status": doc.status,

            "created_at": doc.created_at
        }

        for doc in documents
    ]


@app.post("/chat")
def chat(
    question: str,
    db: Session = Depends(get_db)
):

    chunks = retrieve_chunks(
        db,
        question,
        limit=3
    )


    if not chunks:

        return {
            "answer":
            "I couldn't find that information in your knowledge base.",

            "sources": []
        }


    answer = generate_answer(
        question,
        chunks
    )


    sources = [

        {
            "chunk_id": chunk.id,

            "document_id": chunk.document_id,

            "page": chunk.page_number,

            "similarity": float(
                chunk.similarity
            ),

            "content": chunk.content
        }

        for chunk in chunks
    ]


    return {

        "answer": answer,

        "sources": sources
    }