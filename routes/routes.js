const { Router } = require("express")
const router = Router()

module.exports = (app) => {

    app.use("/api", router);

    // router("/", controllers.create)
}