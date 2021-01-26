module.exports = dTable => {
    let sizeText = dTable.find('th:contains("Gear Capacity (L)")').next('.specs-value').text()
    const mI = sizeText.indexOf('M')
    if (mI > -1) {
        sizeText = sizeText.substr(mI, sizeText.length)
        sizeText = sizeText.substr(sizeText.indexOf(':'), sizeText.length)
        const lI = sizeText.indexOf('liters')
        sizeText = sizeText.substr(lI)
    }
    const hElem = dTable.find('th:contains("Hydration Compatible")').next()
    const gElem = dTable.find('th:contains("Gender")').next('.specs-value')
    const fElem = dTable.find('th:contains("Frame Type")').next('.specs-value')
    return {
        hydrationCompatible: hElem.length > 0 ? (hElem.text().includes('Yes') ? 'Yes' : 'No') : 'No',
        gender: gElem.length > 0 ? gElem.text().trim() : 'Unisex',
        frameType: fElem.length > 0 ? fElem.text().trim() : 'n/a',
        size: sizeText ? parseFloat(sizeText.replace('liters', '')) : undefined
    }
}