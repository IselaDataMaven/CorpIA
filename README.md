<div align="center">

# 🚀 CorpIA

### Enterprise AI Knowledge Assistant

**An enterprise-grade AI platform built with FastAPI, Docker and Retrieval-Augmented Generation (RAG).**

<p>

![Python](https://img.shields.io/badge/Python-3.12-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)
![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite)
![JWT](https://img.shields.io/badge/JWT-Authentication-black?style=for-the-badge)
![Swagger](https://img.shields.io/badge/OpenAPI-Swagger-85EA2D?style=for-the-badge&logo=swagger)

</p>

---

### 🌐 Live API

**Production**

https://corpia.onrender.com

### 📖 Swagger Documentation

https://corpia.onrender.com/docs

### ❤️ Health Check

https://corpia.onrender.com/health

</div>

---

# 📖 Overview

CorpIA is an enterprise-ready AI backend designed to centralize document management, Retrieval-Augmented Generation (RAG), AI model administration, authentication, and knowledge search through a modern REST API.

It was built following production-oriented practices including Docker containerization, automatic deployment, JWT authentication, modular architecture and interactive API documentation.

---

# ✨ Features

- 🔐 JWT Authentication
- 🤖 AI Model Management
- 📄 Intelligent Document Upload
- 📚 Retrieval-Augmented Generation (RAG)
- 💬 AI Chat API
- 👥 User Administration
- ⚙️ System Configuration
- 📊 Dashboard Metrics
- 📁 File Management
- 📖 Automatic Swagger Documentation
- 🐳 Docker Ready
- ☁️ Cloud Deployment

---

# 🏗 Architecture

```text
                   ┌──────────────────────┐
                   │      Frontend        │
                   │ React / Vue / Next   │
                   └──────────┬───────────┘
                              │ REST API
                              ▼
                   ┌──────────────────────┐
                   │      FastAPI         │
                   │       CorpIA         │
                   └──────────┬───────────┘
                              │
        ┌─────────────────────┼────────────────────┐
        ▼                     ▼                    ▼
 Authentication          Document RAG         AI Models
        │                     │                    │
        └───────────────Database───────────────────┘
```

---

# 📂 Project Structure

```text
CorpIA/

├── backend
│   ├── app
│   │   ├── api
│   │   ├── core
│   │   ├── db
│   │   ├── rag
│   │   ├── schemas
│   │   └── services
│   │
│   ├── data
│   ├── Dockerfile
│   ├── main.py
│   └── requirements.txt
│
├── frontend
│
├── docs
│
├── qa
│
└── docker-compose.yml
```

---

# 🚀 API Modules

| Module | Description |
|---------|-------------|
| Authentication | JWT Login & Security |
| Chat | AI Conversations |
| Documents | Upload, Preview & Delete |
| Models | AI Model Administration |
| Users | User Management |
| Dashboard | Metrics |
| Settings | Configuration |
| System | Server Information |

---

# 🧠 Technologies

| Backend | DevOps | AI |
|----------|---------|----|
| Python | Docker | RAG |
| FastAPI | Render | LLM Ready |
| SQLAlchemy | GitHub | Embeddings |
| Pydantic | Swagger | Vector Search |
| SQLite | Docker Compose | ChromaDB |

---

# 🔌 REST Endpoints

| Method | Endpoint |
|----------|-----------|
| GET | / |
| GET | /health |
| POST | /api/auth/login |
| POST | /api/chat |
| POST | /api/documents/upload |
| GET | /api/models |
| GET | /api/users |
| GET | /api/dashboard |

See the complete documentation in Swagger:

https://corpia.onrender.com/docs

---

# 🐳 Docker

Build

```bash
docker build -t corpia .
```

Run

```bash
docker run -p 8000:8000 corpia
```

---

# ⚙ Local Installation

Clone repository

```bash
git clone https://github.com/IselaDataMaven/CorpIA.git
```

Enter project

```bash
cd CorpIA/backend
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run

```bash
uvicorn main:app --reload
```

Open

```
http://localhost:8000/docs
```

---

# ☁ Deployment

The backend is containerized with Docker and automatically deployed using Render.

Production URL

```
https://corpia.onrender.com
```

---

# 📸 Screenshots

## Swagger UI

> Add a screenshot of the deployed API documentation.

## Dashboard

> Add future frontend screenshots.

---

# 🔮 Roadmap

- [x] FastAPI Backend
- [x] Docker
- [x] JWT Authentication
- [x] Document Management
- [x] RAG Integration
- [x] Swagger Documentation
- [x] Cloud Deployment
- [ ] React Frontend
- [ ] PostgreSQL
- [ ] Redis Cache
- [ ] Kubernetes
- [ ] CI/CD Pipeline
- [ ] Multi-model AI Support

---

# 🤝 Contributing

Contributions, issues and feature requests are welcome.

Feel free to fork this project and submit a Pull Request.

---

# 👩‍💻 Author

**IselaDataMaven**

GitHub

https://github.com/IselaDataMaven

---

<div align="center">

### ⭐ If you found this project useful, consider giving it a Star.

Built with ❤️ using FastAPI, Docker and Artificial Intelligence.

</div>
