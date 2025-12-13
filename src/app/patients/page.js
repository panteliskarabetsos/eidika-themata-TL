"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

function toDateInputValue(dateLike) {
  if (!dateLike) return "";
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

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

  // Edit modal state
  const [editingPatient, setEditingPatient] = useState(null);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    notes: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleEditChange(e) {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setError("σφάλμα");
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
      setError("σφάλμα κατά την καταχώρηση");
    } finally {
      setCreating(false);
    }
  }

  function openEditModal(p) {
    setError("");
    setEditingPatient(p);
    setEditForm({
      firstName: p.firstName || "",
      lastName: p.lastName || "",
      phone: p.phone || "",
      email: p.email || "",
      dateOfBirth: toDateInputValue(p.dateOfBirth),
      notes: p.notes || "",
    });
  }

  function closeEditModal() {
    setEditingPatient(null);
    setSavingEdit(false);
  }

  async function handleUpdatePatient(e) {
    e.preventDefault();
    if (!editingPatient) return;

    setError("");
    setSavingEdit(true);

    if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
      setError("Το όνομα και το επώνυμο είναι υποχρεωτικά.");
      setSavingEdit(false);
      return;
    }

    try {
      const res = await fetch(`/api/patients/${editingPatient.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to update patient:", text);
        setError(text || "Αποτυχία ενημέρωσης ασθενή");
        return;
      }

      const updated = await res.json();

      setPatients((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );

      closeEditModal();
    } catch (err) {
      console.error(err);
      setError("Απρόσμενο σφάλμα κατά την ενημέρωση");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDeletePatient(p) {
    setError("");

    const ok = window.confirm(
      `Σίγουρα θέλεις να διαγράψεις τον/την ${p.firstName} ${p.lastName};`
    );
    if (!ok) return;

    setDeletingId(p.id);

    try {
      const res = await fetch(`/api/patients/${p.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      if (!res.ok && res.status !== 204) {
        const text = await res.text();
        console.error("Failed to delete patient:", text);
        setError(text || "Αποτυχία διαγραφής ασθενή");
        return;
      }

      setPatients((prev) => prev.filter((x) => x.id !== p.id));
    } catch (err) {
      console.error(err);
      setError("Απρόσμενο σφάλμα κατά τη διαγραφή");
    } finally {
      setDeletingId(null);
    }
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
      <header className="top-bar">
        <div className="top-bar-left">
          <h1 className="app-title">Clinic Appointment System</h1>
          <span className="app-subtitle">Διαχείριση ασθενών</span>
        </div>
      </header>

      <section className="content-grid">
        {/* Φόρμα προσθήκης νέου ασθενή */}
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
                    <th style={{ width: 220 }}>Ενέργειες</th>
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
                      <td>
                        <div
                          style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                        >
                          <button
                            className="btn-secondary"
                            type="button"
                            onClick={() => openEditModal(p)}
                          >
                            Επεξεργασία
                          </button>
                          <button
                            className="btn-danger"
                            type="button"
                            onClick={() => handleDeletePatient(p)}
                            disabled={deletingId === p.id}
                          >
                            {deletingId === p.id ? "Διαγραφή..." : "Διαγραφή"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* EDIT MODAL*/}
      {editingPatient && (
        <div className="modal-backdrop" onClick={closeEditModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                Επεξεργασία: {editingPatient.firstName}{" "}
                {editingPatient.lastName}
              </h3>
            </div>

            <form className="form" onSubmit={handleUpdatePatient}>
              <div className="form-row">
                <div className="form-field">
                  <label>Όνομα *</label>
                  <input
                    className="input"
                    name="firstName"
                    value={editForm.firstName}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="form-field">
                  <label>Επώνυμο *</label>
                  <input
                    className="input"
                    name="lastName"
                    value={editForm.lastName}
                    onChange={handleEditChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Τηλέφωνο</label>
                  <input
                    className="input"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="form-field">
                  <label>Email</label>
                  <input
                    className="input"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
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
                    value={editForm.dateOfBirth}
                    onChange={handleEditChange}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Σημειώσεις</label>
                <textarea
                  className="textarea"
                  name="notes"
                  rows={3}
                  value={editForm.notes}
                  onChange={handleEditChange}
                />
              </div>

              {error && <div className="error-text">{error}</div>}

              <div
                className="modal-actions"
                style={{ display: "flex", gap: 10 }}
              >
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={closeEditModal}
                  disabled={savingEdit}
                >
                  Ακύρωση
                </button>
                <button
                  className="btn-primary"
                  type="submit"
                  disabled={savingEdit}
                >
                  {savingEdit ? "Αποθήκευση..." : "Αποθήκευση"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
