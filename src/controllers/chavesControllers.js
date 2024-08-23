const Chaves = require('../models/Chaves');
const Entradas = require('../models/Entradas');

const chavesControllers = {
  async create (req, res) {
    try {
      const { nome, codigo, quantidade } = req.body;
      const chaveExist = await Chaves.findOne({ codigo });

      if(chaveExist){
        res.status(400).json({ message: 'Chave já está cadastrada!'});
      return
      }

      const chave = await Chaves.create({ nome, codigo, quantidade });

      res.status(201).json({ message: 'Chave cadastrada com sucesso!', chave});
    } catch (error) {
      return console.log(error);
    }
  },

  async read (req, res) {
    try {
      const chaves = await Chaves.find();

      res.status(200).json({chaves});
    } catch (error) {
      return console.log(error);
    }
  },

  async update (req, res) {
    try {
      const { id } = req.params;
      const { nome, codigo, quantidade } = req.body;
      const chaveExist = await Chaves.findById(id);

      if(!chaveExist) {
        return res.status(400).json({ message: 'Chave não encontrada!' });
      }

      await Chaves.findByIdAndUpdate(id, { nome, codigo, quantidade });

      res.status(201).json({ message: 'Chave atualizada com sucesso!' });
    } catch (error) {
      return console.log(error);
    }
  },

  async delete (req, res) {
    try {
      const { id } = req.params;
      const chaveExist = await Chaves.findById(id);

      if(!chaveExist) {
        return res.status(400).json({ message: 'Chave não encontrada!' });
      }

      await Chaves.findByIdAndDelete(id);

      res.status(200).json({ message: 'Chave apagada com sucesso!' });
    } catch (error) {
      return console.log(error);
    }
  },
}

module.exports = chavesControllers;