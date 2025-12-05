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
- AWS Hosting
- AWS RDS
- HTTPS Encryption
- DNS

### **Frontend**
- EJS views  
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
For running on a localhost machine (rather than on AWS), you'll need to create a DB in PGAdmin4 titled 'INTEX--EllaRises', and use the .sql scripts (CREATE, INSERT -- these are located under IS 402 Deliverables). You'll need to then run the website using npm install, then npm init (go through those setup procedures, and then run npm run dev // node app.js. This will then load the website if opened on localhost:3000. Go to Log in, Sign up, and then enter the SUPER manager credentials FIRST, and then in PGAdmin, go and change ROLE to Manager, and ensure its ID primary key is set to 1. This would be auto-configured for you in AWS, but testing on localhost doesn't do that. You would also need to create the Manager account and also elevate its ROLE to Manager. Keep User set to User.

URL: **ellarises-1-14-intex.is404.net**
The following accounts have already been created in AWS / Beanstalk, so you'll just need to 'log in' with the credentials.

**Super Manager**  
Full Name: Super Manager
Email: `supermanager@gmail.com`  
Password: `supermanager1`  

**Manager** 
Full Name: Manager
Email: `manager@gmail.com`  
Password: `manager1`  

**User** 
Full Name: User
Email: `user@gmail.com`  
Password: `user1`  
