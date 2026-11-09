# PyBot AI – Intelligent Python Programming Assistant SaaS

PyBot AI is a modern, production-grade SaaS platform designed for Python students, developers, and data science engineers. It combines Natural Language Processing, Machine Learning Question Classification, a verified Python Knowledge Base, and a sub-second in-browser Python 3 execution sandbox.

---

## 1. System Architecture & Features

```
                         ┌──────────────────────────────────────────────┐
                         │      React 19 + Tailwind CSS Frontend        │
                         │  (ChatGPT / Perplexity-inspired Workspace)   │
                         └──────────────────────┬───────────────────────┘
                                                │ REST API / JWT
                                                ▼
                         ┌──────────────────────────────────────────────┐
                         │         Express.js Full-Stack Server         │
                         │             (Port 3000 / tsx)                │
                         └──────┬───────────────┬────────────────┬──────┘
                                │               │                │
            ┌───────────────────┴───┐    ┌──────┴─────────┐   ┌──┴──────────────────┐
            │   ML Engine (TF-IDF)  │    │ Python Sandbox │   │ Gemini 3.8 Flash AI │
            │ Question Classifier & │    │ python3 runner │   │ Server-side Python  │
            │  Knowledge Base Match │    │ stdout/stderr  │   │ Code Synthesis      │
            └───────────────────────┘    └────────────────┘   └─────────────────────┘
```

### Core Modules:
1. **AI Chatbot Interface**: Real-time Python assistance, syntax highlighting, Copy Code, Run Python 3, Markdown / JSON chat export, thread management.
2. **ML Classification Engine**: Preprocessing, stopword removal, TF-IDF vectorization, Cosine Similarity matching against 22 Python topics with multi-model comparison (XGBoost, Logistic Regression, Naive Bayes, Random Forest, Neural Network).
3. **Verified Python Knowledge Base**: 60+ categorized articles covering Python basics, OOP, Inheritance, Exception Handling, File I/O, NumPy, Pandas, Matplotlib, and Machine Learning.
4. **Interactive Python 3 Sandbox**: Real-time code execution with stdout, stderr, execution time, and security guards.
5. **SaaS Subscription & Billing**: Free (15/day), Pro (150/day), and Enterprise (Unlimited) plans with simulated Razorpay / UPI gateway verification and printable invoices.
6. **Admin & Analytics Consoles**: User management (RBAC roles, daily question quota resets), category popularity charts, daily query trends, and query triage.

---

## 2. Default Test Accounts

| Account | Email | Password | Role | Plan |
|---|---|---|---|---|
| **Administrator** | `admin@pybot.ai` | `AdminPass123!` | `admin` | Enterprise (Unlimited) |
| **Developer / Student** | `user@pybot.ai` | `UserPass123!` | `user` | Pro (150/day) |

*You can also click the "Demo User" or "Demo Admin" buttons on the navigation bar or login modal for instant 1-click evaluation.*

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4 (`@custom-variant dark`), Lucide React, Canvas Confetti.
- **Backend**: Node.js, Express, tsx.
- **Python Runtime**: Python 3.10 sandbox runner.
- **AI Integration**: `@google/genai` with model `gemini-3.8-flash`.
- **Machine Learning**: Custom TF-IDF Vectorizer with Sublinear Scaling, Cosine Similarity, and Softmax Multi-Class Classifiers.

---

## 4. Local Installation & Development

### Prerequisites:
- Node.js 18+ (Node 20 or 22 recommended)
- Python 3.8+

### Setup:
```bash
# Clone repository
git clone https://github.com/your-org/pybot-ai.git
cd pybot-ai

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Start full-stack development server (runs on port 3000)
npm run dev
```

### Build for Production:
```bash
npm run build
npm start
```

---

## 5. Docker Deployment

### Run with Docker:
```bash
# Build Docker image
docker build -t pybot-ai:latest .

# Run container
docker run -p 3000:3000 -e GEMINI_API_KEY="your-api-key" pybot-ai:latest
```

### Run with Docker Compose:
```bash
docker-compose up --build
```

---

## 6. REST API Endpoints

- `POST /api/auth/register` – Register new user
- `POST /api/auth/login` – Login and obtain JWT
- `GET /api/auth/me` – Current authenticated user details
- `POST /api/chat/ask` – Ask Python question (ML categorization + KB retrieval / Gemini synthesis)
- `POST /api/python/execute` – Run Python 3 snippet in sandbox
- `GET /api/kb` – Search and filter knowledge base articles
- `POST /api/kb` – Create KB article (Admin)
- `POST /api/ml/predict` – Classify Python query and get probability distribution
- `GET /api/ml/metrics` – Get model benchmark comparisons & confusion matrix
- `POST /api/ml/train` – Retrain ML models against knowledge base
- `GET /api/subscription/plans` – List subscription plans
- `POST /api/subscription/checkout` – Upgrade subscription (Razorpay / UPI)
- `GET /api/admin/analytics` – Platform usage telemetry and category metrics
- `GET /api/admin/users` – User management and quota controls
