# 🛡️ SafeNana Backend

REST API for **SafeNana**, a prototype check-in and safety coordination tool for older adults and their families, built after my grandmother nearly lost her savings to a phone scammer.

> **Status: prototype.** Not an emergency service and does not contact emergency services. There is no authentication and no push, SMS or email notifications yet, so please use demo data only.

---

## 📌 What It Does Today

- Records daily check-ins, help requests and suspicious-message reports
- Stores a family message as an activity record
- Serves a 7-day summary and an activity feed to the family dashboard
- Stores settings: the person's name, a family contact and a preferred check-in time
- Validates input, applies rate limiting and security headers
- Refuses to start if the database is unreachable, and reports database status on its health endpoint

## 🚧 Not Built Yet

- User accounts and login (the API is currently open, so use demo data only)
- Push, SMS and email alerts to family
- Escalation to a backup contact
- Multiple residents and caregivers
- Automatic missed check-in alerts
- PDF/CSV reports

---

## ⚙️ Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB** (Mongoose)
- `helmet` and `express-rate-limit` for basic hardening

---

## 🔌 API

- `GET /api/health`: server and database status (returns 503 if the database is down)
- `GET /api/events`: latest 50 events
- `GET /api/events/weekly-summary`: counts for the last 7 days
- `GET /api/events/alerts`: suspicious message reports
- `POST /api/events/checkin`
- `POST /api/events/suspicious` with `senderType`: `unknown_number`, `whatsapp_forward`, `someone_i_know` or `not_sure`
- `POST /api/events/help`
- `POST /api/events/message` (1 to 200 characters)
- `GET /api/settings` and `PUT /api/settings`

---

## 🔑 Environment Variables

Create a `.env` file (never commit it):

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
ALLOWED_ORIGINS=https://safe-nana-frontend.vercel.app
```

`ALLOWED_ORIGINS` is optional and takes a comma-separated list of websites allowed to call the API.

---

## 🧪 Demo Data

`node seed.js` resets a database with fresh sample events dated this week. It **refuses to run unless the database name contains "demo"** (for example `safenana_demo`), so it cannot wipe a real database. Run it again before any demo, because the dates age.

---

## 🎨 Frontend

- 👵 Older adult screen: [safe-nana-frontend.vercel.app/elderly](https://safe-nana-frontend.vercel.app/elderly)
- 👨‍👩‍👧 Family dashboard: [safe-nana-frontend.vercel.app/dashboard](https://safe-nana-frontend.vercel.app/dashboard)

---

## 📖 The Story

*"Beta, agar galti ho gayi toh?" (Son, what if a mistake happens?)*: my grandmother's question became my design brief. For me, dignity is the only metric that matters.