const gText = require('../helpers/getTtext')
module.exports = dTable => {
    return {
        gender: gText(dTable, 'Gender'),
        isMoistureWicking: gText(dTable, 'Moisture Wicking'),
        heightCat: gText(dTable, 'Sock Height')
    }
}