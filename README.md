# College Assignment Submission and Grading Portal

A full-stack web application that helps colleges manage assignments, student submissions, and faculty grading in one platform.

## Features

### Student

* Register and login
* View available assignments
* Check assignment due dates
* Submit project links and work notes
* Track submission status
* View marks and faculty feedback

### Faculty

* Register and login
* Create assignments
* Set subject, description, due date, and maximum marks
* View student submissions
* Grade submissions
* Provide feedback
* Update marks and feedback

## Technologies Used

**Frontend**

* React.js
* Vite
* Axios
* HTML
* CSS
* JavaScript

**Backend**

* Node.js
* Express.js
* REST API
* JWT Authentication
* bcrypt.js

**Database**

* MongoDB
* MongoDB Atlas
* Mongoose

## Project Structure

```text
MERN-Project/
│
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── index.html
│   └── package.json
│
├── .gitignore
└── README.md
```

## How to Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/pranaycharde01/MERN-Project.git
cd MERN-Project
```

### 2. Run Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret
```

Start the backend:

```bash
node server.js
```

Backend:

```text
http://localhost:5000
```

### 3. Run Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## Application Workflow

```text
Faculty Login
      ↓
Create Assignment
      ↓
Student Login
      ↓
View Assignment
      ↓
Submit Project
      ↓
Faculty Views Submission
      ↓
Faculty Gives Marks & Feedback
      ↓
Student Views Result
```

## Authentication

The application uses:

* JWT authentication
* bcrypt.js password hashing
* Role-based access control
* Student and Faculty accounts

## Database

MongoDB Atlas stores:

* User information
* Assignments
* Student submissions
* Marks
* Faculty feedback

## API Modules

* `/api/auth` — Registration and Login
* `/api/assignments` — Assignment management
* `/api/submissions` — Submission and grading management

## Author

**Pranay Charde**

GitHub:
https://github.com/pranaycharde01

## Project Status

Functional MVP completed for college assignment submission and grading management.
