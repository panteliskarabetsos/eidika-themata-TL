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
        role: user.role, // Βεβαιώσου ότι το User model έχει αυτό το πεδίο
      };

      if (!jwtSecret) {
        const err = new Error("JWT_SECRET is not set");
        err.status = 500;
        throw err;
      }

      const token = jwt.sign(payload, jwtSecret, { expiresIn: "1h" });

      return { token, user: payload };
    },

    async register({ username, password, fullName, email }) {
      if (!username || !password || !fullName) {
        const err = new Error("Username, password, and fullName are required");
        err.status = 400;
        throw err;
      }

      if (password.length < 6) {
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
      const newUser = await userRepository.create({
        username,
        passwordHash,
        fullName,
        email: email || null,
        role: "user", 
      });

      return {
        id: newUser.id,
        username: newUser.username,
        fullName: newUser.fullName,
        role: newUser.role,
        email: newUser.email,
      };
    },
  };
}
