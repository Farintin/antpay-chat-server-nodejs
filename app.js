require('dotenv').config()
const express = require('express')
// const https = require('https')
// const fs = require('fs')
// const path = require('path')
const cors = require("cors");
const config = require('./config')
require('./db')
const routes = require("./routes/v1")
const io = require('./ioServer')



const app = express()
// app.use(express.json())
app.use(express.json({limit: '25mb'}))
app.use(express.urlencoded({limit: '25mb', extended: true}))
app.use(cors())

app.use("/v1", routes)

/* 
app.use(function(err, req, res, next) {
    console.log({ err });
    return res.status(500).send({ msg: 'err', err })
}) 
*/

/* const sslServer = https.createServer(
    {
        key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
        cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'))
    },
    app
) */


const PORT = process.env.PORT || 5000
const server = app.listen(PORT, () => console.log(`💬 server on port ${PORT}`))
// IO Engine
io(server)