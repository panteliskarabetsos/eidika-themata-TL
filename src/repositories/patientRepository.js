export function createPatientRepository({ Patient }) {
  return {
    findAll() {
      return Patient.findAll({ order: [["createdAt", "DESC"]] });
    },

    findById(id) {
      return Patient.findByPk(id);
    },

    create(data) {
      return Patient.create(data);
    },

    async update(id, data) {
      const p = await Patient.findByPk(id);
      if (!p) return null;
      await p.update(data);
      return p;
    },

    async remove(id) {
      const p = await Patient.findByPk(id);
      if (!p) return false;
      await p.destroy();
      return true;
    },
  };
}
