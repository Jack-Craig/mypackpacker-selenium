const gText = require('../helpers/getTtext')
module.exports = dTable => {
    const blT = gText(dTable, 'Max Blade Length (in.)')
    return {
        bladeLength: blT ? parseFloat(blT.replace('inches', '')) : undefined,
        bladeType: gText(dTable, 'Knife Blade Type'),
        bladeMaterial: gText(dTable, 'Blade Construction'),
        handleMaterial: gText(dTable, 'Handle Material'),
        knifeType: gText(dTable, 'Closed Length') ? 'Folding' : 'Fixed'
    }
}