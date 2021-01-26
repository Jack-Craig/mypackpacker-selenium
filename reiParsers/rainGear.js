const gText = require('../helpers/getTtext')
module.exports = dTable => {
    return {
        isWindproof: gText(dTable, 'Windproof'),
        hasHood: gText(dTable, 'Hood'),
        gender: gText(dTable, 'Gender')
    }
}