import { Sequelize } from "sequelize";
import pg from "pg";
const url =
  process.env.DATABASE_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL;

if (!url) {
  throw new Error("Missing enviromental variable.");
}

const sequelize =
  globalThis.__sequelize ??
  new Sequelize(url, {
    dialect: "postgres",
    logging: false,
    pool: {
      max: 3,
      min: 0,
      idle: 10000,
      acquire: 30000,
    },
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
  });

if (!globalThis.__sequelize) {
  globalThis.__sequelize = sequelize;
}

export default sequelize;
