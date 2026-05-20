# WhatsApp SaaS Manager

A modern SaaS dashboard for managing WhatsApp Business API connections, templates, and campaigns. Built with Next.js, Prisma, MongoDB, and Tailwind CSS.

## Required Environment Variables

To run this project, you need to set up the following environment variables. Create a `.env` file in the root directory and add:

```env
# Database Configuration (MongoDB)
DATABASE_URL="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority"

# Admin Panel Configuration
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="SecurePassword123"

# Security & Session Secrets (Generate strong random strings for these)
ADMIN_SESSION_SECRET="your_admin_session_secret"
CLIENT_SESSION_SECRET="your_client_session_secret"
ACCESS_KEY_PEPPER="your_encryption_pepper_secret"
```

## Local Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   # or yarn install / pnpm install
   ```

2. **Set up Environment Variables**
   Create a `.env` file and populate it with the required variables listed above.

3. **Initialize Database**
   Push the Prisma schema to your MongoDB database:
   ```bash
   npx prisma db push
   ```
   Generate the Prisma client:
   ```bash
   npx prisma generate
   ```

4. **Seed Initial Data**
   Seed the database with the initial required data (if any):
   ```bash
   npm run seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

## Deployment Steps (Vercel)

The easiest way to deploy this Next.js app is using [Vercel](https://vercel.com).

1. **Push your code to a Git provider** (GitHub, GitLab, or Bitbucket).
2. **Import Project into Vercel:**
   - Go to your Vercel dashboard and click **Add New... > Project**.
   - Import your repository.
3. **Configure Environment Variables:**
   - In the Vercel deployment settings, add all the environment variables listed in the `Required Environment Variables` section above.
4. **Deploy:**
   - Click **Deploy**. Vercel will automatically run `npm run build` and `npx prisma generate` (ensure your `build` script in `package.json` includes `prisma generate` if needed, or Vercel will handle it).
5. **Database Webhooks:**
   - Once deployed, copy your production domain URL and configure the WhatsApp Webhooks in your Meta App Dashboard to point to `https://your-domain.com/api/meta/webhooks`.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS & shadcn/ui
- **Database ORM:** Prisma
- **Database:** MongoDB
