# 🎀 Ella Rises Program Management System  
A full-stack web application built for the INTEX project, helping **Ella Rises** manage events, participants, donations, surveys, and organizational impact.  
Designed to resemble the aesthetic and user experience of **EllaRises.org** with soft pastel visuals, elegant rounded components, and a polished professional UI.

---

## 📌 Features

### Public Pages
- Landing page with mission statement and donation CTA  
- Impact page with real program metrics  
- Public donation link to GiveButter  
- Mobile-responsive header and footer  

### Authenticated System
- Login + logout  
- Role-based dashboards  
  - **Manager Dashboard** – full access  
  - **User Dashboard** – limited access  
- Secure authentication using hashed passwords  

### Core Management Tools
- Event templates & event occurrences  
- Participant management  
- Registrations  
- Milestones  
- Surveys  
- Donations  

### UI & Styling
- Custom CSS (no Tailwind required)  
- Pastel gradients & elevated cards  
- Rounded UI components inspired by EllaRises.org  
- Reusable partials (`_navbar`, `header`, `footer`)  

---

## 🛠 Tech Stack

**Backend:**  
- Node.js  
- Express.js  
- EJS  
- Knex.js or native `pg`  
- Express-session  

**Database:**  
- PostgreSQL  
- Schema located in `db/schema.sql`

**Frontend:**  
- EJS templates  
- Custom CSS in `public/css/styles.css`  
- Static assets in `public/images`  

-------------------------------------------------------

:)

## 🧰 Installation & Setup

### Clone repo, install dependencies, edit .env file, create db
```bash
git clone https://github.com/your-repo/INTEX--EllaRises.git
cd INTEX--EllaRises

npm install


Edit .env file with your information:

DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=intex--ellarises
SESSION_SECRET=supersecretvalue
PORT=3000


Create db:

CREATE DATABASE intex--ellarises;


Load db schema:

psql -d ellarises -f db/schema.sql


Start server:

npm run dev


App runs at http://localhost:3000













If you're reading this you're gay








