# BeepBite web

Angular, TypeScript, CSS and Tailwind.

## Run

```sh
npm install
npm start
```

Open `http://localhost:4200`. Run `npm run build` for production or `npm run check` for TypeScript validation. Serve `dist/beepbite/browser` with a fallback to `index.html` for every application route.

## Backend

The screens read and write real data from the NestJS + MongoDB backend in `Final-project/` (API under `/api`, Socket.IO for live order updates). `npm start` proxies `/api` and `/socket.io` to `http://localhost:3000` (see `proxy.conf.json`), so the browser only talks to `localhost:4200`. In production, serve the app and the backend behind one origin with the same two paths forwarded.

Run the backend next to `npm start` (needs MongoDB running locally):

```sh
cd Final-project
cp .env.example .env   # then set JWT_SECRET (openssl rand -hex 32); see the file for the optional settings
npm install
npm run start:dev
```

Backend environment (`Final-project/.env`): `JWT_SECRET` (at least 32 characters) and `MONGO_URI` are required. `PORT` (default 3000) and `JWT_EXPIRES_IN` (default `1h`) are optional. `ADMIN_EMAIL`, `ADMIN_PASSWORD` (at least 8 characters) and `ADMIN_NAME` are also optional: when set, the first admin account is created at startup if it doesn't exist yet. `RESEND_API_KEY` turns on emails (password reset, support form); `RESEND_FROM`, `SUPPORT_EMAIL` and `APP_URL` adjust them.

| Screen | Endpoints |
|---|---|
| Sign in, register | `POST /auth/login`, `POST /auth/register` |
| Forgot / reset password | `POST /auth/forgot-password`, `POST /auth/reset-password` (email via Resend; needs `RESEND_API_KEY`) |
| Support | `POST /support` (emails `SUPPORT_EMAIL`, default support@beepbite.net; needs `RESEND_API_KEY`) |
| Customer home | `GET /order/all`, `GET /restaurant`, `GET /customer/me` (QR code, points), socket |
| Customer orders, tracker | `GET /order/all`, `GET /restaurant`, socket |
| Ready for pickup | `GET /order/ready`, `GET /restaurant`, socket |
| Customer profile | `GET /auth/me`, `GET /order/all`, `GET /customer/me` |
| New order | `POST /order/new` (camera scan with jsQR, or the full code typed in) |
| Board, order detail | `GET /order/restaurant`, `PATCH /order/:id/status`, socket |
| Restaurant account | `GET /restaurant/me`, `GET /order/restaurant` |
| Restaurants, add, detail | `GET /restaurant/accounts`, `POST /restaurant`, `GET /restaurant/:id` |

Socket events: customers join `order.join` (one order) and `customer.join` (new orders for them); restaurants join `restaurant.join`. The server sends `order.created` and `order.updated`.

Sessions keep the JWT in `localStorage`. Each role's routes are guarded, and an expired or rejected token leads to the session-expired screen.


## Structure

- `src/app`: all application screen components, grouped by role.
- `src/app/shared`: shared UI, API client (`api.ts`), session (`session.ts`), live updates (`live.ts`), data types and role behavior.
- `src/styles`: original design tokens, base styles, components and layouts.
- `public/foundations/logo`: original SVG assets.

Public routes use short names without screen IDs. Navigation keeps the original document transitions and resets each screen's timers and state.



## Routes

| Screen | Path |
|---|---|
| Landing | `/` |
| Sign in | `/login` |
| Forgot password | `/forgot-password` |
| Reset password | `/reset-password?token=…` |
| Register | `/register` |
| Support | `/support` (optional `?topic=account\|orders\|points\|restaurants\|other`) |
| Auth callback | `/auth/callback` |
| Customer home | `/customer` |
| Order history | `/customer/orders` |
| Order tracker | `/customer/orders/:id` |
| Ready for pickup | `/customer/ready` |
| Customer profile | `/customer/profile` |
| New order | `/restaurant/orders/new` |
| Order board | `/restaurant/orders` |
| Order detail | `/restaurant/orders/:id` |
| Restaurant account | `/restaurant/account` |
| Restaurants | `/admin/restaurants` |
| Add restaurant | `/admin/restaurants/new` |
| Restaurant detail | `/admin/restaurants/:id` |
| Not found | `/not-found` |

Order and restaurant ids in URLs are MongoDB ids.
