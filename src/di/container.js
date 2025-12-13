import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";

import { createPatientRepository } from "../repositories/patientRepository.js";
import { createPatientService } from "../services/patientService.js";

import { createAppointmentRepository } from "../repositories/appointmentRepository.js";
import { createAppointmentService } from "../services/appointmentService.js";

import { createUserRepository } from "../repositories/userRepository.js";
import { createAuthService } from "../services/authService.js";
import { createAdminService } from "../services/adminService.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export function createContainer() {
  const patientRepository = createPatientRepository({ Patient });
  const patientService = createPatientService({ patientRepository });

  const appointmentRepository = createAppointmentRepository({
    Appointment,
    Patient,
  });
  const appointmentService = createAppointmentService({
    appointmentRepository,
  });

  const userRepository = createUserRepository({ User });

  const authService = createAuthService({
    userRepository,
    bcrypt,
    jwt,
    jwtSecret: process.env.JWT_SECRET,
  });

  const adminService = createAdminService({ userRepository, bcrypt });

  return {
    patientService,
    appointmentService,
    authService,
    adminService,
  };
}
