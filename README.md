# Healme Backend

Healme Backend is an Express.js API for a healthcare platform that connects patients, clinics, pharmacies, and business partners.  
It provides core services for user management, appointments, prescriptions, search, subscriptions, reviews, media upload, mapping, and chatbot support.

## About

Healthcare service platform backend for managing users, appointments, prescriptions, pharmacies, clinics, subscriptions, and media with MySQL and Express.js.

## Key Features

- User registration, login, profile, address, and password flows
- Patient records and patient prescription history
- Clinic and pharmacy listing, details, and search
- Pharmacy medicine inventory management
- Appointment booking and diagnosis workflow
- Prescription creation, update, and order handling
- Area lookup for province, district, ward, and address data
- Business profile and subscription management
- Review management for healthcare businesses
- Media upload and management with Azure Blob Storage
- Chatbot and map integration endpoints

## Tech Stack

- Node.js
- Express.js
- MySQL
- Pug
- JWT authentication
- Azure Blob Storage

## Project Structure

- `app.js` - Express app setup and route registration
- `bin/www` - HTTP server bootstrap
- `routes/` - API route handlers
- `models/` - database and validation helpers
- `db_scripts/` - database schema and seed scripts
- `views/` - Pug templates for basic rendered pages

## Getting Started

### 1) Prerequisites

- Node.js 18+ recommended
- MySQL database

### 2) Install dependencies

```bash
npm install
```

### 3) Configure environment variables

Create a `.env` file in the project root and add:

```env
PORT=3001
OPENAI_API_KEY=your_openai_key
MAP_API_KEY=your_map_api_key
AZURE_STORAGE_CONNECTION_STRING=your_azure_storage_connection_string
API_KEY=your_zoom_api_key
API_SECRET=your_zoom_api_secret
CLIENT_ID=your_zoom_client_id
CLIENT_SECRET=your_zoom_client_secret
ACCOUNT_ID=your_zoom_account_id
```

### 4) Configure database

Update database connection settings in `models/dbconfig.js`, then run SQL scripts from `db_scripts/` to initialize schema and data.

### 5) Run the server

```bash
npm start
```

Default local URL:

```text
http://localhost:3001
```

## API Modules

Main route groups:

- `/users`
- `/patient`
- `/clinic`
- `/pharmacy`
- `/business`
- `/area`
- `/appt`
- `/medicine`
- `/schedule`
- `/prescription`
- `/search`
- `/map`
- `/chatbot`
- `/media`
- `/subscription`
- `/review`

## Scripts

```bash
npm start
```

Current `package.json` only defines a start script.
