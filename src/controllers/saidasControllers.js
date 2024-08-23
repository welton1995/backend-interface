const Chaves = require('../models/Chaves');
const Saidas = require('../models/Saidas');

const saidasControllers = {
  async create(req, res) {
    try {
      const { id } = req.params;
      const { quantidade } = req.body;

      // Verifica se o ID foi passado
      if (!id) {
        return res.status(400).json({ message: 'Chave não encontrada!' });
      }

      // Encontra a chave e verifica se a quantidade em estoque é suficiente
      const chave = await Chaves.findById(id);

      if (!chave) {
        return res.status(404).json({ message: 'Chave não encontrada!' });
      }

      // Verifica se a quantidade a ser removida é válida
      if (chave.quantidade < quantidade) {
        return res.status(400).json({ message: 'Quantidade insuficiente no estoque!' });
      }

      // Atualiza a quantidade da chave (decrementa a quantidade)
      chave.quantidade -= quantidade;
      await chave.save(); // Salva a chave com a quantidade atualizada

      // Cria a saída no banco de dados
      const saida = await Saidas.create({
        chave: id, // O campo no schema é "chave", não "chaves"
        quantidade
      });

      // Retorna a resposta de sucesso
      res.status(201).json({ message: 'Saída realizada com sucesso!' });
    } catch (error) {
      console.error(error); // Mostra o erro no console
      res.status(500).json({ message: 'Erro ao criar saída!' });
    }
  },
};

module.exports = saidasControllers;
