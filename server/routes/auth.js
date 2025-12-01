import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';

const router = express.Router();

router.post('/register', (req, res) => {
  console.log('[/api/auth/register] Corpo recebido:', req.body);
  const { empresa, nome, email, password } = req.body || {};

  const nomeValido = typeof nome === 'string' && nome.trim() !== '';
  const emailValido = typeof email === 'string' && email.trim() !== '';
  const senhaValida = typeof password === 'string' && password.trim() !== '';

  if (!nomeValido || !emailValido || !senhaValida) {
    return res.status(400).json({ message: 'Nome, e-mail e senha são obrigatórios.' });
  }

  db.get('SELECT id FROM usuarios WHERE email = ?', [email], (err, row) => {
    if (err) {
      console.error('Erro ao verificar usuário:', err);
      return res.status(500).json({ message: 'Erro ao verificar usuário.' });
    }

    if (row) {
      return res.status(409).json({ message: 'E-mail já cadastrado.' });
    }

    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (hashErr, hashedPassword) => {
      if (hashErr) {
        console.error('Erro ao gerar hash da senha:', hashErr);
        return res.status(500).json({ message: 'Erro ao registrar usuário.' });
      }

      const stmt = db.prepare(
        'INSERT INTO usuarios (empresa, nome, email, senha_hash) VALUES (?, ?, ?, ?)',
      );
      stmt.run(empresa || null, nome, email, hashedPassword, function (runErr) {
        if (runErr) {
          console.error('Erro ao inserir usuário:', runErr);
          return res.status(500).json({ message: 'Erro ao registrar usuário.' });
        }

        db.get('SELECT id, empresa, nome, email, role FROM usuarios WHERE id = ?', [
          this.lastID,
        ], (selectErr, user) => {
          if (selectErr) {
            console.error('Erro ao buscar usuário criado:', selectErr);
            return res.status(500).json({ message: 'Erro ao registrar usuário.' });
          }
          return res.status(201).json({
            message: 'Conta criada com sucesso',
            user,
          });
        });
      });
      stmt.finalize();
    });
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
  }

  db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, user) => {
    if (err) {
      console.error('Erro ao buscar usuário:', err);
      return res.status(500).json({ message: 'Erro ao realizar login.' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    bcrypt.compare(password, user.senha_hash, (compareErr, isMatch) => {
      if (compareErr) {
        console.error('Erro ao comparar senha:', compareErr);
        return res.status(500).json({ message: 'Erro ao realizar login.' });
      }

      if (!isMatch) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      const { id, empresa, nome, email: userEmail, role } = user;
      return res.json({
        message: 'Login realizado com sucesso',
        user: { id, empresa, nome, email: userEmail, role },
      });
    });
  });
});

export default router;
