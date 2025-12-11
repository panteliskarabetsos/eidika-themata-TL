// src/app/layout.js
import "./globals.css";
import Footer from "./components/Footer";
import Header from "./components/Header";

export const metadata = {
  title: "Clinic App",
  description: "Appointment management for clinic",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
