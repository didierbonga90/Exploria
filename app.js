const express = require('express');
const app = express();
const fs = require('fs');

// middleware -> use function to use middleware
app.use(express.json());
app.use((req, res, next) => {
    console.log('Test middleware')
    next();
})

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));


const getAllTours =  (req, res) => {
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data:{
            tours
        }
    })
}
const getTour =  (req, res) => {
    console.log(req.params); // req.params -> /:id

    // multiply a string that looks like a number ( '5' , '4') by a real number, it automatically converts the string to a number
    const id = req.params.id * 1 

   
    // in tours, find an element (el) where (=>) its id (el.id) is the same with the one that we get from the parameter (req.params.id)
    const tour = tours.find( el => el.id === id) 

    // if the request is not in the tours array, then throw an error
    if(!tour){
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        })
    }

    res.status(200).json({
        status: 'success',
        data:{
            tour
        }
    })
}

const createTour = (req, res) =>{
    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({ id: newId }, req.body)
 
    tours.push(newTour);
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err =>{
     res.status(201).json({
         status: 'success',
         data: {
             tour: newTour
         }
     })
    })
 }

 const updateTour = (req, res) =>{

    if(req.params.id * 1 > tours.length){
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        })
    }

    res.status(200).json({
        status: 'success',
        data:{
            tour: '<Updated tour here...>'
        }
    })
}

const deleteTour = (req, res) =>{

    if(req.params.id * 1 > tours.length){
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        })
    }

    res.status(204).json({
        status: 'success',
        data: 'null'
    })
}

app.route('/api/v1/tours')
.get(getAllTours)
.post(createTour)

app.route('/api/v1/tours/:id')
.get(getTour)
.patch(updateTour)
.delete(deleteTour)

// PORT
const PORT = 3000;
app.listen(PORT, () =>{
    (`Listening on port ${PORT}...`)
})