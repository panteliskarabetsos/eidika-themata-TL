# Clinic Appointment System (Course Project)

Web εφαρμογή τύπου **CRUD** για διαχείριση **ασθενών** και **ραντεβού** ιατρείου.

>  project για το μάθημα **Ειδικά Θέματα Τεχνολογίας Λογισμικού (2025–2026)** του Πανεπιστημίο Δυτικής Αττικής.

---

## Τι κάνει η εφαρμογή
- **Σύνδεση διαχειριστή (JWT)** και προστασία των σελίδων διαχείρισης
- **Ασθενείς (Patients)**
  - δημιουργία, προβολή λίστας, αναζήτηση
  - επεξεργασία και διαγραφή
- **Ραντεβού (Appointments)**
  - δημιουργία, προβολή λίστας
  - αλλαγή κατάστασης (π.χ. scheduled/completed/cancelled)
  - επεξεργασία και διαγραφή
- **Διαχειριστές (Admins)**
  - προβολή λίστας
  - δημιουργία / επεξεργασία / διαγραφή λογαριασμών

---

## Αρχιτεκτονική & Τεχνολογίες
Η εφαρμογή ακολουθεί **3-tier αρχιτεκτονική**:

- **Front-end (SPA):** Next.js (React / App Router)
- **Business Logic:** Next.js API Routes (REST endpoints)
- **Database:** PostgreSQL (Neon) μέσω **Sequelize ORM**

**Auth**
- JWT (Bearer token)
- bcryptjs για hashing κωδικών

---

## Δομή φακέλων (ενδεικτικά)
- `src/app/` → UI pages (`/dashboard`, `/patients`, `/appointments`, `/admins`)
- `src/app/api/` → REST API endpoints
- `src/models/` → Sequelize Models (User, Patient, Appointment)
- `src/lib/` → DB init, Sequelize instance, auth helpers

---

## Report (PDF)
Η αναφορά της εργασίας υπάρχει στο repo και σερβίρεται ως static αρχείο:

- Διαδρομή εφαρμογής: **`/docs/report.pdf`**
- Τοποθεσία αρχείου: `public/docs/report.pdf`
- GitHub file: [`public/docs/report.pdf`](public/docs/report.pdf)

**Local:** http://localhost:3000/docs/report.pdf  
**Deployed:** https://eidika-themata-tl.vercel.app/docs/report.pdf

---

## Περιβάλλον (Environment Variables)
Δημιούργησε `.env.local`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
JWT_SECRET=" "
