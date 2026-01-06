// models/Config.js
const mongoose = require("mongoose");

const configSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  embedColor: { type: String, default: "#2b2d31" },
  logChannelId: { type: String, default: null }, // ✅ OBLIGATOIRE
  leaderboardChannelId: { type: String },
  leaderboardMessageId: { type: String }

});

module.exports = mongoose.model("Config", configSchema);
