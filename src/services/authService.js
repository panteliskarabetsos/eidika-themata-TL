export function createAuthService({ userRepository, bcrypt, jwt, jwtSecret }) {
  return {
    async login({ username, password }) {
      if (!username || !password) {
        const err = new Error("Missing credentials");
        err.status = 400;
        throw err;
      }

      const user = await userRepository.findByUsername(username);

      if (!user) {
        const err = new Error("Invalid username or password");
        err.status = 401;
        throw err;
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);

      if (!isValid) {
        const err = new Error("Invalid username or password");
        err.status = 401;
        throw err;
      }

      const payload = {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      };

      if (!jwtSecret) {
        const err = new Error("JWT_SECRET is not set");
        err.status = 500;
        throw err;
      }

      const token = jwt.sign(payload, jwtSecret, { expiresIn: "1h" });

      return { token, user: payload };
    },
  };
}
