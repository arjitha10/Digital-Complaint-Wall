const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key_change_in_production');
    req.user = payload; // { id, role, name, email }
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Optional auth: if token exists and is valid, attach req.user; otherwise continue
function optionalAuthenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key_change_in_production');
    req.user = payload; // { id, role, name, email }
  } catch (err) {
    // ignore invalid token for optional auth
  }
  return next();
}

function requireRole(role) {
  return function (req, res, next) {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return next();
  };
}

module.exports = { authenticate, optionalAuthenticate, requireRole };


