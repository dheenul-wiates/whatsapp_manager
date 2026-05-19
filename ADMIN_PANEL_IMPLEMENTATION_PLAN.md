# Admin Panel Implementation Plan

## Goal

Build a separate admin panel for the WhatsApp Business Manager site. The admin panel is used by the platform owner to create client invitations, generate access keys, monitor onboarding progress, and manage client accounts.

The admin should not collect or manually enter sensitive Meta access tokens. Meta/WhatsApp credentials must be entered by the client during their own onboarding flow.

## Current Project Context

- Framework: Next.js 16.2.6
- UI: React 19, Tailwind CSS, shadcn-style local UI components
- Database: Prisma with MongoDB
- Existing schema currently has only `Template`
- Existing dashboard routes are under `src/app/templates`
- Existing app layout uses `SidebarLayout` globally in `src/app/layout.tsx`
- Existing visual style is a compact SaaS dashboard

Important: This project uses a newer Next.js version. Before changing routing, layouts, server actions, cookies, middleware, or auth-related behavior, read the relevant guide under:

```txt
node_modules/next/dist/docs/
```

## Product Scope

The admin panel must allow one fixed platform admin to:

- Log in using email and password
- Create a client invitation
- Generate a one-time access key for that client
- View all clients
- View onboarding status
- Regenerate access keys
- Suspend/reactivate clients
- Add internal notes
- Track basic audit events

No admin signup and no password reset are required for now.

## Routes To Add

```txt
/admin/login
/admin
/admin/clients
/admin/clients/new
/admin/clients/[id]
```

Recommended route organization:

```txt
src/app/admin/login/page.tsx
src/app/admin/layout.tsx
src/app/admin/page.tsx
src/app/admin/clients/page.tsx
src/app/admin/clients/new/page.tsx
src/app/admin/clients/[id]/page.tsx
```

The admin layout should be separate from the client dashboard layout.

## Authentication Requirements

Use a simple first version:

- Admin logs in with email and password.
- One admin user is seeded into the database.
- Store admin password as a hash.
- Store admin session in a secure HTTP-only cookie.
- Protect all `/admin/*` routes except `/admin/login`.
- Redirect unauthenticated admin users to `/admin/login`.
- Redirect logged-in admin users away from `/admin/login` to `/admin`.

Recommended environment variables:

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-this-password
ADMIN_SESSION_SECRET=replace-with-random-secret
ACCESS_KEY_PEPPER=replace-with-random-secret
```

The seed script should create or update the fixed admin user from environment variables.

## Data Model Changes

Add these Prisma models.

```prisma
model AdminUser {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Client {
  id                         String    @id @default(auto()) @map("_id") @db.ObjectId
  email                      String    @unique
  name                       String?
  businessName               String
  phone                      String?
  plan                       String?
  status                     String    @default("INVITED")
  metaBusinessId             String?
  whatsappBusinessAccountId  String?
  phoneNumberId              String?
  businessVerificationStatus String    @default("NOT_STARTED")
  whatsappSetupStatus        String    @default("NOT_STARTED")
  notes                      String?
  onboardedAt                DateTime?
  suspendedAt                DateTime?
  createdAt                  DateTime  @default(now())
  updatedAt                  DateTime  @updatedAt

  accessKeys                 ClientAccessKey[]
  users                      ClientUser[]
}

model ClientAccessKey {
  id        String    @id @default(auto()) @map("_id") @db.ObjectId
  clientId  String    @db.ObjectId
  client    Client    @relation(fields: [clientId], references: [id], onDelete: Cascade)
  keyHash   String
  status    String    @default("ACTIVE")
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())
}

model ClientUser {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  clientId     String   @db.ObjectId
  client       Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  email        String   @unique
  passwordHash String
  name         String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model AuditLog {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  actorType  String
  actorId    String?
  action     String
  targetType String
  targetId   String?
  metadata   Json?
  createdAt  DateTime @default(now())
}
```

Recommended enum-like string values:

```txt
Client.status:
INVITED
ONBOARDING
ACTIVE
SUSPENDED

ClientAccessKey.status:
ACTIVE
USED
EXPIRED
REVOKED

businessVerificationStatus:
NOT_STARTED
PENDING
VERIFIED
REJECTED

whatsappSetupStatus:
NOT_STARTED
PENDING
CONNECTED
FAILED
```

## Access Key Rules

The access key is used by the client to start signup.

Requirements:

- Admin does not manually type the access key.
- System generates the access key.
- Format should be human-friendly:

```txt
WBM-XXXX-XXXX-XXXX
```

- Access key must be random and hard to guess.
- Store only a hash of the key in the database.
- Show the raw access key only immediately after generation.
- Allow admin to regenerate a new key.
- Regenerating should revoke previous active keys for that client.
- Recommended expiry: 7 days.
- Once used successfully, mark it as `USED`.

Recommended implementation:

- Generate with Node `crypto`.
- Hash with SHA-256 or HMAC-SHA-256 using `ACCESS_KEY_PEPPER`.
- Compare hash during client signup.

## Admin Pages

### `/admin/login`

Fields:

- Email
- Password

Behavior:

- Validate credentials against `AdminUser`.
- Create admin session cookie.
- Redirect to `/admin`.
- Show simple invalid credentials error.

No password reset, no signup.

### `/admin`

Dashboard cards:

- Total clients
- Invited clients
- Active clients
- Suspended clients
- Expired active keys

Recent activity:

- Last 10 audit log events
- Last 10 created clients

Primary action:

- Create client

### `/admin/clients`

Table columns:

- Business name
- Email
- Phone
- Status
- Business verification status
- WhatsApp setup status
- Access key status
- Created date
- Actions

Filters/search:

- Search by email/business name
- Status filter
- Verification filter
- Setup filter

Actions:

- View details
- Regenerate key
- Suspend/reactivate

### `/admin/clients/new`

Fields:

- Client email, required
- Business name, required
- Contact name, optional
- Phone number, optional
- Plan/package, optional
- Internal notes, optional

On submit:

- Create `Client`
- Generate active `ClientAccessKey`
- Write audit log
- Show generated access key once with copy button

Do not ask for:

- Meta access token
- WhatsApp API token
- System user token
- Webhook verify token

Those belong in the client onboarding flow.

### `/admin/clients/[id]`

Show:

- Client profile
- Status
- Onboarding status
- Meta Business ID, if submitted by client
- WhatsApp Business Account ID, if submitted by client
- Phone Number ID, if submitted by client
- Current access key status
- Internal notes
- Audit history

Actions:

- Regenerate access key
- Suspend client
- Reactivate client
- Update admin-only notes

## UI Theme

Use a clean operational SaaS theme. WhatsApp green should be the brand accent, but the whole interface should not be green.

Color palette:

```txt
Primary Green:      #25D366
Primary Dark:       #128C7E
Deep Text:          #111827
Muted Text:         #6B7280
Page Background:    #F7F8FA
Panel/Card:         #FFFFFF
Border:             #E5E7EB
Soft Green BG:      #E9F8EF
Success:            #16A34A
Warning:            #F59E0B
Error:              #DC2626
Info Blue:          #2563EB
```

Design guidance:

- Compact dashboard UI
- Sidebar navigation
- Tables for client management
- Use badges for status
- Use dialogs or dedicated pages for destructive actions
- Use icons from `lucide-react`
- Avoid marketing/landing-page style
- Avoid oversized hero sections
- Keep card radius around 8px or aligned with the existing design system

## Server Actions / Utilities To Add

Recommended files:

```txt
src/lib/auth/admin.ts
src/lib/auth/password.ts
src/lib/access-keys.ts
src/server/actions/admin-auth.ts
src/server/actions/admin-clients.ts
src/server/actions/audit-log.ts
```

Responsibilities:

- `password.ts`: hash and verify passwords
- `admin.ts`: admin session create/read/destroy helpers
- `access-keys.ts`: generate, hash, validate access keys
- `admin-auth.ts`: login/logout server actions
- `admin-clients.ts`: create client, list clients, update status, regenerate key
- `audit-log.ts`: write audit entries

## Acceptance Criteria

- Admin seed creates a fixed admin user.
- `/admin/login` works with seeded credentials.
- `/admin` is protected.
- `/admin/clients/new` creates a client and generates an access key.
- Access key is stored hashed, not raw.
- Admin can list clients.
- Admin can view client details.
- Admin can regenerate client access key.
- Admin can suspend/reactivate client.
- Audit log entries are created for major admin actions.
- Admin panel does not ask for client Meta access tokens.

## Implementation Order

1. Read relevant Next.js docs in `node_modules/next/dist/docs/`.
2. Update Prisma schema.
3. Update seed script for fixed admin user.
4. Add password hashing utilities.
5. Add admin session helpers.
6. Add access key utilities.
7. Add admin login page.
8. Add admin route protection.
9. Add admin layout/sidebar.
10. Add dashboard page.
11. Add client creation flow.
12. Add client list page.
13. Add client detail page.
14. Add access key regeneration.
15. Add suspend/reactivate.
16. Add audit logging.
17. Run lint/build checks.

## Out Of Scope For This Phase

- Client signup implementation
- Client login implementation
- Meta API validation
- WhatsApp template ownership migration
- Password reset
- Multi-admin support
- Role-based admin permissions
