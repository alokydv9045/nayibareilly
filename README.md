# NayiBareilly — Civic Issue Tracking & Resolution System

NayiBareilly is a complete, role-based civic issue tracking and resolution system designed for the Bareilly municipality. It bridges the gap between citizens and municipal authorities, allowing citizens to report civic problems and enabling field technicians and department admins to triage, assign, repair, and verify issues in a structured workflow.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js (App Router, TypeScript, TailwindCSS, Lucide Icons)
- **Backend:** Node.js, Express, Socket.io (for real-time updates)
- **Database ORM:** Prisma Client
- **Database:** PostgreSQL (with migration support)
- **State Management & Fetching:** React Query (TanStack Query)

---

## 📁 Repository Structure

```
nayibareilly/
├── client/                 # Next.js Frontend Application
│   ├── src/                # Client source code
│   └── next.config.ts      # Client configuration & redirects
├── server/                 # Express Backend API
│   ├── src/                # Backend source code
│   ├── prisma/             # Database schema and migrations
│   └── scripts/            # Database seeding and utility scripts
├── README.md               # Main project setup guide (this file)
└── ABOUT_WORKFLOWS.md      # Detailed documentation of user roles and workflows
```

---

## 🚀 Quick Start & Development Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or higher)
- [PostgreSQL](https://www.postgresql.org/) database running locally or hosted

### 2. Backend Setup
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment configuration and edit `.env`:
   ```bash
   cp .env.example .env
   ```
   Modify `DATABASE_URL` and `DIRECT_URL` in `.env` to point to your PostgreSQL database.
4. Run Prisma database migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Seed realistic database data (including Municipal Corporation department, categories, and sample issues):
   ```bash
   node scripts/seed-realistic-data.js
   ```
6. Seed default test users and credentials:
   ```bash
   node scripts/seed-test-users.js
   ```
7. Start the backend developer server:
   ```bash
   npm run dev
   ```
   *(Running at `http://localhost:4001`)*

### 3. Frontend Setup
1. Navigate to the client folder:
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment configuration and edit `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Ensure the `NEXT_PUBLIC_API_URL` is set to point to the backend (default: `http://localhost:4001`).
4. Start the Next.js developer server:
   ```bash
   npm run dev
   ```
   *(Running at `http://localhost:3000`)*

---

## 🔐 Role Credentials

The database seeding (`seed-test-users.js` and `seed-realistic-data.js`) generates the following credentials for development testing:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Tech Admin** | `admin@nagarsetu.gov.in` | `Nagarsetu@Admin2025` |
| **Moderator** | `moderator@nagarsetu.gov.in` | `Moderator@123` |
| **Department Admin** | `pwd.head@nayibareilly.gov.in` | `Admin@123` |
| **Field Staff** | `staff@nagarsetu.gov.in` | `Staff@123` |
| **Citizen (Seeded)** | `citizen@example.com` | `Citizen@123` |
| **Mayor** | `mayor@nagarsetu.gov.in` | `Mayor@123` |

---

## 📱 Developer Features: Mock OTP Bypass

To simplify the login/registration process for developers testing citizen flows, the system supports a **Mock OTP** mode.

### How to Enable Mock OTP:
1. In your `server/.env` file, set:
   ```env
   MOCK_OTP=true
   ```
2. When logging in or registering as a citizen, enter any 10-digit mobile number.
3. Click "Send OTP".
4. Enter **any 6-digit OTP code** (e.g., `123456` or `999999`) to successfully bypass authentication and log in.

---

## 🔄 User Workflows & Happy Path

For a complete and detailed breakdown of each user role's capabilities, issue lifecycles, and a visual sequence diagram, refer to [ABOUT_WORKFLOWS.md](ABOUT_WORKFLOWS.md).
