const mongoose = require('mongoose');

const DocumentMetadataSchema = new mongoose.Schema({
  stagiaireId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stagiaire', required: true },
  nomFichier: { type: String, required: true },
  type: { type: String },
  taille: { type: Number },
  cheminStorage: { type: String },
  uploadDate: { type: Date, default: Date.now },
  uploadedBy: { type: String },
  tags: [{ type: String }]
});

module.exports = mongoose.model('DocumentMetadata', DocumentMetadataSchema);
