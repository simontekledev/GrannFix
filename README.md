# GrannFix 🏠

**Quick help from your neighbors.** GrannFix connects people who need help with everyday tasks like carrying, mounting and moving with reliable helpers nearby.

> 📱 React Native (Expo) · ☕ Spring Boot · 🐘 PostgreSQL

---

## Screenshots

| Onboarding | Explore | Tasks | Chat | Profile |
|:----------:|:-------:|:-----:|:----:|:-------:|
| <img src="docs/screenshots/onboarding.png" width="180"> | <img src="docs/screenshots/explore.png" width="180"> | <img src="docs/screenshots/tasks.png" width="180"> | <img src="docs/screenshots/chat.png" width="180"> | <img src="docs/screenshots/profile.png" width="180"> |

### 🌙 Dark mode

| Explore | Tasks |
|:-------:|:-----:|
| <img src="docs/screenshots/explore-dark.png" width="220"> | <img src="docs/screenshots/tasks-dark.png" width="220"> |

---

## What can you do?

🔍 **Find help** — Browse tasks near you, filter by category

📦 **Post a task** — Describe what you need, pick a category and price

💬 **Chat** — Talk directly with the helper before and during the task

⭐ **Rate** — Leave a star rating after the task is completed

🔔 **Push notifications** — Never miss a new offer or message

🛡️ **Safety controls** — Report inappropriate users and block anyone to hide their tasks, offers, and messages

🌙 **Dark mode** — Full dark theme support across the app

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Mobile** | React Native, Expo, TypeScript, Expo Router |
| **Backend** | Java 17, Spring Boot 4, Spring Security |
| **Database** | PostgreSQL |
| **Push** | Firebase Cloud Messaging (FCM) |
| **Email** | Resend SMTP |
| **Image storage** | Cloudinary (auto-format, auto-quality, on-the-fly transforms) |
| **Auth** | JWT (access 15 min + refresh 30 days) |
| **API** | REST, OpenAPI 3.0, auto-generated TypeScript client |

## Architecture

```
GrannFix/
├── backend/          # Modular monolith (Spring Boot)
│   ├── auth/         # JWT, password reset
│   ├── user/         # Profiles, admin
│   ├── task/         # Tasks, categories, search
│   ├── offer/        # Offers, ratings
│   ├── chat/         # Messages
│   ├── moderation/   # User reports and blocks
│   └── notification/ # Push (FCM)
└── mobile/           # React Native (Expo)
    ├── app/          # Screens (Expo Router)
    ├── src/api/      # Auto-generated API client
    ├── src/context/  # User, Theme
    └── src/components/ # TaskCard, Skeleton, ErrorBoundary
```

---

## Getting Started

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

Create `backend/.env` (loaded automatically via `spring-dotenv`):

```properties
DB_PASSWORD=your_db_password
MAIL_PASSWORD=your_resend_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Mobile

```bash
cd mobile
npm install
npm start
```

Update the API base URL in `mobile/src/api/client.ts`.

### API Documentation

Swagger UI: `/swagger-ui.html` · OpenAPI spec: `/v3/api-docs`

Regenerate client after backend changes: `npm run generate-api`

---

## License

Private — all rights reserved.
