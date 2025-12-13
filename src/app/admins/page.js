"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminsPage() {
  const router = useRouter();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    username: "",
    fullName: "",
    password: "",
  });

  //edit modal
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editForm, setEditForm] = useState({
    username: "",
    fullName: "",
    password: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchAdmins() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/admins", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message || "Αποτυχία φόρτωσης admins");
        setAdmins([]);
        return;
      }

      const data = await res.json();
      setAdmins(data);
    } catch (e) {
      console.error(e);
      setError("Απρόσμενο σφάλμα");
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function handleEditChange(e) {
    const { name, value } = e.target;
    setEditForm((p) => ({ ...p, [name]: value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setCreating(true);

    if (!form.username.trim() || !form.password.trim()) {
      setError("Username και password είναι υποχρεωτικά.");
      setCreating(false);
      return;
    }

    try {
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(form),
      });

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        setError(payload?.message || "Αποτυχία δημιουργίας admin");
        return;
      }

      setAdmins((prev) => [payload, ...prev]);
      setForm({ username: "", fullName: "", password: "" });
    } catch (e) {
      console.error(e);
      setError("σφάλμα κατά τη δημιουργία");
    } finally {
      setCreating(false);
    }
  }

  function openEditModal(a) {
    setError("");
    setEditingAdmin(a);
    setEditForm({
      username: a.username || "",
      fullName: a.fullName || "",
      password: "",
    });
  }

  function closeEditModal() {
    setEditingAdmin(null);
    setSavingEdit(false);
  }

  async function handleUpdate(e) {
    e.preventDefault();
    if (!editingAdmin) return;

    setError("");
    setSavingEdit(true);

    if (!editForm.username.trim()) {
      setError("Το username είναι υποχρεωτικό.");
      setSavingEdit(false);
      return;
    }

    try {
      const res = await fetch(`/api/admins/${editingAdmin.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(editForm),
      });

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        setError(payload?.message || "Αποτυχία ενημέρωσης admin");
        return;
      }

      setAdmins((prev) => prev.map((x) => (x.id === payload.id ? payload : x)));

      closeEditModal();
    } catch (e) {
      console.error(e);
      setError("σφάλμα κατά την ενημέρωση");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(a) {
    setError("");

    const ok = window.confirm(
      `Σίγουρα θέλεις να διαγράψεις τον admin "${a.username}"?`
    );
    if (!ok) return;

    setDeletingId(a.id);

    try {
      const res = await fetch(`/api/admins/${a.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      if (res.status === 204) {
        setAdmins((prev) => prev.filter((x) => x.id !== a.id));
        return;
      }

      const payload = await res.json().catch(() => null);
      setError(payload?.message || "Αποτυχία διαγραφής admin");
    } catch (e) {
      console.error(e);
      setError(" σφάλμα κατά τη διαγραφή");
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return admins;
    const q = search.toLowerCase();
    return admins.filter((a) => {
      return (
        (a.username || "").toLowerCase().includes(q) ||
        (a.fullName || "").toLowerCase().includes(q)
      );
    });
  }, [admins, search]);

  return (
    <main className="page">
      <header className="top-bar">
        <div className="top-bar-left">
          <h1 className="app-title">Clinic Appointment System</h1>
          <span className="app-subtitle">Admins</span>
        </div>
      </header>

      <section className="content-grid">
        <div className="card">
          <h2 className="card-title">Δημιουργία admin</h2>
          <p className="card-subtitle">Πρόσθεσε νέο λογαριασμό διαχειριστή.</p>

          <form className="form" onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-field">
                <label>Username *</label>
                <input
                  className="input"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                />
              </div>
              <div className="form-field">
                <label>Ονοματεπώνυμο *</label>
                <input
                  required
                  className="input"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Password *</label>
                <input
                  className="input"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="τουλάχιστον 6 χαρακτήρες"
                />
              </div>
            </div>

            {error && <div className="error-text">{error}</div>}

            <button className="btn-primary" type="submit" disabled={creating}>
              {creating ? "Δημιουργία..." : "Δημιουργία Admin"}
            </button>
          </form>
        </div>

        {/* List admins */}
        <div className="card">
          <div className="card-header-row">
            <div>
              <h2 className="card-title">Λίστα admins</h2>
              <p className="card-subtitle">Όλοι οι λογαριασμοί διαχειριστή.</p>
            </div>
            <div>
              <input
                className="input"
                placeholder="Αναζήτηση ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <p>Φόρτωση...</p>
          ) : filtered.length === 0 ? (
            <p>Δεν βρέθηκαν admins.</p>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Ονοματεπώνυμο</th>
                    <th>Ημ. δημιουργίας</th>
                    <th style={{ width: 220 }}>Ενέργειες</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <strong>{a.username}</strong>
                      </td>
                      <td>{a.fullName || "-"}</td>
                      <td>
                        {a.createdAt
                          ? new Date(a.createdAt).toLocaleString("el-GR")
                          : "-"}
                      </td>
                      <td>
                        <div
                          style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                        >
                          <button
                            className="btn-secondary"
                            type="button"
                            onClick={() => openEditModal(a)}
                          >
                            Επεξεργασία
                          </button>
                          <button
                            className="btn-danger"
                            type="button"
                            onClick={() => handleDelete(a)}
                            disabled={deletingId === a.id}
                          >
                            {deletingId === a.id ? "Διαγραφή..." : "Διαγραφή"}
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

      {/* EDIT MODAL */}
      {editingAdmin && (
        <div className="modal-backdrop" onClick={closeEditModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Επεξεργασία admin</h3>
            </div>

            <form className="form" onSubmit={handleUpdate}>
              <div className="form-row">
                <div className="form-field">
                  <label>Username *</label>
                  <input
                    className="input"
                    name="username"
                    value={editForm.username}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="form-field">
                  <label>Ονοματεπώνυμο</label>
                  <input
                    className="input"
                    name="fullName"
                    value={editForm.fullName}
                    onChange={handleEditChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Νέος κωδικός (προαιρετικό)</label>
                  <input
                    className="input"
                    type="password"
                    name="password"
                    value={editForm.password}
                    onChange={handleEditChange}
                    placeholder="άφησέ το κενό για να μην αλλάξει"
                  />
                </div>
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
