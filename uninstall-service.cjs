const Service = require("node-windows").Service
const path = require("path")

const svc = new Service({
  name: "KIKI-service",
  script: path.join(__dirname, "server", "server.js"),
})

svc.on("uninstall", () => {
  console.log("Service uninstalled successfully.")
  console.log("Service exists: ", svc.exists)
})

svc.uninstall()
