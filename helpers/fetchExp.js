const puppeteer = require("puppeteer")

async function fetchExp() {
  const ignList = ["wizyori", "jeraie", "shlop", "traemon", "meleeking"]

  const getRates = async (ign) => {
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

      const description = expValue.innerText.split("\n")[0]
      const number = expValue.querySelector(".char-stat-right").innerText

      return { name, description, number }
    })

    // Display the page data
    // console.log(rates)

    // Close the browser
    await browser.close()

    return rates
  }

  const playerListWithData = ignList.map((player) => {
    return getRates(player)
  })

  const sortedResult = await Promise.all(playerListWithData).then((values) => {
    let newArr = [].concat(...values) // Flatten the array of arrays into a single array
    const sorted = newArr.sort((a, b) => {
      const numberA = parseNumber(a.number)
      const numberB = parseNumber(b.number)
      return numberB - numberA
    })
    return sorted
  })

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

  return sortedResult
}

module.exports = {
  fetchExp,
}