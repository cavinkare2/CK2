# QualVault — Qualitative Research Intelligence Portal

A comprehensive dashboard for CavinKare's Consumer Insights & Analytics team to manage, transcribe, and analyze qualitative research data from consumer immersions, focus group discussions, and field studies.

## Features

- **Dashboard** — KPI cards (projects, recordings, transcripts, avg sentiment), sentiment distribution, recent activity
- **Projects** — Create and manage research projects across CavinKare brands (Meera, Chik, KESH KING, Spinz, Nyle, Garden)
- **Recordings** — Add audio/video/text recordings linked to projects
- **Transcripts** — View transcribed content with sentiment scores and confidence levels
- **Analysis** — Theme extraction with frequency counts, word cloud, sentiment breakdown, cross-study comparison
- **Discussion Guides** — Upload and manage FGD/consumer immersion guides per project
- **Light/Dark mode** toggle

## Tech Stack

- **Frontend:** React + TypeScript, Tailwind CSS, shadcn/ui, Recharts, TanStack Query
- **Backend:** Express.js + TypeScript
- **Database:** SQLite (via Drizzle ORM)
- **Build:** Vite

## Setup & Run

### Prerequisites
- Node.js 18+ and npm

### Install Dependencies
```bash
npm install
```

### Initialize Database
```bash
npm run db:push
```

### Seed Demo Data
After starting the server, seed demo data with:
```bash
curl -X POST http://localhost:5000/api/seed
```

### Development Mode
```bash
npm run dev
```
The app will be available at `http://localhost:5000`

### Production Build
```bash
npm run build
npm start
```

## Project Structure

```
qualvault/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # UI components + sidebar
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities, query client
│   │   └── pages/           # Dashboard, Projects, Recordings, 
│   │                          Transcripts, Analysis, Guides
│   └── index.html
├── server/                  # Express backend
│   ├── index.ts             # Server entry point
│   ├── routes.ts            # API routes
│   ├── storage.ts           # Database operations
│   └── vite.ts              # Vite dev middleware
├── shared/
│   └── schema.ts            # Drizzle ORM schema (shared types)
├── package.json
├── drizzle.config.ts
├── vite.config.ts
└── tailwind.config.ts
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/projects | List all projects |
| POST | /api/projects | Create a project |
| GET | /api/recordings | List recordings (optional ?projectId=) |
| POST | /api/recordings | Add a recording |
| GET | /api/transcripts | List transcripts (optional ?projectId=) |
| GET | /api/themes | List themes (optional ?projectId=) |
| GET | /api/guides | List discussion guides (optional ?projectId=) |
| POST | /api/guides | Create a discussion guide |
| GET | /api/dashboard/stats | Dashboard KPI stats |
| GET | /api/dashboard/sentiment | Sentiment distribution |
| GET | /api/dashboard/recent | Recent activity |
| GET | /api/analysis/comparison | Cross-study comparison data |
| POST | /api/seed | Seed demo data |

## License

Internal — CavinKare Confidential
