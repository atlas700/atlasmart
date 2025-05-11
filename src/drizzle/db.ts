// import { drizzle } from "drizzle-orm/node-postgres";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// export const db = drizzle({
//   schema,
//   connection: {
//     password: process.env.DB_PASSWORD,
//     user: process.env.DB_USER,
//     database: process.env.DB_NAME,
//     host: process.env.DB_HOST,
//   },
// });

import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql, schema });
