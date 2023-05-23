const mongoose = require('mongoose')
const config = require('../config')



mongoose.set('strictQuery', false)

const DB = config.DATABASE
mongoDB = `mongodb+srv://${DB.USERNAME}:${DB.PASSWORD}@cluster0.d8edvqz.mongodb.net/${DB.NAME}?retryWrites=true&w=majority`
/* let mongoDB
if (process.env.NODE_ENV == 'production') {
    mongoDB = `mongodb+srv://${DB.USERNAME}:${DB.PASSWORD}@cluster0.d8edvqz.mongodb.net/?retryWrites=true&w=majority`
} else if (process.env.NODE_ENV == 'development') {
    mongoDB = 'mongodb://localhost:27017/employee'
} */

mongoose.connect(mongoDB, {
    useUnifiedTopology: true, 
    useNewUrlParser: true
    // useCreateIndex: true,
    // useFindAndModify: false
})
let db = mongoose.connection

db.on('error', console.error.bind(console, 'MongoDB connection error:'))
db.once('open', () => {
    console.log('Database connected sucessfully')
})



module.exports = db