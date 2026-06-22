# Eventora — Event Booking Web

**Eventora** is a full-stack MERN application for discovering, booking, and managing local events. Users can browse upcoming events, register with email verification, and book tickets with OTP confirmation. Admins can create events, review bookings, and confirm payments from a dedicated dashboard.

---

## Features

### For Users
- **Browse events** — View upcoming events on the home page with search by title, seat availability, pricing, and category.
- **Event details** — See full event information including date, location, description, and remaining seats.
- **Account registration & login** — Sign up with email/password; accounts are verified via a 6-digit OTP sent to email.
- **Secure booking** — Book an event with a two-step OTP flow (OTP sent to email before confirmation).
- **Personal dashboard** — View all your bookings with status (`pending`, `confirmed`, `cancelled`) and payment status (`paid`, `unpaid`).
- **Cancel bookings** — Cancel your own bookings from the user dashboard.

### For Admins
- **Event management** — Create, update, and delete events (title, description, date, location, category, seats, price, image).
- **Booking oversight** — View all user bookings across the platform.
- **Approve bookings** — Update booking status and mark payments as paid to confirm a booking and send a confirmation email to the user.

---

## Tech Stack

| Layer      | Technologies |
|------------|--------------|
| Frontend   | React 19, Vite, React Router, Tailwind CSS, Axios |
| Backend    | Node.js, Express 5, JWT authentication |
| Database   | MongoDB with Mongoose |
| Email      | Nodemailer (Gmail OAuth2) for OTP and booking confirmations |

---

## Project Structure

```
Event Booking Web/
├── backend/
│   └── src/
│       ├── config/         # MongoDB connection
│       ├── controllers/    # Auth, event, and booking logic
│       ├── middleware/     # JWT auth & admin role guard
│       ├── models/         # User, Event, Booking, OTP schemas
│       ├── routes/         # API route definitions
│       ├── utils/          # Email utilities (OTP & booking emails)
│       └── server.js       # Express app entry point
│
└── frontend/
    └── src/
        ├── components/     # Navbar and shared UI
        ├── context/        # Auth context & provider
        ├── pages/          # Home, Login, Register, Dashboards, EventDetails
        └── utils/            # Axios instance with JWT interceptor
```

---

## How It Works

### User Flow
1. **Register** → Receive an OTP via email → **Verify OTP** → Account activated.
2. **Browse** events on the home page and open an event for details.
3. Click **Confirm Registration** → OTP is sent to your email.
4. Enter the OTP → Booking is created with `pending` status.
5. Admin marks the booking as **paid** → Status becomes `confirmed`, seat count is updated, and a confirmation email is sent.
6. Manage bookings from the **User Dashboard** (`/dashboard`).

### Admin Flow
1. Log in with an admin account.
2. Open the **Admin Dashboard** (`/admin`).
3. Create and manage events.
4. Review bookings and update payment/status to confirm or cancel them.

### Booking Status Lifecycle

```
User books event (OTP verified)
        ↓
   status: pending
   payment: unpaid
        ↓
Admin marks payment as paid
        ↓
   status: confirmed
   payment: paid
   (confirmation email sent)
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas)
- A Gmail account with OAuth2 credentials for sending emails

### 1. Clone the repository

```bash
git clone <repository-url>
cd "Event Booking Web"
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/eventora
JWT_SECRET=your_jwt_secret_key

# Gmail OAuth2 (for OTP & booking emails)
GOOGLE_USER=your-email@gmail.com
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
```

Start the backend:

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` (default Vite port).

> **Note:** The frontend is configured to call the API at `http://localhost:5000/api/`. Update `frontend/src/utils/axios.jsx` if your backend runs on a different host or port.

---

## Frontend Routes

| Route            | Page            | Access        | Description                          |
|------------------|-----------------|---------------|--------------------------------------|
| `/`              | Home            | Public        | Browse and search events             |
| `/register`      | Register        | Public        | Create a new account                 |
| `/login`         | Login           | Public        | Sign in (OTP sent if unverified)     |
| `/events/:id`    | Event Details   | Public        | View event and book tickets          |
| `/dashboard`     | User Dashboard  | Authenticated | View and cancel your bookings        |
| `/admin`         | Admin Dashboard | Admin only    | Manage events and all bookings       |

---

## API Endpoints

### Authentication — `/api/auth`

| Method | Endpoint        | Description                    |
|--------|-----------------|--------------------------------|
| POST   | `/register`     | Register a new user            |
| POST   | `/login`        | Login and receive JWT token    |
| POST   | `/verify-otp`   | Verify account with OTP        |

### Events — `/api/events`

| Method | Endpoint  | Auth     | Description                              |
|--------|-----------|----------|------------------------------------------|
| GET    | `/`       | Public   | Get all events (supports `?search=`, `?category=`, `?location=`) |
| GET    | `/:id`    | Public   | Get a single event by ID                 |
| POST   | `/`       | Admin    | Create a new event                       |
| PUT    | `/:id`    | Admin    | Update an event                          |
| DELETE | `/:id`    | Admin    | Delete an event                          |

### Bookings — `/api/booking`

| Method | Endpoint       | Auth     | Description                              |
|--------|----------------|----------|------------------------------------------|
| POST   | `/send-otp`    | User     | Send booking OTP to user's email         |
| POST   | `/`            | User     | Create a booking (requires `eventId`, `otp`) |
| GET    | `/my-bookings` | User     | Get current user's bookings              |
| GET    | `/`            | Admin    | Get all bookings                         |
| PUT    | `/:id`         | Admin    | Update booking status / payment status   |
| DELETE | `/:id`         | User     | Cancel own booking                       |

> Protected routes require a `Bearer <token>` header obtained from login or OTP verification.

---

## Data Models

### User
- `name`, `email`, `password` (hashed with bcrypt)
- `role`: `user` | `admin` (default: `user`)
- `isVerified`: boolean (OTP verification required for regular users)

### Event
- `title`, `description`, `date`, `location`, `category`
- `totalSeats`, `availableSeats`, `price`, `image` (optional URL)
- `createdBy` (admin user reference)

### Booking
- `userId`, `eventId`
- `status`: `pending` | `confirmed` | `cancelled`
- `paymentStatus`: `paid` | `unpaid`
- `amount` (ticket price at time of booking)

---

## Scripts

### Backend (`backend/`)
| Command       | Description              |
|---------------|--------------------------|
| `npm run dev` | Start with nodemon       |
| `npm start`   | Start production server  |

### Frontend (`frontend/`)
| Command         | Description            |
|-----------------|------------------------|
| `npm run dev`   | Start Vite dev server  |
| `npm run build` | Production build       |
| `npm run preview` | Preview production build |
| `npm run lint`  | Run ESLint             |

---

## License

ISC
