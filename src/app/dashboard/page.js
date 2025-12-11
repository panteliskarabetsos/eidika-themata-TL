// src/app/dashboard/page.js
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [patientCount, setPatientCount] = useState(0);
  const [latestPatient, setLatestPatient] = useState(null);

  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchOverview();
  }, [router]);

  async function fetchOverview() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token") || "";

      const [patientsRes, appointmentsRes] = await Promise.all([
        fetch("/api/patients", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("/api/appointments", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (!patientsRes.ok) {
        const t = await patientsRes.text();
        console.error("Failed to fetch patients for dashboard:", t);
        setError("Αποτυχία φόρτωσης ασθενών");
        setLoading(false);
        return;
      }

      if (!appointmentsRes.ok) {
        const t = await appointmentsRes.text();
        console.error("Failed to fetch appointments for dashboard:", t);
        setError("Αποτυχία φόρτωσης ραντεβού");
        setLoading(false);
        return;
      }

      const patients = await patientsRes.json();
      const appointmentsData = await appointmentsRes.json();

      setPatientCount(patients.length);
      setLatestPatient(patients[0] || null); // πιο πρόσφατος (order DESC από route)
      setAppointments(appointmentsData);
    } catch (err) {
      console.error(err);
      setError("Απρόσμενο σφάλμα");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    router.push("/login");
  }

  // Υπολογισμοί για τα ραντεβού
  const totalAppointments = appointments.length;

  const todayAppointmentsCount = useMemo(() => {
    if (!appointments.length) return 0;
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();

    return appointments.filter((a) => {
      if (!a.dateTime) return false;
      const dt = new Date(a.dateTime);
      return (
        dt.getFullYear() === y &&
        dt.getMonth() === m &&
        dt.getDate() === d &&
        a.status === "scheduled"
      );
    }).length;
  }, [appointments]);

  const nextAppointment = useMemo(() => {
    if (!appointments.length) return null;

    const now = new Date();

    const future = appointments
      .filter(
        (a) =>
          a.dateTime && new Date(a.dateTime) >= now && a.status === "scheduled"
      )
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

    return future[0] || null;
  }, [appointments]);

  return (
    <main className="page">
      {/* Top bar */}
      <header className="top-bar">
        <div className="top-bar-left">
          <h1 className="app-title">Clinic Appointment System</h1>
          <span className="app-subtitle">Πίνακας διαχείρισης</span>
        </div>
      </header>

      {/* Κεντρικό περιεχόμενο */}
      <section className="dashboard-grid">
        {/* Κάρτες στατιστικών */}
        <div className="card">
          <h2 className="card-title">Επισκόπηση</h2>
          <p className="card-subtitle">
            Γρήγορη ματιά στα βασικά στοιχεία του ιατρείου.
          </p>

          {loading ? (
            <p>Φόρτωση...</p>
          ) : error ? (
            <p className="error-text">{error}</p>
          ) : (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Σύνολο ασθενών</div>
                <div className="stat-value">{patientCount}</div>
                <div className="stat-helper">
                  <Link href="/patients">Προβολή λίστας ασθενών →</Link>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Συνολικά ραντεβού</div>
                <div className="stat-value">{totalAppointments}</div>
                <div className="stat-helper">
                  <Link href="/appointments">Προβολή όλων των ραντεβού →</Link>
                </div>
              </div>

              <div className="stat-card stat-card--muted">
                <div className="stat-label">Ραντεβού σήμερα</div>
                <div className="stat-value">{todayAppointmentsCount}</div>
                <div className="stat-helper">
                  Προγραμματισμένα ραντεβού για τη σημερινή ημερομηνία.
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Επόμενο ραντεβού</div>
                {nextAppointment ? (
                  <>
                    <div className="stat-value">
                      {nextAppointment.Patient
                        ? `${nextAppointment.Patient.firstName} ${nextAppointment.Patient.lastName}`
                        : "—"}
                    </div>
                    <div className="stat-helper">
                      {nextAppointment.dateTime
                        ? new Date(nextAppointment.dateTime).toLocaleString(
                            "el-GR",
                            {
                              dateStyle: "short",
                              timeStyle: "short",
                            }
                          )
                        : "-"}
                    </div>
                  </>
                ) : (
                  <div className="stat-helper">
                    Δεν υπάρχει επόμενο προγραμματισμένο ραντεβού.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Γρήγορες ενέργειες */}
        <div className="card">
          <h2 className="card-title">Γρήγορες ενέργειες</h2>
          <p className="card-subtitle">
            Συχνές λειτουργίες για την καθημερινή διαχείριση.
          </p>

          <div className="quick-actions">
            <Link href="/patients" className="quick-action">
              <div className="quick-action-title">Καταχώρηση νέου ασθενούς</div>
              <div className="quick-action-desc">
                Μετάβαση στη σελίδα ασθενών για δημιουργία νέου φακέλου.
              </div>
            </Link>

            <Link href="/appointments" className="quick-action">
              <div className="quick-action-title">Προγραμματισμός ραντεβού</div>
              <div className="quick-action-desc">
                Δημιουργία νέου ραντεβού και επισκόπηση προγραμματισμένων.
              </div>
            </Link>

            <div className="quick-action quick-action--disabled">
              <div className="quick-action-title">Ημερολόγιο ημέρας</div>
              <div className="quick-action-desc">
                Επισκόπηση ραντεβού ανά ημέρα (υπό ανάπτυξη).
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
