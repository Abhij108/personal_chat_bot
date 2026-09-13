# 🧠 Personal Knowledge Base Chatbot

A **RAG-based Personal Knowledge Base Chatbot** that allows users to upload PDF documents and ask questions about their content using natural language.

The system extracts information from uploaded documents, converts it into vector embeddings, stores them in PostgreSQL with **pgvector**, retrieves relevant information, and uses **Google Gemini AI** to generate context-aware answers.

---

## 🎯 What, How & Why

### What?

A personal AI-powered knowledge assistant that lets you **upload PDFs and chat with your documents** instead of manually searching through them.

### How?

The application uses a **Retrieval-Augmented Generation (RAG)** pipeline:

1. Upload a PDF.
2. Extract text from the document.
3. Split the text into smaller chunks.
4. Generate vector embeddings using **Gemini Embeddings**.
5. Store embeddings in **PostgreSQL + pgvector**.
6. Convert the user's question into an embedding.
7. Find the most relevant document chunks using vector similarity search.
8. Send the retrieved context to **Gemini AI**.
9. Generate a context-aware answer.

### Why?

Traditional document search requires manually scanning large documents. This project makes personal knowledge **searchable, conversational, and easier to understand** using AI-powered semantic search.

---

## ✨ Features

* 📄 Upload PDF documents
* 🧠 AI-powered document Q&A
* 🔍 Semantic/vector search
* 📚 Retrieval-Augmented Generation (RAG)
* 🔢 Gemini text embeddings
* 🗄️ PostgreSQL database
* ⚡ pgvector similarity search
* 💬 Modern chatbot interface
* 📑 Document source references
* 📊 Source relevance scores
* 🆕 New chat in a separate browser tab
* 🔒 Environment variable based API key configuration
* ⚡ ~4.4 second end-to-end response time in local testing

---

## 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │      React UI       │
                    │     Vite Frontend   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      FastAPI        │
                    │       Backend       │
                    └──────────┬──────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
       ┌─────────────────┐          ┌─────────────────┐
       │   PDF Service   │          │   RAG Service   │
       │     pypdf       │          │ Retrieval + LLM │
       └────────┬────────┘          └────────┬────────┘
                │                            │
                ▼                            ▼
       ┌─────────────────┐          ┌─────────────────┐
       │ Chunking        │          │ Gemini AI       │
       │ Service         │          │ Embeddings + LLM│
       └────────┬────────┘          └────────┬────────┘
                │                            │
                └──────────────┬─────────────┘
                               ▼
                    ┌─────────────────────┐
                    │ PostgreSQL +        │
                    │ pgvector            │
                    └─────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend

* Python
* FastAPI
* SQLAlchemy

### AI / ML

* Google Gemini API
* `gemini-embedding-001`
* Gemini Flash
* Retrieval-Augmented Generation (RAG)

### Database

* PostgreSQL
* pgvector

### Document Processing

* pypdf
* Custom text chunking

### DevOps

* Docker
* Docker Compose
* Git / GitHub

---

## 📁 Project Structure

```text
personal_chat/
│
├── docker-compose.yml
├── .gitignore
│
├── backend/
│   ├── .env
│   ├── requirements.txt
│   ├── uploads/
│   │
│   └── app/
│       ├── __init__.py
│       ├── main.py
│       ├── config.py
│       ├── database.py
│       ├── models.py
│       ├── init_db.py
│       │
│       └── services/
│           ├── __init__.py
│           ├── pdf_service.py
│           ├── chunking_service.py
│           ├── embedding_service.py
│           └── rag_service.py
│
└── frontend/
    ├── package.json
    └── src/
        ├── App.jsx
        ├── App.css
        └── main.jsx
```

---

# 🚀 Setup Instructions

## 1. Clone the Repository

```bash
git clone https://github.com/Abhij108/personal_knowledge_base_chatbot.git
cd personal_knowledge_base_chatbot
```

---

## 2. Create Python Virtual Environment

```bash
python3 -m venv virtual
```

Activate it:

```bash
source virtual/bin/activate
```

You should see:

```text
(virtual)
```

in your terminal.

---

## 3. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

---

## 4. Configure Environment Variables

Create:

```text
backend/app/.env
```

Add:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/knowledge_base
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

### ⚠️ Important

Never commit `.env` to GitHub.

Your `.gitignore` should contain:

---

# 🐘 5. Start PostgreSQL + pgvector

Go back to the project root:

```bash
cd ..

```
Start Docker:
```bash
docker compose up -d
```

Check the container:

```bash
docker ps
```

You should see:

```text
knowledge-postgres
```

---

# 🗄️ 6. Initialize the Database

Make sure your virtual environment is active.

From the project root:

```bash
python -m app.init_db
```

If you are inside `backend`, use:

```bash
cd backend
python -m app.init_db
```

Expected output:

```text
Database initialized successfully.
```

---

# ▶️ 7. Start the Backend

From the `backend` directory:

```bash
uvicorn app.main:app --reload
```

The API will run at:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

---

# 💻 8. Start the Frontend

Open another terminal.

Go to:

```bash
cd ~/Desktop/personal_chat/frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

You should see something similar to:

```text
Local: http://localhost:5173/
```

Open the URL in your browser.

---

# 📄 9. Upload a Document

1. Open the frontend.
2. Click **Attach PDF**.
3. Select a PDF.
4. Click **Upload**.
5. The backend extracts the PDF text.
6. Text is divided into chunks.
7. Gemini generates embeddings.
8. Embeddings are stored in PostgreSQL.
9. The document status changes to `indexed`.

---

# 💬 10. Ask Questions

After uploading a document, enter a question such as:

```text
What are the main topics covered in this document?
```

or:

```text
Explain the concept of machine learning mentioned in the document.
```

The RAG system retrieves relevant chunks and Gemini generates the answer using that context.

---

# 🔄 RAG Pipeline

```text
PDF
 │
 ▼
Text Extraction
 │
 ▼
Text Chunking
 │
 ▼
Gemini Embeddings
 │
 ▼
PostgreSQL + pgvector
 │
 │
 │ User Question
 ▼
Question Embedding
 │
 ▼
Vector Similarity Search
 │
 ▼
Relevant Chunks
 │
 ▼
Gemini LLM
 │
 ▼
AI Answer
```

---

# 🔌 API Endpoints

| Method | Endpoint            | Description             |
| ------ | ------------------- | ----------------------- |
| GET    | `/`                 | Check API status        |
| POST   | `/documents/upload` | Upload and index PDF    |
| GET    | `/documents`        | List uploaded documents |
| POST   | `/chat`             | Ask questions           |

FastAPI Swagger documentation:

```text
http://127.0.0.1:8000/docs
```

---

# ⚡ Performance

During local testing, the approximate response breakdown was:

```text
Embedding generation     ~0.52 sec
Database vector search   ~0.01 sec
LLM generation           ~3.89 sec
--------------------------------
Total                    ~4.42 sec
```

The database vector search is very fast, while LLM generation is the primary contributor to response latency.

---

# 🔐 Security

API keys are stored using environment variables instead of hardcoding them in the source code.

Example:

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

The `.env` file should **never be pushed to GitHub**.

If an API key is accidentally committed, revoke/rotate it immediately.

---

# 🔮 Future Improvements

* [ ] Streaming AI responses
* [ ] Better semantic chunking
* [ ] Batch embedding generation
* [ ] Conversation history
* [ ] User authentication
* [ ] Multiple knowledge bases
* [ ] Delete documents
* [ ] Document preview
* [ ] Clickable PDF citations
* [ ] Exact page-level source navigation
* [ ] Support for DOCX, TXT and web pages
* [ ] Cloud deployment
* [ ] Redis caching
* [ ] Background document processing
* [ ] Hybrid keyword + vector search

---

# 🎓 Learning Outcomes

This project demonstrates practical experience with:

* **RAG architecture**
* **LLM integration**
* **Vector databases**
* **Semantic search**
* **Embeddings**
* **FastAPI REST APIs**
* **React frontend development**
* **PostgreSQL**
* **pgvector**
* **Docker**
* **Environment-based configuration**
* **Git/GitHub**

---

# 👨‍💻 Project Highlights

### What

Built an AI-powered personal knowledge assistant for conversational document search.

### How

Implemented a RAG pipeline using PDF extraction, text chunking, Gemini embeddings, pgvector similarity search, and Gemini LLM generation.

### Why

To make large personal documents easier to search, understand, and interact with using natural language.

---

## 📜 License

This project is for educational and portfolio purposes.
