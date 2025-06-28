# Medify Backend

A comprehensive medical assistance application backend that connects doctors and patients remotely.

## Features

- **User Management** (Admin, Doctor, Patient)
- **Appointment Scheduling** with availability management
- **Medical Reports & Prescriptions** with file attachments
- **Real-time Messaging** system
- **AI-powered Health Analysis** and recommendations
- **Push Notifications** via Firebase
- **Medical History Tracking** with comprehensive patient data
- **Doctor Reviews & Ratings** system
- **Favorite Doctors** functionality
- **Health Posts** by doctors
- **Advanced Search** capabilities
- **File Upload** with Vercel Blob storage
- **Rate Limiting** and security features

## Tech Stack

- **Runtime**: Node.js & Express.js
- **Database**: MongoDB with Prisma ORM
- **Authentication**: JWT with bcryptjs
- **File Storage**: Vercel Blob Storage
<!-- - **Push Notifications**: Firebase Admin SDK -->
- **Email Service**: Nodemailer
- **Validation**: Yup schema validation
- **Logging**: Winston logger
- **Security**: Helmet, CORS, Rate limiting
<!-- - **Deployment**: Vercel -->

## Prerequisites

- Node.js (v14 or higher)
- MongoDB database
- Firebase Project (for notifications)
- Vercel account (for deployment and file storage)

<!-- ## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/medify-backend.git
cd medify-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file with the following variables: -->
<!-- ```env
# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key

<!-- # Firebase
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email -->

<!-- # Email
EMAIL_HOST=your_smtp_host
EMAIL_PORT=your_smtp_port
EMAIL_USER=your_email_username
EMAIL_PASS=your_email_password

# Vercel Blob
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

# AI Service (if applicable)
AI_SERVICE_API_KEY=your_ai_service_key
``` -->

Generate Prisma client:
```bash
npm run postinstall
```

## Running the Application

Development mode:
```bash
npm run start:dev
```

Production mode:
```bash
npm start
``` -->

## API Documentation

Import the Postman collection (`Medify.postman_collection.json`) and environment (`Medify.postman_environment.json`) for detailed API documentation and examples.

### Key API Endpoints

- **Authentication**: `/api/auth/*`
- **Doctors**: `/api/doctors/*`
- **Patients**: `/api/patients/*`
- **Appointments**: `/api/appointments/*`
- **Medical Records**: `/api/medical-records/*`
- **Messages**: `/api/messages/*`
- **Reviews**: `/api/reviews/*`
- **AI Services**: `/api/ai/*`
- **Search**: `/api/search/*`

## Project Structure

```
src/
├── config/         # Configuration files (Firebase, Prisma, Upload, Logging)
├── controllers/    # Request handlers for all API endpoints
├── middleware/     # Custom middleware (Auth, Error handling)
├── models/         # Database models and schemas
├── routes/         # API route definitions
├── services/       # Business logic and external service integrations
├── utils/          # Utility functions (Auth, Email, JWT, Validation)
└── validators/     # Request validation schemas
```

## Database Schema

The application uses MongoDB with Prisma ORM and includes the following main entities:

- **Users**: Admin, Doctor, Patient profiles
- **Appointments**: Scheduling and management
- **Medical Records**: Patient history and reports
- **Availability**: Doctor scheduling slots
- **Reviews**: Patient feedback system
- **Posts**: Doctor health content
- **Messages**: Real-time communication

## Key Features

### 1. User Management
- Role-based authentication (Admin, Doctor, Patient)
- Secure password hashing with bcryptjs
- JWT token-based sessions

### 2. Appointment System
- Doctor availability management
- Appointment scheduling with status tracking
- Medical report generation

### 3. Medical Records
- Comprehensive patient history
- File attachment support
- Medical report generation

### 4. Communication
- Real-time messaging system
- Push notifications via Firebase
- Email notifications

### 5. AI Integration
- Health data analysis
- Diagnosis assistance
- Treatment recommendations

### 6. File Management
- Secure file uploads via Vercel Blob
- Image and document support
- Organized storage structure

## Security Features

- **Rate Limiting**: Prevents API abuse
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Yup schema validation
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcryptjs encryption

## Deployment

The application is configured for deployment on Vercel:

1. Connect your repository to Vercel
2. Set up environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

The `vercel.json` file handles routing configuration for serverless deployment.

## Testing

Run tests:
```bash
npm test
```

The project includes Jest testing framework with:
- Unit tests for controllers and services
- Integration tests for API endpoints
- MongoDB memory server for testing

## Development Scripts

- `npm run start:dev`: Start development server with nodemon
- `npm start`: Start production server
- `npm run postinstall`: Generate Prisma client
- `npm test`: Run test suite

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License

## Contact

For support or questions, contact: mostafaelshahat194@gmail.com