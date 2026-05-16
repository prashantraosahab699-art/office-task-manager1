# 🚀 TeamFlow — Team Task Manager

A full-stack collaborative task management application built with React, Node.js, Express, and PostgreSQL. Manage projects, assign tasks, and track progress with your team in real-time.

![TeamFlow](https://img.shields.io/badge/TeamFlow-Task%20Manager-6366f1?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![React](https://img.shields.io/badge/React-Vite-61DAFB?style=flat-square&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?style=flat-square&logo=postgresql)

---

## ✨ Features

- **JWT Authentication** — Secure signup/login with httpOnly cookies + Bearer tokens
- **Role-Based Access Control** — App-level (ADMIN/MEMBER) and project-level roles
- **Project Management** — Create, update, delete projects with member management
- **Kanban Task Board** — Visual task management with TODO / IN_PROGRESS / DONE columns
- **Task Filtering** — Filter by status, priority, assignee, and overdue
- **Dashboard** — Summary cards, progress tracking, and recent activity feed
- **Overdue Detection** — Automatic overdue flagging with visual indicators
- **Responsive Design** — Beautiful glassmorphism UI that works on all devices

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
│   React (Vite)  │────▶│  Express.js API  │────▶│  PostgreSQL  │
│   Tailwind CSS  │     │   JWT + RBAC     │     │   (Prisma)   │
│   React Query   │◀────│   Zod Validation │◀────│              │
└─────────────────┘     └──────────────────┘     └──────────────┘
    Port 5173              Port 5000              Port 5432
```

---

## 📁 Folder Structure

```
/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.js            # Demo data seeder
│   ├── src/
│   │   ├── index.js           # Express app entry
│   │   ├── middleware/
│   │   │   ├── auth.js        # JWT authentication
│   │   │   ├── rbac.js        # Role-based access control
│   │   │   ├── validate.js    # Zod validation schemas
│   │   │   └── errorHandler.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── project.routes.js
│   │   │   └── task.routes.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── project.controller.js
│   │   │   └── task.controller.js
│   │   └── utils/
│   │       ├── prisma.js
│   │       └── jwt.js
│   ├── package.json
│   └── railway.json
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── api/
│   │   │   ├── axios.js       # Axios instance + interceptors
│   │   │   └── hooks.js       # React Query hooks
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   └── Modal.jsx
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── Signup.jsx
│   │       ├── Dashboard.jsx
│   │       ├── Projects.jsx
│   │       ├── ProjectDetail.jsx
│   │       └── NotFound.jsx
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 🛠️ Local Setup

### Prerequisites

- **Node.js** v18+
- **PostgreSQL** running locally (or use Docker)
- **npm** or **yarn**

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install --legacy-peer-deps
```

### 2. Configure Environment

```bash
# backend/.env
DATABASE_URL="postgresql://postgres:password@localhost:5432/team_task_manager?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

### 3. Setup Database

```bash
cd backend

# Create database and run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# (Optional) Seed demo data
node prisma/seed.js
```

### 4. Run Development Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Prisma Studio**: `npx prisma studio` (port 5555)

---

## 🔑 Demo Credentials (after seeding)

| Role   | Email           | Password    |
|--------|-----------------|-------------|
| ADMIN  | admin@demo.com  | Admin1234   |
| MEMBER | alice@demo.com  | Member1234  |
| MEMBER | bob@demo.com    | Member1234  |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint           | Description          | Auth |
|--------|--------------------|----------------------|------|
| POST   | /api/auth/signup   | Register new user    | No   |
| POST   | /api/auth/login    | Login                | No   |
| GET    | /api/auth/me       | Get current user     | Yes  |
| POST   | /api/auth/logout   | Logout               | Yes  |

### Projects
| Method | Endpoint                          | Description         | Role Required     |
|--------|-----------------------------------|---------------------|-------------------|
| GET    | /api/projects                     | List user projects  | Authenticated     |
| POST   | /api/projects                     | Create project      | App ADMIN         |
| GET    | /api/projects/:id                 | Get project details | Project Member    |
| PUT    | /api/projects/:id                 | Update project      | Project ADMIN     |
| DELETE | /api/projects/:id                 | Delete project      | Project ADMIN     |
| POST   | /api/projects/:id/members         | Add member          | Project ADMIN     |
| DELETE | /api/projects/:id/members/:userId | Remove member       | Project ADMIN     |

### Tasks
| Method | Endpoint                              | Description       | Role Required     |
|--------|---------------------------------------|-------------------|-------------------|
| GET    | /api/projects/:id/tasks               | List tasks        | Project Member    |
| POST   | /api/projects/:id/tasks               | Create task       | Project Member    |
| GET    | /api/projects/:id/tasks/:taskId       | Get task          | Project Member    |
| PUT    | /api/projects/:id/tasks/:taskId       | Update task       | Assignee / Admin  |
| DELETE | /api/projects/:id/tasks/:taskId       | Delete task       | Project ADMIN     |
| GET    | /api/projects/dashboard/stats         | Dashboard stats   | Authenticated     |

---

## 🔐 Environment Variables

### Backend
| Variable      | Description                    | Required |
|---------------|--------------------------------|----------|
| DATABASE_URL  | PostgreSQL connection string   | Yes      |
| JWT_SECRET    | Secret key for JWT signing     | Yes      |
| PORT          | Server port (default: 5000)    | No       |
| NODE_ENV      | Environment mode               | No       |
| FRONTEND_URL  | Frontend URL for CORS          | No       |

### Frontend
| Variable      | Description                    | Required |
|---------------|--------------------------------|----------|
| VITE_API_URL  | Backend API base URL           | No*      |

*Uses Vite proxy in development, required in production.

---

## 🚀 Deployment (Railway)

### Backend Service
1. Create a new Railway project
2. Add a PostgreSQL plugin
3. Deploy the `backend/` directory
4. Set environment variables: `DATABASE_URL` (auto from plugin), `JWT_SECRET`, `NODE_ENV=production`, `FRONTEND_URL`
5. Start command: `npx prisma migrate deploy && node src/index.js`

### Frontend Service
1. Add a new service for `frontend/`
2. Set `VITE_API_URL` to your backend Railway URL
3. Build command: `npm run build`
4. Serve the `dist/` directory

---

## 📋 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 19, Vite 8, Tailwind CSS 4   |
| Routing    | React Router v6                     |
| State      | TanStack React Query                |
| HTTP       | Axios                               |
| Backend    | Node.js, Express.js                 |
| Database   | PostgreSQL + Prisma ORM             |
| Auth       | JWT (jsonwebtoken + bcryptjs)       |
| Validation | Zod                                 |
| UI Icons   | Lucide React                        |
| Toasts     | React Hot Toast                     |

---

## License

MIT
