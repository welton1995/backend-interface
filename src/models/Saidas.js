const mongoose = require('mongoose');

const saidaSchema = new mongoose.Schema({
  chave: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chaves',
    required: true,
  },
  quantidade: {
    type: Number,
    required: true,
  },
  dataSaida: {
    type: Date,
    default: Date.now,
  }
});

const Saidas = mongoose.model('Saidas', saidaSchema);

module.exports = Saidas;
