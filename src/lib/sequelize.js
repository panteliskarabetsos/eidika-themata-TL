import { Sequelize } from "sequelize";
import pg from "pg";


const url =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.DATABASE_URL_UNPOOLED;


if (!url) {
  console.warn("WARNING: Database URL missing. Using dummy connection string for build process.");
}


const sequelize =
  globalThis.__sequelize ??
  new Sequelize(
    url || "postgres://dummy:dummy@localhost:5432/dummy", 
    {
      dialect: "postgres",
      dialectModule: pg,
      logging: false,
      pool: {
        max: 3,
        min: 0,
        idle: 10000,
        acquire: 30000,
      },
      dialectOptions: {
        
        ssl: url ? {
          require: true,
          rejectUnauthorized: false,
        } : false,
      },
    }
  );

if (process.env.NODE_ENV !== "production") {
  globalThis.__sequelize = sequelize;
}

export default sequelize;