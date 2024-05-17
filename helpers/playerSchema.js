const mongoose = require("mongoose")
const Schema = mongoose.Schema

const playerSchema = new Schema({
  name: String,
})
module.exports = mongoose.model("players", playerSchema)
