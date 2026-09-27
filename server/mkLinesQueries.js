import { pool } from "./pool.js"
import { getTimeStampWithTimeZone } from "./utils.js"
import camelcaseKeys from "camelcase-keys"

const getMkLines = async (request, response) => {
  try {
    const result = await pool.query("SELECT * FROM mk_items")
    const mkLines = camelcaseKeys(result.rows)
    return response.status(200).json(mkLines)
  } catch (error) {
    return response.status(401).send(error)
  }
}

const createMkLine = async (request, response) => {
  const { id, description, longDescription, orderUnit, cost, type } =
    request.body

  try {
    const result = await pool.query(
      `INSERT INTO mk_items
        (id, description, long_description, order_unit, cost, type)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [id, description, longDescription, orderUnit, cost, type],
    )
    return response.status(201).json(result.rows[0])
  } catch (error) {
    return response.status(401).send(error)
  }
}

const updateMkLine = async (request, response) => {
  const { id, description, longDescription, orderUnit, cost, type } =
    request.body

  try {
    await pool.query(
      `UPDATE mk_items SET
        id=$1, description=$2, long_description=$3, order_unit=$4, cost=$5, type=$6 
       WHERE id=$1`,
      [id, description, longDescription, orderUnit, cost, type],
    )
    return response.status(200).send(`Mk Line updated with ID: ${id}`)
  } catch (error) {
    return response.status(401).send(error)
  }
}

const updateMkLinePrice = async (request, response) => {
  const { id, factor, filter } = request.body

  try {
    if (filter == "ALL") {
      await pool.query(
        `UPDATE mk_items
        SET cost=cost * $1 
        WHERE true`,
        [factor],
      )
    } else {
      await pool.query(
        `UPDATE mk_items
        SET cost=cost * $1 
        WHERE order_unit=$2`,
        [factor, filter],
      )
    }

    return response.status(200).send(`Mk Line updated with ID: ${id}`)
  } catch (error) {
    return response.status(401).send(error)
  }
}

const deleteMkLine = async (request, response) => {
  const id = request.params.id
  try {
    await pool.query("DELETE FROM mk_items WHERE id=$1", [id])
    return response.status(200).send(`Mk Line deleted with ID: ${id}`)
  } catch (error) {
    return response.status(401).send(error)
  }
}

export {
  getMkLines,
  createMkLine,
  updateMkLine,
  updateMkLinePrice,
  deleteMkLine,
}
