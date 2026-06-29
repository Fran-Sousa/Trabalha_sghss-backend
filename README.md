# 🏥 SGHSS — Sistema de Gestão Hospitalar e de Serviços de Saúde

![Node.js](https://img.shields.io/badge/Node.js-20.x_LTS-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-4.x-000000?style=flat-square&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3.x-003B57?style=flat-square&logo=sqlite&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![LGPD](https://img.shields.io/badge/LGPD-Compliant-blue?style=flat-square)
![Status](https://img.shields.io/badge/Status-Concluído-brightgreen?style=flat-square)

> API RESTful desenvolvida em Node.js para o gerenciamento seguro de pacientes e profissionais de saúde da instituição **VidaPlus**, com autenticação JWT, proteção contra XSS e conformidade com a LGPD.

**Projeto Multidisciplinar — UNINTER | Curso de Tecnologia em Análise e Desenvolvimento de Sistemas**  
Aluna: Francilene Sousa Santos — RU: 3508361

---

## 📋 Sumário

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Execução](#-instalação-e-execução)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Endpoints da API](#-endpoints-da-api)
- [Segurança e LGPD](#-segurança-e-lgpd)
- [Plano de Testes](#-plano-de-testes)
- [Autora](#-autora)

---

## 📌 Sobre o Projeto

O **SGHSS** é o back-end do Sistema de Gestão Hospitalar e de Serviços de Saúde, desenvolvido para a instituição fictícia **VidaPlus**, que administra uma rede complexa de hospitais, clínicas, laboratórios e equipes de home care.

O sistema fornece uma API REST segura para centralizar o gerenciamento de usuários, pacientes e profissionais de saúde, substituindo sistemas fragmentados por uma solução unificada e auditável.

---

## ✅ Funcionalidades

- 🔐 Autenticação segura com **JWT** (Login e Cadastro de usuários)
- 👤 **CRUD completo** de Pacientes
- 👨‍⚕️ **CRUD completo** de Profissionais de Saúde
- ✅ Validação de **CPF** com cálculo de dígitos verificadores
- 🛡️ Proteção contra ataques **XSS** via sanitização de entradas
- 🔒 Senhas armazenadas com **hash bcrypt**
- 📋 **Log de auditoria** automático em conformidade com a LGPD
- 🚫 Controle de acesso por **perfil (RBAC)**

---

## 🛠 Tecnologias

| Tecnologia | Versão | Finalidade |
|---|---|---|
| Node.js | 20.x LTS | Ambiente de execução JavaScript server-side |
| Express.js | 4.x | Framework para criação de APIs REST |
| SQLite3 | 5.x (npm) | Banco de dados relacional embarcado |
| jsonwebtoken | 9.x | Autenticação stateless com tokens JWT |
| bcryptjs | 2.x | Hash seguro de senhas |
| xss | 1.x | Sanitização de entradas contra XSS |
| dotenv | 16.x | Gerenciamento de variáveis de ambiente |

---

## 📁 Estrutura do Projeto

```
SGHSS-BACKEND/
├── node_modules/        # Dependências instaladas pelo NPM
├── routes/              # Definição das rotas da API
├── auth.js              # Implementação da autenticação JWT
├── database.js          # Configuração e conexão com SQLite
├── package.json         # Dependências e scripts do projeto
├── package-lock.json    # Controle de versões das dependências
├── README.md            # Documentação do projeto
├── server.js            # Ponto de entrada da aplicação
└── sghss.db             # Banco de dados SQLite (gerado automaticamente)
```

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) v20.x ou superior
- [npm](https://www.npmjs.com/) v9.x ou superior
- [Git](https://git-scm.com/)
- [Postman](https://www.postman.com/) *(opcional, para testar os endpoints)*

---

## 🚀 Instalação e Execução

### 1. Clone o repositório

```bash
git clone https://github.com/Fran-Sousa/Trabalha_sghss-backend.git
cd Trabalha_sghss-backend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com base no exemplo abaixo:

```env
JWT_SECRET=sua_chave_secreta_aqui
PORT=3000
```

### 4. Inicie o servidor

```bash
node server.js
```

O servidor estará disponível em: `http://localhost:3000`

---

## 🔑 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|---|---|---|
| `JWT_SECRET` | Chave secreta para geração dos tokens JWT | `minha_chave_super_secreta` |
| `PORT` | Porta em que o servidor irá rodar | `3000` |

---

## 📡 Endpoints da API

### Autenticação

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/auth/cadastro` | Cadastro de novo usuário | ❌ |
| POST | `/auth/login` | Login e geração de token JWT | ❌ |

**Exemplo — POST `/auth/login`:**
```json
// Request
{
  "email": "admin@vidaplus.com",
  "senha": "Admin@2025"
}

// Response 200 OK
{
  "sucesso": true,
  "mensagem": "Login realizado com sucesso.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Pacientes

> ⚠️ Todos os endpoints abaixo requerem o header: `Authorization: Bearer <token>`

| Método | Rota | Descrição |
|---|---|---|
| GET | `/pacientes` | Listar todos os pacientes |
| GET | `/pacientes/:id` | Buscar paciente por ID |
| POST | `/pacientes` | Cadastrar novo paciente |
| PUT | `/pacientes/:id` | Atualizar dados do paciente |
| DELETE | `/pacientes/:id` | Excluir paciente |

**Exemplo — POST `/pacientes`:**
```json
// Request
{
  "nome": "Maria Silva",
  "cpf": "529.982.247-25",
  "data_nascimento": "1985-03-17",
  "telefone": "(11) 98765-4321",
  "email": "maria@email.com",
  "endereco": "Rua das Flores, 100 - São Paulo/SP",
  "historico_clinico": "Paciente em acompanhamento regular."
}

// Response 201 Created
{
  "sucesso": true,
  "mensagem": "Paciente cadastrado com sucesso.",
  "id": 1
}
```

---

### Profissionais de Saúde

> ⚠️ Todos os endpoints abaixo requerem o header: `Authorization: Bearer <token>`

| Método | Rota | Descrição |
|---|---|---|
| GET | `/profissionais` | Listar todos os profissionais |
| GET | `/profissionais/:id` | Buscar profissional por ID |
| POST | `/profissionais` | Cadastrar novo profissional |
| PUT | `/profissionais/:id` | Atualizar profissional |
| DELETE | `/profissionais/:id` | Excluir profissional |

---

## 🔒 Segurança e LGPD

O sistema implementa múltiplas camadas de segurança:

- **JWT** — Autenticação stateless; rotas protegidas exigem token válido no header `Authorization`
- **bcrypt** — Senhas armazenadas com hash criptográfico (salt rounds ≥ 10), impossibilitando recuperação do valor original
- **XSS Protection** — Todas as entradas textuais são sanitizadas antes do armazenamento
- **Validação de CPF** — Cálculo completo dos dígitos verificadores antes do cadastro
- **Log de Auditoria (LGPD)** — Cada operação de INSERT, UPDATE ou DELETE gera automaticamente um registro na tabela `logs_auditoria`, armazenando usuário responsável, ação, tabela afetada e timestamp

---

## 🧪 Plano de Testes

Os testes foram realizados via **Postman**. Todos os 15 casos de teste foram aprovados (100%).

| ID | Caso de Teste | Resultado |
|---|---|---|
| CT01 | Cadastrar usuário com dados válidos | ✅ 201 Created |
| CT02 | Login com credenciais válidas | ✅ 200 OK + Token JWT |
| CT03 | Cadastrar paciente com CPF válido | ✅ 201 Created |
| CT04 | Listar pacientes autenticado | ✅ 200 OK |
| CT05 | Buscar paciente por ID | ✅ 200 OK |
| CT06 | Atualizar paciente existente | ✅ 200 OK |
| CT07 | Cadastrar paciente com CPF inválido | ✅ 400 Bad Request |
| CT08 | Excluir paciente existente | ✅ 200 OK |
| CT09 | Cadastrar profissional válido | ✅ 201 Created |
| CT10 | Listar profissionais autenticado | ✅ 200 OK |
| CT11 | Buscar profissional por ID | ✅ 200 OK |
| CT12 | Atualizar profissional existente | ✅ 200 OK |
| CT13 | Excluir profissional existente | ✅ 200 OK |
| CT14 | Acessar rota protegida sem token | ✅ 401 Unauthorized |
| CT15 | Proteção contra XSS | ✅ Script sanitizado |

---

## 👩‍💻 Autora

**Francilene Sousa Santos**  
RU: 3508361  
Curso de Tecnologia em Análise e Desenvolvimento de Sistemas — UNINTER  
Polo: Parauapebas — PA  

---

*Projeto desenvolvido para fins acadêmicos — UNINTER 2026*
