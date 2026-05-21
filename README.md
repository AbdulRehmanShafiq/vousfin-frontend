# vousFin Frontend

AI-powered smart accounting platform — production React SPA for SMEs.

## Stack

- **React 19** + **Vite 8**
- **Tailwind CSS 3**
- **Zustand** (state)
- **Axios** (API)
- **React Router 7**
- **Recharts** (charts)
- **react-hot-toast**, **react-markdown**, **lucide-react**

## Prerequisites

- Node.js 18+
- vousFin backend running at `http://localhost:5000`

## Setup

```bash
cd vousfin-frontend
npm install
cp .env.example .env   # or use existing .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Environment

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Ensure backend `CLIENT_URL` matches your frontend origin (e.g. `http://localhost:5173`) for cookies/CORS.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

## Architecture

```
src/
├── components/   # UI by domain (common, layout, dashboard, transactions, reports, ai, admin)
├── pages/        # Route-level screens
├── layouts/      # Auth, Dashboard, Admin shells
├── services/     # Axios API layer (/api/v1)
├── stores/       # Zustand stores
├── hooks/        # Reusable hooks
├── utils/        # Formatters, validators, constants
├── routes.jsx    # Lazy routes + guards
└── App.jsx       # Router + toast provider
```

## Features

- JWT auth (login, register, verify email, password reset, Google OAuth redirect)
- Role-based routes (customer vs admin)
- Dashboard KPIs and charts
- Double-entry transactions (form, Excel, natural language)
- Financial reports with PDF/Excel export
- AI assistant, forecast, anomalies, semantic search
- Admin customer management

## API

All services use the centralized Axios instance in `src/services/api.js` with Bearer token and 401 handling.

Backend routes: `/api/v1/auth`, `/business`, `/transactions`, `/reports`, `/dashboard`, `/ai`, `/admin`.

## Design

Enterprise fintech UI — clean, responsive, brand blues inspired by QuickBooks/Stripe.
