const express = require('express');
const router = express.Router();
const db = require('../database');
const { verificarToken } = require('../auth');

// Função para validar CPF completo (formato + dígitos verificadores)
function validarCPF(cpf) {
  const regex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
  if (!regex.test(cpf)) return false;

  // Remove pontuação
  const nums = cpf.replace(/[.\-]/g, '');

  // Rejeita sequências repetidas (ex: 111.111.111-11)
  if (/^(\d)\1+$/.test(nums)) return false;

  // Valida primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(nums[i]) * (10 - i);
  let dig1 = (soma * 10) % 11;
  if (dig1 === 10 || dig1 === 11) dig1 = 0;
  if (dig1 !== parseInt(nums[9])) return false;

  // Valida segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(nums[i]) * (11 - i);
  let dig2 = (soma * 10) % 11;
  if (dig2 === 10 || dig2 === 11) dig2 = 0;
  return dig2 === parseInt(nums[10]);
}

// Função para sanitizar entrada (proteção XSS)
function sanitizar(texto) {
  if (typeof texto !== 'string') return texto;
  return texto.replace(/[<>'"]/g, '');
}

// -----------------------------------------------
// GET /profissionais — Lista todos os profissionais
// -----------------------------------------------
router.get('/', verificarToken, (req, res) => {
  db.all('SELECT * FROM profissionais ORDER BY nome ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar profissionais.' });
    res.json({ sucesso: true, total: rows.length, profissionais: rows });
  });
});

// -----------------------------------------------
// GET /profissionais/:id — Busca profissional por ID
// -----------------------------------------------
router.get('/:id', verificarToken, (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM profissionais WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar profissional.' });
    if (!row) return res.status(404).json({ erro: 'Profissional não encontrado.' });
    res.json({ sucesso: true, profissional: row });
  });
});

// -----------------------------------------------
// POST /profissionais — Cadastra novo profissional
// -----------------------------------------------
router.post('/', verificarToken, (req, res) => {
  let { nome, cpf, crm_coren, especialidade, telefone, email } = req.body;

  // Validações
  if (!nome || !cpf || !crm_coren || !especialidade) {
    return res.status(400).json({ erro: 'Campos obrigatórios: nome, cpf, crm_coren, especialidade.' });
  }

  if (!validarCPF(cpf)) {
    return res.status(400).json({ erro: 'CPF inválido. Tente novamente.' });
  }

  // Sanitização contra XSS
  nome = sanitizar(nome);
  especialidade = sanitizar(especialidade);
  crm_coren = sanitizar(crm_coren);

  const sql = `
    INSERT INTO profissionais (nome, cpf, crm_coren, especialidade, telefone, email)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [nome, cpf, crm_coren, especialidade, telefone, email], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(409).json({ erro: 'CPF já cadastrado no sistema.' });
      }
      return res.status(500).json({ erro: 'Erro ao cadastrar profissional.' });
    }

    // Log de auditoria (LGPD)
    db.run(
      `INSERT INTO logs_auditoria (usuario_id, acao, tabela, registro_id, detalhes) VALUES (?, ?, ?, ?, ?)`,
      [req.usuario.id, 'INSERT', 'profissionais', this.lastID, `Profissional ${nome} cadastrado`]
    );

    res.status(201).json({ sucesso: true, mensagem: 'Profissional cadastrado com sucesso.', id: this.lastID });
  });
});

// -----------------------------------------------
// PUT /profissionais/:id — Atualiza profissional
// -----------------------------------------------
router.put('/:id', verificarToken, (req, res) => {
  const { id } = req.params;
  let { nome, cpf, crm_coren, especialidade, telefone, email } = req.body;

  if (!nome || !cpf || !crm_coren || !especialidade) {
    return res.status(400).json({ erro: 'Campos obrigatórios: nome, cpf, crm_coren, especialidade.' });
  }

  if (!validarCPF(cpf)) {
    return res.status(400).json({ erro: 'CPF inválido. Tente novamente.' });
  }

  nome = sanitizar(nome);
  especialidade = sanitizar(especialidade);
  crm_coren = sanitizar(crm_coren);

  const sql = `
    UPDATE profissionais SET nome=?, cpf=?, crm_coren=?, especialidade=?, telefone=?, email=?
    WHERE id=?
  `;

  db.run(sql, [nome, cpf, crm_coren, especialidade, telefone, email, id], function(err) {
    if (err) return res.status(500).json({ erro: 'Erro ao atualizar profissional.' });
    if (this.changes === 0) return res.status(404).json({ erro: 'Profissional não encontrado.' });

    // Log de auditoria
    db.run(
      `INSERT INTO logs_auditoria (usuario_id, acao, tabela, registro_id, detalhes) VALUES (?, ?, ?, ?, ?)`,
      [req.usuario.id, 'UPDATE', 'profissionais', id, `Profissional ${nome} atualizado`]
    );

    res.json({ sucesso: true, mensagem: 'Profissional atualizado com sucesso.' });
  });
});

// -----------------------------------------------
// DELETE /profissionais/:id — Remove profissional
// -----------------------------------------------
router.delete('/:id', verificarToken, (req, res) => {
  const { id } = req.params;

  db.get('SELECT nome FROM profissionais WHERE id = ?', [id], (err, row) => {
    if (!row) return res.status(404).json({ erro: 'Profissional não encontrado.' });

    db.run('DELETE FROM profissionais WHERE id = ?', [id], function(err) {
      if (err) return res.status(500).json({ erro: 'Erro ao remover profissional.' });

      // Log de auditoria
      db.run(
        `INSERT INTO logs_auditoria (usuario_id, acao, tabela, registro_id, detalhes) VALUES (?, ?, ?, ?, ?)`,
        [req.usuario.id, 'DELETE', 'profissionais', id, `Profissional ${row.nome} removido`]
      );

      res.json({ sucesso: true, mensagem: 'Profissional removido com sucesso.' });
    });
  });
});

module.exports = router;
