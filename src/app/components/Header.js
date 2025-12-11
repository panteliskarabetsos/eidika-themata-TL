// src/components/Header.js
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUserName(parsed.fullName || parsed.username || "");
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    router.push("/login");
  }

  const isActive = (href) =>
    pathname === href || pathname.startsWith(href + "/");

  const initials =
    userName
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "AD";

  return (
    <header className="top-bar">
      <div className="top-bar-inner">
        {/* Brand + title (left) */}
        <div className="top-bar-left">
          <button
            type="button"
            className="brand-mark"
            onClick={() => router.push("/appointments")}
            aria-label="Δημιουργία νέου ραντεβού"
          >
            <span className="brand-cross">+</span>
          </button>

          <div className="app-title-wrap">
            <div className="app-title-row">
              <h1 className="app-title">Clinic Admin</h1>
              <span className="app-title-pill">Appointment System</span>
            </div>
            <span className="app-subtitle">Πίνακας διαχείρισης ιατρείου</span>
          </div>
        </div>

        {/* Centered navigation */}
        <nav className="top-nav">
          <Link
            href="/dashboard"
            className={
              "top-nav-link" +
              (isActive("/dashboard") ? " top-nav-link--active" : "")
            }
          >
            Dashboard
          </Link>
          <Link
            href="/patients"
            className={
              "top-nav-link" +
              (isActive("/patients") ? " top-nav-link--active" : "")
            }
          >
            Ασθενείς
          </Link>
          <Link
            href="/appointments"
            className={
              "top-nav-link" +
              (isActive("/appointments") ? " top-nav-link--active" : "")
            }
          >
            Ραντεβού
          </Link>
        </nav>

        {/* User block (right) */}
        <div className="header-user">
          <div className="header-user-avatar">{initials}</div>
          <div className="header-user-info">
            <div className="header-user-name">{userName || "Χρήστης"}</div>
            <div className="header-user-role">Διαχειριστής</div>
          </div>
          <button
            className="btn-outline header-logout"
            type="button"
            onClick={handleLogout}
          >
            Αποσύνδεση
          </button>
        </div>
      </div>
    </header>
  );
}
