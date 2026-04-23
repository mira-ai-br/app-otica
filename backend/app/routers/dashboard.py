from datetime import datetime, timedelta
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends, Query
from app.database import get_db
from app.models import Customer, Sale

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/kpis")
async def get_kpis(
    from_date: datetime = Query(default_factory=lambda: datetime.utcnow().replace(day=1)),
    to_date: datetime = Query(default_factory=datetime.utcnow),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(
            func.count(Sale.id).label("num_vendas"),
            func.coalesce(func.sum(Sale.valor_total), 0).label("faturamento"),
            func.coalesce(func.avg(Sale.valor_total), 0).label("ticket_medio"),
        ).where(and_(Sale.created_at >= from_date, Sale.created_at <= to_date))
    )
    row = result.one()

    novos = (await db.execute(
        select(func.count(Customer.id)).where(Customer.created_at >= from_date)
    )).scalar()

    return {
        "num_vendas": row.num_vendas,
        "faturamento": float(row.faturamento),
        "ticket_medio": float(row.ticket_medio),
        "novos_clientes": novos,
    }


@router.get("/segments")
async def get_segments(db: AsyncSession = Depends(get_db)):
    cutoff_inativo = datetime.utcnow() - timedelta(days=365)
    result = await db.execute(
        select(Customer.id, func.max(Sale.created_at).label("ultima_compra"), func.count(Sale.id).label("num"))
        .outerjoin(Sale).group_by(Customer.id)
    )
    rows = result.all()
    counts = {"novo": 0, "recorrente": 0, "inativo": 0}
    for _, ultima, num in rows:
        if ultima and ultima < cutoff_inativo:
            counts["inativo"] += 1
        elif num >= 2:
            counts["recorrente"] += 1
        else:
            counts["novo"] += 1
    return counts


@router.get("/reactivation")
async def get_reactivation_suggestions(db: AsyncSession = Depends(get_db)):
    cutoff = datetime.utcnow() - timedelta(days=365)
    result = await db.execute(
        select(
            Customer,
            func.max(Sale.created_at).label("ultima_compra"),
            func.coalesce(func.sum(Sale.valor_total), 0).label("total_gasto"),
        )
        .join(Sale)
        .group_by(Customer.id)
        .having(func.max(Sale.created_at) < cutoff)
        .order_by(func.sum(Sale.valor_total).desc())
        .limit(10)
    )
    rows = result.all()
    return [
        {"id": c.id, "nome": c.nome, "telefone": c.telefone, "ultima_compra": uc, "total_gasto": float(tg)}
        for c, uc, tg in rows
    ]
