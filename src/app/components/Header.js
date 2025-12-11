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
      // ignore
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
          <div className="app-title-wrap">
            <div className="app-title-row">
              <h1 className="app-title">Πίνακας διαχείρισης ιατρείου</h1>
            </div>
          </div>
        </div>

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
