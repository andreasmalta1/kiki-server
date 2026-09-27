import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import "dotenv/config"
import {
  createEmployeeTable,
  createDocketTable,
  createWorksTable,
  createWorkOrdersTable,
  createMkItemsTable,
} from "./table.js"
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
} from "./employeeQueries.js"
import {
  getDockets,
  createDocket,
  updateDocket,
  deleteDocket,
  deleteWork,
} from "./docketQueries.js"
import {
  getWorkOrders,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
} from "./workOrderQueries.js"

import {
  getMkLines,
  createMkLine,
  updateMkLine,
  updateMkLinePrice,
  deleteMkLine,
} from "./mkLinesQueries.js"

const app = express()
const PORT = process.env.PORT

app.use(express.json())
app.use(cors())
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
)

app.get("/api/employees", getEmployees)
app.get("/api/employees/:id", getEmployeeById)
app.post("/api/employees", createEmployee)
app.put("/api/employees/:id", updateEmployee)

app.get("/api/dockets", getDockets)
app.post("/api/dockets", createDocket)
app.put("/api/dockets/:id", updateDocket)
app.delete("/api/dockets/:id", deleteDocket)
app.delete("/api/works/:id", deleteWork)

app.get("/api/work-orders", getWorkOrders)
app.post("/api/work-orders", createWorkOrder)
app.put("/api/work-orders/:id", updateWorkOrder)
app.delete("/api/work-orders/:id", deleteWorkOrder)

app.get("/api/mk-lines", getMkLines)
app.post("/api/mk-lines", createMkLine)
app.put("/api/mk-lines/:id", updateMkLine)
app.put("/api/mk-lines-price", updateMkLinePrice)
app.delete("/api/mk-lines/:id", deleteMkLine)

app.get("/health", (_, res) => {
  res.status(200).json({ status: "ok" })
})

async function createTables() {
  await createEmployeeTable()
  await createDocketTable()
  await createWorksTable()
  await createWorkOrdersTable()
  await createMkItemsTable()
}

function startServer() {
  app.listen(PORT, () => {
    console.log(`Express server listening at http://localhost:${PORT}`)
  })
  createTables()
}

startServer()
