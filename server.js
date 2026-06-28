const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./database');
const { gerarToken, verificarToken } = require('./auth');

const app = express();
const PORTA = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// -----------------------------------------------
// ROTAS DE AUTENTICAÇÃO
// -----------------------------------------------

// POST /auth/cadastro — Cria um novo usuário no sistema
app.post('/auth/cadastro', async (req, res) => {
  const { nome, email, senha, perfil } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Campos obrigatórios: nome, email, senha.' });
  }

  try {
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const sql = `INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)`;
    db.run(sql, [nome, email, senhaCriptografada, perfil || 'admin'], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(409).json({ erro: 'E-mail já cadastrado.' });
        }
        return res.status(500).json({ erro: 'Erro ao cadastrar usuário.' });
      }
      res.status(201).json({ sucesso: true, mensagem: 'Usuário cadastrado com sucesso.', id: this.lastID });
    });
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// POST /auth/login — Faz login e retorna o token JWT
app.post('/auth/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Informe e-mail e senha.' });
  }

  db.get('SELECT * FROM usuarios WHERE email = ?', [email], async (err, usuario) => {
    if (err) return res.status(500).json({ erro: 'Erro interno.' });
    if (!usuario) return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });

    const token = gerarToken(usuario);
    res.json({
      sucesso: true,
      mensagem: 'Login realizado com sucesso.',
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil }
    });
  });
});

// -----------------------------------------------
// ROTAS PRINCIPAIS
// -----------------------------------------------
const rotasPacientes = require('./routes/pacientes');
const rotasProfissionais = require('./routes/profissionais');

app.use('/pacientes', rotasPacientes);
app.use('/profissionais', rotasProfissionais);

// -----------------------------------------------
// GET / — Rota raiz (verifica se API está online)
// -----------------------------------------------
app.get('/', (req, res) => {
  res.json({
    sistema: 'SGHSS - Sistema de Gestão Hospitalar e de Serviços de Saúde',
    versao: '1.0.0',
    status: 'online',
    instituicao: 'VidaPlus',
    endpoints: [
      'POST /auth/cadastro',
      'POST /auth/login',
      'GET  /pacientes',
      'POST /pacientes',
      'GET  /pacientes/:id',
      'PUT  /pacientes/:id',
      'DELETE /pacientes/:id',
      'GET  /profissionais',
      'POST /profissionais',
      'GET  /profissionais/:id',
      'PUT  /profissionais/:id',
      'DELETE /profissionais/:id'
    ]
  });
});

// -----------------------------------------------
// Inicia o servidor
// -----------------------------------------------
app.listen(PORTA, () => {
  console.log(`✅ Servidor SGHSS rodando em http://localhost:${PORTA}`);
  console.log(`📋 Endpoints disponíveis em http://localhost:${PORTA}/`);
});
