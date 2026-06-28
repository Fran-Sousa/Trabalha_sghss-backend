const jwt = require('jsonwebtoken');

const SEGREDO = 'sghss_vidaplus_segredo_2025';

// Gera um token JWT para o usuário logado
function gerarToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil
    },
    SEGREDO,
    { expiresIn: '8h' }
  );
}

// Middleware: verifica se o token é válido antes de acessar rotas protegidas
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer TOKEN

  if (!token) {
    return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
  }

  jwt.verify(token, SEGREDO, (err, usuario) => {
    if (err) {
      return res.status(403).json({ erro: 'Token inválido ou expirado.' });
    }
    req.usuario = usuario;
    next();
  });
}

module.exports = { gerarToken, verificarToken };
