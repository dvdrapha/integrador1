# Backend e Frontend - Protector Dash

## Instalação de dependências

```bash
npm install
```

## Rodando o backend (Node + Express + SQLite)

- O backend está na pasta `server/`.
- Banco de dados: arquivo SQLite em `server/database.sqlite` (criado automaticamente).
- Porta padrão: `3000` (pode ser alterada via `.env`).

### Scripts

```bash
npm run server
```

Isso irá iniciar o servidor em `http://localhost:3000`.

## Rodando o frontend (React + Vite)

O frontend já está configurado em `src/`.

Para rodar o frontend:

```bash
npm run dev
```

Por padrão o Vite sobe em `http://localhost:5173`.

O Vite deve estar configurado com proxy para `/api` apontando para `http://localhost:3000`.

- Acesse o frontend em: `http://localhost:5173`
- As chamadas para `/api/...` serão redirecionadas para o backend na porta 3000.

## Rotas principais do backend

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/epis`
- `POST /api/epis`
- `GET /api/funcionarios`
- `POST /api/funcionarios`
- `GET /api/epis-uso`
- `POST /api/epis-uso`
- `POST /api/epis-uso/:id/devolver`
