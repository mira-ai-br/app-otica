#!/bin/sh
echo "[start] PORT=$PORT"
echo "[start] Rodando migrations..."
alembic upgrade head
echo "[start] Migracao retornou: $?"
echo "[start] Iniciando uvicorn na porta ${PORT:-8000}..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" --log-level debug
