# Backup Monitor

A modern, high-performance web application designed to monitor and manage server backup statuses. Built with a focus on visual excellence, security, and real-time data tracking.

## 🚀 Key Features

- **Real-time Dashboard**: Comprehensive summary of total servers, pre-update/post-update success rates, and pending backups.
- **Advanced Filtering**: Quickly filter servers by status (Success, Failed, Pending, Incomplete) and environment (Production, Staging, Development).
- **Dual View Modes**: Switch between a visually rich **Card View** and a data-dense **Table View** for optimal monitoring.
- **Detailed Server Analysis**: Deep-dive into specific server backup records, progress percentages, and timestamps via interactive modals.
- **User Management**: Complete CRUD functionality for system users and roles, featuring a modern modal-based interface and automated role capitalization.
- **Secure Authentication**: JWT-based authentication system with persistent sessions, protected routes, and automatic API interceptors for token management.
- **Responsive Design**: Fully optimized for desktop and mobile, with smooth animations and transitions powered by Framer Motion.
- **Dark/Light Mode**: Full system support for theme toggling with curated color palettes.

## 🛠️ Tech Stack

- **Frontend**: [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (based on Radix UI)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query) (React Query)
- **API Client**: [Axios](https://axios-http.com/)
- **Routing**: [React Router DOM](https://reactrouter.com/)

## 📂 Project Structure

```bash
src/
├── components/         # Reusable UI components
│   ├── shared/         # Generic table, search, and badge components
│   └── ui/             # Shadcn base components
├── data/               # API service layers, types, and mock data
├── hooks/              # Custom React hooks (toast, etc.)
├── lib/                # Core utilities (API instance, Auth logic, cn helper)
├── pages/              # Main application views/routes
└── App.tsx             # Root component and router configuration
```

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/USG-ENTERPRISE-DEPARTMENT/DATABASE-BACKUP-MONITORING
   cd backup-buddy
   ```


2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment** (Optional)
   The application points to: `http://10.203.14.169:3066/v1/api/backup_monitor`
   Adjust `src/lib/api.ts` if the base URL needs to change.

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔐 Authentication & API

The system implements a secure authentication flow:
- **Login**: Validates credentials and stores the JWT in `localStorage`.
- **Interceptors**: An Axios request interceptor automatically attaches the `Authorization: Bearer <token>` header to all requests.
- **Token Handling**: Automatic response interceptors handle `401 Unauthorized` errors to ensure session security.
- **Protected Routes**: All internal pages are wrapped in a `ProtectedRoute` component to prevent unauthorized access.

## 📊 Data Mapping

The application transforms complex backend responses into a clean, typed `Database` interface:
- **Pre-Update**: Status and records backed up before server updates.
- **Post-Update**: Status and records backed up after server updates.
- **Backup Age**: A human-readable age calculation (e.g., "3 days, 1 hour, 36 minutes") for clear status reporting.

## 🎨 Aesthetic Standards

- **Typography**: Uses modern, readable fonts.
- **Animations**: Subtle entry animations for cards and lists.
- **Glassmorphism**: Header and sticky elements use backdrop blur effects.
- **Borders**: Strategic use of dashed borders and shadows for visual depth.

---
*Built with ❤️ for efficient server monitoring.*
