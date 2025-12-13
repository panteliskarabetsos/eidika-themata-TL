export function createUserRepository({ User }) {
  return {
    findByUsername(username) {
      return User.findOne({ where: { username } });
    },

    findById(id) {
      return User.findByPk(id);
    },

    findAll() {
      return User.findAll({ order: [["createdAt", "DESC"]] });
    },

    create(data) {
      return User.create(data);
    },

    async update(id, data) {
      const u = await User.findByPk(id);
      if (!u) return null;
      await u.update(data);
      return u;
    },

    async remove(id) {
      const u = await User.findByPk(id);
      if (!u) return false;
      await u.destroy();
      return true;
    },
  };
}
