const express = require('express');
const router = express.Router();
const db = require('../database');
const { verificarToken } = require('../auth');

function validarCPF(cpf) {
  const regex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
  if (!regex.test(cpf)) return false;
  const nums = cpf.replace(/[.\-]/g, '');
  if (/^(\d)\1+$/.test(nums)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(nums[i]) * (10 - i);
  let dig1 = (soma * 10) % 11;
  if (dig1 === 10 || dig1 === 11) dig1 = 0;
  if (dig1 !== parseInt(nums[9])) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(nums[i]) * (11 - i);
  let dig2 = (soma * 10) % 11;
  if (dig2 === 10 || dig2 === 11) dig2 = 0;
  return dig2 === parseInt(nums[10]);
}

function sanitizar(texto) {
  if (typeof texto !== 'string') return texto;
  return texto.replace(/[<>'"]/g, '');
}

router.get('/', verificarToken, (req, res) => {
  db.all('SELECT * FROM pacientes ORDER BY nome ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar pacientes.' });
    res.json({ sucesso: true, total: rows.length, pacientes: rows });
  });
});

router.get('/:id', verificarToken, (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM pacientes WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar paciente.' });
    if (!row) return res.status(404).json({ erro: 'Paciente nao encontrado.' });
    res.json({ sucesso: true, paciente: row });
  });
});

router.post('/', verificarToken, (req, res) => {
  let { nome, cpf, data_nascimento, telefone, email, endereco, historico_clinico } = req.body;
  if (!nome || !cpf || !data_nascimento) {
    return res.status(400).json({ erro: 'Campos obrigatorios: nome, cpf, data_nascimento.' });
  }
  if (!validarCPF(cpf)) {
    return res.status(400).json({ erro: 'CPF invalido. Tente novamente.' });
  }
  nome = sanitizar(nome);
  endereco = sanitizar(endereco);
  historico_clinico = sanitizar(historico_clinico);
  const sql = `INSERT INTO pacientes (nome, cpf, data_nascimento, telefone, email, endereco, historico_clinico) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.run(sql, [nome, cpf, data_nascimento, telefone, email, endereco, historico_clinico], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) return res.status(409).json({ erro: 'CPF ja cadastrado no sistema.' });
      return res.status(500).json({ erro: 'Erro ao cadastrar paciente.' });
    }
    db.run(`INSERT INTO logs_auditoria (usuario_id, acao, tabela, registro_id, detalhes) VALUES (?, ?, ?, ?, ?)`,
      [req.usuario.id, 'INSERT', 'pacientes', this.lastID, `Paciente ${nome} cadastrado`]);
    res.status(201).json({ sucesso: true, mensagem: 'Paciente cadastrado com sucesso.', id: this.lastID });
  });
});

router.put('/:id', verificarToken, (req, res) => {
  const { id } = req.params;
  let { nome, cpf, data_nascimento, telefone, email, endereco, historico_clinico } = req.body;
  if (!nome || !cpf || !data_nascimento) return res.status(400).json({ erro: 'Campos obrigatorios: nome, cpf, data_nascimento.' });
  if (!validarCPF(cpf)) return res.status(400).json({ erro: 'CPF invalido. Tente novamente.' });
  nome = sanitizar(nome);
  endereco = sanitizar(endereco);
  historico_clinico = sanitizar(historico_clinico);
  db.run(`UPDATE pacientes SET nome=?, cpf=?, data_nascimento=?, telefone=?, email=?, endereco=?, historico_clinico=? WHERE id=?`,
    [nome, cpf, data_nascimento, telefone, email, endereco, historico_clinico, id], function(err) {
    if (err) return res.status(500).json({ erro: 'Erro ao atualizar paciente.' });
    if (this.changes === 0) return res.status(404).json({ erro: 'Paciente nao encontrado.' });
    db.run(`INSERT INTO logs_auditoria (usuario_id, acao, tabela, registro_id, detalhes) VALUES (?, ?, ?, ?, ?)`,
      [req.usuario.id, 'UPDATE', 'pacientes', id, `Paciente ${nome} atualizado`]);
    res.json({ sucesso: true, mensagem: 'Paciente atualizado com sucesso.' });
  });
});

router.delete('/:id', verificarToken, (req, res) => {
  const { id } = req.params;
  db.get('SELECT nome FROM pacientes WHERE id = ?', [id], (err, row) => {
    if (!row) return res.status(404).json({ erro: 'Paciente nao encontrado.' });
    db.run('DELETE FROM pacientes WHERE id = ?', [id], function(err) {
      if (err) return res.status(500).json({ erro: 'Erro ao remover paciente.' });
      db.run(`INSERT INTO logs_auditoria (usuario_id, acao, tabela, registro_id, detalhes) VALUES (?, ?, ?, ?, ?)`,
        [req.usuario.id, 'DELETE', 'pacientes', id, `Paciente ${row.nome} removido`]);
      res.json({ sucesso: true, mensagem: 'Paciente removido com sucesso.' });
    });
  });
});

module.exports = router;