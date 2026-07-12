# CorpIA — Enterprise AI Knowledge Assistant

**Proyecto completo: Fases 1-4 terminadas.** Frontend + Backend + RAG +
Docker, listo para correr en local o desplegar en Oracle Cloud.

CorpIA es una plataforma de IA para empresas que permite consultar
documentos internos (políticas, manuales, reportes) mediante un asistente
conversacional con RAG (Retrieval-Augmented Generation), con una interfaz de
nivel SaaS Enterprise inspirada en Microsoft Copilot, Notion y Linear.

## 📸 Capturas

*(Corre el proyecto en local siguiendo la sección de instalación para verlo
en vivo — el login, dashboard, chat con streaming y base de conocimiento
están descritos en detalle en cada sección de abajo.)*

## 🏗️ Arquitectura

```
corpia/
├── frontend/                    React 19 + Vite + Tailwind v4
│   ├── src/
│   │   ├── api/                 Cliente Axios + 1 archivo por dominio (auth, chat, documents...)
│   │   ├── components/
│   │   │   ├── common/          Button, Card, Modal, TextField, Logo... (Atomic Design)
│   │   │   ├── layout/          Sidebar, Header, Footer
│   │   │   └── chat/            MessageBubble, ConversationHistory
│   │   ├── context/             AuthContext (JWT real), ThemeContext (dark/light)
│   │   ├── i18n/                es / en / pt, sin textos hardcodeados
│   │   ├── layouts/             MainLayout (shell de la app autenticada)
│   │   ├── pages/                Login, Dashboard, Chat, KnowledgeBase, Documents, Models, Users, Settings
│   │   └── routes/               ProtectedRoute
│   ├── Dockerfile                multi-stage: build Vite -> sirve con Nginx
│   └── nginx.conf                SPA fallback + proxy /api -> backend
│
├── backend/                     FastAPI + Python 3.12
│   ├── app/
│   │   ├── api/routes/          auth, chat, documents, models, users, settings, dashboard
│   │   ├── core/                config (Settings), security (JWT, bcrypt)
│   │   ├── db/                  SQLAlchemy models, sesión, seed de datos demo
│   │   ├── rag/                 loader -> chunker -> embeddings -> vector_store -> retriever -> prompt -> llm -> pipeline
│   │   ├── schemas/              Pydantic (request/response)
│   │   └── services/             lógica de negocio (auth, chat, documents)
│   ├── data/                    volumen persistente: SQLite, ChromaDB, uploads
│   └── Dockerfile
│
├── docs/
│   └── DEPLOY_ORACLE_CLOUD.md   guía paso a paso de despliegue en OCI
│
├── docker-compose.yml           orquesta frontend + backend (+ Postgres opcional)
├── LICENSE                      MIT
└── README.md                    este archivo
```

### Decisiones técnicas clave

- **Clean Architecture por capas** en el backend: `routes` (HTTP) →
  `services` (lógica de negocio) → `db/models` (persistencia), con el
  pipeline RAG completamente aislado en su propio paquete (`app/rag/`) para
  poder sustituir cualquier pieza (vector store, embeddings, LLM) sin tocar
  el resto.
- **RAG funcional sin dependencias externas por defecto**: el motor de
  embeddings (`HashingVectorizer`) y el generador de respuesta local
  (extractivo) no requieren ninguna API key, así que el proyecto es
  100% funcional nada más clonarlo. Conectar OpenAI/Groq es cuestión de
  cargar una key desde la pantalla "Modelos IA".
- **JWT stateless** para autenticación, con los mismos 5 usuarios demo
  sembrados automáticamente en frontend y backend.
- **SQLite por defecto, PostgreSQL "a un cambio de variable de entorno"**
  gracias a SQLAlchemy — ver `docs/DEPLOY_ORACLE_CLOUD.md` sección 10.
- **Nginx como proxy inverso** en el contenedor del frontend: en producción
  el navegador solo habla con un origen (puerto 80), que reenvía `/api/*`
  al backend — evita problemas de CORS y expone una sola IP/puerto público.

## 🧰 Tecnologías

**Frontend:** React 19, Vite, Tailwind CSS v4, React Router, React Icons,
Axios, Framer Motion, i18next, Recharts, react-markdown.
**Backend:** FastAPI, Python 3.12, Uvicorn, SQLAlchemy, Pydantic, ChromaDB,
scikit-learn, python-jose, passlib/bcrypt.
**Infraestructura:** Docker, Docker Compose, Nginx, Oracle Cloud
Infrastructure.

## 🚀 Instalación

### Opción A — Desarrollo local (dos terminales)

**Backend**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```
Abre `http://localhost:5173`.

### Opción B — Docker (un solo comando)

```bash
docker compose up -d --build
```
Abre `http://localhost` (puerto 80). La API queda accesible en
`http://localhost/api/*` y su documentación en `http://localhost/docs`.

Antes de un despliegue real, edita `backend/.env` y genera tu propio
`SECRET_KEY`:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(48))"
```

## 🔑 Usuarios demo

| Usuario            | Contraseña   | Rol               |
|---------------------|--------------|-------------------|
| admin.corpia        | Admin2026!   | Administrador     |
| rrhh.corpia          | RRHH2026!    | Recursos Humanos  |
| marketing.corpia     | Mktg2026!    | Marketing         |
| ti.corpia            | TI2026!      | TI                |
| finanzas.corpia       | Fin2026!     | Finanzas          |

## ☁️ Deploy en producción

Guía completa paso a paso (instancia, seguridad, HTTPS, backups, migración a
PostgreSQL) en [`docs/DEPLOY_ORACLE_CLOUD.md`](docs/DEPLOY_ORACLE_CLOUD.md).

## 🗺️ Roadmap

**Completado:**
- [x] Fase 1 — Frontend: layout Enterprise, login, dashboard, dark/light, i18n (es/en/pt)
- [x] Fase 2 — Backend: FastAPI, JWT, RAG completo (loader→chunker→embeddings→vector store→retriever→prompt→LLM), Swagger
- [x] Fase 3 — Frontend conectado 100% al backend real: Chat con streaming SSE, Base de conocimiento, Documentos, Modelos IA, Usuarios, Configuración
- [x] Fase 4 — Docker, docker-compose, Nginx reverse proxy, guía de despliegue en Oracle Cloud

**Ideas para siguientes iteraciones:**
- [ ] Embeddings semánticos reales (OpenAI/Cohere) como alternativa al motor local
- [ ] Roles y permisos más granulares (por documento/departamento)
- [ ] Notificaciones en tiempo real (WebSockets)
- [ ] Tests automatizados (pytest + Vitest) y CI/CD
- [ ] Migración guiada de SQLite a PostgreSQL con script de datos

## 📄 Licencia

MIT — ver [`LICENSE`](LICENSE).
