import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { db, initDatabase } from './db.js';
import authRoutes from './routes/auth.js';
import episRoutes from './routes/epis.js';
import funcionariosRoutes from './routes/funcionarios.js';
import episUsoRoutes from './routes/episUso.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

initDatabase()
  .then(() => {
    console.log('Banco de dados inicializado.');
  })
  .catch((err) => {
    console.error('Erro ao inicializar o banco de dados:', err);
  });

app.get('/api/health', (req, res) => {
  db.get('SELECT 1 as ok', (err, row) => {
    if (err) {
      console.error('Erro na verificação de saúde do banco:', err);
      return res.status(500).json({ status: 'error', db: 0 });
    }
    return res.json({ status: 'ok', db: row.ok });
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/epis', episRoutes);
app.use('/api/funcionarios', funcionariosRoutes);
app.use('/api/epis-uso', episUsoRoutes);

app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});
