export function createAdminService({ userRepository, bcrypt }) {
  function sanitize(user) {
    const u = user.toJSON ? user.toJSON() : user;

    // eslint-disable-next-line no-unused-vars
    const { passwordHash, ...safe } = u;
    return safe;
  }

  return {
    async listAdmins() {
      const users = await userRepository.findAll();
      return users.map(sanitize);
    },

    async createAdmin(body) {
      const { username, password, fullName } = body || {};

      if (!username || !password) {
        const err = new Error("Missing required fields");
        err.status = 400;
        throw err;
      }

      if (String(password).length < 6) {
        const err = new Error("Password must be at least 6 characters");
        err.status = 400;
        throw err;
      }

      const existing = await userRepository.findByUsername(username);
      if (existing) {
        const err = new Error("Username already exists");
        err.status = 409;
        throw err;
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const created = await userRepository.create({
        username,
        fullName: fullName || null,
        passwordHash,
      });

      return sanitize(created);
    },

    async updateAdmin(id, body, currentUserId) {
      if (!id) {
        const err = new Error("Invalid admin id");
        err.status = 400;
        throw err;
      }

      const existing = await userRepository.findById(id);
      if (!existing) {
        const err = new Error("Admin not found");
        err.status = 404;
        throw err;
      }

      const { username, fullName, password } = body || {};

      if (!username) {
        const err = new Error("Username is required");
        err.status = 400;
        throw err;
      }

      if (username !== existing.username) {
        const taken = await userRepository.findByUsername(username);
        if (taken) {
          const err = new Error("Username already exists");
          err.status = 409;
          throw err;
        }
      }

      const updateData = {
        username,
        fullName: fullName || null,
      };

      if (password && String(password).trim().length > 0) {
        if (String(password).length < 6) {
          const err = new Error("Password must be at least 6 characters");
          err.status = 400;
          throw err;
        }
        updateData.passwordHash = await bcrypt.hash(password, 10);
      }

      const updated = await userRepository.update(id, updateData);
      return sanitize(updated);
    },

    async deleteAdmin(id, currentUserId) {
      if (!id) {
        const err = new Error("Invalid admin id");
        err.status = 400;
        throw err;
      }

      //αποφυγή αυτοδιαγραφής
      if (Number(id) === Number(currentUserId)) {
        const err = new Error("You cannot delete your own account");
        err.status = 400;
        throw err;
      }

      const ok = await userRepository.remove(id);
      if (!ok) {
        const err = new Error("Admin not found");
        err.status = 404;
        throw err;
      }

      return true;
    },
  };
}
