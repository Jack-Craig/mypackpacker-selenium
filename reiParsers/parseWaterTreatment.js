const gText = require('../helpers/getTtext')
module.exports = dTable => {
    return {
        filterType: gText(dTable, 'Filter Type'),
        effectiveness: gText(dTable, 'Removes/Destroys')
    }
}