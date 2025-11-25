# NELO Task Manager

A full-stack task management application built with React.js and Node.js, featuring CRUD operations, filtering, search, authentication, and automated task reminders.

**Author: SUNIDHI pathak**

## 🚀 Features

### Core Functionality
- ✅ **CRUD Operations**: Create, Read, Update, and Delete tasks
- 🔍 **Advanced Filtering**: Filter by status (All, Completed, Pending) and priority (Low, Medium, High)
- 🔎 **Elastic Search**: Real-time search with debouncing for optimal performance
- 🔐 **Authentication**: Secure login with JWT and session management
- 📧 **Task Reminders**: Automated email notifications for pending tasks (every 20 minutes)
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS

### Task Management
- Add tasks with Title, Description, Priority, and Due Date
- Edit tasks inline or via modal
- Delete tasks with confirmation dialog
- Toggle task completion status
- View tasks in an organized, card-based layout

### Search & Filter
- Case-insensitive search across task titles and descriptions
- Debounced search input (300ms delay) for smooth performance
- Combined filtering: Apply multiple filters simultaneously
- Real-time result updates

### Authentication
- Secure login with email and password
- Session persistence using sessionStorage
- Protected routes with automatic redirect
- JWT token-based authentication

## 🛠️ Tech Stack

### Frontend
- **React.js 18+** - UI framework
- **Tailwind CSS** - Styling
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **date-fns** - Date formatting

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Redis** - Caching and sessions
- **JWT** - Authentication
- **AWS SES** - Email service

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (v14 or higher)
- Redis (v6 or higher)
- Git

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/nelo-task-manager.git
cd nelo-task-manager
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
NODE_ENV=development

DB_USER=postgres
DB_PASSWORD=npmrundev
DB_NAME=larklabs
DB_HOST=127.0.0.1
DB_PORT=5432

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD='%@{f6q#077Jl'

JWT_SECRET=pioneersoftdevaccessjwt
JWT_REFRESH_SECRET=pioneersoftdevrefreshjwt

EMAIL_ADDRESS=testpioneersoft@gmail.com
EMAIL_PASSWORD=wbdn rwau rjgi ihrq

PORT=3000
```

### 3. Database Setup

Create the database and run migrations:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE larklabs;

# Run migrations (see database/migrations/001_initial_schema.sql)
```

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:3000/api
```

## 🚀 Running the Application

### Start Backend Server
```bash
cd backend
npm run dev
```
Server will run on `http://localhost:3000`

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

## 📖 API Documentation

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Task Endpoints

#### Get All Tasks
```http
GET /api/tasks
Authorization: Bearer <token>

Query Parameters:
- status: Pending | Completed
- priority: Low | Medium | High
- search: string
```

#### Create Task
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Task Title",
  "description": "Task Description",
  "priority": "High",
  "due_date": "2024-12-31"
}
```

#### Update Task
```http
PUT /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated Description",
  "priority": "Medium",
  "due_date": "2024-12-31",
  "status": "Completed"
}
```

#### Delete Task
```http
DELETE /api/tasks/:id
Authorization: Bearer <token>
```

#### Toggle Task Status
```http
PATCH /api/tasks/:id/toggle
Authorization: Bearer <token>
```

## 🎯 Usage

### Login
1. Navigate to the login page
2. Enter your email and password
3. Click "Login" to access the dashboard

### Create a Task
1. Click the "Add Task" button
2. Fill in the task details:
   - Title (required)
   - Description (optional)
   - Priority: Low, Medium, or High
   - Due Date (required)
3. Click "Create Task"

### Edit a Task
1. Click the "Edit" button on any task card
2. Modify the task details in the modal
3. Click "Save Changes"

### Delete a Task
1. Click the "Delete" button on any task card
2. Confirm deletion in the dialog

### Filter Tasks
- Use the filter buttons to show:
  - All Tasks
  - Completed Tasks
  - Pending Tasks
  - Tasks by Priority

### Search Tasks
- Type in the search box to find tasks by title or description
- Results update automatically as you type (with debouncing)

## 🔄 Task Mail Automation

The application automatically checks for pending tasks every 20 minutes and logs notification details to the console. In production, this would send email reminders via AWS SES.

## 📁 Project Structure

```
nelo-task-manager/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── tasks/
│   │   │   └── common/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   └── pages/
│   └── package.json
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── server.js
├── database/
│   └── migrations/
└── README.md
```

## 🧪 Testing

### Manual Testing Checklist
- [x] User authentication (login/logout)
- [x] Create, read, update, delete tasks
- [x] Filter tasks by status and priority
- [x] Search tasks with debouncing
- [x] Session persistence
- [x] Task mail automation

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
- Ensure PostgreSQL is running
- Verify database credentials in `.env`
- Check if database exists

**Redis Connection Error**
- Ensure Redis server is running
- Verify Redis credentials in `.env`

**CORS Errors**
- Check backend CORS configuration
- Verify frontend API URL in `.env`

## 📝 Development Notes

- Code follows React best practices with hooks
- Components are reusable and well-structured
- Error handling implemented throughout
- Form validation on both client and server
- Responsive design for all screen sizes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

This project is created for NELO assessment purposes.

## 👤 Author

**SUNIDHI pathak**

## 📧 Contact

For questions or support, please contact: nelo.careers@gmail.com

---

**Built with ❤️ for NELO Assessment**

