const gText = require('../helpers/getTtext')
module.exports = dTable => {
    const wpT = gText(dTable, 'Windproof')
    return {
        isWindproof: wpT ? 'Yes' : 'No',
        hasHood: gText(dTable, 'Hood'),
        gender: gText(dTable, 'Gender'),
        insulationType: gText(dTable, 'Insulation Type'),
    }
}