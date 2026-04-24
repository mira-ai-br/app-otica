#!/bin/sh
set -e
echo "[start] Rodando migrations..."
alembic upgrade head
echo "[start] Migrations OK. Iniciando uvicorn na porta $PORT..."
exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT" --log-level info
