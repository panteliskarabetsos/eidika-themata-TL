export function createAppointmentService({ appointmentRepository }) {
  const allowedStatuses = new Set(["scheduled", "completed", "cancelled"]);

  return {
    listAppointments() {
      return appointmentRepository.findAllWithPatient();
    },

    async createAppointment(body) {
      const { patientId, dateTime, durationMinutes, reason } = body || {};

      if (!patientId || !dateTime) {
        const err = new Error("Missing required fields");
        err.status = 400;
        throw err;
      }

      const dt = new Date(dateTime);
      if (Number.isNaN(dt.getTime())) {
        const err = new Error("Invalid dateTime");
        err.status = 400;
        throw err;
      }

      const created = await appointmentRepository.create({
        patientId,
        dateTime: dt,
        durationMinutes: durationMinutes || 30,
        reason: reason || null,
        status: "scheduled",
      });

      const reloaded = await appointmentRepository.findByIdWithPatient(
        created.id
      );
      return reloaded || created;
    },

    async updateAppointment(id, body) {
      const { dateTime, durationMinutes, status, reason } = body || {};

      const changes = {};

      if (dateTime) {
        const dt = new Date(dateTime);
        if (Number.isNaN(dt.getTime())) {
          const err = new Error("Invalid dateTime");
          err.status = 400;
          throw err;
        }
        changes.dateTime = dt;
      }

      if (durationMinutes != null) {
        const dur = Number(durationMinutes);
        if (Number.isNaN(dur) || dur <= 0) {
          const err = new Error("Invalid durationMinutes");
          err.status = 400;
          throw err;
        }
        changes.durationMinutes = dur;
      }

      if (status) {
        if (!allowedStatuses.has(status)) {
          const err = new Error("Invalid status");
          err.status = 400;
          throw err;
        }
        changes.status = status;
      }

      if (reason !== undefined) {
        changes.reason = reason;
      }

      const updated = await appointmentRepository.update(id, changes);
      if (!updated) {
        const err = new Error("Appointment not found");
        err.status = 404;
        throw err;
      }

      const reloaded = await appointmentRepository.findByIdWithPatient(id);
      return reloaded || updated;
    },

    async deleteAppointment(id) {
      const ok = await appointmentRepository.remove(id);
      if (!ok) {
        const err = new Error("Appointment not found");
        err.status = 404;
        throw err;
      }
      return true;
    },
  };
}
