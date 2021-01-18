const cheerio = require('cheerio')
const fs = require('fs')

const run = () => new Promise(async (res, req) => {
    fs.readFile('toscrape.htm', 'utf-8', (e, data) => {
        const $ = cheerio.load(data)
        let maxIdx = 12
        let i = 0
        $('ul.nav-level-1 > li:first-child .nav-level-2 .nav-level-3').each((idx, elem) => {
            if (idx > maxIdx)
                return
            $(elem).find('li a').each((_, e) => {
                i++
                console.log($(e).attr('href'))
            })
        })
        console.log(i)
        res()
    })
})

run().then(()=>{
    console.log('Done')
})