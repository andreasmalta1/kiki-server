import { pool } from "./pool.js"
import { getTimeStampWithTimeZone } from "./utils.js"
import { types } from "pg"
types.setTypeParser(1082, (val) => val)

const getDockets = async (request, response) => {
  const employeeId = request.query.employeeId
  const fromDate = request.query.fromDate
  const toDate = request.query.toDate
  const equipment = request.query.equipment
  const description = request.query.description

  if (!equipment && !description) {
    let conditions = []
    let values = []

    if (employeeId) {
      values.push(employeeId)
      conditions.push(`dockets.employee_id = $${values.length}`)
    }
    if (fromDate && toDate) {
      values.push(fromDate)
      conditions.push(`dockets.date >= $${values.length}`)
      values.push(toDate)
      conditions.push(`dockets.date <= $${values.length}`)
    }

    const whereClause = "WHERE " + conditions.join(" AND ")
    const query = `SELECT dockets.id AS id, employees.name AS name, employees.id AS employee_id, dockets.date AS date FROM dockets JOIN employees ON dockets.employee_id = employees.id  ${whereClause} ORDER BY date DESC`

    try {
      const docketResults = await pool.query(query, values)

      await Promise.all(
        docketResults.rows.map(async (row) => {
          let docketId = row.id
          let worksResult = await pool.query(
            "SELECT * FROM works WHERE docket_id = $1",
            [docketId]
          )
          row.works = worksResult.rows
        })
      )

      return response.status(200).json(docketResults.rows)
    } catch (error) {
      return response.status(401).send(error)
    }
  }

  if (equipment || description) {
    let worksConditions = []
    let worksValues = []

    let docketsConditions = []
    let docketsValues = []

    if (equipment) {
      worksValues.push(`%${equipment}%`)
      worksConditions.push(`equipment ILIKE $${worksValues.length}`)
    }

    if (description) {
      worksValues.push(`%${description}%`)
      worksConditions.push(`description ILIKE $${worksValues.length}`)
    }

    if (employeeId) {
      docketsValues.push(employeeId)
      docketsConditions.push(`dockets.employee_id = $${docketsValues.length}`)
    }
    if (fromDate && toDate) {
      docketsValues.push(fromDate)
      docketsConditions.push(`dockets.date >= $${docketsValues.length}`)
      docketsValues.push(toDate)
      docketsConditions.push(`dockets.date <= $${docketsValues.length}`)
    }

    const worksClause = "WHERE " + worksConditions.join(" AND ")
    const worksQuery = `SELECT * FROM works ${worksClause}`

    const queryResults = []

    try {
      const worksResults = await pool.query(worksQuery, worksValues)

      const docketIds = []
      worksResults.rows.map((row) => {
        docketIds.push(row.docket_id)
      })
      const uniqueDocketIds = [...new Set(docketIds)]

      await Promise.all(
        uniqueDocketIds.map(async (id) => {
          const localDocketsValues = [...docketsValues, id]
          const localDocketsConditions = [
            ...docketsConditions,
            `dockets.id = $${localDocketsValues.length}`,
          ]

          const docketsClause = "WHERE " + localDocketsConditions.join(" AND ")
          const docketsQuery = `SELECT dockets.id AS id, employees.name AS name, employees.id AS employee_id, dockets.date AS date FROM dockets JOIN employees ON dockets.employee_id = employees.id ${docketsClause} ORDER BY date DESC`

          let docketsResult = await pool.query(docketsQuery, localDocketsValues)

          if (docketsResult.rows[0]) {
            docketsResult.rows[0].works = worksResults.rows.filter(
              (row) => row.docket_id == id
            )
            queryResults.push(docketsResult.rows[0])
          }
        })
      )

      return response
        .status(200)
        .json(queryResults.sort((a, b) => new Date(b.date) - new Date(a.date)))
    } catch (error) {
      return response.status(401).send(error)
    }
  }
}

const createDocket = async (request, response) => {
  const { employeeId, date, worksForm } = request.body

  const createdAt = getTimeStampWithTimeZone()
  const updatedAt = getTimeStampWithTimeZone()

  try {
    const results = await pool.query(
      "INSERT INTO dockets (employee_id, date, created_at, updated_at) VALUES ($1, $2, $3, $4) RETURNING *",
      [employeeId, date, createdAt, updatedAt]
    )

    const docketId = results.rows[0].id

    worksForm.map(async (form) => {
      await pool.query(
        "INSERT INTO works (docket_id, hours, equipment, description) VALUES ($1, $2, $3, $4) RETURNING *",
        [docketId, form.hours, form.equipment, form.description]
      )
    })

    return response
      .status(201)
      .send(`Docket added with ID: ${results.rows[0].id}`)
  } catch (error) {
    return response.status(401).send(error)
  }
}

const updateDocket = async (request, response) => {
  const docketId = parseInt(request.params.id)
  const { employeeId, date, worksForm } = request.body
  const updatedAt = getTimeStampWithTimeZone()

  try {
    await pool.query(
      "UPDATE dockets SET employee_id = $1, date = $2, updated_at = $3 WHERE id = $4",
      [employeeId, date, updatedAt, docketId]
    )

    const result = await pool.query(
      "SELECT id FROM works WHERE docket_id = $1",
      [docketId]
    )

    const existingIds = result.rows.map((row) => row.id)

    worksForm.map(async (work) => {
      if (!work.id || !existingIds.includes(work.id)) {
        await pool.query(
          `INSERT INTO works (docket_id, hours, equipment, description, reviewed)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            docketId,
            work.hours,
            work.equipment,
            work.description,
            work.reviewed,
          ]
        )
      } else {
        await pool.query(
          `UPDATE works
           SET hours = $1, equipment = $2, description = $3, reviewed = $4
           WHERE id = $5 AND docket_id = $6`,
          [
            work.hours,
            work.equipment,
            work.description,
            work.reviewed,
            work.id,
            docketId,
          ]
        )
      }
    })
    return response.status(200).send(`Docket modified with ID: ${docketId}`)
  } catch (error) {
    return response.status(401).send(error)
  }
}

const deleteDocket = async (request, response) => {
  const id = parseInt(request.params.id)

  try {
    await pool.query("DELETE FROM works where docket_id = $1", [id])

    await pool.query("DELETE FROM dockets where id = $1", [id])
    return response.status(200).send(`Docket & works deleted with ID: ${id}`)
  } catch (error) {
    return response.status(401).send(error)
  }
}

const deleteWork = async (request, response) => {
  const id = parseInt(request.params.id)

  try {
    await pool.query("DELETE FROM works where id = $1", [id])
    return response.status(200).send(`Work deleted with ID: ${id}`)
  } catch (error) {
    return response.status(401).send(error)
  }
}

export { getDockets, createDocket, updateDocket, deleteDocket, deleteWork }
