const gText = require('../helpers/getTtext')
module.exports = dTable => {
    const uT = gText(dTable, 'Best Use')
    const cT = gText(dTable, 'Liquid Capacity (L)')
    return {
        uses: uT ? uT.split(',') : undefined,
        cap: cT ? parseFloat(cT.replace('liters', '')) : undefined,
        material: gText(dTable, 'Cookware Material'),
        isNonStick: gText(dTable, 'Nonstick Surface')
    }
}