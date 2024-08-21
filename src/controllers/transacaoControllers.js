const Transacao = require('../models/Transacao');

const transacaoControllers = {
  async create (req, res) {
    try {
      const { tipo, categoria, observacao, valor, data } = req.body;

      const transacao = await Transacao.create({ tipo, categoria, observacao, valor, data });

      res.status(201).json(`Transação criada com sucesso!`);
    } catch (error) {
      return console.log(error);
    }
  },

  async read (req, res) {
    try {
      const transacoes = await Transacao.find();

      res.status(200).send({ transacoes });
    } catch (error) {
      return console.log(error);
    }
  },

  async readReceitas (req, res) {
    try {
      const teste = await T
      const transacoes = await Transacao.find({ tipo: 'Receitas' });

      res.status(200).send({ transacoes });
    } catch (error) {
      return console.log(error);
    }
  },

  async update (req, res) {
    try {
      const { id } = req.params;
      const { tipo, categoria, observacao, valor, data } = req.body;

      const transaction = await Transacao.findById(id);

      if(!transaction) {
        return res.status(400).send(`Transação não encontrada!`);
      }

      const transacaoAtualizada = await Transacao.findByIdAndUpdate(id, { tipo, categoria, observacao, valor, data }, { new: true });

      res.status(200).json(`Transação atualizada com sucesso!`);
    } catch (error) {
      return console.log(error);
    }
  },

  async delete (req, res) {
    try {
      const { id } = req.params;

      const transaction = await Transacao.findById(id);

      if(!transaction) {
        return res.status(400).send(`Transação não encontrada!`);
      }

      await Transacao.findByIdAndDelete(id);

      res.status(200).json(`Transação excluida com sucesso!`);
    } catch (error) {
      return console.log(error);
    }
  },

  async saldo(req, res) {
    try {
      const resultado = await Transacao.aggregate([
        {
          $group: {
            _id: "$tipo", // Agrupamos por tipo ("Receitas" ou "Despesas")
            totalValor: { $sum: "$valor" } // Somamos os valores por tipo
          }
        },
        {
          $project: {
            tipo: "$_id", // Projetamos o campo "tipo"
            totalValor: 1, // E o valor total
            _id: 0
          }
        }
      ]);
  
      // Extraindo os valores de Receitas e Despesas
      let totalReceitas = 0;
      let totalDespesas = 0;
  
      resultado.forEach((item) => {
        if (item.tipo === "Receitas") {
          totalReceitas = item.totalValor;
        } else if (item.tipo === "Despesas") {
          totalDespesas = item.totalValor;
        }
      });
  
      // Calculando a diferença
      const diferenca = totalReceitas - totalDespesas;
  
      return res.status(200).send({ diferenca });
    } catch (erro) {
      return console.log(error);
    }
  },

  async saldoMes(req, res) {
    try {
      const { mes, ano } = req.body;
      const resultado = await Transacao.aggregate([
        {
          // Filtrando os documentos de acordo com o mês e ano específicos
          $match: {
            $expr: {
              $and: [
                { $eq: [{ $month: "$data" }, mes] },  // Filtra pelo mês
                { $eq: [{ $year: "$data" }, ano] }    // Filtra pelo ano
              ]
            }
          }
        },
        {
          // Agrupando por tipo de transação (Receitas ou Despesas)
          $group: {
            _id: "$tipo", // Agrupamos por tipo
            totalValor: { $sum: "$valor" } // Somamos os valores de acordo com o tipo
          }
        },
        {
          // Projetando o resultado para ter um formato mais limpo
          $project: {
            tipo: "$_id",
            totalValor: 1,
            _id: 0
          }
        }
      ]);
  
      // Inicializando variáveis para Receitas e Despesas
      let totalReceitas = 0;
      let totalDespesas = 0;
  
      // Iterando sobre o resultado para extrair os valores
      resultado.forEach((item) => {
        if (item.tipo === "Receitas") {
          totalReceitas = item.totalValor;
        } else if (item.tipo === "Despesas") {
          totalDespesas = item.totalValor;
        }
      });
  
      // Calculando a diferença entre Receitas e Despesas
      const diferenca = totalReceitas - totalDespesas;
  
      console.log(`Diferença para ${mes}/${ano}:`, diferenca);
      res.status(200).send({ diferenca });
    } catch (erro) {
      console.error("Erro ao calcular a diferença:", erro);
    }
  },


async diferancaMeses(req, res) {
  try {
    function gerarMeses(anos) {
      const meses = [];
      anos.forEach(ano => {
        for (let mes = 1; mes <= 12; mes++) {
          meses.push({ ano, mes });
        }
      });
      return meses;
    }

    // Definindo o intervalo de anos (por exemplo, de 2023 a 2024)
    const anos = [2024];
    const meses = gerarMeses(anos);

    // Primeiro passo: agrupar as transações por ano e mês
    const transacoesAgrupadas = await Transacao.aggregate([
      {
        $group: {
          _id: {
            ano: { $year: "$data" },
            mes: { $month: "$data" }
          },
          totalReceitas: {
            $sum: {
              $cond: [{ $eq: ["$tipo", "Receitas"] }, "$valor", 0]
            }
          },
          totalDespesas: {
            $sum: {
              $cond: [{ $eq: ["$tipo", "Despesas"] }, "$valor", 0]
            }
          }
        }
      },
      {
        $project: {
          ano: "$_id.ano",
          mes: "$_id.mes",
          diferenca: { $subtract: ["$totalReceitas", "$totalDespesas"] },
          _id: 0
        }
      }
    ]);

    // Transformando as transações agrupadas em um formato indexado por ano e mês
    const transacoesMap = {};
    transacoesAgrupadas.forEach(t => {
      transacoesMap[`${t.ano}-${t.mes}`] = t.diferenca;
    });

    // Segundo passo: criar a lista completa de meses com suas diferenças
    const resultado = meses.map(({ ano, mes }) => {
      const diferenca = transacoesMap[`${ano}-${mes}`] || 0; // Valor 0 para meses sem transações
      return { ano, mes, diferenca };
    });

    res.status(200).send({resultado}); // Retorna o resultado em JSON
  } catch (erro) {
    console.error("Erro ao calcular a diferença por mês:", erro);
    res.status(500).json({ erro: "Erro ao calcular a diferença" });
  }
},

// RECEITAS
async servicosMes(req, res) {
  function gerarMeses(anos) {
    const meses = [];
    anos.forEach(ano => {
      for (let mes = 1; mes <= 12; mes++) {
        meses.push({ ano, mes });
      }
    });
    return meses;
  }

  try {
    // Defina o intervalo de anos que você deseja cobrir (ajuste conforme necessário)
    const anos = [2024]; // Ajuste os anos conforme necessário
    const meses = gerarMeses(anos);

    // Realizar a agregação no MongoDB para somar receitas por mês com categoria "Serviços"
    const receitasServicosAgrupadas = await Transacao.aggregate([
      {
        // Filtro para considerar apenas transações do tipo "Receitas" e categoria "Serviços"
        $match: {
          tipo: 'Receitas',
          categoria: 'Serviços'
        }
      },
      {
        // Agrupamento por ano e mês
        $group: {
          _id: {
            ano: { $year: "$data" },
            mes: { $month: "$data" }
          },
          totalReceitas: { $sum: "$valor" }
        }
      },
      {
        // Projeto para ajustar a estrutura do documento retornado
        $project: {
          ano: "$_id.ano",
          mes: "$_id.mes",
          totalReceitas: 1,
          _id: 0
        }
      },
      {
        // Ordenação por ano e mês (opcional)
        $sort: { ano: 1, mes: 1 }
      }
    ]);

    // Transformando as receitas agrupadas em um formato indexado por ano e mês
    const receitasMap = {};
    receitasServicosAgrupadas.forEach(receita => {
      receitasMap[`${receita.ano}-${receita.mes}`] = receita.totalReceitas;
    });

    // Criar a lista final de meses com suas receitas, incluindo meses vazios
    const resultado = meses.map(({ ano, mes }) => {
      const totalReceitas = receitasMap[`${ano}-${mes}`] || 0; // Define 0 para meses sem receitas
      return { ano, mes, totalReceitas };
    });

    res.status(200).send({resultado}); // Retorna o resultado
  } catch (erro) {
    console.error("Erro ao somar receitas por mês:", erro);
    res.status(500).json({ erro: "Erro ao somar receitas por mês" });
  }
},

async vendasMes(req, res) {
  function gerarMeses(anos) {
    const meses = [];
    anos.forEach(ano => {
      for (let mes = 1; mes <= 12; mes++) {
        meses.push({ ano, mes });
      }
    });
    return meses;
  }

  try {
    // Defina o intervalo de anos que você deseja cobrir (ajuste conforme necessário)
    const anos = [2024]; // Ajuste os anos conforme necessário
    const meses = gerarMeses(anos);

    // Realizar a agregação no MongoDB para somar receitas por mês com categoria "Serviços"
    const receitasServicosAgrupadas = await Transacao.aggregate([
      {
        // Filtro para considerar apenas transações do tipo "Receitas" e categoria "Serviços"
        $match: {
          tipo: 'Receitas',
          categoria: 'Vendas'
        }
      },
      {
        // Agrupamento por ano e mês
        $group: {
          _id: {
            ano: { $year: "$data" },
            mes: { $month: "$data" }
          },
          totalReceitas: { $sum: "$valor" }
        }
      },
      {
        // Projeto para ajustar a estrutura do documento retornado
        $project: {
          ano: "$_id.ano",
          mes: "$_id.mes",
          totalReceitas: 1,
          _id: 0
        }
      },
      {
        // Ordenação por ano e mês (opcional)
        $sort: { ano: 1, mes: 1 }
      }
    ]);

    // Transformando as receitas agrupadas em um formato indexado por ano e mês
    const receitasMap = {};
    receitasServicosAgrupadas.forEach(receita => {
      receitasMap[`${receita.ano}-${receita.mes}`] = receita.totalReceitas;
    });

    // Criar a lista final de meses com suas receitas, incluindo meses vazios
    const resultado = meses.map(({ ano, mes }) => {
      const totalReceitas = receitasMap[`${ano}-${mes}`] || 0; // Define 0 para meses sem receitas
      return { ano, mes, totalReceitas };
    });

    res.status(200).send({resultado}); // Retorna o resultado
  } catch (erro) {
    console.error("Erro ao somar receitas por mês:", erro);
    res.status(500).json({ erro: "Erro ao somar receitas por mês" });
  }
},

async outrosMes(req, res) {
  function gerarMeses(anos) {
    const meses = [];
    anos.forEach(ano => {
      for (let mes = 1; mes <= 12; mes++) {
        meses.push({ ano, mes });
      }
    });
    return meses;
  }

  try {
    // Defina o intervalo de anos que você deseja cobrir (ajuste conforme necessário)
    const anos = [2024]; // Ajuste os anos conforme necessário
    const meses = gerarMeses(anos);

    // Realizar a agregação no MongoDB para somar receitas por mês com categoria "Serviços"
    const receitasServicosAgrupadas = await Transacao.aggregate([
      {
        // Filtro para considerar apenas transações do tipo "Receitas" e categoria "Serviços"
        $match: {
          tipo: 'Receitas',
          categoria: 'Outros'
        }
      },
      {
        // Agrupamento por ano e mês
        $group: {
          _id: {
            ano: { $year: "$data" },
            mes: { $month: "$data" }
          },
          totalReceitas: { $sum: "$valor" }
        }
      },
      {
        // Projeto para ajustar a estrutura do documento retornado
        $project: {
          ano: "$_id.ano",
          mes: "$_id.mes",
          totalReceitas: 1,
          _id: 0
        }
      },
      {
        // Ordenação por ano e mês (opcional)
        $sort: { ano: 1, mes: 1 }
      }
    ]);

    // Transformando as receitas agrupadas em um formato indexado por ano e mês
    const receitasMap = {};
    receitasServicosAgrupadas.forEach(receita => {
      receitasMap[`${receita.ano}-${receita.mes}`] = receita.totalReceitas;
    });

    // Criar a lista final de meses com suas receitas, incluindo meses vazios
    const resultado = meses.map(({ ano, mes }) => {
      const totalReceitas = receitasMap[`${ano}-${mes}`] || 0; // Define 0 para meses sem receitas
      return { ano, mes, totalReceitas };
    });

    res.status(200).send({resultado}); // Retorna o resultado
  } catch (erro) {
    console.error("Erro ao somar receitas por mês:", erro);
    res.status(500).json({ erro: "Erro ao somar receitas por mês" });
  }
},

// DESPESAS
async luzMes(req, res) {
  function gerarMeses(anos) {
    const meses = [];
    anos.forEach(ano => {
      for (let mes = 1; mes <= 12; mes++) {
        meses.push({ ano, mes });
      }
    });
    return meses;
  }

  try {
    // Defina o intervalo de anos que você deseja cobrir (ajuste conforme necessário)
    const anos = [2024]; // Ajuste os anos conforme necessário
    const meses = gerarMeses(anos);

    // Realizar a agregação no MongoDB para somar receitas por mês com categoria "Serviços"
    const receitasServicosAgrupadas = await Transacao.aggregate([
      {
        // Filtro para considerar apenas transações do tipo "Receitas" e categoria "Serviços"
        $match: {
          tipo: 'Despesas',
          categoria: 'Luz'
        }
      },
      {
        // Agrupamento por ano e mês
        $group: {
          _id: {
            ano: { $year: "$data" },
            mes: { $month: "$data" }
          },
          totalReceitas: { $sum: "$valor" }
        }
      },
      {
        // Projeto para ajustar a estrutura do documento retornado
        $project: {
          ano: "$_id.ano",
          mes: "$_id.mes",
          totalReceitas: 1,
          _id: 0
        }
      },
      {
        // Ordenação por ano e mês (opcional)
        $sort: { ano: 1, mes: 1 }
      }
    ]);

    // Transformando as receitas agrupadas em um formato indexado por ano e mês
    const receitasMap = {};
    receitasServicosAgrupadas.forEach(receita => {
      receitasMap[`${receita.ano}-${receita.mes}`] = receita.totalReceitas;
    });

    // Criar a lista final de meses com suas receitas, incluindo meses vazios
    const resultado = meses.map(({ ano, mes }) => {
      const totalReceitas = receitasMap[`${ano}-${mes}`] || 0; // Define 0 para meses sem receitas
      return { ano, mes, totalReceitas };
    });

    res.status(200).send({resultado}); // Retorna o resultado
  } catch (erro) {
    console.error("Erro ao somar receitas por mês:", erro);
    res.status(500).json({ erro: "Erro ao somar receitas por mês" });
  }
},

async materiaPrimaMes(req, res) {
  function gerarMeses(anos) {
    const meses = [];
    anos.forEach(ano => {
      for (let mes = 1; mes <= 12; mes++) {
        meses.push({ ano, mes });
      }
    });
    return meses;
  }

  try {
    // Defina o intervalo de anos que você deseja cobrir (ajuste conforme necessário)
    const anos = [2024]; // Ajuste os anos conforme necessário
    const meses = gerarMeses(anos);

    // Realizar a agregação no MongoDB para somar receitas por mês com categoria "Serviços"
    const receitasServicosAgrupadas = await Transacao.aggregate([
      {
        // Filtro para considerar apenas transações do tipo "Receitas" e categoria "Serviços"
        $match: {
          tipo: 'Despesas',
          categoria: 'Matéria Prima'
        }
      },
      {
        // Agrupamento por ano e mês
        $group: {
          _id: {
            ano: { $year: "$data" },
            mes: { $month: "$data" }
          },
          totalReceitas: { $sum: "$valor" }
        }
      },
      {
        // Projeto para ajustar a estrutura do documento retornado
        $project: {
          ano: "$_id.ano",
          mes: "$_id.mes",
          totalReceitas: 1,
          _id: 0
        }
      },
      {
        // Ordenação por ano e mês (opcional)
        $sort: { ano: 1, mes: 1 }
      }
    ]);

    // Transformando as receitas agrupadas em um formato indexado por ano e mês
    const receitasMap = {};
    receitasServicosAgrupadas.forEach(receita => {
      receitasMap[`${receita.ano}-${receita.mes}`] = receita.totalReceitas;
    });

    // Criar a lista final de meses com suas receitas, incluindo meses vazios
    const resultado = meses.map(({ ano, mes }) => {
      const totalReceitas = receitasMap[`${ano}-${mes}`] || 0; // Define 0 para meses sem receitas
      return { ano, mes, totalReceitas };
    });

    res.status(200).send({resultado}); // Retorna o resultado
  } catch (erro) {
    console.error("Erro ao somar receitas por mês:", erro);
    res.status(500).json({ erro: "Erro ao somar receitas por mês" });
  }
},

async ferramentasMes(req, res) {
  function gerarMeses(anos) {
    const meses = [];
    anos.forEach(ano => {
      for (let mes = 1; mes <= 12; mes++) {
        meses.push({ ano, mes });
      }
    });
    return meses;
  }

  try {
    // Defina o intervalo de anos que você deseja cobrir (ajuste conforme necessário)
    const anos = [2024]; // Ajuste os anos conforme necessário
    const meses = gerarMeses(anos);

    // Realizar a agregação no MongoDB para somar receitas por mês com categoria "Serviços"
    const receitasServicosAgrupadas = await Transacao.aggregate([
      {
        // Filtro para considerar apenas transações do tipo "Receitas" e categoria "Serviços"
        $match: {
          tipo: 'Despesas',
          categoria: 'Ferramentas'
        }
      },
      {
        // Agrupamento por ano e mês
        $group: {
          _id: {
            ano: { $year: "$data" },
            mes: { $month: "$data" }
          },
          totalReceitas: { $sum: "$valor" }
        }
      },
      {
        // Projeto para ajustar a estrutura do documento retornado
        $project: {
          ano: "$_id.ano",
          mes: "$_id.mes",
          totalReceitas: 1,
          _id: 0
        }
      },
      {
        // Ordenação por ano e mês (opcional)
        $sort: { ano: 1, mes: 1 }
      }
    ]);

    // Transformando as receitas agrupadas em um formato indexado por ano e mês
    const receitasMap = {};
    receitasServicosAgrupadas.forEach(receita => {
      receitasMap[`${receita.ano}-${receita.mes}`] = receita.totalReceitas;
    });

    // Criar a lista final de meses com suas receitas, incluindo meses vazios
    const resultado = meses.map(({ ano, mes }) => {
      const totalReceitas = receitasMap[`${ano}-${mes}`] || 0; // Define 0 para meses sem receitas
      return { ano, mes, totalReceitas };
    });

    res.status(200).send({resultado}); // Retorna o resultado
  } catch (erro) {
    console.error("Erro ao somar receitas por mês:", erro);
    res.status(500).json({ erro: "Erro ao somar receitas por mês" });
  }
},

async despesasOutrosMes(req, res) {
  function gerarMeses(anos) {
    const meses = [];
    anos.forEach(ano => {
      for (let mes = 1; mes <= 12; mes++) {
        meses.push({ ano, mes });
      }
    });
    return meses;
  }

  try {
    // Defina o intervalo de anos que você deseja cobrir (ajuste conforme necessário)
    const anos = [2024]; // Ajuste os anos conforme necessário
    const meses = gerarMeses(anos);

    // Realizar a agregação no MongoDB para somar receitas por mês com categoria "Serviços"
    const receitasServicosAgrupadas = await Transacao.aggregate([
      {
        // Filtro para considerar apenas transações do tipo "Receitas" e categoria "Serviços"
        $match: {
          tipo: 'Despesas',
          categoria: 'Outros'
        }
      },
      {
        // Agrupamento por ano e mês
        $group: {
          _id: {
            ano: { $year: "$data" },
            mes: { $month: "$data" }
          },
          totalReceitas: { $sum: "$valor" }
        }
      },
      {
        // Projeto para ajustar a estrutura do documento retornado
        $project: {
          ano: "$_id.ano",
          mes: "$_id.mes",
          totalReceitas: 1,
          _id: 0
        }
      },
      {
        // Ordenação por ano e mês (opcional)
        $sort: { ano: 1, mes: 1 }
      }
    ]);

    // Transformando as receitas agrupadas em um formato indexado por ano e mês
    const receitasMap = {};
    receitasServicosAgrupadas.forEach(receita => {
      receitasMap[`${receita.ano}-${receita.mes}`] = receita.totalReceitas;
    });

    // Criar a lista final de meses com suas receitas, incluindo meses vazios
    const resultado = meses.map(({ ano, mes }) => {
      const totalReceitas = receitasMap[`${ano}-${mes}`] || 0; // Define 0 para meses sem receitas
      return { ano, mes, totalReceitas };
    });

    res.status(200).send({resultado}); // Retorna o resultado
  } catch (erro) {
    console.error("Erro ao somar receitas por mês:", erro);
    res.status(500).json({ erro: "Erro ao somar receitas por mês" });
  }
},



}

module.exports = transacaoControllers;