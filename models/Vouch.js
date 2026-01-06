const mongoose = require("mongoose");

const vouchSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  vouchId: { type: Number, required: true },

  vendeurId: { type: String, required: true },
  vendeurName: { type: String, required: true },

  item: { type: String, required: true },
  prix: { type: String, required: true },
  paiement: { type: String, required: true },

  note: { type: Number, required: true },
  commentaire: { type: String, default: null },
  anonyme: { type: Boolean, default: false },

  authorId: { type: String, required: true },
  authorTag: { type: String, required: true },
  authorAvatar: { type: String, required: true },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Vouch", vouchSchema);
