// function to get rid of all the try/catch async/await functions
module.exports = fn =>{
    return (req, res, next) => { // return is an anonymous function
        fn(req, res, next).catch(next) // catch(next) calls our global Error handler function
    }
}
