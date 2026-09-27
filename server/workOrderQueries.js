import { pool } from "./pool.js"
import { getTimeStampWithTimeZone } from "./utils.js"

const getWorkOrders = async (request, response) => {
  try {
    const result = await pool.query("SELECT * FROM work_orders LIMIT 10")
    return response.status(200).json(result.rows)
  } catch (error) {
    return response.status(401).send(error)
  }
}

const createWorkOrder = async (request, response) => {
  const {
    work_order_no,
    equipment,
    date_start,
    date_finish,
    description,
    status,
    paperwork_status,
    cost,
    po_number,
    invoice_number,
    works,
    service_repairs,
    requested_by,
  } = request.body

  try {
    const result = await pool.query(
      `INSERT INTO work_orders
        (work_order_no, equipment, date_start, date_finish, description, status,
         paperwork_status, cost, po_number, invoice_number, works, service_repairs, requested_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        work_order_no,
        equipment,
        date_start || null,
        date_finish || null,
        description,
        status,
        paperwork_status,
        cost || null,
        po_number,
        invoice_number,
        works,
        service_repairs,
        requested_by,
      ],
    )
    return response.status(201).json(result.rows[0])
  } catch (error) {
    return response.status(401).send(error)
  }
}

const updateWorkOrder = async (request, response) => {
  const id = parseInt(request.params.id)
  const {
    work_order_no,
    equipment,
    date_start,
    date_finish,
    description,
    status,
    paperwork_status,
    cost,
    po_number,
    invoice_number,
    works,
    service_repairs,
    requested_by,
  } = request.body

  try {
    await pool.query(
      `UPDATE work_orders SET
        work_order_no=$1, equipment=$2, date_start=$3, date_finish=$4, description=$5,
        status=$6, paperwork_status=$7, cost=$8, po_number=$9, invoice_number=$10,
        works=$11, service_repairs=$12, requested_by=$13
       WHERE id=$14`,
      [
        work_order_no,
        equipment,
        date_start || null,
        date_finish || null,
        description,
        status,
        paperwork_status,
        cost || null,
        po_number,
        invoice_number,
        works,
        service_repairs,
        requested_by,
        id,
      ],
    )
    return response.status(200).send(`Work order updated with ID: ${id}`)
  } catch (error) {
    return response.status(401).send(error)
  }
}

const deleteWorkOrder = async (request, response) => {
  const id = parseInt(request.params.id)
  try {
    await pool.query("DELETE FROM work_orders WHERE id=$1", [id])
    return response.status(200).send(`Work order deleted with ID: ${id}`)
  } catch (error) {
    return response.status(401).send(error)
  }
}

export { getWorkOrders, createWorkOrder, updateWorkOrder, deleteWorkOrder }
