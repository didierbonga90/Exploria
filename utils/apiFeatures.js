class APIFreatures {
    constructor(query, queryString) {
        this.query = query
        this.queryString = queryString
    }

    filter(){
         // Build the query  (filtering)
         const queryObj = {...this.queryString}
         const excludeFileds = ['page', 'sort', 'limit', 'fields']
         excludeFileds.forEach( el =>  delete queryObj[el] )
 
         // Advanced filtering
         let queryStr = JSON.stringify(queryObj)
         queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
         
         this.query.find(JSON.parse(queryStr))

         return this
    }

    sort(){
        if(this.queryString.sort){
            const sortBy = req.query.sort.split(',').join(' ')
            this.query = this.query.sort(sortBy)
            console.log( sortBy)
        }else{
            this.query = this.query.sort('-createdAt')
        }
        return this
    }

    limitedFields(){
        if(this.queryString.fields){
            const fields = this.queryString.fields.split(',').join(' ')
            this.query = this.query.select(fields)
        }else{
            this.query = this.query.select('-__v')
        }
        return this
    }

    paginate(){
        const page = this.queryString.page * 1 || 1
        const limit = this.queryString.limit * 1 || 100
        const skip = (page - 1) * limit

        // we want page number 2 with 10 results ( 1-10 , 11-20, 21-30 ...)
        this.query = this.query.skip(skip).limit(limit)

        return this
    }
}

module.exports = APIFreatures;