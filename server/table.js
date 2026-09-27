import { pool } from "./pool.js"

const createEmployeeTable = async () => {
  pool.query(
    "CREATE TABLE IF NOT EXISTS employees (id SERIAL NOT NULL, employee_id INTEGER NOT NULL, name VARCHAR(100) NOT NULL, active BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE, PRIMARY KEY (id))",
    (error, results) => {
      if (error) {
        return error
      }
      return results
    },
  )
}

const createDocketTable = async () => {
  pool.query(
    "CREATE TABLE IF NOT EXISTS dockets (id SERIAL NOT NULL, employee_id INTEGER REFERENCES employees, date DATE, created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE, PRIMARY KEY (id))",
    (error, results) => {
      if (error) {
        return error
      }
    },
  )
}

const createWorksTable = async () => {
  pool.query(
    "CREATE TABLE IF NOT EXISTS works (id SERIAL NOT NULL, docket_id INTEGER REFERENCES dockets, hours REAL, equipment VARCHAR (50), description TEXT, reviewed BOOLEAN default false, PRIMARY KEY (id))",
    (error, results) => {
      if (error) {
        return error
      }
    },
  )
}

const createWorkOrdersTable = async () => {
  pool.query(
    `CREATE TABLE IF NOT EXISTS work_orders (
      work_order_no    VARCHAR(50) PRIMARY KEY,
      equipment        VARCHAR(100),
      date_start       DATE,
      date_finish      DATE,
      description      TEXT,
      status           VARCHAR(50),
      paperwork_status VARCHAR(50),
      cost             NUMERIC(10,2),
      po_number        VARCHAR(50),
      invoice_number   VARCHAR(50),
      works            TEXT,
      service_repairs  TEXT,
      requested_by     VARCHAR(100)
    )`,
    (error) => {
      if (error) return error
    },
  )
}

const createMkItemsTable = async () => {
  pool.query(
    `CREATE TABLE IF NOT EXISTS mk_items (
      id               VARCHAR(50) PRIMARY KEY,
      description      VARCHAR(1000),
      long_description VARCHAR(2000),
      order_unit       VARCHAR(20),
      cost             NUMERIC(10,2),
      type             VARCHAR(20)
    )`,
    (error) => {
      if (error) return error
    },
  )
}

export {
  createEmployeeTable,
  createDocketTable,
  createWorksTable,
  createWorkOrdersTable,
  createMkItemsTable,
}
