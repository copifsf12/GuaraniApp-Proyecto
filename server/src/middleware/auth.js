const supabaseAuth = require('../authClient');

/**
 * Espera un header: Authorization: Bearer <access_token>
 * (el access_token es el que devuelve /auth/login o /auth/register)
 * Si es válido, agrega req.user = { id, email, ... }
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Falta el token de sesión (Authorization: Bearer ...)' });
  }

  if (!supabaseAuth) {
    return res.status(500).json({ success: false, message: 'Autenticación no configurada en el servidor' });
  }

  const { data, error } = await supabaseAuth.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ success: false, message: 'Sesión inválida o expirada, vuelve a iniciar sesión' });
  }

  req.user = data.user;
  next();
}

module.exports = requireAuth;