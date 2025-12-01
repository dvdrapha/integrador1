import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  db.all('SELECT * FROM epis', (err, rows) => {
    if (err) {
      console.error('Erro ao listar EPIs:', err);
      return res.status(500).json({ message: 'Erro ao listar EPIs.' });
    }
    return res.json(rows);
  });
});

router.post('/', (req, res) => {
  const {
    nome,
    categoria,
    validade,
    fabricante,
    ca,
    foto_url,
    descricao,
    quantidade_total,
  } = req.body;

  if (!nome) {
    return res.status(400).json({ message: 'Nome é obrigatório.' });
  }

  let total = parseInt(quantidade_total, 10);
  if (Number.isNaN(total) || total < 0) {
    total = 0;
  }

  const stmt = db.prepare(
    `INSERT INTO epis (
      nome, categoria, validade, fabricante, ca, foto_url, descricao,
      quantidade_total, quantidade_disponivel
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  stmt.run(
    nome,
    categoria || null,
    validade || null,
    fabricante || null,
    ca || null,
    foto_url || null,
    descricao || null,
    total,
    total,
    function (err) {
      if (err) {
        console.error('Erro ao criar EPI:', err);
        return res.status(500).json({ message: 'Erro ao criar EPI.' });
      }

      db.get('SELECT * FROM epis WHERE id = ?', [this.lastID], (selectErr, epi) => {
        if (selectErr) {
          console.error('Erro ao buscar EPI criado:', selectErr);
          return res.status(500).json({ message: 'Erro ao criar EPI.' });
        }
        return res.status(201).json(epi);
      });
    },
  );

  stmt.finalize();
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM epis WHERE id = ?', [id], function (err) {
    if (err) {
      if (err.message && err.message.includes('FOREIGN KEY constraint failed')) {
        return res
          .status(400)
          .json({ message: 'Não é possível excluir um EPI que possui registros de uso.' });
      }
      console.error('Erro ao excluir EPI:', err);
      return res.status(500).json({ message: 'Erro ao excluir EPI.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'EPI não encontrado.' });
    }

    return res.json({ message: 'EPI excluído com sucesso.' });
  });
});

export default router;
