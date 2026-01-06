const mongoose = require("mongoose");

const vendeurSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true
  },
  discordId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  }
});

/**
 * 🔒 Un vendeur unique PAR SERVEUR
 */
vendeurSchema.index(
  { guildId: 1, discordId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Vendeur", vendeurSchema);
