# PALLU — AI Research Assistant

PALLU is an AI-powered research assistant that helps users explore topics, ask questions, and understand complex information through a simple chat interface.

The project combines a React frontend with a Python FastAPI backend and Google's Gemini API to generate AI-powered responses.

## Features

- AI-powered chat and question answering
- Research-focused queries
- Simple and user-friendly interface
- Language-aware responses
- FastAPI backend
- Backend health monitoring
- Online deployment

## Tech Stack

- **Frontend:** React, Vite
- **Backend:** Python, FastAPI
- **AI Model:** Google Gemini
- **Deployment:** Render
- **Version Control:** Git and GitHub

## Live Demo

- **Application:** https://research-agent-1-m8p4.onrender.com
- **Backend API:** https://research-agent-fv0t.onrender.com
- **Health Check:** https://research-agent-fv0t.onrender.com/health

## Screenshots

### Home Page

![PALLU Home Page](screenshots/home.png)

### Chat Interface

![PALLU Chat Interface](screenshots/chat.png)

### Settings & Diagnostics

![PALLU Settings](screenshots/settings.png)

*Make sure the screenshots are uploaded to the `screenshots` folder in the repository.*

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/prashant-singh-78/research-agent.git
cd research-agent
```

### 2. Install backend dependencies

Navigate to the directory containing `requirements.txt` and run:

```bash
pip install -r requirements.txt
```

### 3. Start the backend

From the directory containing `main.py`, run:

```bash
uvicorn main:app --reload --port 8000
```

### 4. Start the frontend

Navigate to the frontend directory and run:

```bash
npm install
npm run dev
```

Open the local URL displayed in your terminal. Make sure the frontend is configured to use the correct backend URL.

## Project Goal

The goal of PALLU is to make AI-assisted learning and research more accessible by providing a straightforward way to explore ideas and ask questions.

## Future Improvements

- Improved research source discovery
- More reliable citations and references
- Research history and saved conversations
- Exportable research summaries
- Better answer evaluation

## Author

**Prashant Singh**

AI & Machine Learning | Python | Full-Stack Development

GitHub: https://github.com/prashant-singh-78

---

*Built with curiosity and a passion for AI.*
