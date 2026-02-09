import sequelize from "../src/lib/sequelize.js";
import User from "../src/models/User.js";
import Patient from "../src/models/Patient.js";
import Appointment from "../src/models/Appointment.js";
import bcrypt from "bcryptjs";

async function seed() {
  try {
    console.log("🌱 Starting database seed...");

 
   await sequelize.sync({ force: true });
    console.log("✅ Connected to database.");

    await sequelize.sync({ alter: true });
    console.log("✅ Database synced.");

    const existingAdmin = await User.findOne({ where: { username: "admin" } });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("123456", 10);
      
      await User.create({
        username: "admin",
        passwordHash: hashedPassword,
        fullName: "System Administrator",
        email: "admin@clinic.com",
        role: "admin",
        isActive: true
      });
      console.log("✅ Admin user created successfully!");
      console.log("👉 Username: admin");
      console.log("👉 Password: 123456");
    } else {
      console.log("ℹ️ Admin user already exists. Skipping creation.");
    }

    console.log("🚀 Seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();