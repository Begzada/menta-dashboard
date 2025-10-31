# Menta Admin Dashboard

A minimalist admin dashboard for the Menta mental health app built with Next.js 16, React Query, Axios, and Tailwind CSS.

## Features

- **Authentication**: OTP-based login with session management
- **Dashboard Overview**: Statistics and metrics for all key resources
- **Account Management**: View and manage user accounts with filtering and pagination
- **Therapist Management**: Manage therapist profiles with search and filters
- **Patient Management**: View and manage patient profiles
- **Certificate Management**: Review and manage therapist certificates
- **Event Management**: Manage mental health events
- **Match Management**: View therapist-patient matches

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: Tailwind CSS 4
- **State Management**: Valtio
- **Data Fetching**: Axios + React Query (@tanstack/react-query)
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd menta-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and set your API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
menta-dashboard/
├── app/
│   ├── api/              # API routes
│   ├── dashboard/        # Dashboard pages
│   │   ├── accounts/
│   │   ├── therapists/
│   │   ├── patients/
│   │   ├── certificates/
│   │   ├── events/
│   │   └── matches/
│   ├── login/            # Login page
│   └── layout.tsx        # Root layout
├── components/           # Reusable components
│   ├── Sidebar.tsx
│   ├── Table.tsx
│   ├── Pagination.tsx
│   └── StatCard.tsx
├── lib/
│   ├── api.ts           # API functions
│   ├── axios-client.ts  # Axios configuration
│   ├── types.ts         # TypeScript types
│   └── query-provider.tsx # React Query provider
└── middleware.ts        # Authentication middleware
```

## Authentication

The dashboard uses OTP (One-Time Password) authentication:

1. Enter your email on the login page
2. Receive an OTP via email
3. Enter the OTP to authenticate
4. Session is stored in a secure HTTP-only cookie

Sessions are validated using middleware on all protected routes.

## API Integration

All API endpoints are configured in `lib/api.ts` using Axios. The base URL is configured via the `NEXT_PUBLIC_API_URL` environment variable.

### Available API Modules

- `authApi` - Authentication endpoints
- `accountsApi` - Account management
- `therapistsApi` - Therapist management
- `patientsApi` - Patient management
- `certificatesApi` - Certificate management
- `eventsApi` - Event management
- `matchesApi` - Match management

## Features by Page

### Dashboard Overview
- Total accounts, therapists, patients, and events
- Account breakdown by role
- Therapist verification status

### Accounts Page
- View all user accounts
- Filter by role (admin, therapist, patient)
- Filter by status (active, inactive)
- Search by email
- Pagination support

### Therapists Page
- View all therapists
- Search by name, specialization, or language
- Filter by verification status
- Filter by accepting patients status
- View specializations, languages, experience, and rates

### Certificates Page
- View all therapist certificates
- Filter by status (pending, approved, rejected)
- View certificate details and rejection reasons

### Patients Page
- View all patients
- Pagination support
- View patient demographics and preferences

### Events Page
- View all mental health events
- Search by title
- Filter by time (upcoming, past, today)
- View participant counts

### Matches Page
- View therapist-patient matches
- Filter by minimum match score
- Visual match score indicators
- Language and specialization match status

## Development

### Building for Production

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8080/api/v1` |

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Proprietary - Menta Mental Health App
