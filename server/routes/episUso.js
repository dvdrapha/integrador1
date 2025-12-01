import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  const query = `
    SELECT
      eu.id,
      eu.funcionario_id,
      eu.epi_id,
      f.nome AS funcionario_nome,
      e.nome AS epi_nome,
      eu.data_entrega,
      eu.data_devolucao,
      eu.observacoes
    FROM epis_em_uso eu
    JOIN funcionarios f ON eu.funcionario_id = f.id
    JOIN epis e ON eu.epi_id = e.id
  `;

  db.all(query, (err, rows) => {
    if (err) {
      console.error('Erro ao listar EPIs em uso:', err);
      return res.status(500).json({ message: 'Erro ao listar EPIs em uso.' });
    }
    return res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { funcionario_id, epi_id, observacoes } = req.body;

  if (!funcionario_id || !epi_id) {
    return res.status(400).json({ message: 'funcionario_id e epi_id são obrigatórios.' });
  }

  db.get('SELECT * FROM epis WHERE id = ?', [epi_id], (err, epi) => {
    if (err) {
      console.error('Erro ao buscar EPI:', err);
      return res.status(500).json({ message: 'Erro ao registrar uso de EPI.' });
    }

    if (!epi) {
      return res.status(404).json({ message: 'EPI não encontrado.' });
    }

    if ((epi.quantidade_disponivel || 0) <= 0) {
      return res
        .status(400)
        .json({ message: 'Não há quantidade disponível para este EPI.' });
    }

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      const insertStmt = db.prepare(
        'INSERT INTO epis_em_uso (funcionario_id, epi_id, observacoes) VALUES (?, ?, ?)',
      );

      insertStmt.run(
        funcionario_id,
        epi_id,
        observacoes || null,
        function (insertErr) {
          if (insertErr) {
            console.error('Erro ao inserir EPI em uso:', insertErr);
            db.run('ROLLBACK');
            return res.status(500).json({ message: 'Erro ao registrar uso de EPI.' });
          }

          const usoId = this.lastID;

          db.run(
            'UPDATE epis SET quantidade_disponivel = quantidade_disponivel - 1 WHERE id = ?',
            [epi_id],
            (updateErr) => {
              if (updateErr) {
                console.error('Erro ao atualizar quantidade de EPI:', updateErr);
                db.run('ROLLBACK');
                return res.status(500).json({ message: 'Erro ao registrar uso de EPI.' });
              }

              db.run('COMMIT', (commitErr) => {
                if (commitErr) {
                  console.error('Erro ao confirmar transação:', commitErr);
                  return res.status(500).json({ message: 'Erro ao registrar uso de EPI.' });
                }

                const selectQuery = `
                  SELECT
                    eu.id,
                    eu.funcionario_id,
                    eu.epi_id,
                    f.nome AS funcionario_nome,
                    e.nome AS epi_nome,
                    eu.data_entrega,
                    eu.data_devolucao,
                    eu.observacoes
                  FROM epis_em_uso eu
                  JOIN funcionarios f ON eu.funcionario_id = f.id
                  JOIN epis e ON eu.epi_id = e.id
                  WHERE eu.id = ?
                `;

                db.get(selectQuery, [usoId], (selectErr, row) => {
                  if (selectErr) {
                    console.error('Erro ao buscar registro de uso criado:', selectErr);
                    return res
                      .status(500)
                      .json({ message: 'Erro ao registrar uso de EPI.' });
                  }

                  return res.status(201).json(row);
                });
              });
            },
          );
        },
      );

      insertStmt.finalize();
    });
  });
});

router.post('/:id/devolver', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM epis_em_uso WHERE id = ?', [id], (err, uso) => {
    if (err) {
      console.error('Erro ao buscar registro de uso:', err);
      return res.status(500).json({ message: 'Erro ao registrar devolução.' });
    }

    if (!uso) {
      return res.status(404).json({ message: 'Registro de uso não encontrado.' });
    }

    if (uso.data_devolucao) {
      return res.status(400).json({ message: 'Este EPI já foi devolvido.' });
    }

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      db.run(
        'UPDATE epis_em_uso SET data_devolucao = CURRENT_TIMESTAMP WHERE id = ?',
        [id],
        (updateUsoErr) => {
          if (updateUsoErr) {
            console.error('Erro ao atualizar registro de uso:', updateUsoErr);
            db.run('ROLLBACK');
            return res.status(500).json({ message: 'Erro ao registrar devolução.' });
          }

          db.run(
            'UPDATE epis SET quantidade_disponivel = quantidade_disponivel + 1 WHERE id = ?',
            [uso.epi_id],
            (updateEpiErr) => {
              if (updateEpiErr) {
                console.error('Erro ao atualizar quantidade de EPI:', updateEpiErr);
                db.run('ROLLBACK');
                return res.status(500).json({ message: 'Erro ao registrar devolução.' });
              }

              db.run('COMMIT', (commitErr) => {
                if (commitErr) {
                  console.error('Erro ao confirmar transação:', commitErr);
                  return res.status(500).json({ message: 'Erro ao registrar devolução.' });
                }

                return res.json({ message: 'Devolução registrada com sucesso.' });
              });
            },
          );
        },
      );
    });
  });
});

export default router;
