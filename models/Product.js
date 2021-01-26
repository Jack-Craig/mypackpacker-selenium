const mongoose = require('mongoose')

const ProductModel = mongoose.model('product', new mongoose.Schema({
    displayName: String, // Same as ID
    categoryID: String,
    brand: String,
    sourceData: {},
    productInfo: {
        weight: Number,
        size: Number,
        pictures: [String],
        description: String,
        unaffiliatedUrl: String,
        rating: {r: Number, n:Number},
        type: String,
    },
    lowestPriceRange: {
        minPrice: Number,
        maxPrice: Number
    },
    userCreated: {$type: Boolean, default: false},
    publicalyViewable: {$type: Boolean, default: true}
}, {strict: false, typeKey: '$type'}))

module.exports = ProductModel