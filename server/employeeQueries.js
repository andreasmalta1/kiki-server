import { pool } from "./pool.js"
import { getTimeStampWithTimeZone } from "./utils.js"

const getEmployees = (request, response) => {
  pool.query(
    "SELECT * FROM employees ORDER BY employee_id ASC",
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    }
  )
}

const getEmployeeById = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query(
    "SELECT * FROM employees WHERE id = $1",
    [id],
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    }
  )
}

const createEmployee = (request, response) => {
  const { employeeId, name, active } = request.body

  const createdAt = getTimeStampWithTimeZone()
  const updatedAt = getTimeStampWithTimeZone()

  pool.query(
    "INSERT INTO employees (employee_id, name, active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [employeeId, name.trim(), active, createdAt, updatedAt],
    (error, results) => {
      if (error) {
        return response.status(401).send(error)
      }
      response.status(201).send(`Employee added with ID: ${results.rows[0].id}`)
    }
  )
}

const updateEmployee = (request, response) => {
  const id = parseInt(request.params.id)
  const { employeeId, name, active } = request.body

  pool.query(
    "UPDATE employees SET employee_id = $1, name = $2, active = $3 WHERE id = $4",
    [employeeId, name, active, id],
    (error, results) => {
      if (error) {
        return response.status(401).send(error)
      }
      response.status(200).send(`Employee modified with ID: ${id}`)
    }
  )
}

const deleteEmployee = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query("DELETE FROM employees WHERE id = $1", [id], (error, results) => {
    if (error) {
      return response.status(401).send(error)
    }
    response.status(200).send(`Employee deleted with ID: ${id}`)
  })
}

export {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
}
