const gText = require('../helpers/getTtext')
module.exports = dTable => {
    let tT = gText(dTable, 'Pad Thickness (in.)')
    if (tT) {
        const cI = tT.lastIndexOf(':')
        if (cI > -1) {
            const lII = tT.lastIndexOf('inch')
            tT = tT.substr(cI+1, lII)
        }

    }
    return {
        rVal: parseFloat(gText(dTable, 'R-Value')),
        thickness: tT ? parseFloat(tT) : undefined,
        hasRepairKit: gText(dTable, 'Repair Kit Included') ? 'Yes' : 'No',
        hasStuffSack: gText(dTable, 'Stuff Sack Included') ? 'Yes' : 'No',
        beddingType: gText(dTable, 'Sleeping Pad Type'),
        cap: gText(dTable, 'Sleeping Capacity'),
        shape: gText(dTable, 'Sleeping Pad Shape'),
    }
}