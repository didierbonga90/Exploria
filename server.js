const dotenv = require('dotenv');
dotenv.config({path: './config.env'})
const app = require('./app');

// START THE SERVER
const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>{
    console.log(`Listening on ${process.env.NODE_ENV} mode on port ${PORT}...`)
})