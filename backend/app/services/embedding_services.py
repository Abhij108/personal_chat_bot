# from openai import OpenAI

# from ..config import OPENAI_API_KEY


# client = OpenAI(
#     api_key=OPENAI_API_KEY
# )


# def generate_embedding(text):

#     response = client.embeddings.create(
#         model="text-embedding-3-small",
#         input=text
#     )

#     return response.data[0].embedding
from google import genai

from ..config import GEMINI_API_KEY


client = genai.Client(
    api_key=GEMINI_API_KEY
)


def generate_embedding(text):

    response = client.models.embed_content(
        model="gemini-embedding-001",
        contents=text
    )

    return response.embeddings[0].values