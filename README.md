# ⚡ PALLU — Your AI Research Companion

<p align="center">
  <strong>Think Deeper. Research Smarter. Discover More.</strong>
  <br/>
  An AI-powered research companion built to turn complex questions into clear, useful answers.
</p>

<p align="center">
  <a href="https://research-agent-1-m8p4.onrender.com">🚀 Live Demo</a> •
  <a href="https://github.com/prashant-singh-78/research-agent">💻 Source Code</a> •
  <a href="https://research-agent-fv0t.onrender.com/health">🩺 API Health</a>
</p>

---

## 🧠 Meet PALLU

**PALLU is an AI-powered research assistant designed to make exploring ideas, understanding complex topics, and asking questions easier.**

Whether you're learning a new concept, exploring scientific research, or looking for a straightforward explanation, PALLU aims to provide a simple interface for interacting with AI.

The vision is simple: **make research feel less complicated and knowledge more accessible.**

## ✨ Key Features

- 💬 **AI-Powered Conversations** — Ask questions and explore ideas through natural-language interaction.
- 🔬 **Research-Oriented Queries** — Investigate technical, scientific, and general topics.
- 🌐 **Web-Based Access** — Use the deployed application through your browser.
- 🧠 **Gemini Integration** — Uses Google's Gemini API for AI-generated responses.
- ⚡ **FastAPI Backend** — A Python-based API layer for processing requests.
- 🌍 **Multilingual Interaction** — Designed to support language-aware responses.
- 🛠️ **System Diagnostics** — Backend health endpoint to help check service status.

## 🖥️ Screenshots

Add your actual application screenshots to the `screenshots/` directory.

### 🏠 Application Interface

![PALLU Application Interface](screenshots/home.png)

### 💬 AI Chat

![PALLU Chat Interface](screenshots/chat.png)

### ⚙️ System Diagnostics

![PALLU System Diagnostics](screenshots/settings.png)

> Replace the image paths above with your actual screenshot filenames if they differ.

## 🏗️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite |
| Backend | Python, FastAPI |
| AI Provider | Google Gemini API |
| Deployment | Render |
| Version Control | Git and GitHub |

## 🔗 Live Deployment

| Service | Link |
|---|---|
| 🌐 Frontend | [Launch PALLU](https://research-agent-1-m8p4.onrender.com) |
| ⚙️ Backend API | [Open Backend](https://research-agent-fv0t.onrender.com) |
| 🩺 Health Check | [Check API Status](https://research-agent-fv0t.onrender.com/health) |

## 🚀 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/prashant-singh-78/research-agent.git
cd research-agent
```

### 2. Configure environment variables

Create a `.env` file in the backend directory and configure your Gemini API key according to the backend's environment-variable setup.

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash
```

**Security:** Never commit your real API key to GitHub.

### 3. Install backend dependencies

Activate your Python virtual environment, then install the dependencies using the project's requirements file.

```bash
pip install -r requirements.txt
```

Run these commands from the directory containing `requirements.txt`. If the file is inside `backend/`, first enter that directory.

### 4. Start the FastAPI server

From the directory containing `main.py`, run:

```bash
uvicorn main:app --reload --port 8000
```

### 5. Start the frontend

Open a separate terminal in the frontend directory and run:

```bash
npm install
npm run dev
```

Use the local URL printed by Vite to open the application. Configure the frontend API endpoint to point to your local backend.

> Local setup commands may need adjustment depending on the repository's actual folder structure and entry points.

## 🔐 Environment & Security

- Store API keys in environment variables.
- Keep `.env` files out of version control.
- Use `.env.example` to document required configuration without exposing secrets.
- Configure the correct backend URL for local and production environments.

## 🎯 Project Vision

PALLU aims to evolve into a more capable AI research companion that helps users:

- Understand difficult concepts in simpler language.
- Explore scientific and technical questions.
- Discover useful research resources.
- Learn through conversational interactions.
- Turn curiosity into structured exploration.

These are development goals, not a guarantee that every capability is already implemented.

## 🛣️ Future Possibilities

- 📚 Better academic-paper discovery and source attribution.
- 🔎 More reliable web search and citation verification.
- 🗂️ Research history and saved conversations.
- 📄 Exportable research summaries.
- 🧪 Deeper evaluation of answer quality and factual accuracy.

## 🤝 Contributing

Ideas, bug reports, and improvements are welcome. Fork the repository, create a feature branch, and submit a pull request.

## 👨‍💻 Author

**Prashant Singh**

AI & Machine Learning | Python | Full-Stack Development

[GitHub Profile](https://github.com/prashant-singh-78)

---

<p align="center">
  <strong>Built with curiosity. Powered by AI. Designed for discovery. ⚡</strong>
</p>
