// Gets the text of the specified rei table element

module.exports = (dTable, elemText)  => {
    const e =  dTable.find(`th:contains("${elemText}")`).next('.specs-value')
    if (e.length > 0)
        return e.text()
    return undefined
}