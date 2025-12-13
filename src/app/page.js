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
          Σύστημα διαχείρισης αρχείου για ιατρείο, με λίστα ασθενών, ραντεβού
          και διαχειριστές.
        </p>

        <div className="landing-actions">
          <Link href="/login" className="btn-primary">
            Μετάβαση στη σελίδα σύνδεσης
          </Link>

          <Link
            href="/dashboard"
            className="btn-outline landing-secondary-link"
          >
            Είμαι ήδη συνδεδεμένος
          </Link>
        </div>

        <p className="landing-footnote">
          Πρόσβαση μόνο για εξουσιοδοτημένους χρήστες του ιατρείου.
        </p>
      </div>
    </main>
  );
}
