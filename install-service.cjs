const Service = require("node-windows").Service
const path = require("path")
require("dotenv").config()

const PORT = process.env.PORT

// Create a new service object
const svc = new Service({
  name: "KIKI-service",
  description: `KIKI express server running on port ${PORT}`,
  script: path.join(__dirname, "server", "server.js"),
  nodeOptions: ["--harmony", "--max_old_space_size=4096"],
})

// Listen for the "install" event
svc.on("install", () => {
  console.log("Service installed successfully.")
  console.log("Starting service...")
  console.log(`Server started on PORT ${PORT}`)
  svc.start()
})

// Install the service
svc.install()
