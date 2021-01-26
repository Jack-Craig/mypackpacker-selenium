const gText = require('../helpers/getTtext')
module.exports = dTable => {
    return {
        gender: gText(dTable, 'Gender'),
        sleeveLength: gText(dTable, 'Sleeve Length'),
        isMoistureWicking: gText(dTable, 'Moisture Wicking'),
        isSunprotective: gText(dTable, 'Sun-Protective Fabric'),
        shirtType: gText(dTable, 'Shirt Type')
    }
}