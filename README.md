# JaiPriya Academy - Full Stack Application

JaiPriya Academy is a modern educational academy web application offering skill development courses, early childhood education programs, student authentication, and a full-stack **Abacus MCQ Test System** with automated evaluations and countdown timers.

---

## Tech Stack

### Frontend
- **Framework**: React 18 with Vite 6 (JavaScript)
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (v6)
- **Icons**: Lucide React
- **State/Auth**: Context API + JWT Token handling with `localStorage`

### Backend
- **Framework**: Python 3.12 + Django 5.2
- **API Engine**: Django REST Framework (DRF)
- **Authentication**: JWT (JSON Web Tokens) via `djangorestframework-simplejwt`
- **CORS**: `django-cors-headers`
- **Database**: SQLite (configured for seamless transition to PostgreSQL in future production deployments)

---

## Project Structure

```
jaipriya/
├── frontend/                     # React + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/           # Navbar, Footer, Hero, About, Offerings, CourseCard, ProtectedRoute
│   │   ├── context/              # AuthContext.jsx (global authentication state)
│   │   ├── services/             # api.js, authService.js, abacusService.js
│   │   ├── pages/                
│   │   │   ├── Home.jsx, Courses.jsx, CourseDetail.jsx, AboutPage.jsx, Contact.jsx
│   │   │   ├── Login.jsx, Register.jsx, Dashboard.jsx
│   │   │   └── abacus/           # AbacusDashboard.jsx, AbacusTestView.jsx, AbacusResults.jsx
│   │   ├── data/                 # offeringsData.js, whyChooseUsData.js
│   │   ├── App.jsx               # Route definitions and layout
│   │   └── main.jsx
│   ├── public/images/courses/    # Course and academy imagery
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                      # Django + DRF Backend
│   ├── config/                   # Django project configuration (settings, urls, wsgi, asgi)
│   ├── accounts/                 # Custom User model (role=STUDENT/ACADEMY_ADMIN), Auth views & serializers
│   ├── students/                 # StudentProfile (OneToOne with User, unique student_id, phone_number, abacus_level)
│   ├── abacus/                   # Abacus MCQ Test App (Tests, Questions, Attempts, Answers, Evaluation)
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── admin.py
│   │   └── management/commands/create_sample_abacus_tests.py
│   ├── manage.py
│   └── requirements.txt
│
└── README.md
```

---

## Abacus Levels (9 Levels)

1. **Junior** (`JUNIOR`)
2. **Level 1** (`LEVEL_1`)
3. **Level 2** (`LEVEL_2`)
4. **Level 3** (`LEVEL_3`)
5. **Level 4** (`LEVEL_4`)
6. **Level 5** (`LEVEL_5`)
7. **Level 6** (`LEVEL_6`)
8. **Level 7** (`LEVEL_7`)
9. **Level 8** (`LEVEL_8`)

---

## Setup & Running the Application

### 1. Backend Setup

Open a terminal in the root `jaipriya/` directory:

```powershell
# Navigate to backend
cd backend

# Create virtual environment (if not already created)
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (CMD):
.\venv\Scripts\activate.bat
# Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py makemigrations
python manage.py migrate

# (Optional) Seed sample Abacus tests for Junior, Level 1, and Level 2
python manage.py create_sample_abacus_tests

# (Optional) Create superuser for Django Admin
python manage.py createsuperuser

# Start the Django development server
python manage.py runserver
```
The Django backend will start on **`http://127.0.0.1:8000/`**.

---

### 2. Frontend Setup

Open a second terminal in the root `jaipriya/` directory:

```powershell
# Navigate to frontend
cd frontend

# Install Node dependencies (if not already installed)
npm install

# Start Vite development server
npm run dev
```
The React frontend will start on **`http://localhost:5173/`**.

---

## Django Admin Management

### How to Assign or Change a Student's Abacus Level
1. Open `http://127.0.0.1:8000/admin/` and log in with your superuser credentials.
2. Navigate to **Students &rarr; Student profiles**.
3. Click on the student's profile.
4. Set their **Abacus level** (e.g. `Level 1` or `Junior`).
5. Click **Save**. The student will immediately see active tests matching that level upon logging in.

### How to Create an Abacus Test and Add Questions
1. In Django Admin, navigate to **Abacus &rarr; Abacus tests**.
2. Click **Add Abacus test**.
3. Enter the **Title** (e.g. "Level 1 Speed Challenge"), select the **Level**, set the **Duration** in minutes (default is 10), and ensure **Is active** is checked.
4. Under the **Abacus questions** inline table:
   - Enter Question Text (e.g. "What is 15 + 23 - 8?").
   - Enter Options A, B, C, D.
   - Select the **Correct option** (A, B, C, or D).
5. Click **Save**.

---

## API Endpoints

### Authentication (`/api/auth/`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register/` | Public | Registers a student (`role=STUDENT`), creates a `StudentProfile`, and returns JWT tokens. |
| `POST` | `/api/auth/login/` | Public | Authenticates credentials (via username or registered mobile number) and returns JWT tokens. |
| `POST` | `/api/auth/token/refresh/` | Public | Refreshes the JWT access token. |
| `GET` | `/api/auth/me/` | Protected | Returns the authenticated student's profile information, student ID, and assigned Abacus level. |

### Abacus Test System (`/api/abacus/`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/abacus/my-level/` | Protected | Returns the student's assigned level (`abacus_level`, `abacus_level_display`). |
| `GET` | `/api/abacus/tests/` | Protected | Returns active tests available strictly for the student's assigned level. |
| `GET` | `/api/abacus/tests/<test_id>/` | Protected | Returns test metadata and questions (without exposing `correct_option`). |
| `POST` | `/api/abacus/tests/<test_id>/start/` | Protected | Starts a test attempt, verifies level eligibility, records start time, and returns remaining seconds. |
| `GET` | `/api/abacus/attempts/<attempt_id>/` | Protected | Retrieves active attempt state, saved answers, and server-calculated remaining time. Auto-submits if time expired. |
| `POST` | `/api/abacus/attempts/<attempt_id>/answers/` | Protected | Saves or updates a student's answer choice during an active attempt. |
| `POST` | `/api/abacus/attempts/<attempt_id>/submit/` | Protected | Submits the test for backend evaluation and returns the scored metrics. |
| `GET` | `/api/abacus/attempts/<attempt_id>/result/` | Protected | Returns summary results: Total Questions, Attended, Correct, Incorrect, Skipped. |

---

## Frontend Routes

- **Public**:
  - `/` - Academy Homepage
  - `/courses` - Catalog of 15 Skill Development & Early Childhood programs
  - `/courses/:courseId` - Dynamic course detail experience
  - `/about` - About page
  - `/contact` - Contact page
  - `/login` - Student login page (supports username or mobile number)
  - `/register` - Student registration page
- **Protected**:
  - `/dashboard` - Student Dashboard displaying student info, student ID, and module cards.
  - `/dashboard/abacus` - Abacus Hub showing student's assigned level and available level tests.
  - `/dashboard/abacus/attempt/:attemptId` - Timed test-taking interface with 10-minute countdown timer and auto-submit.
  - `/dashboard/abacus/results/:attemptId` - Clean results summary card showing Total, Attended, Correct, Incorrect, Skipped.
