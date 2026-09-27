import { pool } from "./pool.js"
import { getTimeStampWithTimeZone } from "./utils.js"
import camelcaseKeys from "camelcase-keys"

const getEmployees = async (request, response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM employees ORDER BY employee_id ASC",
    )

    const employees = camelcaseKeys(result.rows, { deep: true })
    return response.status(200).json(employees)
  } catch (error) {
    return response.status(401).send(error)
  }
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
      response.status(200).json(camelcaseKeys(results.rows))
    },
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
    },
  )
}

const updateEmployee = (request, response) => {
  const id = parseInt(request.params.id)
  const { employeeId, name, active } = request.body

  const updatedAt = getTimeStampWithTimeZone()

  pool.query(
    "UPDATE employees SET employee_id = $1, name = $2, active = $3, updated_at = $4 WHERE id = $5",
    [employeeId, name, active, updatedAt, id],
    (error, results) => {
      if (error) {
        return response.status(401).send(error)
      }
      response.status(200).send(`Employee modified with ID: ${id}`)
    },
  )
}

export { getEmployees, getEmployeeById, createEmployee, updateEmployee }
