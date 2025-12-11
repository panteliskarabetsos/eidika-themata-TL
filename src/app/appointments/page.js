// src/app/appointments/page.js
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AppointmentsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // φόρμα δημιουργίας
  const [form, setForm] = useState({
    patientId: "",
    date: "",
    time: "",
    durationMinutes: 30,
    reason: "",
  });

  // --- ΝΕΑ STATE για edit/delete ---
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    date: "",
    time: "",
    durationMinutes: 30,
    status: "scheduled",
    reason: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [patientsRes, appointmentsRes] = await Promise.all([
        fetch("/api/patients", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }),
        fetch("/api/appointments", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }),
      ]);

      if (!patientsRes.ok) {
        const t = await patientsRes.text();
        console.error("Patients error:", t);
        setError("Αποτυχία φόρτωσης ασθενών");
        return;
      }

      if (!appointmentsRes.ok) {
        const t = await appointmentsRes.text();
        console.error("Appointments error:", t);
        setError("Αποτυχία φόρτωσης ραντεβού");
        return;
      }

      const patientsData = await patientsRes.json();
      const appointmentsData = await appointmentsRes.json();

      setPatients(patientsData);
      setAppointments(appointmentsData);
    } catch (err) {
      console.error(err);
      setError("Απρόσμενο σφάλμα");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");

    if (!form.patientId || !form.date || !form.time) {
      setError("Ασθενής, ημερομηνία και ώρα είναι υποχρεωτικά.");
      return;
    }

    setCreating(true);

    try {
      const dateTimeStr = `${form.date}T${form.time}:00`;

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({
          patientId: Number(form.patientId),
          dateTime: dateTimeStr,
          durationMinutes: Number(form.durationMinutes) || 30,
          reason: form.reason,
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        console.error("Create appointment error:", t);
        setError(t || "Αποτυχία δημιουργίας ραντεβού");
        return;
      }

      const created = await res.json();
      setAppointments((prev) => [...prev, created]);

      setForm({
        patientId: "",
        date: "",
        time: "",
        durationMinutes: 30,
        reason: "",
      });
    } catch (err) {
      console.error(err);
      setError("Απρόσμενο σφάλμα κατά τη δημιουργία ραντεβού");
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

  // -------- EDIT ΛΟΓΙΚΗ --------

  function startEdit(appointment) {
    const d = appointment.dateTime ? new Date(appointment.dateTime) : null;

    let date = "";
    let time = "";
    if (d) {
      // προσοχή: χρήση UTC, αλλά είναι ΟΚ για basic χρήση
      date = d.toISOString().slice(0, 10); // YYYY-MM-DD
      time = d.toTimeString().slice(0, 5); // HH:MM
    }

    setEditForm({
      date,
      time,
      durationMinutes: appointment.durationMinutes || 30,
      status: appointment.status || "scheduled",
      reason: appointment.reason || "",
    });

    setEditingId(appointment.id);
    setError("");
  }

  function handleEditChange(e) {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleUpdate(e) {
    e.preventDefault();
    if (!editingId) return;

    if (!editForm.date || !editForm.time) {
      setError("Ημερομηνία και ώρα είναι υποχρεωτικά για την επεξεργασία.");
      return;
    }

    setSavingEdit(true);
    setError("");

    try {
      const dateTimeStr = `${editForm.date}T${editForm.time}:00`;

      const res = await fetch(`/api/appointments/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({
          dateTime: dateTimeStr,
          durationMinutes: Number(editForm.durationMinutes) || 30,
          status: editForm.status,
          reason: editForm.reason,
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        console.error("Update appointment error:", t);
        setError(t || "Αποτυχία ενημέρωσης ραντεβού");
        return;
      }

      const updated = await res.json();
      setAppointments((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      );
      setEditingId(null);
    } catch (err) {
      console.error(err);
      setError("Απρόσμενο σφάλμα κατά την ενημέρωση ραντεβού");
    } finally {
      setSavingEdit(false);
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({
      date: "",
      time: "",
      durationMinutes: 30,
      status: "scheduled",
      reason: "",
    });
  }

  // -------- DELETE ΛΟΓΙΚΗ --------

  async function handleDelete(id) {
    const ok = window.confirm("Θέλεις σίγουρα να διαγράψεις αυτό το ραντεβού;");
    if (!ok) return;

    setDeletingId(id);
    setError("");

    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      if (!res.ok) {
        const t = await res.text();
        console.error("Delete appointment error:", t);
        setError(t || "Αποτυχία διαγραφής ραντεβού");
        return;
      }

      setAppointments((prev) => prev.filter((a) => a.id !== id));

      if (editingId === id) {
        cancelEdit();
      }
    } catch (err) {
      console.error(err);
      setError("Απρόσμενο σφάλμα κατά τη διαγραφή ραντεβού");
    } finally {
      setDeletingId(null);
    }
  }

  // -------- ΦΙΛΤΡΑΡΙΣΜΑ --------

  const filteredAppointments = useMemo(() => {
    if (!filterDate) return appointments;
    return appointments.filter((a) => {
      if (!a.dateTime) return false;
      const d = new Date(a.dateTime);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const iso = `${y}-${m}-${day}`;
      return iso === filterDate;
    });
  }, [appointments, filterDate]);

  return (
    <main className="page">
      <header className="top-bar">
        <div className="top-bar-left">
          <h1 className="app-title">Clinic Appointment System</h1>
          <span className="app-subtitle">Διαχείριση ραντεβού</span>
        </div>
      </header>

      <section className="content-grid">
        {/* Φόρμα δημιουργίας ραντεβού */}
        <div className="card">
          <h2 className="card-title">Νέο ραντεβού</h2>
          <p className="card-subtitle">
            Συμπλήρωσε τα στοιχεία για να προγραμματίσεις ραντεβού.
          </p>

          <form className="form" onSubmit={handleCreate}>
            <div className="form-field">
              <label>Ασθενής *</label>
              <select
                name="patientId"
                className="input"
                value={form.patientId}
                onChange={handleChange}
              >
                <option value="">Επιλογή ασθενή</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} {p.phone ? `(${p.phone})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Ημερομηνία *</label>
                <input
                  type="date"
                  name="date"
                  className="input"
                  value={form.date}
                  onChange={handleChange}
                />
              </div>
              <div className="form-field">
                <label>Ώρα *</label>
                <input
                  type="time"
                  name="time"
                  className="input"
                  value={form.time}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Διάρκεια (λεπτά)</label>
                <input
                  type="number"
                  name="durationMinutes"
                  className="input"
                  value={form.durationMinutes}
                  onChange={handleChange}
                  min={5}
                  step={5}
                />
              </div>
            </div>

            <div className="form-field">
              <label>Λόγος επίσκεψης</label>
              <textarea
                name="reason"
                className="textarea"
                rows={2}
                value={form.reason}
                onChange={handleChange}
                placeholder="π.χ. έλεγχος θυρεοειδούς, επανεξέταση..."
              />
            </div>

            {error && <div className="error-text">{error}</div>}

            <button className="btn-primary" type="submit" disabled={creating}>
              {creating ? "Καταχώρηση..." : "Καταχώρηση"}
            </button>
          </form>
        </div>

        {/* Λίστα ραντεβού */}
        <div className="card">
          <div className="card-header-row">
            <div>
              <h2 className="card-title">Προγραμματισμένα ραντεβού</h2>
              <p className="card-subtitle">
                Προβολή όλων των ραντεβού με δυνατότητα φιλτραρίσματος και
                επεξεργασίας.
              </p>
            </div>
            <div className="form-field" style={{ minWidth: "180px" }}>
              <label>Φιλτράρισμα κατά ημερομηνία</label>
              <input
                type="date"
                className="input"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
          </div>

          {/* Panel επεξεργασίας όταν έχει επιλεγεί ραντεβού */}
          {editingId && (
            <div
              className="card"
              style={{
                marginBottom: "0.75rem",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
              }}
            >
              <h3 className="card-title" style={{ fontSize: "1rem" }}>
                Επεξεργασία ραντεβού
              </h3>
              <p className="card-subtitle">
                Τροποποίησε ημερομηνία, ώρα, διάρκεια, κατάσταση και λόγο.
              </p>
              <form className="form" onSubmit={handleUpdate}>
                <div className="form-row">
                  <div className="form-field">
                    <label>Ημερομηνία *</label>
                    <input
                      type="date"
                      name="date"
                      className="input"
                      value={editForm.date}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="form-field">
                    <label>Ώρα *</label>
                    <input
                      type="time"
                      name="time"
                      className="input"
                      value={editForm.time}
                      onChange={handleEditChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label>Διάρκεια (λεπτά)</label>
                    <input
                      type="number"
                      name="durationMinutes"
                      className="input"
                      value={editForm.durationMinutes}
                      onChange={handleEditChange}
                      min={5}
                      step={5}
                    />
                  </div>
                  <div className="form-field">
                    <label>Κατάσταση</label>
                    <select
                      name="status"
                      className="input"
                      value={editForm.status}
                      onChange={handleEditChange}
                    >
                      <option value="scheduled">Προγραμματισμένο</option>
                      <option value="completed">Ολοκληρωμένο</option>
                      <option value="cancelled">Ακυρωμένο</option>
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <label>Λόγος επίσκεψης</label>
                  <textarea
                    name="reason"
                    className="textarea"
                    rows={2}
                    value={editForm.reason}
                    onChange={handleEditChange}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={cancelEdit}
                  >
                    Ακύρωση
                  </button>
                  <button
                    className="btn-primary"
                    type="submit"
                    disabled={savingEdit}
                  >
                    {savingEdit ? "Αποθήκευση..." : "Αποθήκευση αλλαγών"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <p>Φόρτωση...</p>
          ) : filteredAppointments.length === 0 ? (
            <p>Δεν υπάρχουν ραντεβού.</p>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ημερομηνία/ώρα</th>
                    <th>Ασθενής</th>
                    <th>Τηλέφωνο</th>
                    <th>Διάρκεια</th>
                    <th>Κατάσταση</th>
                    <th>Λόγος</th>
                    <th>Ενέργειες</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((a) => {
                    const d = a.dateTime ? new Date(a.dateTime) : null;
                    const patient = a.Patient || a.patient || null;
                    return (
                      <tr key={a.id}>
                        <td>
                          {d
                            ? d.toLocaleString("el-GR", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : "-"}
                        </td>
                        <td>
                          {patient
                            ? `${patient.firstName} ${patient.lastName}`
                            : "-"}
                        </td>
                        <td>{patient?.phone || "-"}</td>
                        <td>{a.durationMinutes}ʼ</td>
                        <td>
                          {a.status === "scheduled"
                            ? "Προγραμματισμένο"
                            : a.status === "completed"
                            ? "Ολοκληρωμένο"
                            : "Ακυρωμένο"}
                        </td>
                        <td>{a.reason || "-"}</td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              gap: "0.35rem",
                              flexWrap: "wrap",
                            }}
                          >
                            <button
                              type="button"
                              className="btn-outline"
                              style={{
                                fontSize: "0.75rem",
                                padding: "0.15rem 0.55rem",
                              }}
                              onClick={() => startEdit(a)}
                            >
                              Επεξεργασία
                            </button>
                            <button
                              type="button"
                              className="btn-outline"
                              style={{
                                fontSize: "0.75rem",
                                padding: "0.15rem 0.55rem",
                                borderColor: "#fecaca",
                                color: "#b91c1c",
                              }}
                              onClick={() => handleDelete(a.id)}
                              disabled={deletingId === a.id}
                            >
                              {deletingId === a.id ? "Διαγραφή..." : "Διαγραφή"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
