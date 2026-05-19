# Client Signup And Onboarding Implementation Plan

## Goal

Build the client-facing signup, login, onboarding, and management-dashboard changes for the WhatsApp Business Manager site.

The client is invited by the admin using an email and generated access key. The client then completes signup, enters their own Meta/WhatsApp details, and gets access to the dashboard.

No password reset is required for now.

## Current Project Context

- Framework: Next.js 16.2.6
- UI: React 19, Tailwind CSS, shadcn-style local UI components
- Database: Prisma with MongoDB
- Existing schema currently has only `Template`
- Existing dashboard routes are under `src/app/templates`
- Existing app layout uses `SidebarLayout` globally in `src/app/layout.tsx`

Important: This project uses a newer Next.js version. Before changing routing, layouts, server actions, cookies, middleware, or auth-related behavior, read the relevant guide under:

```txt
node_modules/next/dist/docs/
```

## Product Scope

Build the client-facing flow:

1. Client opens signup page.
2. Client enters email and access key.
3. System validates the access key generated from admin panel.
4. Client creates their password and enters profile/business details.
5. Client completes Meta/WhatsApp onboarding checklist.
6. Client gets access to the management dashboard.
7. Existing dashboard routes are protected behind client login.

## Routes To Add Or Update

Public/auth routes:

```txt
/signup
/login
/logout
```

Client onboarding/dashboard routes:

```txt
/onboarding
/onboarding/business
/onboarding/whatsapp
/settings/business
/settings/whatsapp
```

Existing protected dashboard routes:

```txt
/templates
/templates/create
/templates/[id]
/templates/[id]/edit
```

Recommended route organization:

```txt
src/app/(auth)/signup/page.tsx
src/app/(auth)/login/page.tsx
src/app/(client)/layout.tsx
src/app/(client)/onboarding/page.tsx
src/app/(client)/onboarding/business/page.tsx
src/app/(client)/onboarding/whatsapp/page.tsx
src/app/(client)/settings/business/page.tsx
src/app/(client)/settings/whatsapp/page.tsx
```

Adjust this structure based on the Next.js docs and current app conventions.

## Data Model Assumptions

This plan assumes the admin-panel implementation has added these models:

- `Client`
- `ClientAccessKey`
- `ClientUser`
- `AuditLog`

It also assumes existing `Template` will be updated to belong to a client.

Update existing `Template` model:

```prisma
model Template {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  clientId    String   @db.ObjectId
  client      Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  name        String
  category    String
  language    String
  status      String
  body        String
  bodySamples Json?
  buttons     Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

If templates should remain globally shared for now, defer the `clientId` migration, but dashboard protection should still be implemented.

## Signup Flow

### Step 1: Email And Access Key

Route:

```txt
/signup
```

Fields:

- Email
- Access key

Validation:

- Email must match an existing `Client`.
- Client status must not be `SUSPENDED`.
- Access key must exist for that client.
- Access key must be `ACTIVE`.
- Access key must not be expired.
- Access key must not be used.
- Entered key hash must match stored `keyHash`.

If valid:

- Move user to account creation step.
- This can be the same page with progressive form state or a separate server-verified temporary signup token.

Do not expose whether email or access key specifically failed. Use a generic message:

```txt
The email or access key is invalid, expired, or already used.
```

### Step 2: Account Creation

Fields:

- Full name
- Password
- Confirm password
- Optional phone number, if not already provided by admin

Rules:

- Email comes from the verified invitation and should not be changed.
- Password should be hashed.
- Create `ClientUser`.
- Mark client status as `ONBOARDING`.
- Mark access key as `USED`.
- Set `usedAt`.
- Write audit log.

After success:

- Create client session cookie.
- Redirect to `/onboarding`.

## Login Flow

Route:

```txt
/login
```

Fields:

- Email
- Password

Rules:

- Validate against `ClientUser`.
- Client must not be suspended.
- Create secure HTTP-only session cookie.
- Redirect:
  - If onboarding incomplete: `/onboarding`
  - If onboarding complete: `/templates` or dashboard home

No password reset in this phase.

## Client Session Requirements

Add client auth helpers.

Recommended files:

```txt
src/lib/auth/client.ts
src/lib/auth/password.ts
src/server/actions/client-auth.ts
```

Requirements:

- Create client session after signup/login.
- Read current client user and client from cookie.
- Destroy client session on logout.
- Protect client dashboard routes.
- Redirect unauthenticated users to `/login`.
- Redirect suspended clients to a blocked/status page or logout with message.

## Onboarding Flow

Route:

```txt
/onboarding
```

Show checklist:

- Business profile
- Meta Business verification
- WhatsApp Business setup
- API connection
- Webhook setup

This route should guide the client through required setup and show status. The real Meta Business Verification process happens in the client-owned Meta Business Manager, not inside the admin panel.

## Business Details Page

Route:

```txt
/onboarding/business
```

Fields:

- Business legal name
- Display/business name
- Business website
- Business email
- Business phone
- Business address
- Country
- Business category
- Meta Business ID

Save these to the `Client` model or a separate `ClientBusinessProfile` model if more structure is desired.

Recommended first version: store directly on `Client` unless the schema becomes too large.

## WhatsApp Setup Page

Route:

```txt
/onboarding/whatsapp
```

Fields:

- WhatsApp Business Account ID
- Phone Number ID
- System user/permanent access token
- Webhook verify token

Important:

- These details are entered by the client, not by the admin.
- Access tokens are sensitive. Consider encryption at rest before storing them.
- If encryption is not implemented in the first pass, clearly isolate storage and avoid exposing tokens back in the UI.

Recommended environment variable:

```env
TOKEN_ENCRYPTION_SECRET=replace-with-random-secret
```

If storing tokens:

- Encrypt before saving.
- Never render the full token after save.
- Show only masked value like `EAA...9x2`.
- Allow replacing the token.

## Meta Verification Guidance

The app should not pretend to complete Meta Business Verification fully inside this product. Instead, guide the client.

Show checklist items such as:

- Open Meta Business Settings.
- Confirm business legal name and address.
- Verify business email/domain if Meta asks for it.
- Submit required legal documents in Meta.
- Wait for Meta review.
- Create or connect WhatsApp Business Account.
- Add and verify phone number.
- Create system user.
- Generate permanent access token.
- Grant required permissions.
- Paste the required IDs/token into this dashboard.

Recommended UI:

- Use checklist cards or a compact status list.
- Provide fields for IDs/token.
- Provide a "Validate connection" button.
- Show status badges:
  - Not started
  - Pending
  - Connected
  - Failed

## Meta API Validation

When the client submits WhatsApp details, validate by calling Meta APIs if credentials are available.

Possible checks:

- Access token is valid.
- Token has required permissions.
- WhatsApp Business Account ID is accessible.
- Phone Number ID belongs to the account.
- Webhook can be configured or verify token is saved.

Recommended statuses:

```txt
whatsappSetupStatus:
NOT_STARTED
PENDING
CONNECTED
FAILED
```

If API validation is not implemented in the first version:

- Save details.
- Mark status as `PENDING`.
- Let admin or future background job verify manually.

## Client Management Dashboard Changes

Existing dashboard currently routes users directly to `/templates`.

Required changes:

- Add client login protection.
- Make root route redirect based on auth state.
- If not logged in, redirect to `/login`.
- If logged in but onboarding incomplete, redirect to `/onboarding`.
- If logged in and active, redirect to `/templates`.

Existing templates features should be client-scoped.

## Template Ownership Changes

Every template should belong to a client.

Required changes:

- Add `clientId` to `Template`.
- During template creation, set `clientId` from current session.
- During template listing, filter by current `clientId`.
- During template detail/edit/delete, verify the template belongs to current client.
- Avoid showing one client another client's templates.

Files likely to change:

```txt
prisma/schema.prisma
src/server/actions/templates.ts
src/app/templates/page.tsx
src/app/templates/create/page.tsx
src/app/templates/[id]/page.tsx
src/app/templates/[id]/edit/page.tsx
```

## UI Theme

Use the same product theme as the admin panel, but make the onboarding flow feel guided and calm.

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

- Login/signup pages should be simple and focused.
- Onboarding should use checklist/status UI.
- Dashboard remains compact and operational.
- Use badges for progress/status.
- Use `lucide-react` icons.
- Avoid marketing landing page design.
- Avoid unnecessary hero sections.

## Server Actions / Utilities To Add

Recommended files:

```txt
src/lib/auth/client.ts
src/lib/auth/password.ts
src/lib/access-keys.ts
src/lib/token-encryption.ts
src/server/actions/client-auth.ts
src/server/actions/client-onboarding.ts
src/server/actions/meta-validation.ts
```

Responsibilities:

- `client.ts`: client session helpers
- `password.ts`: password hash/verify helpers
- `access-keys.ts`: verify invitation access keys
- `token-encryption.ts`: encrypt/decrypt sensitive Meta tokens
- `client-auth.ts`: signup/login/logout actions
- `client-onboarding.ts`: save business and WhatsApp setup details
- `meta-validation.ts`: validate Meta/WhatsApp credentials

## Acceptance Criteria

- `/signup` validates admin-generated email/access key.
- Invalid/expired/used keys are rejected.
- Successful signup creates a `ClientUser`.
- Successful signup marks access key as used.
- Client can log in with email/password.
- No password reset is exposed.
- Client dashboard routes are protected.
- Suspended clients cannot access the dashboard.
- Onboarding checklist exists.
- Client can submit business details.
- Client can submit Meta/WhatsApp setup details.
- Sensitive tokens are not exposed in full after save.
- Existing template routes are scoped to current client.

## Implementation Order

1. Read relevant Next.js docs in `node_modules/next/dist/docs/`.
2. Confirm admin-panel data models exist.
3. Add or reuse password hashing utilities.
4. Add client session helpers.
5. Build `/signup` access key verification.
6. Build account creation step.
7. Build `/login` and logout.
8. Add route protection for client dashboard.
9. Build onboarding checklist page.
10. Build business details onboarding page.
11. Build WhatsApp setup onboarding page.
12. Add token masking/encryption.
13. Add optional Meta API validation.
14. Scope templates by client.
15. Run lint/build checks.

## Out Of Scope For This Phase

- Password reset
- Self-service signup without admin invitation
- Full embedded Meta OAuth flow
- Automatic Meta Business Verification submission
- Billing/subscription management
- Multi-user client teams
- Role-based client permissions
