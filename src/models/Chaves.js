const mongoose = require('mongoose');

const chaveSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
  },
  codigo: {
    type: String,
    required: true,
    unique: true,
  },
  quantidade: {
    type: Number,
    required: true,
    default: 0,
  },
  entradas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Entradas' }], // Referência para entradas
  saidas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Saidas' }]      // Referência para saídas
});

const Chaves = mongoose.model('Chaves', chaveSchema);

module.exports = Chaves;
