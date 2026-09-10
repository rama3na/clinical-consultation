# Mini AI-Powered Clinical Consultation System

## About
This is a small clinical consultation system built for doctors.

- A doctor can see today's appointments on the dashboard.
- A doctor can open any patient's profile and check their previous consultation history.
- A doctor can start a new consultation directly from the patient profile.
- The doctor types in rough notes during or after the consultation.
- Gemini AI takes those rough notes and structures them into a clean clinical note.
- The doctor can review and edit the AI draft before saving it.
- Once confirmed, the consultation note is saved into MongoDB.
- All patient records and appointments in this project are synthetic/fake data.

## Features
- Today's appointments
- Patient profile
- Previous consultation history
- Start consultation in a modal
- AI structured clinical notes
- Review and edit AI draft
- Save consultation
- Appointment status updates
- Status filter

## Tech Stack
- Frontend: Next.js, TypeScript, Tailwind CSS
- Backend: ElysiaJS, TypeScript, Node.js
- Database: MongoDB
- AI: Google Gemini API

## Project Structure
```text
clinical-consultation/
  frontend/
  backend/
```

- `frontend/` handles the UI and user interactions.
- `backend/` handles the REST APIs, database models, and Gemini AI integration.

## How to Run

### 1. Backend

Make sure MongoDB is running locally.

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder (or copy from `.env.example`):

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/clinical-consultation
GEMINI_API_KEY=your_gemini_api_key_here
```

Seed initial synthetic data:

```bash
npm run seed
```

Start the backend server:

```bash
npm run dev
```

The backend will run on `http://localhost:3001`.

### 2. Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`.

## AI Note

The AI only structures and summarizes the notes entered by the doctor. It should not invent patient information, diagnosis, or treatment.

The AI result is shown as a draft, and the doctor can review and edit it before saving.

If the AI service is unavailable, the doctor can still enter and save the consultation manually.

## Database

The application uses MongoDB with three main collections:

- Patients
- Appointments
- Consultations

- Patient data is synthetic and created only for this assignment.
- API keys should be kept in `.env` and should not be committed to Git.
