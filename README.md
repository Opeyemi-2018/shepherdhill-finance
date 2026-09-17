# Shepherdhill Finance

Internal finance and back-office admin dashboard for Shepherdhill. Built with Next.js (App Router), it consumes a remote REST API for authentication, invoicing, banking, retainerships, payables/receivables, and service requests.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router, Server Actions)
- **UI:** React 19, [Tailwind CSS 4](https://tailwindcss.com), [Radix UI](https://www.radix-ui.com) primitives, [shadcn/ui](https://ui.shadcn.com)-style components (see `components.json`)
- **Forms & validation:** `react-hook-form` + `zod`
- **Other libraries:** `date-fns`, `sonner` (toasts), `jspdf` / `html-to-image` (document/PDF export), `next-themes` (dark mode), `lucide-react` / `react-icons`

## Getting Started

### Prerequisites

- Node.js 20+
- npm (a `package-lock.json` is committed; use npm to stay in sync with it)

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root with the API endpoints this app talks to:

   ```bash
   NEXT_PUBLIC_API_URL=https://<your-api-host>/api/admin/finance
   NEXT_PUBLIC_API_CLIENT_URL=https://<your-api-host>/api/admin
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

### Available Scripts

| Command         | Description                              |
| --------------- | ----------------------------------------- |
| `npm run dev`   | Start the Next.js dev server              |
| `npm run build` | Build the app for production              |
| `npm run start` | Run the production build                  |
| `npm run lint`  | Run ESLint                                |

## Project Structure

```
app/
  (auth)/            # Public auth routes (sign-in) — layout without the dashboard shell
  (dashboard)/        # Authenticated app, grouped by route
    overview/          # Landing dashboard after sign-in
    invoices/          # Invoice listing + detail (invoices/[id])
    create-invoice/     # Invoice creation flow
    banking/           # Banking records + detail (banking/[id])
    payable/           # Accounts payable
    receiviable/        # Accounts receivable
    client-payment/     # Client payment recording
    record-vendors-payment/  # Vendor payment recording
    payment-approval/   # Payment approval workflow
    retainership-form/  # Retainer forms (retainership-form/[code])
    add-retainership-form/
    service-request/    # Service requests (service-request/[id])
    services/           # Services catalog
    set-rate/           # Rate configuration
    report/, add-report/  # Reporting
    sop/, create-sop/    # Standard operating procedures
    settings/           # App/user settings
  layout.tsx / page.tsx  # Root layout and entry page
  globals.css           # Tailwind + global styles

actions/     # Next.js Server Actions (auth, invoices, payments, vendors, service requests)
components/  # Shared UI: Navbar, Sidebar, HeaderCard/HeaderContent, RecentActivity, plus components/ui (shadcn-style primitives)
context/     # React context (user/auth state)
hooks/       # Custom hooks (useInvoice, useClient, useStaff, useService, useSessionGuard, use-mobile)
lib/         # Shared utilities
types/       # Shared TypeScript types (auth, invoice)
middleware.ts  # Route protection — redirects unauthenticated requests to /sign-in
```

## Authentication

- `signInAction` (in `actions/auth.ts`) is a Server Action that posts credentials to `${NEXT_PUBLIC_API_URL}/login`, then stores the returned token in an `httpOnly` cookie (`auth_token`).
- `context/user.tsx` provides client-side auth state (`user`, `token`, `login`, `logout`, `handleAuthError`) backed by a mirrored (non-httpOnly) cookie for client reads.
- `middleware.ts` guards dashboard routes (`/overview`, `/invoices`, `/banking`, `/payable`, `/receiviable`, `/report`, `/settings`, and related nested routes) — requests without an `auth_token` cookie are redirected to `/sign-in`.

## Notes

- Environment variables prefixed `NEXT_PUBLIC_` are exposed to the browser; do not put secrets there.
- Remote images are restricted in `next.config.ts` to the configured API host — update `images.remotePatterns` if the API domain changes.
