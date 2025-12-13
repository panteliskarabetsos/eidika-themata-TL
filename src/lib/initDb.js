import sequelize from "@/lib/sequelize";
import User from "@/models/User";
import Patient from "@/models/Patient";
import Appointment from "@/models/Appointment";

let isInitialized = false;

export async function initDb() {
  if (isInitialized) return;

  try {
    await sequelize.authenticate();
    console.log("Connected to database.");

    //σχέσεις
    Patient.hasMany(Appointment, {
      foreignKey: "patientId",
      onDelete: "CASCADE",
    });

    Appointment.belongsTo(Patient, {
      foreignKey: "patientId",
    });

    await sequelize.sync();
    console.log("Models synchronized.");

    isInitialized = true;
  } catch (err) {
    console.error("Unable to connect to the database:", err);
    throw err;
  }
}
