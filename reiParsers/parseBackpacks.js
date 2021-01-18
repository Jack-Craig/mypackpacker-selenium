module.exports = dTable => {
    const sizeElem = dTable.find('th:contains("Gear Capacity (L)")').next('.specs-value')
    const hElem = dTable.find('th:contains("Hydration Compatible")').next('.specs-value')
    const gElem = dTable.find('th:contains("Gender")').next('.specs-value')
    const fElem = dTable.find('th:contains("Frame Type")').next('.specs-value')
    return {
        hydrationCompatible: hElem.length > 0 ? (hElem.text() === 'Yes' ? true : false) : false,
        gender: gElem.length > 0 ? gElem.text().trim() : 'Unisex',
        frameType: fElem.length > 0 ? fElem.text().trim() : 'n/a',
        size: sizeElem.length > 0 ? parseFloat(sizeElem.text().replace('liters', '')) : 0
    }
}