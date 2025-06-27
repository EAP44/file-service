const mongoose = require('mongoose');
const DocumentMetadata = require('../models/DocumentMetadata');
const { Readable } = require('stream');

const bucketName = 'uploads';

exports.uploadFile = async (req, res) => {
  try {
    const { metadata } = req.body;
    const parsed = JSON.parse(metadata);
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'Aucun fichier fourni.' });

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads',
    });

    const uploadStream = bucket.openUploadStream(file.originalname, {
      contentType: file.mimetype,
    });

    const fileId = uploadStream.id; 
    const readStream = Readable.from(file.buffer);
    readStream.pipe(uploadStream);

    uploadStream.on('error', (error) => {
      console.error('Erreur d’upload :', error);
      res.status(500).json({ message: 'Erreur durant l’upload.' });
    });

    uploadStream.on('finish', async () => {
      const doc = new DocumentMetadata({
        stagiaireId: parsed.stagiaireId,
        nomFichier: file.originalname,
        type: file.mimetype,
        taille: file.size,
        cheminStorage: fileId, 
        uploadedBy: parsed.uploadedBy,
        tags: parsed.tags || [],
      });

      await doc.save();
      res.status(201).json({ message: 'Fichier uploadé avec succès.', id: fileId });
    });
  } catch (err) {
    console.error('Erreur upload :', err.message);
    return res.status(400).json({ error: 'Erreur de parsing ou fichier manquant.' });
  }
};


exports.downloadFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    const metadata = await DocumentMetadata.findById(fileId);

    if (!metadata) return res.status(404).json({ message: 'Fichier non trouvé.' });

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName,
    });

    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(metadata.cheminStorage));

    res.set('Content-Type', metadata.type);
    res.set('Content-Disposition', `attachment; filename="${metadata.nomFichier}"`);

    downloadStream.pipe(res);

    downloadStream.on('error', (err) => {
      console.error('Erreur de téléchargement :', err);
      res.status(500).json({ message: 'Erreur pendant le téléchargement' });
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
