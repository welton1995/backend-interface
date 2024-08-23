const Chaves = require('../models/Chaves');
const Entradas = require('../models/Entradas');

const entradasControllers = {
  async create(req, res) {
    try {
      const { id } = req.params;
      const { quantidade } = req.body;

      // Verifica se o ID foi passado
      if (!id) {
        return res.status(400).json({ message: 'Chave não encontrada!' });
      }

      // Encontra a chave e atualiza a quantidade
      const chave = await Chaves.findByIdAndUpdate(
        id,
        { $inc: { quantidade: +quantidade } }, // Incrementa a quantidade
        { new: true } // Retorna o novo documento atualizado
      );

      // Verifica se a chave existe
      if (!chave) {
        return res.status(404).json({ message: 'Chave não encontrada!' });
      }

      // Cria a entrada no banco de dados
      const entrada = await Entradas.create({
        chave: id, // O campo no schema é "chave", não "chaves"
        quantidade
      });

      // Retorna a resposta de sucesso
      res.status(201).json({ message: 'Entrada realizada com sucesso!' });     
    } catch (error) {
      console.error(error); // Mostra o erro no console
      res.status(500).json({ message: 'Erro ao criar entrada!' });
    }
  },
};

module.exports = entradasControllers;
