const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'sghss.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('✅ Conectado ao banco de dados SQLite.');
  }
});

// Criação das tabelas
db.serialize(() => {

  // Tabela de usuários (para login)
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      perfil TEXT NOT NULL DEFAULT 'admin',
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de pacientes
  db.run(`
    CREATE TABLE IF NOT EXISTS pacientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cpf TEXT UNIQUE NOT NULL,
      data_nascimento TEXT NOT NULL,
      telefone TEXT,
      email TEXT,
      endereco TEXT,
      historico_clinico TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de profissionais
  db.run(`
    CREATE TABLE IF NOT EXISTS profissionais (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cpf TEXT UNIQUE NOT NULL,
      crm_coren TEXT NOT NULL,
      especialidade TEXT NOT NULL,
      telefone TEXT,
      email TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de log de auditoria (LGPD)
  db.run(`
    CREATE TABLE IF NOT EXISTS logs_auditoria (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER,
      acao TEXT NOT NULL,
      tabela TEXT NOT NULL,
      registro_id INTEGER,
      detalhes TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Tabelas criadas/verificadas com sucesso.');
});

module.exports = db;
