import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import "dotenv/config"
import {
  createEmployeeTable,
  createDocketTable,
  createWorksTable,
} from "./table.js"
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "./employeeQueries.js"

import {
  getDockets,
  createDocket,
  updateDocket,
  deleteDocket,
  deleteWork,
} from "./docketQueries.js"

const app = express()
const PORT = process.env.PORT

app.use(express.json())
app.use(cors())
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.get("/api/employees", getEmployees)
app.get("/api/employees/:id", getEmployeeById)
app.post("/api/employees", createEmployee)
app.put("/api/employees/:id", updateEmployee)
app.delete("/api/employees/:id", deleteEmployee)

app.get("/api/dockets", getDockets)
app.post("/api/dockets", createDocket)
app.put("/api/dockets/:id", updateDocket)
app.delete("/api/dockets/:id", deleteDocket)
app.delete("/api/works/:id", deleteWork)

app.get("/health", (_, res) => {
  res.status(200).json({ status: "ok" })
})

async function createTables() {
  await createEmployeeTable()
  await createDocketTable()
  await createWorksTable()
}

function startServer() {
  app.listen(PORT, () => {
    console.log(`Express server listening at http://localhost:${PORT}`)
  })
  createTables()
}

startServer()
