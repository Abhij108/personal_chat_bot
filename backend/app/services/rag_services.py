from google import genai
import time
from sqlalchemy import text

from ..config import GEMINI_API_KEY

from .embedding_services import generate_embedding


client = genai.Client(
    api_key=GEMINI_API_KEY
)


def retrieve_chunks(db, query, limit=3):

    query_embedding = generate_embedding(query)

    sql = text("""
        SELECT
            id,
            document_id,
            content,
            page_number,
            1 - (
                embedding <=> CAST(:embedding AS vector)
            ) AS similarity

        FROM chunks

        WHERE embedding IS NOT NULL

        ORDER BY embedding <=> CAST(:embedding AS vector)

        LIMIT :limit
    """)

    result = db.execute(
        sql,
        {
            "embedding": str(query_embedding),
            "limit": limit
        }
    )

    chunks = result.fetchall()
    chunks = remove_duplicate_chunks(chunks)

    print("\n========== RETRIEVED CHUNKS ==========")

    for chunk in chunks:

        print(
            f"\nChunk ID: {chunk.id}"
        )

        print(
            f"Page: {chunk.page_number}"
        )

        print(
            f"Similarity: {chunk.similarity:.3f}"
        )

        print(
            f"Content: {chunk.content[:300]}"
        )

    print("=======================================\n")

    return chunks
def generate_answer(question, chunks):

    start = time.time()

    if not chunks:
        return "I couldn't find that information in your knowledge base."

    context_parts = []

    for chunk in chunks:

        context_parts.append(
            f"""
[Page {chunk.page_number}]
{chunk.content}
"""
        )

    context = "\n\n".join(context_parts)

    prompt = f"""
You are a personal knowledge-base assistant.

Answer the question using ONLY the provided context.

Important:

- Combine information from multiple sources.
- Do not repeat the same fact multiple times.
- Do not mention the same information repeatedly.
- Give one clear, concise answer.
- If multiple chunks contain the same information,
  treat them as one source of information.
- If the answer is not present in the context, say:

"I couldn't find that information in your knowledge base."

CONTEXT:

{context}

QUESTION:

{question}
"""


    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )

    print(
        f"LLM generation time: {time.time() - start:.2f}s"
    )

    return response.text


def remove_duplicate_chunks(chunks):

    unique_chunks = []

    seen = set()

    for chunk in chunks:

        # Normalize text
        normalized = " ".join(
            chunk.content.lower().split()
        )

        # Use first 500 characters as duplicate check
        key = normalized[:500]

        if key not in seen:

            seen.add(key)

            unique_chunks.append(chunk)

    return unique_chunks