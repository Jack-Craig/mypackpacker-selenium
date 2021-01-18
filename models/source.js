const mongoose = require('mongoose')

const ProductModel = mongoose.model('source', new mongoose.Schema({
   _id: String,
   type: String,

   // For provider scrapers:
   categories: [
       {
           _id: String,
           url: String
       }
   ]

}, {strict: false}))

module.exports = ProductModel