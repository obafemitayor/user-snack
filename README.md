# UserSnap Pizza Delivery App

A full-stack pizza ordering application:
- Backend: FastAPI + MongoDB with JWT auth middleware, robust validation, and test coverage.
- Frontend: React (TypeScript) + Chakra UI + React-Intl with strong type safety and tests.

You can view the app by visting https://user-snack.vercel.app/. To view all orders visit https://user-snack.vercel.app/admin/orders

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

## Environment Variables

- Backend (create `backend/.env.dev` for local/dev)
  - `MONGODB_URL`
  - `JWT_SECRET_KEY`
  - `FIREBASE_CONFIG_PATH`
  - `FIREBASE_STORAGE_BUCKET`

- Frontend (create `frontend/.env`)
  - `REACT_APP_API_URL` (e.g., `http://localhost:8000`)

## Running the app locally

Follow these concise steps to run the project using Docker for the backend and Node for the frontend:

1. __Install Docker__
   - Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) or [OrbStack](https://orbstack.dev/) (MacOS Only).

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
  
