/**
 * Syntropy Backend . Auth controller
 * Simple email/password auth with JWT
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

async function register(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'password must be at least 8 characters.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userId = uuidv4();

  const displayName = normalizedEmail.split('@')[0].replace(/[._-]+/g, ' ');
  db.prepare('INSERT INTO users (id, email, display_name, password_hash) VALUES (?, ?, ?, ?)')
    .run(userId, normalizedEmail, displayName, passwordHash);

  const token = signToken({ id: userId, email: normalizedEmail });
  res.status(201).json({ token, user: { id: userId, email: normalizedEmail, display_name: displayName } });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = signToken(user);
  res.status(200).json({
    token,
    user: { id: user.id, email: user.email, display_name: user.display_name }
  });
}

module.exports = { register, login };
