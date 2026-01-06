const mongoose = require("mongoose");

const paiementSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  name: { type: String, required: true },
});

module.exports = mongoose.model("Paiement", paiementSchema);
