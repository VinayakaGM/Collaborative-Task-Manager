# 🧠 Collaborative Task Manager

A full-stack web application for managing tasks collaboratively with **role-based access control**, **secure authentication**, and a modern UI.

---

## ⚡ Quick Start

```bash
npm run install:all
npm run dev
```

---

## 🚀 Features

### 🔐 Authentication & Security

* User Signup & Login
* JWT-based authentication
* Secure password hashing
* Protected routes

---

### 👥 Role-Based Access Control (RBAC)

#### 🧑‍💼 Manager

* Create tasks
* Assign tasks to users
* Edit and delete tasks
* View all created tasks

#### 👨‍💻 User

* View assigned tasks
* Update task status

---

### 📋 Task Management

* Create, edit, delete tasks
* Assign tasks to users
* Mark tasks as completed
* Filter and manage tasks efficiently

---

### 📊 Dashboard

* Tasks assigned to logged-in user
* Tasks created by manager
* Clean and intuitive UI

---

### 🎨 UI/UX

* Responsive design
* Built with Tailwind CSS
* Dark mode support 🌙

---

### ⚙️ Backend Features

* RESTful API
* Activity logs for task updates
* Rate limiting for API protection
* Scalable architecture

---

### ⚡ Bonus Features

* Real-time updates using Socket.io
* Drag-and-drop task management
* Pagination support

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Tailwind CSS
* Context API 

### Backend

* Node.js
* Express.js

### Database

* MongoDB (Mongoose)

### Tools

* JWT Authentication
* bcrypt
* Express Rate Limit
* Socket.io

---

## 🔧 Environment Variables

### 📌 Backend (`backend/.env`)

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

---

### 📌 Frontend (`frontend/.env`)

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## 🧪 Available Scripts

### 📦 Install All Dependencies

```bash
npm run install:all
```

---

### 🚀 Run Full Application

```bash
npm run dev
```

---

### 🔧 Run Backend Only

```bash
npm run dev:backend
```

---

### 🎨 Run Frontend Only

```bash
npm run dev:frontend
```

---

### ▶️ Run Backend (Production)

```bash
npm run start:backend
```

---

## ⚙️ Manual Setup (Alternative)

### 1️⃣ Backend

```bash
cd backend
npm install
npm run dev
```

---

### 2️⃣ Frontend

```bash
cd frontend
npm install
npm start
```

---

## ⭐ Summary

This project demonstrates:

* Full-stack development
* Secure authentication & authorization
* Clean architecture
* Real-world task management system
---
