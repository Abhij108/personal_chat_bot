import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";


function App() {

  const [file, setFile] = useState(null);

  const [uploading, setUploading] = useState(false);

  const [documents, setDocuments] = useState([]);

  const [question, setQuestion] = useState("");

  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(false);


  // --------------------------------------------------
  // LOAD DOCUMENTS
  // --------------------------------------------------

  const loadDocuments = async () => {

    try {

      const response = await fetch(
        `${API_URL}/documents`
      );

      const data = await response.json();

      setDocuments(data);

    } catch (error) {

      console.error(
        "Failed to load documents:",
        error
      );

    }

  };


  useEffect(() => {

    loadDocuments();

  }, []);


  // --------------------------------------------------
  // UPLOAD PDF
  // --------------------------------------------------

  const uploadDocument = async () => {

    if (!file) {

      alert("Please select a PDF first.");

      return;
    }


    setUploading(true);


    try {

      const formData = new FormData();

      formData.append(
        "file",
        file
      );


      const response = await fetch(
        `${API_URL}/documents/upload`,
        {
          method: "POST",
          body: formData
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail || "Upload failed"
        );

      }


      setFile(null);

      document.getElementById(
        "file-input"
      ).value = "";


      await loadDocuments();


      alert(
        "Document indexed successfully!"
      );


    } catch (error) {

      console.error(error);

      alert(error.message);


    } finally {

      setUploading(false);

    }

  };


  // --------------------------------------------------
  // ASK QUESTION
  // --------------------------------------------------

  const askQuestion = async () => {

    if (!question.trim() || loading) {

      return;

    }


    const currentQuestion =
      question.trim();


    // Add user message

    setMessages((previous) => [

      ...previous,

      {
        role: "user",
        content: currentQuestion
      }

    ]);


    setQuestion("");

    setLoading(true);


    try {

      const response = await fetch(

        `${API_URL}/chat?question=${encodeURIComponent(
          currentQuestion
        )}`,

        {
          method: "POST"
        }

      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Failed to get answer"
        );

      }


      // Add assistant message

      setMessages((previous) => [

        ...previous,

        {
          role: "assistant",
          content: data.answer,
          sources: data.sources || []
        }

      ]);


    } catch (error) {

      console.error(error);


      setMessages((previous) => [

        ...previous,

        {
          role: "assistant",
          content:
            "Sorry, something went wrong. Please try again.",
          sources: []
        }

      ]);


    } finally {

      setLoading(false);

    }

  };


  // --------------------------------------------------
  // ENTER TO SEND
  // --------------------------------------------------

  const handleKeyDown = (event) => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      askQuestion();

    }

  };


  // --------------------------------------------------
  // CLEAR CHAT
  // --------------------------------------------------

  const clearChat = () => {

    setMessages([]);

  };


  return (

    <div className="app">

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-icon">
            🧠
          </div>

          <div>

            <h1>
              Second Brain
            </h1>

            <span>
              Personal Knowledge Base
            </span>

          </div>

        </div>


        {/* New Chat */}

        <button
          className="new-chat-btn"
          onClick={clearChat}
        >

          <span>＋</span>

          New Chat

        </button>


        {/* Documents */}

        <div className="documents-section">

          <div className="section-title">

            <span>
              YOUR DOCUMENTS
            </span>

            <span className="document-count">
              {documents.length}
            </span>

          </div>


          <div className="document-list">

            {documents.length === 0 ? (

              <div className="empty-documents">

                <div>
                  📄
                </div>

                <p>
                  No documents yet
                </p>

                <small>
                  Upload a PDF to get started
                </small>

              </div>

            ) : (

              documents.map((doc) => (

                <div
                  className="document-item"
                  key={doc.id}
                >

                  <div className="document-icon">
                    PDF
                  </div>

                  <div className="document-info">

                    <div
                      className="document-name"
                      title={doc.filename}
                    >
                      {doc.filename}
                    </div>

                    <div className="document-status">

                      <span
                        className={
                          doc.status === "indexed"
                            ? "status-dot indexed"
                            : "status-dot"
                        }
                      />

                      {doc.status}

                    </div>

                  </div>

                </div>

              ))

            )}

          </div>

        </div>


        <div className="sidebar-footer">

          <div>
            🔒
          </div>

          <span>
            Your knowledge stays yours
          </span>

        </div>

      </aside>


      {/* =========================================
          MAIN
      ========================================= */}

      <main className="main">

        {/* Header */}

        <header className="topbar">

          <div>

            <h2>
              Knowledge Assistant
            </h2>

            <p>
              Ask questions about your documents
            </p>

          </div>


          <div className="status">

            <span className="online-dot" />

            AI Ready

          </div>

        </header>


        {/* Chat */}

        <div className="chat-container">

          {messages.length === 0 && (

            <div className="welcome">

              <div className="welcome-icon">
                🧠
              </div>

              <h2>
                Your knowledge,
                <br />
                <span>one conversation away.</span>
              </h2>

              <p>
                Upload your notes, textbooks,
                documentation or PDFs and ask
                questions about them.
              </p>


              <div className="suggestions">

                <button
                  onClick={() =>
                    setQuestion(
                      "Summarize my document"
                    )
                  }
                >
                  ✨ Summarize my document
                </button>

                <button
                  onClick={() =>
                    setQuestion(
                      "What are the main topics?"
                    )
                  }
                >
                  📚 Main topics
                </button>

                <button
                  onClick={() =>
                    setQuestion(
                      "Explain the important concepts"
                    )
                  }
                >
                  💡 Important concepts
                </button>

              </div>

            </div>

          )}


          {/* Messages */}

          {messages.map(
            (message, index) => (

              <div
                className={`message-row ${message.role}`}
                key={index}
              >

                <div className="avatar">

                  {message.role === "user"
                    ? "You"
                    : "AI"}

                </div>


                <div className="message-content">

                  <div className="message-label">

                    {message.role === "user"
                      ? "You"
                      : "Knowledge Assistant"}

                  </div>


                  <div className="message-text">

                    {message.content}

                  </div>


                  {/* SOURCES */}

                  {message.sources &&
                    message.sources.length > 0 && (

                      <div className="sources">

                        <div className="sources-title">

                          📚 Sources

                        </div>


                        {message.sources.map(
                          (source) => (

                            <div
                              className="source-card"
                              key={source.chunk_id}
                            >

                              <div className="source-header">

                                <span>
                                  📄
                                </span>

                                <strong>
                                  Document #
                                  {source.document_id}
                                </strong>

                                <span className="page">
                                  Page {source.page}
                                </span>

                              </div>


                              <p>
                                {source.content}
                              </p>


                              <div className="similarity">

                                Relevance{" "}

                                <span>
                                  {(
                                    source.similarity *
                                    100
                                  ).toFixed(0)}
                                  %
                                </span>

                              </div>

                            </div>

                          )
                        )}

                      </div>

                    )}

                </div>

              </div>

            )
          )}


          {/* Loading */}

          {loading && (

            <div className="message-row assistant">

              <div className="avatar">
                AI
              </div>

              <div className="message-content">

                <div className="message-label">
                  Knowledge Assistant
                </div>

                <div className="typing">

                  <span />
                  <span />
                  <span />

                  <em>
                    Thinking...
                  </em>

                </div>

              </div>

            </div>

          )}

        </div>


        {/* =====================================
            INPUT AREA
        ===================================== */}

        <div className="input-area">

          <div className="upload-bar">

            <div className="file-select">

              <input
                id="file-input"
                type="file"
                accept=".pdf"
                onChange={(event) =>
                  setFile(
                    event.target.files[0]
                  )
                }
              />

              <label htmlFor="file-input">

                📎

                <span>
                  {file
                    ? file.name
                    : "Attach PDF"}
                </span>

              </label>

            </div>


            {file && (

              <button
                className="upload-btn"
                onClick={uploadDocument}
                disabled={uploading}
              >

                {uploading
                  ? "Indexing..."
                  : "Upload"}

              </button>

            )}

          </div>


          <div className="chat-input">

            <textarea

              value={question}

              onChange={(event) =>
                setQuestion(
                  event.target.value
                )
              }

              onKeyDown={handleKeyDown}

              placeholder="Ask anything about your knowledge base..."

              rows={1}

            />


            <button
              className="send-btn"
              onClick={askQuestion}
              disabled={
                !question.trim() ||
                loading
              }
            >

              ➤

            </button>

          </div>


          <div className="input-hint">

            Press
            <kbd>
              Enter
            </kbd>
            to send ·
            <kbd>
              Shift + Enter
            </kbd>
            for new line

          </div>

        </div>

      </main>

    </div>

  );
}


export default App;