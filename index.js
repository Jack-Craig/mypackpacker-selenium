//const { Builder, Key, By } = require('selenium-webdriver');
const mongoose = require('mongoose')
const ProductModel = require('./models/Product')
const SourceModel = require('./models/source')
const cheerio = require('cheerio');
require('dotenv').config()
const fs = require('fs');
const getTtext = require('./helpers/getTtext');

const CAT2PRSR = { // Category Id to parser function
    'backpacks': require('./reiParsers/parseBackpacks'),
    'bathroom': require('./reiParsers/parseBathroom'),
    'boots': require('./reiParsers/parseBoots'),
    'bottoms': require('./reiParsers/parseBottoms'),
    'custom': require('./reiParsers/parseCustom'),
    'emergency-shelter': require('./reiParsers/parseEmergencyShelter'),
    'fire-starter': require('./reiParsers/parseFireStarter'),
    'first-aid': require('./reiParsers/parseFirstAid'),
    'insulation-layers': require('./reiParsers/parseInsulationLayer'),
    'knives': require('./reiParsers/parseKnives'),
    'light': require('./reiParsers/parseLight'),
    'mess-items': require('./reiParsers/parseMessItems'),
    'navigation': require('./reiParsers/parseNavigation'),
    'other': require('./reiParsers/parseOther'),
    'pots-and-pans': require('./reiParsers/parsePotsAndPans'),
    'sleeping-bags': require('./reiParsers/parseSleepingBags'),
    'sleeping-pads': require('./reiParsers/parseSleepingPads'),
    'socks': require('./reiParsers/parseSocks'),
    'stoves': require('./reiParsers/parseStoves'),
    'sun-protection': require('./reiParsers/parseSunProtection'),
    'teeth': require('./reiParsers/parseTeeth'),
    'tents': require('./reiParsers/parseTents'),
    'tops': require('./reiParsers/parseTops'),
    'water-treatment': require('./reiParsers/parseWaterTreatment'),
    'rain-gear': require('./reiParsers/rainGear'),
    'water-container': require('./reiParsers/waterContainer')
}

// REI SCRAPER
let f_idx = 0
const CRAWL_DELAY = 100
const CRAW_VARIATION = 100
const grd = () => CRAWL_DELAY + Math.floor(Math.random() * CRAW_VARIATION)

const splitPriceRange = (priceRange) => {
    let priceObj = {
        minPrice: "",
        maxPrice: ""
    }
    const priceArr = priceRange.split('-')
    priceObj.minPrice = parseFloat(priceArr[0].trim().replace('$', ''))
    if (priceArr.length > 1) {
        priceObj.maxPrice = parseFloat(priceArr[1].trim().replace('$', ''))
    }
    return priceObj
}

const UOM_TO_G = {
    'lbs': 453.592,
    'lb': 453.592,
    'pounds': 453.592,
    'pound': 453.592,
    'oz': 28.3495,
    'ounce': 28.3495,
    'ounces': 28.3495
}

const isUndefined = objDoc => {
    for (const key of Object.keys(objDoc)) {
        if (typeof objDoc[key] === 'object') {
            if (isUndefined(objDoc[key])) {
                return true
            }
        } else {
            if (objDoc[key] === undefined || objDoc[key] == -1 || Number.isNaN(objDoc[key]))
                return true
        }
    }
    return false
}

const normalizeWeightString = (str) => {
    if (str.length == 0)
        return -1
    const normalized = str.toLowerCase().trim()
    let rIndex = normalized.indexOf('regular')
    rIndex = rIndex < 0 ? normalized.indexOf('m') : rIndex
    let isolatedString = ''
    let weight = -1
    if (rIndex > 0) {
        const firstC = normalized.indexOf(':', rIndex)
        let secondC = normalized.indexOf(':', firstC + 1)
        secondC = secondC > 0 ? secondC : normalized.length
        isolatedString = normalized.substring(firstC + 1, secondC).trim()
    } else {
        isolatedString = normalized
    }
    let sList = isolatedString.split(' ')
    let pRatio = -1
    for (let i = sList.length - 1; i >= 0; i--) {
        let word = sList[i]
        if (pRatio > -1) {
            weight += pRatio * parseFloat(word)
            pRatio = -1
            continue
        }
        const pIndex = word.indexOf('.')
        if (pIndex > 0)
            word = word.slice(0, pIndex)
        if (UOM_TO_G.hasOwnProperty(word)) {
            pRatio = UOM_TO_G[word]
        }
    }
    return weight
}
 
const get1Detail = async (driver, cId, scId, testData=undefined) => {
    let $
    if (driver)
        $ = cheerio.load(await driver.getPageSource())
    else
        $ = cheerio.load(testData)

    const imgSrc = $('img.media-center-primary-image').attr('src')
    let cat = cId
    const dTable = $('table.product-specs-table')
    if (cat === 'insulation-layers' && dTable.find(`th:contains("Waterproof")`).length > 0) {
        cat = 'rain-gear'
    }
    if (cat === 'top')
    cat = 'tops'
    const rElem = $('.product-rating-navigable a').first().children('span[aria-hidden="true"]').children(':first-child')
    const productNumber = $('.item-number > span[data-ui="product-information-style"]').first().text().trim()
    const origPrice = $('span.product-price.product-standard-price')
    return {
        displayName: $('.product-title').text().trim().replace('  ', ' '),
        categoryID: cat,
        brand: $('.brand-link').text().trim(),
        sourceData: {
            rei: {
                id: productNumber,
                url: driver ? await driver.getCurrentUrl() : `www.rei.com/product/${productNumber}`
            }
        },
        productInfo: {
            weight: cat==='socks'?85:cat==='rain-gear'?0:normalizeWeightString($('table.product-specs-table th:contains("Weight")').next('.specs-value').text().trim()),
            pictures: imgSrc ? ['http://rei.com' + imgSrc] : undefined,
            rating: {r: parseFloat(rElem.text()), n: parseFloat(rElem.next().text().replace('(','').replace(')',''))},
            description: $('ul.product-features-list').text().trim(),
            unaffiliatedUrl: driver ? await driver.getCurrentUrl() : `www.rei.com/product/${productNumber}`,
            type: scId,
            ...CAT2PRSR[cat](dTable)
        },
        lowestPriceRange: origPrice.length ? splitPriceRange(origPrice.text()) : $('span.product-price.product-sale-price').text()
    }
}

const save = (driver, sId, cId) => new Promise(async (res, rej) => {
    const f = {subCat:sId, catId: cId, src: await driver.getPageSource()}
    fs.writeFile('downloads/src_'+ ++f_idx, JSON.stringify(f), e => {
        res()
    })
})

const getAllDetail = async (driver, subId, catId) => { // TODO: Renovate to use files saved in downloads/
    let allData = []
    let curUrl = ''
    do {
        curUrl = await driver.getCurrentUrl()
        for (const url of await getAllLinks(driver)) {
            await driver.get(url)
            await driver.sleep(grd())
            await save(driver, subId, catId)
            continue
            let doc = await get1Detail(driver, cId)
            if (!isUndefined(doc)) {
                doc.productInfo.type = subCat
                allData.push(doc)
            }
        }
    } while (await paginate(driver, curUrl))
    return allData
}

const getAllLinks = async driver => {
    // Returns a list of string urls
    let links = []
    const $ = cheerio.load(await driver.getPageSource())
    const pageResults = $('._1COyDttDTR5M16ybKTmtJn ._1A-arB0CEJjk5iTZIRpjPs:first-child')
    pageResults.each((i, elem) => {
        const href = $(elem).attr('href')
        if (href.indexOf('rei-garage') > 0)
            return
        links.push(`http://rei.com${href}`)
    })
    return links
}

const paginate = async (driver, currentUrl) => {
    // Moves driver to next category page, and returns true/false if it was successful or not
    const pageIndex = currentUrl.indexOf('?page=')
    let nextURL = ''
    if (pageIndex < 0) {
        nextURL = `${currentUrl}?page=2`
    } else {
        const pageNum = parseInt(currentUrl.slice(pageIndex + 6))
        nextURL = `${currentUrl.slice(0, pageIndex)}?page=${pageNum + 1}`
    }
    await driver.get(nextURL)
    const elements = await driver.findElements(By.className('_1yB9xrVaZSdXVUP-9hhqZG'))
    return !elements.length
}

const runREI = driver => new Promise(async (res, rej) => {
    const sourceData = await SourceModel.findById('rei').lean()
    for (const category of sourceData.categories) {
        await driver.get(category.url)
        await driver.sleep(grd())
        const allDocs = await getAllDetail(driver, category._id)
        await ProductModel.insertMany(allDocs)
    }
    res()
})

// Loaded from prepared html JSON documents stored locally

const getLocalDetail = (filePath, verbose=false) => new Promise(async (res, rej)=>{
    fs.readFile(filePath, 'utf-8', async (err, data) => {
        if (err) {
            console.log('Resolving error')
            return res({_id: 'error', eT: err})
        }
        const jsData = JSON.parse(data)
        const cId = jsData.catId
        const scId = jsData.subCat
        const html = jsData.src
        let d = await get1Detail(false, cId, scId, html)
        if (verbose) {console.log(d)}
        fs.writeFileSync('./debugcache/t.html', html)
        const url = d.sourceData.rei.url
        if (isUndefined(d)) {
            return res({_id: false, cId: d.categoryID, scId: scId, url:url})
        }
        await ProductModel.findOneAndUpdate({'sourceData.rei.id': d.sourceData.rei.id}, d, {upsert: true, setDefaultsOnInsert: true}).lean()
        return res({_id: 'success', cId: d.categoryID})
    })
})

const runlocal = () => new Promise(async (res, rej) => {
    await mongoose.connect(process.env.MONGO_URI)
    let i = 0
    let totalSuccess = 0
    let totalFailure = 0
    let catFailure = {}
    while (1) {
        const data = await getLocalDetail(`./downloads/src_${++i}`)

        // TODO: Validation
        // TODO: IF FAIL, LOAD TO FILE?
        // TODO: Log failure rate
        if (data._id === 'error')
            break
        if (!catFailure.hasOwnProperty(data.cId))
            catFailure[data.cId] = {success: 0, failure: 0}
        if (!data._id) {
            catFailure[data.cId]['failure']++
            fs.appendFileSync('./logs/failedUrls', `./downloads/src_${i}\t${data.url}\t${data.cId}\t${data.scId}\n`) 
            totalFailure++
        }
        else {
            catFailure[data.cId]['success']++
            totalSuccess++
        }
    }
    console.log(catFailure)
    console.log(`Total Success: ${totalSuccess}`)
    console.log(`Total Failure: ${totalFailure}`)
    await mongoose.disconnect()
    res()
})

if (process.argv.length > 2)
    getLocalDetail(process.argv[2], verbose=true).then(r=>console.log(r))
else
    runlocal().then(()=>console.log('done'))

const test = driver => new Promise(async (res, rej) => {
    let numInserted = 0
    for (const url of [
        ['https://www.rei.com/c/backpacking-packs','Backpacking Packs','backpacks'],
        ['https://www.rei.com/c/day-packs','Day Packs','backpacks'],
        ['https://www.rei.com/c/hiking-hydration-packs','Hydration Packs','backpacks'],
        ['https://www.rei.com/c/baby-carrier-packs','Other','backpacks'],
        ['https://www.rei.com/c/hiking-waistpacks','Fanny Packs','backpacks'],
        ['https://www.rei.com/c/pack-accessories','Accessories','backpacks'],
        ['https://www.rei.com/c/backpacking-tents','Backpacking Tents','tents'],
        ['https://www.rei.com/c/camping-tents','Camping Tents','tents'],
        ['https://www.rei.com/c/roof-top-tents','Other','tents'],
        ['https://www.rei.com/c/shelters','Other','tents'],
        ['https://www.rei.com/c/bivy-sacks','Other','tents'],
        ['https://www.rei.com/c/tent-accessories','Accessories','other'],
        ['https://www.rei.com/c/mens-sleeping-bags','Sleeping Bags','sleeping-bags'],
        ['https://www.rei.com/c/womens-sleeping-bags','Sleeping Bags','sleeping-bags'],
        ['https://www.rei.com/c/double-sleeping-bags','Double Bags','sleeping-bags'],
        ['https://www.rei.com/c/kids-sleeping-bags','Sleeping Bags','sleeping-bags'],
        ['https://www.rei.com/c/sleeping-bag-liners','Liners','sleeping-bags'],
        ['https://www.rei.com/c/camp-blankets','Blankets','sleeping-bags'],
        ['https://www.rei.com/c/sleeping-pads','Sleeping Pads','sleeping-pads'],
        ['https://www.rei.com/c/hammocks','Hammocks','sleeping-pads'],
        ['https://www.rei.com/c/cots','Other','sleeping-pads'],
        ['https://www.rei.com/c/air-mattresses','Other','sleeping-pads'],
        ['https://www.rei.com/c/camping-pillows','Pillows','sleeping-pads'],
        ['https://www.rei.com/c/stoves','','stoves'],
        ['https://www.rei.com/c/camp-cookware','','pots-and-pans'],
        ['https://www.rei.com/c/camp-dinnerware','Dinnerware', 'mess-items',],
        ['https://www.rei.com/c/coffee-and-tea','Coffee And Tea','mess-items'],
        ['https://www.rei.com/c/camping-utensils','Dinnerware','mess-items'],
        ['https://www.rei.com/c/coolers','Other','mess-items'],
        ['https://www.rei.com/c/food','Food','mess-items'],
        ['https://www.rei.com/c/glasses-cups-and-mugs','Beverage Containers','mess-items'],
        ['https://www.rei.com/c/water-bottles-flasks-and-jugs','Bottles','water-container'],
        ['https://www.rei.com/c/water-treatment','','water-treatment'],
        ['https://www.rei.com/c/hydration-reservoirs','Pack Bladders','water-container'],
        ['https://www.rei.com/c/vacuum-bottles','Vacuum Bottles','water-container'],
        ['https://www.rei.com/c/headlamps','Headlamps','light'],
        ['https://www.rei.com/c/flashlights-and-lightsticks','Flashlights','light'],
        ['https://www.rei.com/c/lanterns','Lanterns','light'],
        ['https://www.rei.com/c/gps','GPS','navigation'],
        ['https://www.rei.com/c/portable-power-devices','Power Banks','custom'],
        ['https://www.rei.com/c/radios-and-headphones','Audio','custom'],
        ['https://www.rei.com/c/watches','Watches','custom'],
        ['https://www.rei.com/c/two-way-radios','Communication','custom'],
        ['https://www.rei.com/c/plbs-and-satellite-messengers','Communication','custom'],
        ['https://www.rei.com/c/solar-chargers','Solar Chargers','custom'],
        ['https://www.rei.com/c/portable-speakers','Audio','custom'],
        ['https://www.rei.com/c/trekking-poles-hiking-staffs','Hiking Poles','custom'],
        ['https://www.rei.com/c/knives','','knives'],
        ['https://www.rei.com/c/compasses','Compasses','navigation'],
        ['https://www.rei.com/c/multi-tools','Multi Tools','knives'],
        ['https://www.rei.com/c/camp-tools','Tools','knives'],
        ['https://www.rei.com/c/mens-hiking-footwear','Boots','boots'],
        ['https://www.rei.com/c/womens-hiking-footwear','Boots','boots'],
        ['https://www.rei.com/c/kids-hiking-footwear','Boots','boots'],
        ['https://www.rei.com/c/hiking-socks','','socks'],
        ['https://www.rei.com/c/gaiters','Gaiters','boots'],
        ['https://www.rei.com/c/hiking-jackets','','insulation-layers'],
        ['https://www.rei.com/c/hiking-shirts','','top'],
        ['https://www.rei.com/c/hiking-pants','Pants','bottoms'],
        ['https://www.rei.com/c/hiking-shorts','Shorts','bottoms'],
        ['https://www.rei.com/c/hiking-clothing-accessories','Clothing Accessories','custom'],
        ['https://www.rei.com/c/sunglasses','Sunglasses','sun-protection'],
        ['https://www.rei.com/c/first-aid','','first-aid'],
        ['https://www.rei.com/c/emergency-and-survival','Emergency Gear','emergency-shelter'],
        ['https://www.rei.com/c/camp-bathroom','','bathroom'],
        ['https://www.rei.com/c/bear-safety','Bear Gear','emergency-shelter'],
        ['https://www.rei.com/c/fire-starting-gear','','fire-starter'],
        ['https://www.rei.com/c/sun-and-bug-protection','Sun & Bug Protection','sun-protection']
    ]) {
        await driver.get(url[0])
        await driver.sleep(grd())
        const allDocs = await getAllDetail(driver, url[1], url[2])
        for (const doc of allDocs) {
            numInserted++
            await ProductModel.findOneAndUpdate({'sourceData.rei.id':doc.sourceData.rei.id},doc,{upsert:true}).lean()
        }
    }
    console.log('Updated Or Inserted: ', numInserted)
    res()
})
/**
const testOffline = () => {
    const fs = require('fs')
    fs.readFile('data.html','utf-8', (err, data) => {
        if (err) {
            console.error(err)
            return
        }
        get1Detail(false, 'backpacks', testData=data).then(d=>{
            console.log(d)
        })
        
    })
}
testOffline()
 */
/*
mongoose.connect(process.env.MONGO_URI).then(() => {
    new Builder().forBrowser('chrome').build().then(driver => {
        runlocal().finally(async ()=>{
            await driver.quit()
            await mongoose.disconnect()
        })
        return
        test(driver).finally(async () => {
            await driver.quit()
            await mongoose.disconnect()
        })
    })
})
 
*/
