const gText = require('../helpers/getTtext')
module.exports = dTable => {
    const trT = gText(dTable, 'Temperature Rating (F)')
    return {
        tempRating: trT ? parseFloat(trT.replace('degrees (F)', '')) : undefined,
        insulationType: gText(dTable, 'Insulation Type'),
        shape: gText(dTable, 'Sleeping Bag Shape'),
        gender: gText(dTable, 'Gender'),
    }
}