const gText = require('../helpers/getTtext')
module.exports = dTable => {
    const loT = gText(dTable, 'Max Light Output (Lumens)')
    const rm = gText(dTable, 'Red Light Mode')
    return {
        lightOutput: loT ? parseFloat(loT.replace('lumens', '')) : undefined,
        waterProofRating: gText(dTable, 'Water-Resistance Rating'),
        redLightMode: rm ? 'Yes' : 'No'
    }
}