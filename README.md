# DS CREATIONS Website

Next.js 16 public website and protected content-management foundation for DS CREATIONS.

## Local setup

1. Install Node.js 20.19 or newer and run:

   ```powershell
   npm install
   ```

2. Create a PostgreSQL project in Neon and copy its pooled connection string.

3. Copy `.env.example` to `.env.local`. Do not commit `.env.local`.

4. Set `DATABASE_URL` in `.env.local` to the Neon PostgreSQL connection string.

5. Generate a strong Auth.js secret and set `AUTH_SECRET`:

   ```powershell
   npx auth secret
   ```

6. Choose an administrator password containing at least 12 characters and generate its bcrypt hash:

   ```powershell
   npm run admin:hash -- "your-long-local-admin-password"
   ```

7. Set `ADMIN_EMAIL` and paste the generated hash into `ADMIN_PASSWORD_HASH`. Never store the plain-text password in source control.

8. Create a Vercel Blob store for the project and set its server-only `BLOB_READ_WRITE_TOKEN`.

9. Set `NEXT_PUBLIC_SITE_URL` to the deployed website URL.

10. Format, validate, and generate the Prisma client:

    ```powershell
    npx prisma format
    npx prisma validate
    npx prisma generate
    ```

11. Apply the initial migration to the intended local/development Neon database. Confirm the connection string before running this command:

    ```powershell
    npx prisma migrate dev
    ```

12. Seed the administrator, categories, 24 products, local fallback logo/catalogue records, and website settings:

    ```powershell
    npm run seed
    ```

13. Start the development server:

    ```powershell
    npm run dev
    ```

14. Open `http://localhost:3000/admin/login` and sign in with `ADMIN_EMAIL` and the original password used to create the hash.

15. Configure the same environment variables in the Vercel project. Keep `AUTH_SECRET`, `ADMIN_PASSWORD_HASH`, `DATABASE_URL`, and `BLOB_READ_WRITE_TOKEN` server-only.

16. Run local verification before deploying:

    ```powershell
    npx tsc --noEmit
    npm run build
    ```

## Admin routes

- `/admin` — dashboard
- `/admin/products` — product search, filters, publishing and editing
- `/admin/products/new` — add a product
- `/admin/categories` — category management
- `/admin/assets?type=logo` — official logo management
- `/admin/assets?type=catalogue` — catalogue PDF management
- `/admin/settings` — website contact and content settings

## Storage and safety

Uploaded images, logos and catalogue PDFs are stored in Vercel Blob. Local files under `public` are fallbacks and seed sources only. Every admin mutation verifies an authenticated, active ADMIN session and validates its form or file input on the server. Online payment and customer authentication are intentionally not implemented.
