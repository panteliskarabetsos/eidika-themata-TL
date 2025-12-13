export function createAppointmentRepository({ Appointment, Patient }) {
  const patientInclude = [
    {
      model: Patient,
      attributes: ["id", "firstName", "lastName", "phone"],
    },
  ];

  return {
    findAllWithPatient() {
      return Appointment.findAll({
        order: [["dateTime", "ASC"]],
        include: patientInclude,
      });
    },

    findById(id) {
      return Appointment.findByPk(id);
    },

    async findByIdWithPatient(id) {
      const appt = await Appointment.findByPk(id);
      if (!appt) return null;
      await appt.reload({ include: patientInclude });
      return appt;
    },

    create(data) {
      return Appointment.create(data);
    },

    async update(id, changes) {
      const appt = await Appointment.findByPk(id);
      if (!appt) return null;
      Object.assign(appt, changes);
      await appt.save();
      return appt;
    },

    async remove(id) {
      const appt = await Appointment.findByPk(id);
      if (!appt) return false;
      await appt.destroy();
      return true;
    },
  };
}
