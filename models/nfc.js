const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const nfcSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    }
});

const Nfc = mongoose.models.Nfc || mongoose.model('Nfc', nfcSchema, 'nfc');

module.exports = Nfc;