# 🎀 Ella Rises Program Management System

A full-stack web application built for the **INTEX** project to help **Ella Rises** manage events, participants, registrations, donations, surveys, and organizational impact.  
The system mirrors the soft, elegant aesthetic of **EllaRises.org**, using pastel gradients, rounded components, and a clean, approachable UI.

---

## ✨ Overview

This platform provides a unified internal system for Ella Rises staff, volunteers, and program users.  
It includes role-based dashboards, event scheduling, participant tracking, donation visibility, and survey collection—all integrated into a polished, intuitive experience.

---

## 📌 Features

### **Public Pages**
- Landing page with mission statement and donation CTA  
- Impact page with program metrics  
- Public donation link to GiveButter  
- Mobile-responsive header, footer, and layout  

---

### **Authenticated System**
- Login & logout  
- Secure password hashing  
- Role-based dashboards  
  - **Manager Dashboard**  
  - **Super User Dashboard**  
  - **User Dashboard**  

---

## **Core Management Tools**

### **Events**
- Event Templates (create, edit, delete)  
- Event Occurrences (schedule, update, cancel)  
- User event registration and unregistering  
- Capacity management  

### **Participants**
- Full record management for managers  
- Profile details, milestones, surveys, and donation history  

### **Users**
- Super Users manage system user accounts  
- Access levels set by assigned role  

### **Milestones**
- Create and manage milestone categories  
- Track progress for each program user  

### **Surveys**
- Create and manage surveys  
- Collect user responses  
- Display completion statistics  

### **Donations**
- View donation history  
- Aggregate donation visibility  
- Integrated link to GiveButter  

---

## 🎨 UI & Styling

- Fully custom CSS  
- Pastel gradients, soft shadows, and elevated card components  
- Rounded UI inspired by **EllaRises.org**  

---

## 🛠 Tech Stack

### **Backend**
- Node.js  
- Express.js  
- EJS  
- Knex.js or native `pg`  
- express-session  

### **Database**
- PostgreSQL  

### **Frontend**
- EJS templates  
- Custom CSS in `public/css/styles.css`  
- Static assets in `public/images`  

---

## 🔐 Role-Based Functionality

### **Super Users**
Manage system user accounts and perform all manager-level functions.

---

### **Managers**
Manage events, participants, milestones, surveys, donations, registrations, and view organizational metrics.

---

### **Standard Users**
View personal profile information, milestones, surveys, donation history, event registrations, and register/unregister for events.

---

## 📊 Dashboards

### **Manager Dashboard**
Displays:
- Upcoming events and registration counts  
- Survey completion statistics  
- Milestone progress overviews  
- Recent donations  
- Quick access to management tools  

---

### **User Dashboard**
Displays:
- Events registered for  
- Surveys completed  
- Milestones achieved  
- Donations made  
- Personalized engagement overview  

---

## 🔒 Data Security

The Ella Rises system follows secure authentication practices to ensure user data remains protected.

### **Password Hashing**
All user passwords are encrypted using **bcrypt**, an industry-standard hashing algorithm.  
This includes:

- Salted hashing to prevent lookup-table attacks  
- One-way encryption so passwords cannot be reversed  
- Secure comparison during login, avoiding plain-text password storage  

No raw passwords are ever stored in the database.

---

## TESTING FOR TAs

**Super Manager**  
Email: `supermanager@gmail.com`  
Password: `supermanager1`  

**Manager**  
Email: `manager@gmail.com`  
Password: `manager1`  

**User**  
Email: `user@gmail.com`  
Password: `user1`  
