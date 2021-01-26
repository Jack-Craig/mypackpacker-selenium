const gText = require('../helpers/getTtext')
module.exports = dTable => {
    return {
        gender: gText(dTable, 'Gender'),
        isSunprotective: gText(dTable, 'Sun-Protective Fabric'),
        isQuickDry: gText(dTable, 'Quick Drying'),
        hasCargoPockets: gText(dTable, 'Side Cargo Pockets'),
        fabric: gText(dTable, 'Fabric')
    }
}