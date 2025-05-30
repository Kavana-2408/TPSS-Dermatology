# TPSS-Dermatology



# TPSS Dermatology - Teledermatology Platform

A local web-based platform for remote diagnosis of Allergic Contact Dermatitis (ACD) using patch test images and AI analysis.

---

## 🚀 Project Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Kavana-2408/TPSS-Dermatology.git
cd TPSS-Dermatology
````

---

### 2️⃣ Install Dependencies

Make sure you have Node.js and npm installed. Then run:

```bash
npm install
```

---

### 3️⃣ Set Up the PostgreSQL Database

#### Option A: Using pgAdmin (GUI)

1. Open **pgAdmin**.
2. Right-click on **Databases → Create → Database**.

   * Name it: `tpss_dermatology`
3. Open the **Query Tool**.
4. Open and run the SQL dump file located at `dump.sql`.

#### Option B: Using Terminal (CLI)

```bash
# Create the database
createdb -U postgres tpss_dermatology

# Import the SQL dump
psql -U postgres -d tpss_dermatology -f dump.sql
```

> Replace `postgres` with your local PostgreSQL username if different.

---

### 4️⃣ Configure Environment Variables

1. Create a local environment file:

```bash
cp .env.example .env.local
```

2. Edit `.env.local` and fill in your PostgreSQL credentials. Example:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/tpss_dermatology
NEXTAUTH_SECRET=your-secret-key
```

---

### 5️⃣ Start the Development Server

```bash
npm run dev
```

for backend: [http://localhost:3000]
for frontend: [http://localhost:3000]

---



## 📎 Notes

* Ensure the `public/uploads/` folder exists for image uploads.
* The database contains sample data for testing purposes.
* This app includes a NextAuth-based login, patient dashboard, image upload, and AI result display (AI model integration optional for now).

---

## 🧑‍💻 Contributors

* Kavana-2408



