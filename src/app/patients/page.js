// src/app/patients/page.js
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    notes: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchPatients();
  }, []);

  async function fetchPatients() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/patients", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to fetch patients:", text);
        setError("Αποτυχία φόρτωσης ασθενών");
        setPatients([]);
        return;
      }

      const data = await res.json();
      setPatients(data);
    } catch (err) {
      console.error(err);
      setError("Απρόσμενο σφάλμα");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setCreating(true);

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("Το όνομα και το επώνυμο είναι υποχρεωτικά.");
      setCreating(false);
      return;
    }

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to create patient:", text);
        setError(text || "Αποτυχία καταχώρησης ασθενή");
        return;
      }

      const created = await res.json();
      setPatients((prev) => [created, ...prev]);

      setForm({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        dateOfBirth: "",
        notes: "",
      });
    } catch (err) {
      console.error(err);
      setError("Απρόσμενο σφάλμα κατά την καταχώρηση");
    } finally {
      setCreating(false);
    }
  }

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    router.push("/login");
  }

  const filteredPatients = useMemo(() => {
    if (!search.trim()) return patients;
    const q = search.toLowerCase();
    return patients.filter((p) => {
      const fullName = `${p.firstName || ""} ${p.lastName || ""}`.toLowerCase();
      return (
        fullName.includes(q) ||
        (p.phone || "").toLowerCase().includes(q) ||
        (p.email || "").toLowerCase().includes(q)
      );
    });
  }, [patients, search]);

  return (
    <main className="page">
      {/* Top bar */}
      <header className="top-bar">
        <div className="top-bar-left">
          <h1 className="app-title">Clinic Appointment System</h1>
          <span className="app-subtitle">Διαχείριση ασθενών</span>
        </div>
      </header>

      <section className="content-grid">
        {/* Φόρμα νέου ασθενή */}
        <div className="card">
          <h2 className="card-title">Νέος ασθενής</h2>
          <p className="card-subtitle">
            Καταχώρησε έναν νέο ασθενή στο σύστημα.
          </p>

          <form className="form" onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-field">
                <label>Όνομα *</label>
                <input
                  className="input"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="π.χ. Γιάννης"
                />
              </div>
              <div className="form-field">
                <label>Επώνυμο *</label>
                <input
                  className="input"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="π.χ. Παπαδόπουλος"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Τηλέφωνο</label>
                <input
                  className="input"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="π.χ. 69xxxxxxxx"
                />
              </div>
              <div className="form-field">
                <label>Email</label>
                <input
                  className="input"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="π.χ. patient@example.com"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Ημερομηνία γέννησης</label>
                <input
                  className="input"
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-field">
              <label>Σημειώσεις</label>
              <textarea
                className="textarea"
                name="notes"
                rows={3}
                value={form.notes}
                onChange={handleChange}
                placeholder="Σύντομες κλινικές σημειώσεις ή άλλα σχόλια..."
              />
            </div>

            {error && <div className="error-text">{error}</div>}

            <button className="btn-primary" type="submit" disabled={creating}>
              {creating ? "Καταχώρηση..." : "Καταχώρηση"}
            </button>
          </form>
        </div>

        {/* Λίστα ασθενών */}
        <div className="card">
          <div className="card-header-row">
            <div>
              <h2 className="card-title">Λίστα ασθενών</h2>
              <p className="card-subtitle">
                Προβολή όλων των εγγεγραμμένων ασθενών.
              </p>
            </div>
            <div>
              <input
                className="input"
                placeholder="Αναζήτηση (όνομα, τηλέφωνο, email)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <p>Φόρτωση...</p>
          ) : filteredPatients.length === 0 ? (
            <p>Δεν υπάρχουν ασθενείς που να ταιριάζουν με τα κριτήρια.</p>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ονοματεπώνυμο</th>
                    <th>Τηλέφωνο</th>
                    <th>Email</th>
                    <th>Ημ. δημιουργίας</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>
                          {p.firstName} {p.lastName}
                        </strong>
                      </td>
                      <td>{p.phone || "-"}</td>
                      <td>{p.email || "-"}</td>
                      <td>
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleString("el-GR")
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
