const mongoose = require('mongoose');

const entradaSchema = new mongoose.Schema({
  chave: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chaves',
    required: true,
  },
  quantidade: {
    type: Number,
    required: true,
  },
  dataEntrada: {
    type: Date,
    default: Date.now,
  }
});

const Entradas = mongoose.model('Entradas', entradaSchema);

module.exports = Entradas;
