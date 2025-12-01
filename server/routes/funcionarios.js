import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  db.all('SELECT * FROM funcionarios', (err, rows) => {
    if (err) {
      console.error('Erro ao listar funcionários:', err);
      return res.status(500).json({ message: 'Erro ao listar funcionários.' });
    }
    return res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { nome, cpf, setor } = req.body;

  if (!nome) {
    return res.status(400).json({ message: 'Nome é obrigatório.' });
  }

  const stmt = db.prepare(
    'INSERT INTO funcionarios (nome, cpf, setor) VALUES (?, ?, ?)',
  );

  stmt.run(nome, cpf || null, setor || null, function (err) {
    if (err) {
      if (err.message && err.message.includes('UNIQUE constraint failed: funcionarios.cpf')) {
        return res
          .status(409)
          .json({ message: 'Já existe um funcionário cadastrado com este CPF.' });
      }
      console.error('Erro ao criar funcionário:', err);
      return res.status(500).json({ message: 'Erro ao criar funcionário.' });
    }

    db.get('SELECT * FROM funcionarios WHERE id = ?', [this.lastID], (selectErr, func) => {
      if (selectErr) {
        console.error('Erro ao buscar funcionário criado:', selectErr);
        return res.status(500).json({ message: 'Erro ao criar funcionário.' });
      }
      return res.status(201).json(func);
    });
  });

  stmt.finalize();
});

export default router;
