# Clothing E-Commerce Platform — Final CRA Edition

A separate frontend/backend clothing shopping platform built to the supplied 53-section specification.

## Architecture
React Create React App -> Axios REST -> Node.js/Express -> Mongoose -> MongoDB.

## Customer features
Authentication, role routing, home/catalog, categories, product details, search/filter/sort/pagination APIs, wishlist, cart with server stock/price validation, addresses, checkout, COD, Razorpay verification, orders, cancellation, profile and responsive Bootstrap UI.

## Admin features
Dashboard metrics, statistics, admin management, category CRUD, product CRUD with multi-image upload, inventory/stock management, order status management, audit logging and role protection.

## Database
Users, AdminProfiles, Categories, Products, Carts, Wishlists, Addresses, Orders, Payments, AdminActions. Cart/wishlist/order line items are embedded. Order items keep product snapshots.

## Run
### Backend
```bash
cd backend
npm install
copy .env.example .env
npm run seed
npm run dev
```

### Frontend (Create React App)
```bash
cd frontend
npm install
copy .env.example .env
npm start
```

Frontend: http://localhost:3000  Backend: http://localhost:5000

## Default admin
`admin@example.com` / `Admin@123`. Override with `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`.

## Environment
Backend: PORT, MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN, CLIENT_URL, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD.
Frontend: REACT_APP_API_URL, REACT_APP_SERVER_URL, REACT_APP_RAZORPAY_KEY_ID.

## Payment safety
COD creates an order immediately with PENDING payment. Online checkout creates a Razorpay gateway order from the server-calculated cart total. The backend verifies the Razorpay signature and only then creates the order, decrements inventory and clears the cart in a MongoDB transaction. Never trust a frontend amount/stock value.

## Notes
MongoDB transactions require a replica set for local production-like testing. For a single local MongoDB instance, configure a replica set (or use MongoDB Atlas). Local image uploads use Multer; deploy to object storage/CDN for production. A real email provider is required to turn the password-reset endpoint into a real email reset workflow.
