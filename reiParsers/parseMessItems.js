const gText = require('../helpers/getTtext')
module.exports = dTable => {
    const uT = gText(dTable, 'Best Use')
    const cT = gText(dTable, 'Collapsible') 
    return {
        uses: uT ? uT.split(',') : undefined,
        isCollapsible: cT ? 'Yes' : 'No',
        
    }
}