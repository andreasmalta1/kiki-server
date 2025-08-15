import { pool } from "./pool.js"

const createEmployeeTable = async () => {
  pool.query(
    "CREATE TABLE IF NOT EXISTS employees (id SERIAL NOT NULL, employee_id INTEGER NOT NULL, name VARCHAR(100) NOT NULL, active BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE, PRIMARY KEY (id))",
    (error, results) => {
      if (error) {
        return error
      }
      return results
    }
  )
}

const createDocketTable = async () => {
  pool.query(
    "CREATE TABLE IF NOT EXISTS dockets (id SERIAL NOT NULL, employee_id INTEGER REFERENCES employees, date DATE, created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE, PRIMARY KEY (id))",
    (error, results) => {
      if (error) {
        return error
      }
    }
  )
}

const createWorksTable = async () => {
  pool.query(
    "CREATE TABLE IF NOT EXISTS works (id SERIAL NOT NULL, docket_id INTEGER REFERENCES dockets, hours REAL, equipment VARCHAR (50), description TEXT, reviewed BOOLEAN default false, PRIMARY KEY (id))",
    (error, results) => {
      if (error) {
        return error
      }
    }
  )
}

export { createEmployeeTable, createDocketTable, createWorksTable }
