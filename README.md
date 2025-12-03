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

---

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


====================================================
Run the following SQL script to create users table.

Create test user and test manager through the manager page while running the site.
To give the test manager the manager role, after registering, go into pgadmin and
edit the role to be "Manager" instead of "User".

The users must be created in the register page because bcrypt will hash the password
before adding it to the database users table.

Good luck!

SQL Script:
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- Table: public.users

-- DROP TABLE IF EXISTS public.users;

CREATE TABLE IF NOT EXISTS public.users
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    email character varying(50) COLLATE pg_catalog."default" NOT NULL,
    password character varying(100) COLLATE pg_catalog."default" NOT NULL,
    role character varying(7) COLLATE pg_catalog."default" NOT NULL,
    created_date date NOT NULL DEFAULT CURRENT_DATE,
    full_name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
    OWNER to postgres;
========================================================================================









If you're reading this you're gay








```
