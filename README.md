# Backup Monitor

A modern, high-performance web application designed to monitor and manage server backup statuses. Built with a focus on visual excellence, security, and real-time data tracking.

## 🚀 Key Features & Current Version Highlights

- **Real-time Dashboard**: Comprehensive summary of total servers, pre-update/post-update success rates, and pending backups.
- **Intelligent Status Resolution**: Strict `ui_status` prioritization ensuring that top-level dashboard metrics accurately reflect global success, seamlessly handling any contradictory background process data.
- **Advanced Log Viewer**: Integrated full-screen detail modals that parse, format, and display dense multi-line SQL or Oracle errors as distinct, readable warnings or errors.
- **Advanced Filtering**: Quickly filter servers by status (Success, Failed, Pending, Incomplete) and environment (Production, DR, UAT).
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
- **Backup Age**: A human-readable age calculation for clear status reporting.
- **Error Arrays**: Normalizes JSON-bound API errors into robust string arrays for front-end parsing.

## 🎨 Aesthetic Standards

- **Typography**: Uses modern, readable fonts (Urbanist).
- **Animations**: Subtle entry animations for cards and lists.
- **Glassmorphism**: Header and sticky elements use backdrop blur effects.
- **Borders**: Strategic use of dashed borders and shadows for visual depth.

---

## ✅ Implemented — This Version

| Feature | Details |
|---|---|
| Historical Trending & Analytics | Per-server backup size & run-result charts (Recharts). Full `/analytics` page with server selector. |
| Exportable Compliance Reports | One-click CSV download and printer-friendly HTML/PDF report, accessible from the Analytics page. |
| Intelligent Status Resolution | `ui_status` takes priority over raw phase statuses to prevent false failure flags. |
| Full-Screen Log Viewer | Errors/warnings in the detail modal open in a paginated, deduplicated log view. |
| Duplicate Error Suppression | Repeated ORA-* or system messages collapsed to single entries via `Set` deduplication. |

---

## 🚀 Next Phase — Recommended Features

The following features are recommended for the next iteration of the platform:

1. **Automated Alerts & Webhooks 🔔**
   - **Idea**: Webhook bridge for Slack, Microsoft Teams, or Email. Trigger on backup failure or when a server's `ui_status` degrades.
   - **Value**: Immediately notify on-call DBAs, removing the need to actively monitor the dashboard.

2. **One-Click Retry Actions 🔄**
   - **Idea**: Expose a POST endpoint that triggers a backup re-run for a specific host/DB, with a confirmation dialog in the `DatabaseDetailModal`.
   - **Value**: Transitions the platform from passive monitoring into active incident response.

3. **Advanced Grouping & Custom Tags 🏷️**
   - **Idea**: Allow admins to tag databases (e.g., "Financial", "HR", "Legacy") and filter the dashboard by tag.
   - **Value**: Organises large server fleets beyond the standard Production/UAT/DR classifications.

4. **Granular Role-Based Access Control (RBAC) 🛡️**
   - **Idea**: Extend User Management with a permissions matrix — read-only viewers vs privileged operators.
   - **Value**: Junior admins can view statuses only; senior DBAs can trigger retries, manage users, and edit tags.

5. **Scheduled Report Delivery 📧**
   - **Idea**: Backend-driven cron job that emails a PDF compliance report to configured recipients every Monday morning.
   - **Value**: Satisfies audit requirements passively — no manual download required.

6. **Backup Size Anomaly Detection 🤖**
   - **Idea**: Use statistical deviation (e.g., Z-score on historical size data) to flag backups that are suspiciously small or zero — possible sign of a corrupt or empty dump.
   - **Value**: Catches silent failures that pass a "SUCCESS" status but produce invalid dumps.

---
*Built with ❤️ for efficient server monitoring.*

