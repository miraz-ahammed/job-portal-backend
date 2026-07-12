# Job Portal Backend

Express.js + TypeScript + MongoDB + JWT Auth REST API for the Job Portal project.

## Tech Stack
- Node.js + Express.js
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing

## Local Setup

1. Install dependencies
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your values
   ```bash
   cp .env.example .env
   ```
   - `MONGO_URI`: your MongoDB Atlas connection string
   - `JWT_SECRET`: any long random string
   - `CLIENT_URL`: your frontend URL (for CORS)

3. Run in development
   ```bash
   npm run dev
   ```

4. Seed demo admin + user accounts (needed for assignment submission credentials)
   ```bash
   npm run seed
   ```

## API Endpoints

### Auth
| Method | Route | Access | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Register new user |
| POST | /api/auth/login | Public | Login, returns JWT |
| GET | /api/auth/me | Private | Get logged-in user profile |

### Jobs
| Method | Route | Access | Description |
|---|---|---|---|
| GET | /api/jobs | Public | List jobs (search, filter, sort, paginate) |
| GET | /api/jobs/:id | Public | Get single job + related jobs |
| GET | /api/jobs/meta/categories | Public | Get distinct categories & locations for filters |
| POST | /api/jobs | Admin only | Create a job posting |
| GET | /api/jobs/manage/mine | Admin only | Get jobs posted by logged-in admin |
| DELETE | /api/jobs/:id | Admin only | Delete a job (must be the poster) |

### Query params for GET /api/jobs
`?search=react&category=Engineering&location=Dhaka&jobType=Full-time&sort=newest&page=1&limit=12`

## Deployment (Render)

1. Push this folder to a GitHub repo (e.g. `job-portal-backend`)
2. Go to [render.com](https://render.com) → New → Web Service → connect your repo
3. Settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. Add environment variables (same as `.env`) in Render's dashboard
5. After deploy, copy the live URL — you'll use this as `NEXT_PUBLIC_API_URL` in the frontend

## Deployment note on Vercel
Vercel is optimized for serverless functions, not long-running Express servers.
If you specifically need the backend on Vercel too, wrap the Express app as a
serverless function (`api/index.ts`) using `serverless-http`. Render/Railway
is simpler and more reliable for a standard Express + MongoDB backend.
