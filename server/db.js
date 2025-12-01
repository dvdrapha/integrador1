import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

sqlite3.verbose();

const dbPath = path.join(__dirname, 'database.sqlite');

export const db = new sqlite3.Database(dbPath);

export function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('PRAGMA foreign_keys = ON');

      db.run(
        `CREATE TABLE IF NOT EXISTS usuarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          empresa TEXT,
          nome TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          senha_hash TEXT NOT NULL,
          role TEXT DEFAULT 'colaborador',
          criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
      );

      db.run(
        `CREATE TABLE IF NOT EXISTS epis (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          categoria TEXT,
          validade DATE,
          fabricante TEXT,
          ca TEXT,
          foto_url TEXT,
          descricao TEXT,
          quantidade_total INTEGER DEFAULT 0,
          quantidade_disponivel INTEGER DEFAULT 0,
          ativo INTEGER DEFAULT 1,
          criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
      );

      db.run(
        `CREATE TABLE IF NOT EXISTS funcionarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          cpf TEXT UNIQUE,
          setor TEXT,
          criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
      );

      db.run(
        `CREATE TABLE IF NOT EXISTS epis_em_uso (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          funcionario_id INTEGER REFERENCES funcionarios(id),
          epi_id INTEGER REFERENCES epis(id),
          data_entrega DATETIME DEFAULT CURRENT_TIMESTAMP,
          data_devolucao DATETIME,
          observacoes TEXT
        )`,
      );

      db.run(
        `CREATE TABLE IF NOT EXISTS auditoria (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          descricao TEXT NOT NULL,
          tipo TEXT,
          data DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        },
      );
    });
  });
}
