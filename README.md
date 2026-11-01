# AI-POWERED SAAS PLATFORM BASED ON GENERATIVE AI

[![B.Tech Major Project](https://img.shields.io/badge/Degree-B.Tech%20Major%20Project-blue.svg)](https://github.com)
[![Developer: Kunwar Kantikeya Gautam](https://img.shields.io/badge/Developer-KUNWAR%20KANTIKEYA%20GAUTAM-indigo.svg)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-v18-cyan.svg)](https://reactjs.org/)
[![Local AI](https://img.shields.io/badge/Local%20Inference-Ollama%20%7C%20gpt--oss%3A20b-purple.svg)](https://ollama.ai)
[![Prisma ORM](https://img.shields.io/badge/ORM-Prisma%20PostgreSQL-indigo.svg)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC.svg)](https://tailwindcss.com/)

---

## 📌 1. Project Overview & Problem Statement

Modern individuals, researchers, students, and engineers frequently rely on cloud-dependent AI tools for their everyday generative workflows. However, relying on external AI APIs introduces significant challenges:
- **Data Privacy & Compliance Risks:** Sensitive enterprise documents and proprietary code are transmitted to third-party cloud servers.
- **External API Dependency & Recurring Invoicing:** High per-token fees and unpredictable cloud billing.
- **API Rate Limits & Vendor Lock-In:** Unexpected service throttling, model deprecations, or sudden outages.

### Proposed Solution
**“AI-POWERED SAAS PLATFORM BASED ON GENERATIVE AI”** solves this by establishing a **Three-Tier Web Architecture with Local Generative AI Inference Layer**. 

The platform runs open-weight generative models (such as `gpt-oss:20b`) directly on the local host machine using **Ollama**, orchestrating all client-server communications through a secure **Node.js / Express** application layer backed by a persistent **PostgreSQL** relational database.

- **Project Title:** AI-POWERED SAAS PLATFORM BASED ON GENERATIVE AI
- **Author & Developer:** **KUNWAR KANTIKEYA GAUTAM**
- **Course:** B.Tech Major Project
- **Inference Runtime:** Local Ollama Daemon (`http://localhost:11434`)
- **Primary Model:** `gpt-oss:20b` (Configurable open-weight model)

---

## 🏗️ 2. System Architecture: Three-Tier Web Architecture with Local Inference Layer

The application is structured across four clean, modular layers:

```
+-------------------------------------------------------------------------+
|                       1. PRESENTATION LAYER                             |
|               React.js 18  |  Tailwind CSS  |  Lucide Icons             |
|        (Browser NEVER communicates directly with the Ollama daemon)     |
+------------------------------------+------------------------------------+
                                     |  HTTP / REST (JWT in Bearer Header)
                                     v
+-------------------------------------------------------------------------+
|                       2. APPLICATION LAYER                              |
|                       Node.js & Express.js REST API                     |
|  - Request Validation & Rate Limiting                                   |
|  - JWT Authentication & Bcrypt Password Hashing                         |
|  - Document Extraction & Parsing (pdf-parse, mammoth)                   |
|  - Modular AI Services:                                                 |
|      * server/src/services/ai/localAIService.js                         |
|      * server/src/services/ai/documentAIService.js                      |
|      * server/src/services/ai/imageAIService.js                         |
+------------------+----------------------------------+-------------------+
                   |                                  |
                   | Local HTTP (/api/generate)       | SQL Queries
                   v                                  v
+----------------------------------+  +----------------------------------+
|   3. LOCAL AI INFERENCE LAYER    |  |       4. DATA LAYER              |
|        (Ollama Runtime)          |  |        (PostgreSQL)              |
|                                  |  |                                  |
|  - Ollama Daemon (Port 11434)    |  |  - Prisma ORM 6.x                |
|  - Local Model: gpt-oss:20b      |  |  - users table                   |
|  - 100% On-Premise GPU/CPU       |  |  - ai_generations table          |
|  - Zero External LLM Calls       |  |  - documents table               |
|  - Low Latency & High Privacy    |  |  - history table                 |
+----------------------------------+  +----------------------------------+
```

### Execution Flow:
```
User (Browser)
  ↓
React.js + Tailwind CSS
  ↓
Node.js + Express.js API
  ↓
localAIService (/server/src/services/ai/localAIService.js)
  ↓
Ollama Local Runtime (http://localhost:11434)
  ↓
gpt-oss:20b (Local Open-Weight Model)
  ↓
AI Response Output
  ↓
Express API Server
  ↓
PostgreSQL Storage (ai_generations & history tables)
  ↓
React.js Client Interface
  ↓
User
```

---

## 🚀 3. Core Capabilities & Feature Suite

| Module | Description | Engine / Model | Execution Type |
| :--- | :--- | :--- | :--- |
| **AI Text Generation** | Conversational reasoning, coding, algorithmic logic | `gpt-oss:20b` via Ollama | **100% Local Inference** |
| **Document Intelligence** | Automated executive summarization, key takeaways, Q&A | `gpt-oss:20b` + PDF/DOCX Parser | **100% Local Inference** |
| **Resume & ATS Optimizer** | Candidate profiling, skills inventory, ATS heuristics | `gpt-oss:20b` + Resume Parser | **100% Local Inference** |
| **Article & Whitepaper Writer**| Structured technical essays with tone, length, keywords | `gpt-oss:20b` Markdown Engine | **100% Local Inference** |
| **Headline & Title Ideator**| High-converting viral hooks, YouTube titles, SEO subjects | `gpt-oss:20b` Copywriting Engine | **100% Local Inference** |
| **Generative Image Studio** | Photorealistic visuals, 3D renders, and digital art | Modular Vision Pipeline | **Modular Vision Suite** |
| **Document Vault** | User-isolated document repository with instant re-analysis | Local / S3 Storage + Postgres | **Local Database** |
| **Audit & History Log** | Filterable history by tool type, search by prompt, export | PostgreSQL History Vault | **Local Database** |
| **Secure Authentication** | Password hashing (bcrypt 10 rounds), JWT auth tokens | Express Auth Middleware | **Local Security** |

> [!NOTE]
> **Image Generation Architecture Note:** Language models such as `gpt-oss:20b` are autoregressive text/code LLMs and do not synthesize raster image pixels. Visual synthesis is decoupled in `imageAIService.js` as an independent modular vision pipeline so local diffusion models (e.g. Stable Diffusion) can be plugged in without affecting the core text inference layer.

---

## 🗄️ 4. Database Schema (PostgreSQL via Prisma ORM)

```mermaid
erDiagram
    USERS ||--o{ AI_GENERATIONS : creates
    USERS ||--o{ DOCUMENTS : uploads
    USERS ||--o{ HISTORY : owns
    AI_GENERATIONS ||--o{ HISTORY : logs

    USERS {
        string user_id PK
        string name
        string email UK
        string password
        datetime created_at
        datetime updated_at
    }

    AI_GENERATIONS {
        string generation_id PK
        string user_id FK
        string tool_type
        text prompt
        text result
        string provider
        json metadata
        datetime timestamp
    }

    DOCUMENTS {
        string document_id PK
        string user_id FK
        string file_name
        string file_path
        string file_type
        int file_size
        text extracted_text
        json analysis
        datetime uploaded_at
    }

    HISTORY {
        string history_id PK
        string user_id FK
        string generation_id FK
        datetime created_at
    }
```

---

## 📡 5. REST API Reference

All protected endpoints require the HTTP header: `Authorization: Bearer <JWT_TOKEN>`.

### Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account with hashed password | No |
| `POST` | `/api/auth/login` | Authenticate email & password, returns JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | **Yes** |
| `PUT` | `/api/auth/profile` | Update account name or change password | **Yes** |

### Local AI Endpoints (`/api/ai`)
| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/generate` | Primary local text generation endpoint | `{"prompt": "Write an introduction about Generative AI"}` |
| `GET` | `/api/ai/status` | Check local Ollama daemon & model health | `None` |
| `GET` | `/api/ai/providers` | List available AI providers and local models | `None` |
| `POST` | `/api/ai/generate-text` | Feature text generation with temperature/model | `{"prompt": "...", "temperature": 0.7}` |
| `POST` | `/api/ai/generate-article` | Generate structured long-form article | `{"topic": "...", "tone": "Professional"}` |
| `POST` | `/api/ai/generate-titles` | Generate viral headlines / titles | `{"topic": "...", "contentType": "Blog Post"}` |
| `POST` | `/api/ai/generate-image` | Modular visual synthesis | `{"prompt": "...", "style": "Photorealistic"}` |

### Document Intelligence (`/api/documents` & `/api/resume`)
| Method | Endpoint | Description | Payload |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/documents/upload` | Upload & parse PDF/DOCX/TXT file | `multipart/form-data (file)` |
| `POST` | `/api/documents/analyze` | Run local AI summarization & entity extraction | `{"documentId": "...", "mode": "summarize"}` |
| `GET` | `/api/documents` | Get list of user's uploaded documents | `None` |
| `DELETE`| `/api/documents/:id` | Delete document from database & disk | `None` |
| `POST` | `/api/resume/analyze` | Parse resume & generate local ATS insights | `multipart/form-data (resume)` |

### History & Dashboard (`/api/history` & `/api/dashboard`)
| Method | Endpoint | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/history` | Paginated user generation history | `?toolType=text&search=query&page=1` |
| `GET` | `/api/history/:id` | View specific history generation record | `None` |
| `DELETE`| `/api/history/:id` | Delete single history generation | `None` |
| `GET` | `/api/dashboard/stats` | Aggregated telemetry & metrics | `None` |

---

## 💻 6. Complete Local Setup Instructions

Follow these step-by-step instructions to run the entire stack locally with Ollama.

### Step 1: Install Ollama
Download and install Ollama for your operating system from the official portal:
- **Windows / macOS / Linux:** [https://ollama.ai/download](https://ollama.ai/download)

Verify installation:
```bash
ollama --version
```

### Step 2: Start the Ollama Service
Start the local Ollama background server:
```bash
ollama serve
```
*By default, Ollama listens on `http://localhost:11434`.*

### Step 3: Download / Pull the Required Model
Pull the open-weight model to your local machine:
```bash
ollama pull gpt-oss:20b
```
*(Alternative lightweight models: `ollama pull llama3:latest` or `ollama pull mistral:latest`)*

Test the model in your terminal:
```bash
ollama run gpt-oss:20b
```

### Step 4: Configure Environment Variables
Copy `.env.example` to `server/.env`:
```bash
cp .env.example server/.env
```

Ensure `server/.env` contains:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

JWT_SECRET=super_secret_jwt_key_btech_project_2026_saas
JWT_EXPIRES_IN=7d

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/omni_ai_saas?schema=public"

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gpt-oss:20b
OLLAMA_TIMEOUT_MS=120000
DEFAULT_AI_PROVIDER=ollama
```

### Step 5: Install Dependencies
```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

### Step 6: Start the Backend & Frontend Servers
```bash
# Run both backend (port 5000) and frontend (port 5173) concurrently:
npm run dev
```

Alternatively, start them separately:
```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
cd client && npm run dev
```

- **Frontend Client:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000/api`
- **Ollama Inference:** `http://localhost:11434`

### Step 7: Test the Local AI Features
1. Open `http://localhost:5173` in your browser.
2. Sign in with the demo account:
   - Email: `kunwarkantikeyagautam@gmail.com`
   - Password: `Password@123`
   *(Or click **"Quick Fill: KUNWAR KANTIKEYA GAUTAM"** on the login page)*
3. Navigate to **Chat & Text Generator** and submit a prompt.
4. The generation is processed locally by **Ollama (`gpt-oss:20b`)** without calling external cloud LLM APIs, and persisted to PostgreSQL.

---

## 🧪 7. Automated Testing

Run the automated test suite to validate all endpoints and local AI integration:
```bash
cd server
npm test
```
Or run the dedicated local AI validation script:
```bash
node server/test-local-ai.js
```

---

## 🎓 8. Developer & Project Details

- **Developer:** **KUNWAR KANTIKEYA GAUTAM**
- **Email:** `kunwarkantikeyagautam@gmail.com`
- **Project:** B.Tech Major Project — “AI-POWERED SAAS PLATFORM BASED ON GENERATIVE AI”
- **Demo Credentials:** `kunwarkantikeyagautam@gmail.com` / `Password@123`
