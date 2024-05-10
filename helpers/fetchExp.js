const puppeteer = require("puppeteer")

//LOOK INTO OPTIMISING PUPPETEER REQUESTS

async function fetchExp(ignList) {
  const batchSize = 1
  const batches = []
  for (let i = 0; i < ignList.length; i += batchSize) {
    batches.push(ignList.slice(i, i + batchSize))
  }

  const playerListWithData = []

  for (const batch of batches) {
    const batchResults = await Promise.all(
      batch.map((player) => getRates(player))
    )
    playerListWithData.push(...batchResults)
    await delay(400)
  }

  const sortedResult = playerListWithData.sort((a, b) => {
    const numberA = parseNumber(a.number)
    const numberB = parseNumber(b.number)
    return numberB - numberA
  })

  return sortedResult
}

async function getRates(ign) {
  // Start a Puppeteer session with:
  // - a visible browser (`headless: false` - easier to debug because you'll see the browser in action)
  // - no default viewport (`defaultViewport: null` - website page will in full width and height)
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  })

  // Open a new page
  const page = await browser.newPage()

  // On this new page
  // - open mapleranks to specified char
  // - wait until the dom content is loaded (HTML is ready)
  await page.goto(`https://mapleranks.com/u/${ign}`, {
    waitUntil: "domcontentloaded",
  })

  // Get page data
  const rates = await page.evaluate(() => {
    const name = document.querySelector(".card-title").innerText
    const expValue = document.querySelector(".char-exp-cell")
    const image = document.querySelector(".card-img-top").src
    const description = expValue.innerText.split("\n")[0]
    const number = expValue.querySelector(".char-stat-right").innerText

    return { name, description, number, image }
  })

  // Display the page data
  // console.log(rates)

  // Close the browser
  await browser.close()

  return rates
}

function parseNumber(numberString) {
  const numericPart = parseFloat(numberString.replace(/[^\d.-]/g, ""))
  const unit = numberString.slice(-1) // Get the last character (unit)

  switch (unit) {
    case "M":
      return numericPart * 1e6 // Convert million to its numerical equivalent
    case "B":
      return numericPart * 1e9 // Convert billion to its numerical equivalent
    case "T":
      return numericPart * 1e12 // Convert trillion to its numerical equivalent
    default:
      return numericPart // Return as is if no unit or unrecognized unit
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const ignList = [
  "wizyori",
  "jeraie",
  "shlop",
  "traemon",
  "meleeking",
  "kinkflip",
  "salary",
  // "plimbotoilet",
]

// fetchExp(ignList)

module.exports = {
  fetchExp,
}
