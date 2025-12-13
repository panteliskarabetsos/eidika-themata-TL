"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
        console.error("patients fetch failed:", t);
        setError("Αποτυχία φόρτωσης ασθενών");
        setLoading(false);
        return;
      }

      if (!appointmentsRes.ok) {
        const t = await appointmentsRes.text();
        console.error("appointmnets fetch failed:", t);
        setError("Αποτυχία φόρτωσης ραντεβού");
        setLoading(false);
        return;
      }

      const patients = await patientsRes.json();
      const appointmentsData = await appointmentsRes.json();

      setPatientCount(patients.length);
      setLatestPatient(patients[0] || null);
      setAppointments(appointmentsData);
    } catch (err) {
      console.error(err);
      setError("Σφάλμα");
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

  //υπολογισμοί για τα ραντεβού
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
      <header className="top-bar">
        <div className="top-bar-left">
          <h1 className="app-title">Clinic Appointment System</h1>
          <span className="app-subtitle">Πίνακας διαχείρισης</span>
        </div>
      </header>
      <section className="dashboard-grid">
        <div className="card">
          <h2 className="card-title">Επισκόπηση</h2>
          <p className="card-subtitle">
            Επισκόπιση βασικών στατιστικών και πληροφοριών.
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
                  <Link href="/patients" className="link-with-icon">
                    <ArrowRight size={16} className="icon-left" />
                    <span>Προβολή λίστας ασθενών</span>
                  </Link>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Συνολικά ραντεβού</div>
                <div className="stat-value">{totalAppointments}</div>
                <div className="stat-helper">
                  <Link href="/appointments" className="link-with-icon">
                    <ArrowRight size={16} className="icon-left" />
                    <span>Προβολή λίστας ραντεβού</span>
                  </Link>
                </div>
              </div>

              <div className="stat-card stat-card--muted">
                <div className="stat-label">Ραντεβού σήμερα</div>
                <div className="stat-value">{todayAppointmentsCount}</div>
                <div className="stat-helper">
                  Προγραμματισμένα ραντεβού για σήμερα.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="card-title">Γρήγορες ενέργειες</h2>
          <p className="card-subtitle">Εργαλεία για γρήγορη πλοήγηση.</p>

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

            <Link href="/admins" className="quick-action">
              <div className="quick-action-title">Προσθήκη Διαχειριστή</div>
              <div className="quick-action-desc">
                Προβολή λίστας διαχειριστών και δημιουργία νέου.
              </div>
            </Link>
            <Link href="/docs/report.pdf" className="quick-action">
              <div className="quick-action-title">Προβολή αναφοράς (PDF)</div>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
