export function createPatientService({ patientRepository }) {
  return {
    listPatients() {
      return patientRepository.findAll();
    },

    async createPatient(body) {
      const { firstName, lastName, phone, email, dateOfBirth, notes } =
        body || {};

      if (!firstName || !lastName) {
        const err = new Error("Missing required fields");
        err.status = 400;
        throw err;
      }

      return patientRepository.create({
        firstName,
        lastName,
        phone,
        email,
        dateOfBirth: dateOfBirth || null,
        notes,
      });
    },

    async updatePatient(id, body) {
      const { firstName, lastName, phone, email, dateOfBirth, notes } =
        body || {};

      if (!firstName || !lastName) {
        const err = new Error("Missing required fields");
        err.status = 400;
        throw err;
      }

      const updated = await patientRepository.update(id, {
        firstName,
        lastName,
        phone,
        email,
        dateOfBirth: dateOfBirth || null,
        notes,
      });

      if (!updated) {
        const err = new Error("Patient not found");
        err.status = 404;
        throw err;
      }

      return updated;
    },

    async deletePatient(id) {
      const ok = await patientRepository.remove(id);
      if (!ok) {
        const err = new Error("Patient not found");
        err.status = 404;
        throw err;
      }
      return true;
    },
  };
}
