// src/app/page.js
"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  // Αν υπάρχει token, στέλνουμε κατευθείαν στο dashboard
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <main className="landing-root">
      <div className="landing-card">
        <h1 className="landing-title">Clinic Appointment System</h1>

        <p className="landing-subtitle">
          Μικρό σύστημα διαχείρισης ραντεβού για ιατρείο, με ασθενείς, ραντεβού
          και dashboard για τον γιατρό ή τη γραμματεία.
        </p>

        <div className="landing-actions">
          <Link href="/login" className="btn-primary">
            Μετάβαση στη σελίδα σύνδεσης
          </Link>

          <Link
            href="/dashboard"
            className="btn-outline landing-secondary-link"
          >
            Είμαι ήδη συνδεδεμένος →
          </Link>
        </div>

        <p className="landing-footnote">
          Πρόσβαση μόνο για εξουσιοδοτημένους χρήστες του ιατρείου.
        </p>
      </div>
    </main>
  );
}
