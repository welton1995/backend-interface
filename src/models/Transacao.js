const mongoose = require('mongoose');


const transacaoSchema = new mongoose.Schema({
  tipo: {
    type: String,
    required: true
  },
  categoria: {
    type: String,
    required: true,
  },
  observacao: {
    type: String,
  },
  valor: {
    type: Number,
    default: 0
  },
  data: {
    type: Date,
    default: Date.now()
  }
});

const transacao = mongoose.model('Transacao', transacaoSchema);

module.exports = transacao;