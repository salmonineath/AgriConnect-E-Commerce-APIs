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
| CUSTOMER | Search products, manage cart, check out, pay, view and cancel own pending orders |
| FARMER | Everything a customer can, plus manage **their own** products and images, see orders for their products, and fulfil orders made only of their products |
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
| Product images | `POST /api/products/:id/images`, `DELETE /api/products/:id/images/:imageId` (farmer owner or admin) |
| Farmer | `GET /api/farmer/products`, `GET /api/farmer/orders`, `PATCH /api/farmer/orders/:id/status` |
| Categories | `GET` public; `POST`, `PUT`, `DELETE` admin |
| Cart | `GET /api/cart`, `POST /api/cart/add`, `DELETE /api/cart/remove/:productId` |
| Orders | `POST /api/orders/checkout`, `POST /api/orders/:id/pay`, `GET /api/orders/me`, `PATCH /api/orders/:id/cancel`; admin: `GET /api/orders`, `PATCH /api/orders/:id/status` |
| Roles (admin) | `GET`, `POST /api/roles`, `GET`, `DELETE /api/roles/:id` |

Authenticate with `Authorization: Bearer <accessToken>` or the `accessToken` cookie set at login.

## Searching products

`GET /api/products` accepts these query parameters, all optional:

| Parameter | Example | Meaning |
|---|---|---|
| `search` | `mango` | Matches name or description, case-insensitive |
| `category` | `Fruit` | Category name or id |
| `minPrice`, `maxPrice` | `1`, `5` | Price range |
| `inStock` | `true` | Only products with stock |
| `status` | `Available` | `Available` or `Unavailable` |
| `farmer` | `<user id>` | Products from one farmer |
| `sort` | `price_asc` | `newest` (default), `price_asc`, `price_desc`, `name` |
| `page`, `limit` | `2`, `20` | Pagination (limit max 100). The response includes `pagination: { page, limit, total, totalPages }` |

## Ordering and payment

1. Add products to the cart.
2. `POST /api/orders/checkout` with a delivery address and a payment method:
   ```json
   {
     "paymentMethod": "card",
     "shippingAddress": { "recipient_name": "Sok Dara", "phone": "012345678", "address_line": "St 271", "city": "Phnom Penh", "note": "optional" }
   }
   ```
3. Card orders: `POST /api/orders/:id/pay` with `{ "paymentToken": "tok_success" }`.
   **Payments are simulated**: `tok_success` approves and `tok_declined` returns 402. No card numbers are accepted or stored. To use a real provider, replace `chargeCard` and `refundCharge` in `src/services/payment-service.ts`.
4. Cash on delivery orders are marked paid when they are delivered.

Status flow: `pending → confirmed → shipped → delivered`. An order can be `cancelled` while pending or confirmed; cancelling returns the stock and refunds a paid card order. Card orders must be paid before they can be confirmed.

Who can change the status: an admin for any order, and a farmer for orders made only of their own products. Orders with items from several farmers are handled by an admin.

## Product images

Upload as `multipart/form-data` with the field `images`: JPEG, PNG or WebP, 2 MB each, up to 5 per product. The file content is checked, not just the extension. Files are stored in `uploads/` (or `UPLOAD_DIR`) and served at the `url` returned for each image, e.g. `/uploads/products/<id>.png`.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every pull request and on pushes to `main`, `develop` and `staging`: lint, typecheck, build, tests, a maintainability audit (fallow), and security checks (npm audit, gitleaks secret scan, CodeQL).
