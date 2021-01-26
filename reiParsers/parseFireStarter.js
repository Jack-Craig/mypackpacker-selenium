const gText = require('../helpers/getTtext')
module.exports = dTable => {
    const uT = gText(dTable, 'Best Use')
    return {
        uses: uT ? uT.split(',') : undefined,
        isWaterproof: gText(dTable, 'Waterproof') ? 'Yes' : 'No'
    }
}