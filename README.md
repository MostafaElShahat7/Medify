# Medify Backend

A comprehensive medical assistance application backend that connects doctors and patients remotely.

## Features

- User Management (Admin, Doctor, Patient)
- Appointment Scheduling
- Medical Reports & Prescriptions
- Real-time Messaging
- AI-powered Health Analysis
- Push Notifications

## Tech Stack

- Node.js & Express.js
- MongoDB with Mongoose
- PostgreSQL with Prisma
- Firebase Admin SDK
- JWT Authentication
- Winston Logger

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- PostgreSQL
- Firebase Project
- AI Service API Access

## Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/your-username/medify-backend.git
cd medify-backend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
- Copy `.env.example` to `.env`
- Update the variables with your configuration

4. Generate Prisma client:
\`\`\`bash
npm run prisma:generate
\`\`\`

5. Run database migrations:
\`\`\`bash
npm run prisma:migrate
\`\`\`

## Running the Application

Development mode:
\`\`\`bash
npm run dev
\`\`\`

Production mode:
\`\`\`bash
npm start
\`\`\`

## API Documentation

Import the Postman collection (`Medify.postman_collection.json`) for detailed API documentation and examples.

## Project Structure

\`\`\`
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic
├── utils/          # Utility functions
└── validators/     # Request validators
\`\`\`

## Integration Points

1. Frontend Integration:
   - RESTful API endpoints
   - Real-time messaging with Socket.IO
   - File upload capabilities

2. Mobile Integration:
   - JWT authentication
   - Push notifications
   - File handling

3. AI Integration:
   - Patient data analysis
   - Health recommendations
   - Diagnosis prediction

## Testing

Run tests:
\`\`\`bash
npm test
\`\`\`

## License

MIT