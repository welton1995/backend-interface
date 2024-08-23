const express = require('express');
const transacaoControllers = require('./controllers/transacaoControllers');
const chavesControllers = require('./controllers/chavesControllers');
const entradasControllers = require('./controllers/entradasControllers');
const saidasControllers = require('./controllers/saidasControllers');

const routes = express.Router();

routes.get('/transacoes', transacaoControllers.read); // Listar transações
routes.post('/transacoes', transacaoControllers.create); // Criar transações
routes.put('/transacoes/:id', transacaoControllers.update); // Editar transações 
routes.delete('/transacoes/:id', transacaoControllers.delete); // Excluir transações 

routes.get('/transacoes/receitas', transacaoControllers.readReceitas); // Somar receitas 
routes.get('/transacoes/saldo', transacaoControllers.saldo); // Saldo
routes.get('/transacoes/saldomeses', transacaoControllers.diferancaMeses); // Saldo por mês

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

// Chaves
routes.get('/chaves', chavesControllers.read); // Listar Chaves
routes.post('/chaves', chavesControllers.create); // Cadastrar Chaves
routes.put('/chaves/:id', chavesControllers.update); // Editar Chaves
routes.delete('/chaves/:id', chavesControllers.delete); // Excluir Chaves

// Entradas
// routes.get('/entradas', entradasControllers.read); // Listar entradas
routes.post('/entradas/:id', entradasControllers.create); // Cadastrar entradas
// routes.put('/entradas/:id', entradasControllers.update); // Editar entradas
// routes.delete('/entradas/:id', entradasControllers.delete); // Excluir entradas

// Entradas
// routes.get('/saidas', saidasControllers.read); // Listar saidas
routes.post('/saidas/:id', saidasControllers.create); // Cadastrar saidas
// routes.put('/saidas/:id', saidasControllers.update); // Editar saidas
// routes.delete('/saidas/:id', saidasControllers.delete); // Excluir saidas


module.exports = routes;