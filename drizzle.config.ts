import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// export default defineConfig({
//   out: "./src/drizzle/migration",
//   schema: "./src/drizzle/schema.ts",
//   dialect: "postgresql",
//   verbose: true,
//   strict: true,
//   dbCredentials: {
//     password: process.env.DB_PASSWORD!,
//     user: process.env.DB_USER!,
//     database: process.env.DB_NAME!,
//     host: process.env.DB_HOST!,
//     ssl: false,
//   },
// });

export default defineConfig({
  out: "./src/drizzle/migration",
  schema: "./src/drizzle/schema.ts",
  dialect: "postgresql",
  verbose: true,
  strict: true,
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
