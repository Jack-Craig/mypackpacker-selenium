const gText = require('../helpers/getTtext')
module.exports = dTable => {
    const uT = gText(dTable, 'Best Use')
    return {
        uses: uT ? uT.split(',') : undefined,
        ankleHeight: gText(dTable, 'Footwear Height'),
        isWaterproof: gText(dTable, 'Waterproof') ? 'Yes' : 'No',
        isInsulated: gText(dTable, 'Insulated') ? 'Yes' : 'No',
        gender: gText(dTable, 'Gender'),
    }
}