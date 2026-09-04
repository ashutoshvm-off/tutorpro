# TutorFlow — Test Credentials

Use these credentials to explore the app in development mode.

---

## 🔐 Dev Login (Local Development Only)

TutorFlow uses OAuth for production authentication. In local development, a **dev login** endpoint is available that bypasses OAuth and creates a mock session.

### How to Use Dev Login

Start the dev server (`npm run dev`) and send a POST request:

```bash
curl -X POST http://localhost:3000/api/dev-login \
  -H "Content-Type: application/json" \
  -d '{"email": "tutor@tutorflow.local", "name": "Maya Rivera"}'
```

The server will:
1. Create/upsert a mock user in the database
2. Set a session cookie (`app_session_id`) valid for 1 year
3. Return `{ success: true, openId, name, email }`

After that, open `http://localhost:3000` in the same browser — you'll be logged in.

---

## 👨‍🏫 Tutor Account

| Field    | Value                          |
|----------|--------------------------------|
| Email    | `tutor@tutorflow.local`        |
| Name     | `Maya Rivera`                  |
| Role     | Tutor                          |

**Dev login command:**
```bash
curl -X POST http://localhost:3000/api/dev-login \
  -H "Content-Type: application/json" \
  -d '{"email": "tutor@tutorflow.local", "name": "Maya Rivera"}'
```

After logging in, navigate to `/dashboard/tutor` to see:
- Session agenda and scheduling
- Student roster
- AI lesson planner
- Invitation link generator

---

## 👩‍🎓 Student Account

| Field    | Value                          |
|----------|--------------------------------|
| Email    | `student@tutorflow.local`      |
| Name     | `Aarav Mehta`                  |
| Role     | Student                        |

**Dev login command:**
```bash
curl -X POST http://localhost:3000/api/dev-login \
  -H "Content-Type: application/json" \
  -d '{"email": "student@tutorflow.local", "name": "Aarav Mehta"}'
```

After logging in, navigate to `/dashboard/student` to see:
- Upcoming session timeline
- Lesson history and summaries
- Progress tracking & mastery badges
- Booking calendar

---

## 🌐 Supabase Database

| Field               | Value                                                      |
|---------------------|------------------------------------------------------------|
| Supabase Project URL| `https://oovfgslukuqmjcpwiddt.supabase.co`                |
| Anon/Publishable Key| `sb_publishable_cTHlNJUw1am_g5--Cx8-sA_hKuwVXnl`         |
| Database URL        | Set in `.env` → `DATABASE_URL`                             |

---

## ⚠️ Notes

- The dev login endpoint (`/api/dev-login`) is **only available** when `NODE_ENV=development`. It is disabled in production builds.
- After creating a dev session, you must also create a TutorFlow profile via the `/signup` page to set your role (tutor or student), grade, school, etc.
- To switch between tutor and student accounts, clear the `app_session_id` cookie in your browser and run the dev login command with different credentials.
