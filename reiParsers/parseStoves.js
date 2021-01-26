const gText = require('../helpers/getTtext')
module.exports = dTable => {
    const uT = gText(dTable, 'Best Use')
    return {
        uses: uT ? uT.split(',') : undefined,
        fuelType: gText(dTable, 'Fuel'),
        numBurners: gText(dTable, 'Number of Burners'),
        hasIntegratedPot: gText(dTable, 'Integrated Pot') ? 'Yes' : 'No',
    }
}