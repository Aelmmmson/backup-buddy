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

## 🚀 Future Roadmap & Recommendations

To further elevate the system into an enterprise-class observability platform, the following features are highly recommended for future iterations:

1. **Historical Trending & Analytics 📈**
   - **Idea**: Integrate `Recharts` or `Chart.js` to visualize backup success and failure rates over a 30-day or 90-day window.
   - **Value**: Helps identify chronically failing servers or systemic network issues affecting backups during specific times.

2. **Automated Alerts & Webhooks 🔔**
   - **Idea**: Integrate webhook bridging for Slack, Microsoft Teams, or standard Email alerts.
   - **Value**: Immediately notify on-call administrators when a critical production database backup abruptly fails, reducing system downtime.

3. **One-Click Retry Actions 🔄**
   - **Idea**: Expose an API endpoint that allows administrators to manually construct and send a "Retry Backup" trigger directly from the `DatabaseDetailModal`.
   - **Value**: Transitions the platform from a purely "monitoring" tool to an active "management" tool.

4. **Exportable Compliance Reports 📑**
   - **Idea**: Add a module that aggregates weekly dashboard data and exports it as formatted PDF or CSV compliance reports.
   - **Value**: Satisfies external/internal auditing requirements by proving consistent database retention policies are being met.

5. **Advanced Grouping & Custom Tags 🏷️**
   - **Idea**: Allow administrators to assign custom meta-tags to databases (e.g., "Financial Data", "HR", "Legacy Systems") and filter the global dashboard by these tags.
   - **Value**: Better organizes huge fleets of servers beyond standard "Production/UAT" classifications.

6. **Granular Role-Based Access Control (RBAC) 🛡️**
   - **Idea**: Expand the User Management module to support permissions matrices. 
   - **Value**: Ensure junior admins can only *view* statuses, while senior DBAs can edit tags, manage users, or trigger backup retries.

---
*Built with ❤️ for efficient server monitoring.*
