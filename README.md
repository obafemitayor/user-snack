# UserSnap Pizza Delivery App

A full-stack pizza ordering application:
- Backend: FastAPI + MongoDB with JWT auth middleware, robust validation, and test coverage.
- Frontend: React (TypeScript) + Chakra UI + React-Intl with strong type safety and tests.

## What I Implemented

- Users API: endpoints to create, update, and delete users.
- Pizza Menus API: endpoints to add, update, and delete pizza menu items.
- Orders API: endpoint to place pizza orders.
- Order Confirmation: endpoint to confirm an order.
- Auth API: endpoint to generate JWT auth tokens.
- User Interface to view all Pizza Menus and respective menu details.
- User Interface to place orders for a pizza (including extras/quantity where applicable).
- User Interface to view all placed orders.
- User Interface to view/confirm the status of placed orders.
- To keep things simple, Only one order can be placed at a time.

## Project Structure

```
UserSnap/
├── backend/                      # FastAPI backend (run compose here)
│   ├── app/
│   │   ├── controllers/          # Route handlers
│   │   ├── middleware/           # JWT auth, CORS
│   │   ├── models/               # Pydantic data models
│   │   ├── services/             # Business logic
│   │   ├── utils/                # Helpers
│   │   ├── validation/           # Pydantic request validation models
│   │   └── main.py               # FastAPI app setup
│   ├── tests/                    # Pytest test suites
│   ├── requirements.txt          # Python dependencies
│   ├── Dockerfile                # Backend Docker image
│   └── docker-compose.yml        # API + Mongo + test services
├── frontend/                     # React frontend (TypeScript)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   │   ├── pizza/
│   │   │   └── orders/
│   │   └── services/             # Axios API layer
│   ├── package.json
│   └── tsconfig.json
└── README.md                     # This file
```

## Implemented Features

- Backend
  - JWT authentication via middleware (`backend/app/middleware/auth_middleware.py`) validating Bearer tokens.
  - CORS via CORSMiddleware.
  - Robust request validation using Pydantic v2 (`backend/app/validation/`):
    - Field constraints, positive numbers, min/max length.
    - Email pattern validation.
    - Mongo `ObjectId` format checks for path params.
    - Standardized status codes (422 validation errors, 400 format errors, 404 not found).
  - CRUD controllers for pizzas, orders, extras, and users.
  - Tests covering validation, public vs protected endpoints, success and error cases.

- Frontend
  - Full TypeScript conversion with strict typings across components and services.
  - Internationalization with React-Intl:
    - `IntlProvider`, `defineMessages`, `FormattedMessage`, `FormattedNumber`.
  - Centralized Axios API instance with auth token handling (`frontend/src/services/api.ts`).
  - Pages and flows:
    - Pizza menu and details with extras and ordering.
    - Orders list and details (includes status updates/admin-like flows).
  - Jest + React Testing Library covering core UI and API interactions.

## Environment Variables

- Backend (create `backend/.env.dev` for local/dev)
  - `MONGODB_URL`
  - `JWT_SECRET_KEY`
  - `FIREBASE_CREDENTIALS_PATH` (if applicable)

- Frontend (create `frontend/.env`)
  - `REACT_APP_API_URL` (e.g., `http://localhost:8000`)

Note: Do not commit real secrets. Use example files and local overrides.

## How to Run (Recommended: Docker Compose for backend)

1. Backend (from `backend/`):
   ```bash
   docker-compose up --build
   ```
   - API: http://localhost:8000
   - Mongo: mongodb://localhost:27017

2. Frontend (from `frontend/`):
   ```bash
   npm install
   npm start
   ```
   - App: http://localhost:3000

Ensure `frontend/.env` contains:
```
REACT_APP_API_URL=http://localhost:8000
```

## Running the app locally

Follow these concise steps to run the project using Docker for the backend and Node for the frontend:

1. __Install Docker__
   - Install Docker Desktop or OrbStack (MacOS Only).

2. __Build backend containers__
   ```bash
   # from backend/
   docker-compose build
   ```

3. __Start the API__
   ```bash
   # from backend/
   docker-compose up api
   ```
   - API will be available at http://localhost:8000

4. __Install frontend dependencies__
   ```bash
   # from frontend/
   npm install
   ```

5. __Start the frontend__
   ```bash
   # from frontend/
   npm start
   ```
   - App will be available at http://localhost:3000

## Running Tests

- Backend tests
    ```bash
    # from backend/
    docker-compose run --rm test
    ```

- Frontend tests:
  ```bash
  # from frontend/
  npm test
  ```

## Improvements

- Make order placement asynchronous via a message queue (Kafka or AWS SQS) to decouple requests from processing and improve throughput under load.
- Switch backend pagination to cursor-based (opaque cursor with stable sort and next/prev tokens) to avoid page drift and improve performance on large collections.
- Replace simple JWT auth with a more robust system: hashed credentials, refresh tokens, token rotation, and role-based access control (RBAC).
- Implement a cart-based multi-item ordering flow in the UI (add/remove items, quantities, extras) with a single checkout.
- Build an admin user management UI (list, create, update, delete users; manage roles/permissions).
- Build a menu management UI (CRUD pizzas/extras, pricing, availability/status toggles).
- Add end-to-end tests with Cypress covering critical paths (browse menu → add to cart → checkout → confirm order) and integrate into CI.
  