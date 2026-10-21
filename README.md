# AgriConnect E-Commerce APIs

REST API for a farm-to-customer marketplace: farmers list products, customers buy them, admins manage the platform.

Built with Express 5, TypeScript and MongoDB (Mongoose).

## Quick start

```bash
cp .env.example .env        # then fill in the JWT secrets and admin details
docker compose up -d mongo  # or point MONGODB_URI at your own MongoDB
npm install
npm run seed                # roles, admin, sample farmers and customers
npm run dev                 # http://localhost:8000, docs at /swagger
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start with hot reload |
| `npm run build` / `npm start` | Compile to `dist/` and run it |
| `npm test` | Integration tests against an in-memory MongoDB |
| `npm run lint` / `npm run typecheck` | Code quality checks |
| `npm run seed` | Seed roles, admin, farmers, customers (safe to re-run) |

## Roles

| Role | Can do |
|---|---|
| CUSTOMER | Browse products, manage cart, check out, view and cancel own pending orders |
| FARMER | Everything a customer can, plus create and manage **their own** products |
| ADMIN | Everything, plus users, categories, roles, all orders and order status |

New sign-ups via `/api/auth/register` are customers. Admins create farmers via `POST /api/farmers`.

## Endpoints

Full request/response docs are in Swagger at `/swagger`.

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `/login`, `/refresh`, `/logout` |
| Profile | `GET /api/profile/me`, `PUT /api/users/:id` (self or admin) |
| Users (admin) | `GET /api/users`, `GET/DELETE /api/users/:id`, `POST /api/farmers` |
| Products | `GET /api/products`, `GET /api/products/:id` (public); `POST`, `PUT`, `DELETE` (farmer owner or admin) |
| Categories | `GET` public; `POST`, `PUT`, `DELETE` admin |
| Cart | `GET /api/cart`, `POST /api/cart/add`, `DELETE /api/cart/remove/:productId` |
| Orders | `POST /api/orders/checkout`, `GET /api/orders/me`, `PATCH /api/orders/:id/cancel`; admin: `GET /api/orders`, `PATCH /api/orders/:id/status` |
| Roles (admin) | `GET`, `POST /api/roles`, `GET`, `DELETE /api/roles/:id` |

Authenticate with `Authorization: Bearer <accessToken>` or the `accessToken` cookie set at login.

## Order flow

`pending → confirmed → shipped → delivered`, or `cancelled` at any point before delivery. Checkout reserves stock atomically per product and puts it back if anything fails. Cancelling an order returns its stock.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every pull request: lint, typecheck, build, tests, a maintainability audit (fallow), and security checks (npm audit, gitleaks secret scan, CodeQL).
