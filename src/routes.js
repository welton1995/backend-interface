const express = require('express');
const transacaoControllers = require('./controllers/transacaoControllers');

const routes = express.Router();

routes.get('/transacoes', transacaoControllers.read); // Listar
routes.post('/transacoes', transacaoControllers.create); // Criar
routes.put('/transacoes/:id', transacaoControllers.update); // Editar
routes.delete('/transacoes/:id', transacaoControllers.delete); // Excluir

routes.get('/transacoes/receitas', transacaoControllers.readReceitas);
routes.get('/transacoes/saldo', transacaoControllers.saldo);
routes.get('/transacoes/saldomeses', transacaoControllers.diferancaMeses);

// Receitas
routes.get('/transacoes/servicosmeses', transacaoControllers.servicosMes);
routes.get('/transacoes/vendasmeses', transacaoControllers.vendasMes);
routes.get('/transacoes/outrosmeses', transacaoControllers.outrosMes);
routes.post('/transacoes/saldoMes', transacaoControllers.saldoMes);

// Despesas
routes.get('/transacoes/luzmeses', transacaoControllers.luzMes);
routes.get('/transacoes/materiaprimameses', transacaoControllers.materiaPrimaMes);
routes.get('/transacoes/ferramentasmeses', transacaoControllers.ferramentasMes);
routes.get('/transacoes/despesasoutrosmeses', transacaoControllers.despesasOutrosMes);


module.exports = routes;