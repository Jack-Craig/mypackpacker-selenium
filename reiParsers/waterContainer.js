const gText = require('../helpers/getTtext')
module.exports = dTable => {
    const lT = gText(dTable, 'Liquid Capacity (L)')
    return {
        size: lT ? parseFloat(lT.replace('liters', '')) : undefined,
        isBPAFree: gText(dTable, 'BPA Free'),
        isInsulated: gText(dTable, 'Insulated'),
    }
}