const puppeteer = require("puppeteer")

const mongoose = require("mongoose")
const Player = require("./../helpers/playerSchema")
require("dotenv").config()
// const playerSchema = mongoose.Schema({
//   name: String,
// })

// const Player = mongoose.model("Player", playerSchema)

const uri = process.env.MONGODB_URI
const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
}

// async function run() {
//   try {
//     // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
//     await mongoose.connect(uri, clientOptions)
//     await mongoose.connection.db.admin().command({ ping: 1 })
//     console.log(
//       "Pinged your deployment. You successfully connected to MongoDB!"
//     )

//     const players = await Player.find()
//     const final = []
//     players.forEach((player) => {
//       final.push(player.name)
//     })
//     console.log(final)
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await mongoose.disconnect()
//   }
// }
// run().catch(console.dir)

// const { MongoClient, ServerApiVersion } = require("mongodb")
// const uri =
//   "mongodb+srv://jenzbr:8iQCs0RZHhlOWdy4@cluster0.upetflu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

// const mongoClient = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// })

// async function run() {
//   try {
//     await mongoClient.connect()

//     await mongoClient.db("maple-bot").command({ ping: 1 })
//     console.log(
//       "Pinged your deployment. You successfully connected to MongoDB!"
//     )

//     const namesList = await mongoClient
//       .db("maple-bot")
//       .collection("IGN")
//       .find({})
//     console.log(namesList)
//   } finally {
//     await mongoClient.close()
//   }
// }

// run().catch(console.dir)
//LOOK INTO OPTIMISING PUPPETEER REQUESTS

async function fetchExp() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions)
    await mongoose.connection.db.admin().command({ ping: 1 })
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    )

    //Fetch player names from DB using mongoose model
    //and add them to the ignList
    const players = await Player.find()
    const ignList = []
    players.forEach((player) => {
      ignList.push(player.name)
    })

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
  } finally {
    // Ensures that the client will close when you finish/error
    await mongoose.disconnect()
  }
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
    console.log("test")
    let level = 0
    const logs = []
    const getTextContent = (selector) => {
      const element = document.querySelector(selector)
      return element ? element.innerText : null
    }

    const getAttribute = (selector, attribute) => {
      const element = document.querySelector(selector)
      return element ? element.getAttribute(attribute) : null
    }

    const name = getTextContent(".card-title")

    const expValueElement = document.querySelector(".char-exp-cell")
    const image = getAttribute(".card-img-top", "src")
    const description = expValueElement
      ? expValueElement.innerText.split("\n")[0]
      : null
    const numberElement = expValueElement
      ? expValueElement.querySelector(".char-stat-right")
      : null
    const number = numberElement ? numberElement.innerText : null
    const levelElement = getTextContent("h5")
    const match =
      levelElement != null
        ? levelElement.match(/Lv\.\s*(\d+)\s*\(\d+\.\d+%\)/)
        : null
    if (match) {
      level = match[1]
    } else {
      logs.push("no match found for level regex")
    }

    logs.push("level: ", level)
    return { name, description, number, level, image, logs }
  })

  // console.log(rates.logs)

  // const rates = await page.evaluate(() => {
  //   const name = document.querySelector(".card-title").innerText
  //   const expValue = document.querySelector(".char-exp-cell")
  //   const image = document.querySelector(".card-img-top").src
  //   const description = expValue.innerText.split("\n")[0]
  //   const number = expValue.querySelector(".char-stat-right").innerText

  //   return { name, description, number, image }
  // })

  // Display the page data
  // console.log(rates)

  // Close the browser
  await browser.close()

  return rates
}

function parseNumber(numberString) {
  if (numberString === null) return null
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

// const ignList = [
//   "wizyori",
//   "jeraie",
//   "shlop",
//   "traemon",
//   "meleeking",
//   "kinkflip",
//   "salary",
// "plimbotoilet",
// ]

// fetchExp()

module.exports = {
  fetchExp,
}
