import sequelize from "./sequelize.js";
// ΠΡΟΣΟΧΗ: Βεβαιώσου ότι έχεις τα .js extensions
import User from "../models/User.js";
import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";

let initialized = false;

export async function initDb() {
  if (initialized) return;

  try {
    // 1. ΟΡΙΣΜΟΣ ΣΧΕΣΕΩΝ (Εδώ είναι το κλειδί για το include)
    Patient.hasMany(Appointment, { foreignKey: "patientId" });
    Appointment.belongsTo(Patient, { foreignKey: "patientId" });

    // 2. Σύνδεση και Συγχρονισμός
    await sequelize.authenticate();
    // Το alter: true ενημερώνει τη βάση χωρίς να χάσεις δεδομένα
    await sequelize.sync({ alter: true });

    initialized = true;
    console.log("✅ Database initialized & Associations set.");
  } catch (error) {
    console.error("❌ Database init failed:", error);
    throw error; // Πετάμε το error για να φανεί στα logs
  }
}