const gText = require('../helpers/getTtext')
module.exports = dTable => {
    return {
        cap: gText(dTable, 'Sleeping Capacity'),
        season: gText(dTable, 'Seasons'),
        designType: gText(dTable, 'Design Type'),
        hasFootprint: gText(dTable, 'Footprint Included')
    }
}