# ✈️ WANDERSYNC AI - Travel Planning Assistant

**Describe your needs in one sentence, and automatically generate a multi-day travel itinerary with a schedule.**

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.0+-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4.0+-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![LangGraph](https://img.shields.io/badge/LangGraph-1.2+-FF6B35)](https://github.com/langchain-ai/langgraph)

---

## 🏗️ Architecture

Wandersync AI uses a **Vertical Slice Architecture** to ensure high maintainability and modularity.

### Backend (Python/FastAPI)
- **Modular Slices**: Logic is organized by feature (Auth, Trip, User, Itinerary).
- **Service/Repository Pattern**: Separation of business logic from data access.
- **Async-First**: Fully asynchronous data flow with `SQLModel` and `aiosqlite`.
- **LangGraph Orchestrator**: Multi-agent parallel planning for multi-city support.
- **Security**: Dual-token JWT rotation and HttpOnly cookie-based session management.

### Frontend (React/Vite)
- **Feature-Based**: Modular component structure with strict < 250 lines per file policy.
- **Zustand**: Persistent client-side state for Auth and Preferences.
- **React Query**: Optimized server-state management with caching and prefetching.
- **Internationalization**: Full English and Hinglish support via `i18next`.

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/your-username/trip-agent.git
cd trip-agent
```

**Backend Setup:**
```bash
pip install -r backend/requirements.txt
```

**Frontend Setup:**
```bash
cd frontend
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
# API Keys
AMAP_API_KEY=your_amap_key
DEEPSEEK_API_KEY=your_deepseek_key
OPENAI_API_KEY=your_openai_key

# Frontend Config
AMAP_JS_KEY=your_amap_js_key
AMAP_JS_SECURITY_CODE=your_js_secret

# Infrastructure
DATABASE_URL=sqlite+aiosqlite:///./data/app.db
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your_production_secret
```

### 3. Run Development Server

From the root directory:
```bash
python run.py
```

---

## 🛠️ Developer Experience (DX)

### Linting & Formatting
We use **Ruff** for Python and **ESLint** for React.

```bash
# Lint Backend
ruff check backend

# Lint Frontend
cd frontend && npm run lint
```

### CI/CD
Automated validation via **GitHub Actions** runs on every PR:
- Backend: Ruff lint, Pytest.
- Frontend: ESLint, Production build check.

---

## 📄 License

[MIT](LICENSE)
