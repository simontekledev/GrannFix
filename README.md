# GrannFix

A mobile marketplace platform connecting users with local helpers for everyday tasks. Post a task, receive offers from nearby helpers, and complete jobs securely — all through the app.

> **Status:** In active development

---

## Architecture

The project follows a **modular monolith** pattern with a Spring Boot backend and a React Native mobile client.

```
GrannFix/
├── backend/     # Spring Boot REST API
└── mobile/      # React Native (Expo) client
```

### Backend

- **Java 17 + Spring Boot 4**
- **PostgreSQL** — relational data store
- **Spring Security** — stateless JWT authentication
- **SpringDoc OpenAPI 3** — auto-generated API documentation
- **Maven** — build and dependency management

### Mobile

- **React Native + Expo** — cross-platform mobile app
- **TypeScript** — type-safe frontend code
- **React Navigation** — tab-based routing
- **Auto-generated API clients** — TypeScript clients generated from the OpenAPI spec

---

## Features

### Authentication & Users

- Phone number verification via OTP (Twilio)
- Email/password registration and login
- Password reset flow via email (Brevo SMTP)
- JWT-based session management with Bearer tokens
- Role-based access control (User, Admin)
- User profiles with location (city, area, street)
- Admin endpoints for user management (deactivation, listing)

### Tasks

- Create tasks with title, description, location, and offered price
- Browse and search tasks with cursor-based pagination
- Filter by city, area, and status
- Task lifecycle: `OPEN` → `ASSIGNED` → `COMPLETED` / `CANCELLED`
- Soft deletion with an active flag
- Only verified users can create tasks

### Offers

- Helpers submit offers on open tasks with an optional proposed price and message
- Task owners can accept an offer, which auto-declines all other pending offers and assigns the task
- Two-step completion flow: helper marks done → task owner confirms done
- One offer per helper per task (enforced via unique constraint)
- Pending offer count surfaced on task detail (visible only to task owner)
- `canOffer` permission disables the offer button for users who already have an offer

### Chat

- One chat per assigned task between owner and helper
- Real-time messaging via polling (every 4 seconds)
- Chat list shows task title, other party's name, and last message preview
- Participant validation on every message endpoint

### API Documentation

- Swagger UI available at `/swagger-ui.html`
- OpenAPI 3.0 spec at `/v3/api-docs`
- TypeScript API clients auto-generated from the spec (`npm run generate-api` in `/mobile`)

---

## Getting Started

### Prerequisites

- Java 17+
- PostgreSQL
- Node.js 18+
- Expo CLI

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

The API starts on `http://localhost:8080`. Configure database credentials and external service keys in `backend/src/main/resources/application.properties`.

### Mobile

```bash
cd mobile
npm install
npm start
```

Update the API base URL in `mobile/src/api/client.ts` to point to your backend.

### Regenerate API Clients

After making backend API changes:

```bash
cd mobile
npm run generate-api
```

---

## API Overview

| Area   | Endpoint                          | Description                    |
|--------|-----------------------------------|--------------------------------|
| Auth   | `POST /auth/register`             | Register a new user            |
| Auth   | `POST /auth/login`                | Login with email and password  |
| Auth   | `POST /auth/send-otp`             | Send OTP to phone number       |
| Auth   | `POST /auth/verify-otp`           | Verify OTP code                |
| Auth   | `POST /auth/forgot-password`      | Request password reset         |
| Auth   | `POST /auth/reset-password`       | Reset password with token      |
| Users  | `GET /users/me`                   | Get current user profile       |
| Users  | `PATCH /users/me`                 | Update current user            |
| Users  | `GET /users/{id}`                 | Get public user profile        |
| Tasks  | `POST /tasks`                     | Create a new task              |
| Tasks  | `GET /tasks`                      | Browse tasks (public)          |
| Tasks  | `GET /tasks/me`                   | Get own tasks                  |
| Tasks  | `PATCH /tasks/{id}`               | Update a task                  |
| Tasks  | `POST /tasks/{id}/cancel`         | Cancel a task                  |
| Offers | `POST /tasks/{taskId}/offers`     | Submit an offer                |
| Offers | `GET /tasks/{taskId}/offers`      | List offers (task owner only)  |
| Offers | `POST /offers/{id}/accept`        | Accept an offer                |
| Offers | `POST /offers/{id}/mark-done`     | Helper marks offer as done     |
| Offers | `POST /offers/{id}/confirm-done`  | Owner confirms completion      |
| Chat   | `GET /chats`                      | List current user's chats      |
| Chat   | `GET /tasks/{taskId}/chat`        | Get or create chat for task    |
| Chat   | `GET /chats/{chatId}/messages`    | Get messages (with `after`)    |
| Chat   | `POST /chats/{chatId}/messages`   | Send a message                 |
| Admin  | `GET /admin/users`                | List all users (paginated)     |
| Health | `GET /ping`                       | Health check                   |

---

## Project Structure

```
backend/src/main/java/com/example/grannfix/
├── auth/          # Authentication, OTP, JWT, password reset
├── user/          # User profiles, admin operations
├── task/          # Task CRUD, search, status transitions
├── offer/         # Offer lifecycle, acceptance, completion
├── chat/          # Chats, messages, task-scoped conversations
└── common/        # Security config, error handling, shared contracts
```

```
mobile/
├── app/           # Screens and navigation (Expo Router)
│   ├── (tabs)/    # Tab-based screens (Discover, Tasks, Chat, Profile)
│   ├── task-detail.tsx        # Task details, offers, edit, cancel
│   ├── chat-conversation.tsx  # Message thread for a chat
│   ├── edit-profile.tsx       # Edit user profile
│   ├── settings.tsx           # Account & app settings
│   └── public-user.tsx        # Public profile view
├── src/api/       # Auto-generated API clients and config
├── src/context/   # React contexts (UserContext)
├── src/helpers/   # Utilities (time formatting, distance, areas)
├── src/styles/    # Shared styles (modal, form)
├── components/    # Reusable UI components
└── constants/     # Theme and color definitions
```

---

## License

Private — all rights reserved.
