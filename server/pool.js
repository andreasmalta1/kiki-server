import { Pool } from "pg"

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "kiki-app-db",
  password: "Audje_slcrls1",
  port: 5432,
})

export { pool }
