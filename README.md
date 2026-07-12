<p align="center">

<img src="docs/images/banner.png" width="100%"/>

</p>

<h1 align="center">

💜 CorpIA

### Enterprise AI Knowledge Assistant

FastAPI • React • RAG • Oracle Cloud Infrastructure

</h1>

<p align="center">

<img src="https://img.shields.io/badge/Python-3.12-blue?style=for-the-badge&logo=python">

<img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi">

<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react">

<img src="https://img.shields.io/badge/Vite-purple?style=for-the-badge&logo=vite">

<img src="https://img.shields.io/badge/TailwindCSS-38BDF8?style=for-the-badge&logo=tailwindcss">

<img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker">

<img src="https://img.shields.io/badge/Oracle%20Cloud-F80000?style=for-the-badge&logo=oracle">

<img src="https://img.shields.io/github/license/IselaDataMaven/CorpIA?style=for-the-badge">

</p>

---

# 🚀 Overview

CorpIA is an **Enterprise AI Knowledge Assistant**
capable of answering organizational questions through
Retrieval-Augmented Generation (RAG).

Instead of hallucinating answers,
CorpIA searches your organization's documentation,
retrieves the most relevant information,
and generates grounded responses using Large Language Models.

Designed following enterprise architecture principles inspired by:

- Microsoft Copilot
- Notion AI
- Oracle AI
- Azure OpenAI

---

# 🎬 Demo

> (Replace with your GIF)

<p align="center">

<img src="docs/demo/demo.gif">

</p>

---

# ✨ Features

✅ Enterprise Authentication

✅ Role Based Access

✅ Document Upload

✅ Automatic Knowledge Base

✅ Semantic Search

✅ Retrieval Augmented Generation

✅ AI Chat

✅ Dark / Light Mode

✅ Docker Support

✅ Oracle Cloud Ready

---

# 📸 Screenshots

## Login

<img src="docs/images/login.png">

---

## Dashboard

<img src="docs/images/dashboard.png">

---

## AI Chat

<img src="docs/images/chat.png">

---

## Documents

<img src="docs/images/documents.png">

---

# 🏗 Architecture

<img src="docs/images/architecture.png">

---

## Frontend

React 19

Vite

TailwindCSS

React Router

Axios

Context API

---

## Backend

FastAPI

Python

SQLAlchemy

SQLite

JWT

Pydantic

---

## Artificial Intelligence

Retrieval Augmented Generation

Document Loader

Chunking

Embeddings

Vector Store

Retriever

Prompt Engineering

LLM Integration

---

# 📂 Project Structure

```text
CorpIA
│
├── backend
│
│   ├── app
│   ├── api
│   ├── rag
│   ├── db
│   ├── services
│   └── schemas
│
├── frontend
│
│   ├── components
│   ├── pages
│   ├── context
│   ├── layouts
│   └── api
│
├── docs
│
├── qa
│
└── docker-compose.yml
```

---

# 🧠 RAG Pipeline

```
PDF

↓

Loader

↓

Chunking

↓

Embeddings

↓

Vector Database

↓

Retriever

↓

Prompt

↓

LLM

↓

Answer
```

---

# ⚡ Installation

## Backend

```bash
cd backend

python -m venv venv

source venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --reload
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

## Docker

```bash
docker compose up --build
```

---

# 🌎 Oracle Cloud Deployment

The production architecture uses Oracle Cloud Infrastructure.

Components:

✅ Oracle Compute

✅ Oracle Object Storage

✅ OCI Vault

✅ Oracle Container Registry

✅ Docker

✅ NGINX

Deployment Guide:

```
docs/DEPLOY_ORACLE_CLOUD.md
```

---

# 🔒 Security

JWT Authentication

Password Hashing

Protected Routes

Role Based Access

Environment Variables

OCI Vault Ready

---

# 🧪 Testing

```bash
pytest
```

---

# 👨‍💻 Technologies

| Backend | Frontend | AI | Cloud |
|----------|----------|------|------|
| FastAPI | React | RAG | Oracle Cloud |
| SQLAlchemy | Tailwind | Embeddings | OCI |
| JWT | Vite | LLM | Docker |

---

# 🚀 Roadmap

- [x] Authentication

- [x] Dashboard

- [x] AI Chat

- [x] Knowledge Base

- [x] Docker

- [ ] Oracle Deployment

- [ ] CI/CD

- [ ] Kubernetes

---

# 📈 Future Improvements

Vector Search

Streaming Responses

Multi Language

Voice Assistant

Multi Tenant

Analytics Dashboard

Azure OpenAI

Oracle AI

---

# 👩🏻 Author

### Isela López García

AI Engineer

Cybersecurity

Oracle Next Education

LinkedIn

GitHub

---

# ⭐ Support

If you like this project please leave a ⭐

It motivates future development.

---

MIT License
