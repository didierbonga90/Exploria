// This import-dev-data.js file is to import the data from tours.json file directly to the database
const fs = require("fs");
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path: './config.env'})
const Tour = require('../../models/tourModel')

// DB
const connectDB = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      })
      console.log(`MongoDB Connected: ${conn.connection.host}`)
    } catch (err) {
      console.error(`Error : ${err.message}`)
      process.exit(1)
    }
}

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf8'))

// IMPORT DATA INTO DB
const importData = async () =>{
    try {
        await connectDB()
        await Tour.create(tours)
        console.log('Data successfully created!')
        process.exit(1)
    } catch (error) {
        console.log(error)
    }
}

// DELETE DATA FROM DB
const deleteData = async () =>{
    try {
        await connectDB()
        await Tour.deleteMany()
        console.log('Data successfully deleted!')
        process.exit(1)
    } catch (error) {
        console.log(error)
    }
}
if(process.argv[2] === '--import') importData()
else if(process.argv[2] === '--delete') deleteData()
