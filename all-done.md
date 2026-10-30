# BeepBite — Full Fix-Work documentation

**Date:** 29 October 2026
**Project:** BeepBite — Frontend (`beepbites-ui`) + Backend (`Final-project`)


---

## 1. Summary

The Angular frontend is now fully connected to the NestJS + MongoDB backend. All **Problems** found were fixed.


## 2. Phase 1: Analysis

I read the whole backend and database layer + frontend layer before changing anything.

### 2.1 Stack
- **Backend:** NestJS 12, Mongoose 9, Passport JWT, bcrypt, class-validator, Socket.IO gateway.
- **Frontend:** Angular 20, TypeScript, Tailwind, GSAP.
- **Database:** MongoDB.

### 2.2 Database collections

| Collection | Fields |
|---|---|
| `users` | `name`, `email` (lowercase), `password` (bcrypt, 12 rounds, hidden), `role` (`CUSTOMER` / `RESTAURANT` / `ADMIN`), timestamps |
| `customers` | `userId` -> users, `qrToken` (UUID), `pointsBalance` (default 0) |
| `restaurants` | `userId` -> users, `name`, timestamps |
| `orders` | `customerId`, `restaurantId`, `orderId` (daily number per restaurant), `amountPaid` (min 1), `status` (`PREPARING` / `READY` / `COMPLETED`), timestamps |

### 2.3 Original API (prefix `/api`)

| Method | Path | Role |
|---|---|---|
| POST | `/auth/register` | public (creates a CUSTOMER) |
| POST | `/auth/login` | public |
| GET | `/auth/me` | any signed-in user |
| POST | `/restaurant` | ADMIN |
| GET | `/restaurant` | any signed-in user |
| GET | `/restaurant/:id` | any signed-in user |
| POST | `/order/new` | RESTAURANT |
| GET | `/order/all` | CUSTOMER |
| GET | `/order/ready` | CUSTOMER |
| PATCH | `/order/:id/status` | RESTAURANT |
| Socket | `order.join` -> `order.updated` | the customer who owns the order |

---

## 3. Phase 2: Connecting the frontend

The frontend used mock data before. All of it was replaced with real backend data.

1. **`src/app/shared/api.ts`:** one function per endpoint, with error handling. An expired session (401) sends the user to the "Session expired" screen.
2. **`src/app/shared/session.ts`:** stores the JWT and reads the user's name and expiry from it.
3. **`src/app/shared/live.ts`:** Socket.IO connection for live updates.
4. **`src/app/routes.ts`:** route guards for each role (Customer / Restaurant / Admin), matching the backend permissions.
5. **`proxy.conf.json` + `angular.json`:** the dev server forwards `/api` and `/socket.io` from `localhost:4200` to the backend on `localhost:3000`.
6. **All screens:** sample data removed; each screen wired to its endpoint.
7. **Security:** all text coming from the server is escaped before it is shown, so a restaurant name, for example, can't inject HTML.
8. **Camera QR scanning:** on the New Order screen, using the `jsqr` library, with manual code entry as a fallback.
9. **New frontend packages:** `socket.io-client@4.8.1`, `jsqr@1.4.0`.

---

## 4. Problems found

| # | Problem | Severity |
|---|---|---|
| 1 | Backend doesn't build: missing packages | Blocking |
| 2 | No endpoint returns the customer's QR code | Blocking |
| 3 | Points are never exposed or awarded | Missing |
| 4 | A restaurant can't list its orders | Missing |
| 5 | Restaurant emails aren't returned to the admin | Missing |
| 6 | No way to create the first admin | Blocking |
| 7 | An amount under 1 returns a 500 error | Missing |
| 8 | Sign-in email is case-sensitive | Missing |
| 9 | `GET /restaurant/:id` looks up by user ID, not restaurant ID | Missing |
| 10 | No live updates for restaurants, and none for new orders | Missing |

---

## 5. Phase 3: Fixes

### Fix 1: Missing packages
- **Problem:** `order.gateway.ts` uses `@nestjs/websockets` and `socket.io`, but they were not in `package.json`, so the build failed.
- **Fix:** added the packages, pinned to the installed Nest version (12.1.2):
  - `@nestjs/websockets@^12.1.2`
  - `@nestjs/platform-socket.io@^12.1.2`
  - `socket.io@^4.8.4`
- **Important:** `@nestjs/websockets` 12.3.x crashes at startup with the existing `@nestjs/common` 12.1.2, so it was pinned to 12.1.2 and verified with a clean `npm ci`.
- **Files:** `Final-project/package.json`, `Final-project/package-lock.json`

### Fix 2: Customer QR code
- **Problem:** the backend creates a `qrToken` for every customer but never sends it, so customers had nothing to show at the counter.
- **Fix:** new endpoint **`GET /api/customer/me`** (customers only), returning:
  - `qrToken`: the full code
  - `qrCode`: a ready-made QR image (PNG data URL), built with the backend's existing, previously unused `qrcode` package
  - `pointsBalance`: the points balance
- **Frontend:** the customer home screen shows the real QR code. The "Bigger" button enlarges it and shows the full code to read out.
- **Files:** `customer/customer.controller.ts`, `customer/customer.service.ts`

### Fix 3: Points
- **Problem:** the `pointsBalance` field exists in the database but was never shown or increased.
- **Rule used:** from the landing page copy, *"Each order you pick up adds points"*, and from the original design, **"+15 points added"**.
- **Fix:**
  - When an order moves to `COMPLETED`: **+15 points**.
  - When an order is moved back out of `COMPLETED` (the "Move back" button): **−15 points**, so the balance always matches the orders picked up.
  - The value 15 is a single constant, `POINTS_PER_PICKUP`, in `order.service.ts`, easy to change.
- **Frontend:** points appear on the home and profile screens. "+15 points added" shows when an order is picked up.
- **Database:** only the existing `pointsBalance` field is used; no new field.
- **Files:** `order/order.service.ts`, `customer/customer.service.ts`

### Fix 4: Restaurant order list
- **Problem:** there was no endpoint for a restaurant to see its orders, so the order board only showed orders created on the same device.
- **Fix:** new endpoint **`GET /api/order/restaurant`** (restaurants only), returning all of the restaurant's orders, newest first.
- **Frontend:** the order board, order detail and account screens read from the server. Orders are no longer stored in the browser.
- **Files:** `order/order.controller.ts`, `order/order.service.ts`

### Fix 5: Restaurant emails
- **Problem:** restaurant documents have no email, and no endpoint returned one.
- **Fix:** new endpoint **`GET /api/restaurant/accounts`** (admin only), returning every restaurant with its sign-in email (via `populate` from `users`).
- **Why a separate endpoint?** `GET /restaurant` is open to every signed-in user, including customers, so restaurant emails stay admin-only.
- **Files:** `restaurant/restaurant.controller.ts`, `restaurant/restaurant.service.ts`

### Fix 6: First admin account
- **Problem:** registration only creates customers; there was no way to create an ADMIN account.
- **Fix:** new file **`user/admin.seeder.ts`**, which runs when the backend starts:
  - If `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set and no user has that email, it creates an admin account.
  - It uses the existing `createUser` function, so the same bcrypt hashing and email lowercasing apply.
  - It does not create a duplicate on restart (verified).
  - The variables are optional. Without them, nothing happens.
- **Files:** `user/admin.seeder.ts` (new), `user/user.module.ts`, `app.module.ts` (environment validation)

### Fix 7: Amount under 1
- **Problem:** the schema requires `min: 1`, but the DTO didn't check it, so the error surfaced as a 500 Internal Server Error.
- **Fix:** added `@Min(1)` to `CreateOrderDTO.amountPaid`. It now returns **400** with a clear message: `amountPaid must not be less than 1`.
- **Files:** `order/DTO/order.dto.ts`

### Fix 8: Case-sensitive email
- **Problem:** emails are saved in lowercase at registration, but the sign-in lookup matched exactly, so `Lina@Example.com` failed.
- **Fix:** `findByEmail` lowercases the email before searching.
- **Files:** `user/user.service.ts`

### Fix 9: `GET /restaurant/:id`
- **Problem:** the method is named `findById` but searched by `userId`, and returned 200 with an empty body when nothing matched.
- **Fix:**
  - `GET /api/restaurant/:id` now looks up by the **restaurant's ID**, as its name says, and returns **404** when not found.
  - New endpoint **`GET /api/restaurant/me`** for the signed-in restaurant, covering the use that relied on the user-ID lookup.
- **Behaviour change:** this is the only change in existing API behaviour. The frontend was updated to match.
- **Files:** `restaurant/restaurant.controller.ts`, `restaurant/restaurant.service.ts`

### Fix 10: Live updates
- **Problem:** restaurants received no live updates, and customers only saw a new order after refreshing the page.
- **Fix:** in `order.gateway.ts`, with the existing `order.join` and `order.updated` unchanged:

| Event | Who | Purpose |
|---|---|---|
| `restaurant.join` | RESTAURANT | joins the restaurant's room |
| `customer.join` | CUSTOMER | joins the customer's room |
| `order.created` (server -> client) | — | sent to both the restaurant and the customer when an order is created |
| `order.updated` (server -> client) | — | now also sent to the restaurant's room when a status changes |

- **Frontend:** the 15-second polling was removed; everything is live over the socket. After a lost connection comes back, data is reloaded automatically.
- **Files:** `order/order.gateway.ts`, `order/order.service.ts`

---

## 6. Phase 4: Testing

All tests ran on a **separate copy** of the backend with its own test MongoDB. No real data was touched.

| Test | Result |
|---|---|
| Backend build (`nest build`) | Done  |
| Backend install from the exact lockfile (`npm ci`) + startup | Done |
| Backend type check (`tsc --noEmit`) | Done |
| Frontend type check (`npm run check`) | Done |
| Frontend production build (`ng build`) | Done |
| API checks for every fix (curl): success cases, wrong roles (403), not found (404), validation (400) | Done |
| Browser end-to-end test, 3 roles at the same time | Done (52 / 52) |
| Camera QR scan with a real QR image | Done |
| Admin seeder runs once, no duplicate on restart | Done |

**Browser test highlights:**
- Registration, sign-in, duplicate email, wrong password, expired session, sign-out.
- The admin created from `ADMIN_EMAIL` signs in, sees every restaurant with its email, and adds a restaurant.
- The customer sees their real QR code and points.
- The restaurant scans the code and creates an order, which appears **live** for the customer and on a second restaurant screen.
- Marking an order Ready reaches the customer live; pickup adds 15 points and moving it back removes them.
- Access to other roles' pages is blocked, and the browser console shows no errors.

---

## 7. Changed files

### Backend — `Final-project/`
| File | Change |
|---|---|
| `package.json`, `package-lock.json` | 3 packages added |
| `src/app.module.ts` | validation for `ADMIN_*` |
| `src/user/admin.seeder.ts` | **new** |
| `src/user/user.module.ts` | registers the seeder |
| `src/user/user.service.ts` | lowercase sign-in email |
| `src/customer/customer.controller.ts` | `GET /customer/me` |
| `src/customer/customer.service.ts` | `getCode`, `addPoints` |
| `src/restaurant/restaurant.controller.ts` | `GET /restaurant/accounts`, `GET /restaurant/me`, fixed `GET /restaurant/:id` |
| `src/restaurant/restaurant.service.ts` | `findById`, `findMine`, `findAllWithEmail` |
| `src/order/DTO/order.dto.ts` | `@Min(1)` |
| `src/order/order.controller.ts` | `GET /order/restaurant` |
| `src/order/order.service.ts` | restaurant orders, points, live events |
| `src/order/order.gateway.ts` | `restaurant.join`, `customer.join`, `order.created` |

### Frontend — `beepbites-ui/`
- **New:** `src/app/shared/api.ts`, `src/app/shared/session.ts`, `src/app/shared/live.ts`, `proxy.conf.json`, `all-done.md`, `Final-project/.env.example`, `src/app/auth/forgot-password/*`, `src/app/auth/reset-password/*`
- **Updated:** `src/app/routes.ts`, `src/app/shared/*` (data, ui, customer, restaurant, admin), the logic and templates of all 17 screens, `angular.json`, `package.json`, `package-lock.json`, `readme.md`, `.gitignore`

---

## 8. Phase 6: "Forgot password?" by email

Users of every role (customer, restaurant, admin) can now reset a forgotten password from the sign-in page. Emails are sent through **Resend** (free tier: 3,000 emails/month, 100/day, no Resend branding).

### 8.1 How it works
1. On **Sign in**, the user taps **"Forgot password?"** (the email they typed is carried over).
2. **`/forgot-password`**: they enter their email. The backend emails a reset link. The answer on screen is always the same, so the form can't be used to find out which emails have accounts.
3. The email (BeepBite-branded HTML plus a plain-text version) contains a link to **`/reset-password?token=…`**, valid for **30 minutes**.
4. **`/reset-password`**: they choose a new password (at least 8 characters). Then they are sent to **Sign in** with the message "Password updated".

### 8.2 Security design
- **No database change.** The reset token is a signed token whose secret is `JWT_SECRET` **plus the user's current password hash**. It needs no new field or collection, and:
  - it **stops working the moment the password changes**, so each link works only once;
  - it **can't be used as a sign-in token** (different secret), and a sign-in token can't be used as a reset token;
  - it expires after 30 minutes.
- **No account probing:** the same answer for existing and unknown emails, and the email is sent in the background, so the response time doesn't reveal anything either.
- **No inbox flooding:** at most one reset email per address every 10 minutes. A repeat request within that time gets the same on-screen answer but sends nothing.
- **No new backend package:** emails go through Resend's REST API with Node's built-in `fetch`.
- **The API key lives only in `Final-project/.env`** (ignored by git); it is in no project file.

### 8.3 Backend changes (`Final-project/`, additive only)
| File | Change |
|---|---|
| `src/mail/mail.service.ts` | **new**: sends the email via Resend |
| `src/mail/mail.module.ts` | **new** |
| `src/auth/DTO/forgot.password.dto.ts` | **new**: `email` |
| `src/auth/DTO/reset.password.dto.ts` | **new**: `token`, `password` (min 8) |
| `src/auth/auth.controller.ts` | `POST /auth/forgot-password`, `POST /auth/reset-password` |
| `src/auth/auth.service.ts` | `forgotPassword`, `resetPassword` (existing methods untouched) |
| `src/auth/auth.module.ts` | imports `MailModule` |
| `src/user/user.service.ts` | `findByIdWithPassword`, `updatePassword` (bcrypt, 12 rounds, same as registration) |
| `src/app.module.ts` | validation for `RESEND_API_KEY`, `RESEND_FROM`, `APP_URL` |

### 8.4 Frontend changes
- **New screens:** `src/app/auth/forgot-password/*`, `src/app/auth/reset-password/*`.
- **Updated:** `routes.ts` (2 routes), `shared/api.ts` (2 calls), Sign in (`login.html`, `login.css`, `login.logic.ts`, `login.ts`: "Forgot password?" link and the "Password updated" message).

### 8.5 Settings (`Final-project/.env`)
| Setting | Meaning |
|---|---|
| `RESEND_API_KEY` | Resend API key. Without it, the feature is off and the form says it isn't available. |
| `RESEND_FROM` | Sender. Default `BeepBite <no-reply@beepbite.net>`. |
| `APP_URL` | Frontend address used in the email link. Default `http://localhost:4200`. |



---

## 9. Phase 7: Contact emails (`beepbite.net`)

The app domain is **`beepbite.net`**. Three addresses are used:

| Address | Purpose |
|---|---|
| `partner@beepbite.net` | Restaurants: joining BeepBite, changing a restaurant's name or email |
| `support@beepbite.net` | Help and support for everyone |
| `no-reply@beepbite.net` | Sender of every email BeepBite sends (password reset, support form) |

### 9.1 Support address

The support address was not shown anywhere before; the only mention was "Contact BeepBite support." with no address.

| Where | Change |
|---|---|
| Forgot password screen (`forgot-password.logic.ts`) | Message when reset emails are unavailable now says "Contact support@beepbite.net." |
| Customer profile, Help (`profile.html`) | New row "Contact support" that opens the support page (10.3) |
| Restaurant account (`account.html`) | Same "Contact support" row, under Questions & answers |
| Landing page footer (`landing.html`) | New "Support" link in the Product column, to the support page |
| Reset password email (`Final-project/src/mail/mail.service.ts`) | New line "Need help? Visit BeepBite support or write to support@beepbite.net." in both the HTML and plain-text versions |

### 9.2 Email sender

All emails are sent from **`BeepBite <no-reply@beepbite.net>`** (`RESEND_FROM` in `Final-project/.env` and `Final-project/.env.example`, and the backend default when `RESEND_FROM` is not set). The domain `beepbite.net` is verified in Resend: a test send from this address to Resend's test inbox `delivered@resend.dev` was accepted. Replies never go to this address: support emails set the customer as reply-to, and the reset email points to the support page and `support@beepbite.net`.

### 9.3 Support page (`/support`)

A full support page replaces the plain email links. Anyone can open it, signed in or not.

**What it has**
- **Contact form:** name, email, topic (Account & sign in, Orders & pickup, Points, Restaurant partners, Something else) and message (10 to 2,000 characters, with a counter). The message is emailed to `support@beepbite.net`, with the sender's address as reply-to, so the team answers by simply replying.
- **Quick answers:** forgot password (links to the reset page), order ready alerts, code not scanning, points, joining as a restaurant.
- **Email us directly:** `support@beepbite.net` and `partner@beepbite.net`.
- **Signed in:** name and email are filled in, and the header button goes back to the app instead of Sign in.
- **Topic link:** `/support?topic=points` (or any topic) opens with that topic picked.

**Protection**
- Every field is checked in the browser and again on the server; unknown fields are rejected (existing global validation).
- One message per email address per 10 minutes (HTTP 429 with a clear message).
- Everything the visitor types is escaped before it goes into the email.
- If email isn't configured (no `RESEND_API_KEY`) or sending fails, the page says so and gives `support@beepbite.net` instead.

**Backend (`Final-project/`, additive only)**

| File | Change |
|---|---|
| `src/support/DTO/support.dto.ts` | **New.** `name` (max 80), `email`, `topic` (one of 5), `message` (10 to 2,000) |
| `src/support/support.service.ts` | **New.** Per-address 10-minutes limit, sends the message, clear errors |
| `src/support/support.controller.ts` | **New.** `POST /api/support` (public) |
| `src/support/support.module.ts` | **New.** Uses `MailModule` |
| `src/app.module.ts` | Registers `SupportModule`; new optional setting `SUPPORT_EMAIL` (default `support@beepbite.net`) |
| `src/mail/mail.service.ts` | New `sendSupportRequest` (branded email to the support inbox); `send` takes an optional reply-to; reset email links to the support page |

No database change. Existing endpoints and logic are unchanged.

**Frontend**

| File | Change |
|---|---|
| `src/app/public/support/` (`.ts`, `.html`, `.css`, `.logic.ts`) | **New** page |
| `src/app/routes.ts` | Route `support` |
| `src/app/shared/api.ts`, `src/app/shared/data.ts` | `Api.support(...)`, type `SupportTopic` |
| `src/app/shared/auth.ts` | Form helpers also handle text areas and dropdowns (sign-in, register and password forms unchanged) |
| `profile.html`, `account.html`, `landing.html` | Support links now open `/support` |


---

