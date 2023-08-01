require('dotenv').config()
const express = require('express')
const cors = require("cors");
const config = require('./config')
require('./db')
const routes = require("./routes/v1")
const io = require('./ioServer')


const app = express()
app.use(express.json({limit: '25mb'}))
app.use(express.urlencoded({limit: '25mb', extended: true}))
app.use(cors())

app.use("/v1", routes)

const PORT = process.env.PORT || 5000
const server = app.listen(PORT, () => console.log(`💬 server on port ${PORT}`))
// IO Engine
io(server)