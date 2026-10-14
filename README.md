# Surplus — Food Rescue & Redistribution Platform

Surplus connects restaurants, grocers, and commercial kitchens with verified NGOs and volunteer couriers to redirect surplus edible food to communities in need before it expires.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Zustand, Lucide React
- **Backend**: Node.js, Express, Prisma ORM, BullMQ, Socket.IO
- **Database**: PostgreSQL with PostGIS spatial extensions
- **Cache & Queues**: Redis
- **Cloud & Deployment**: Vercel

## Architecture
- **Multi-Role Authentication**: Secure JWT-based access control for Donors, NGOs, Volunteers, and Admins.
- **Listing & Spatial Matching**: PostGIS geospatial querying to match surplus food batches with nearby relief shelters.
- **SLA & Dispatch Engine**: Dynamic deadlines for pickup and transport to guarantee food freshness.
- **Photo-Verified Closure**: Upload and donor acknowledgement of distribution proofs.
- **Impact & Rewards**: Live tracking of meals served, CO2 avoided, and water saved.

## Local Development
1. **Start infrastructure services**:
   ```bash
   docker compose up -d
   ```
2. **Backend**:
   ```bash
   cd backend
   npm install
   npx prisma generate
   npm run dev
   ```
3. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Production Build & Vercel
Build frontend and backend assets:
```bash
npm run build
```
This compiles the Vite client into `backend/public`, generates the Prisma client, and prepares Express for production serving.
