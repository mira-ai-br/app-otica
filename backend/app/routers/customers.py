from datetime import datetime, timedelta
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends, HTTPException, Query
from app.database import get_db
from app.models import Customer, Sale, WhatsappMessage
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerOut, CustomerList

router = APIRouter(prefix="/api/customers", tags=["customers"])


def _segmento(num_compras: int, ultima_compra: datetime | None) -> str:
    if ultima_compra and (datetime.utcnow() - ultima_compra).days > 365:
        return "inativo"
    if num_compras >= 2:
        return "recorrente"
    return "novo"


@router.get("", response_model=list[CustomerList])
async def list_customers(
    q: str | None = Query(None),
    segment: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(
        Customer,
        func.count(Sale.id).label("num_compras"),
        func.coalesce(func.sum(Sale.valor_total), 0).label("total_gasto"),
        func.max(Sale.created_at).label("ultima_compra"),
    ).outerjoin(Sale).group_by(Customer.id).order_by(desc(Customer.created_at))

    if q:
        stmt = stmt.where(Customer.nome.ilike(f"%{q}%") | Customer.telefone.contains(q))

    result = await db.execute(stmt)
    rows = result.all()

    customers = []
    for row in rows:
        c, num_compras, total_gasto, ultima_compra = row
        seg = _segmento(num_compras, ultima_compra)
        if segment and seg != segment:
            continue
        customers.append(CustomerList(
            id=c.id, nome=c.nome, telefone=c.telefone,
            total_gasto=float(total_gasto), num_compras=num_compras,
            ultima_compra=ultima_compra, segmento=seg,
        ))
    return customers


@router.post("", response_model=CustomerOut, status_code=201)
async def create_customer(payload: CustomerCreate, db: AsyncSession = Depends(get_db)):
    customer = Customer(**payload.model_dump())
    db.add(customer)
    await db.commit()
    await db.refresh(customer)
    return CustomerOut(segmento="novo", **{k: getattr(customer, k) for k in CustomerOut.model_fields if hasattr(customer, k)})


@router.get("/{id}", response_model=CustomerOut)
async def get_customer(id: int, db: AsyncSession = Depends(get_db)):
    customer = await db.get(Customer, id)
    if not customer:
        raise HTTPException(404, "Cliente não encontrado")
    result = await db.execute(
        select(func.count(Sale.id), func.coalesce(func.sum(Sale.valor_total), 0), func.max(Sale.created_at))
        .where(Sale.customer_id == id)
    )
    num_compras, total_gasto, ultima_compra = result.one()
    seg = _segmento(num_compras, ultima_compra)
    return CustomerOut(
        **{k: getattr(customer, k) for k in ["id", "nome", "telefone", "cpf", "data_nascimento", "email", "observacoes", "created_at"]},
        total_gasto=float(total_gasto), num_compras=num_compras,
        ultima_compra=ultima_compra, segmento=seg,
    )


@router.patch("/{id}", response_model=CustomerOut)
async def update_customer(id: int, payload: CustomerUpdate, db: AsyncSession = Depends(get_db)):
    customer = await db.get(Customer, id)
    if not customer:
        raise HTTPException(404, "Cliente não encontrado")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(customer, field, value)
    await db.commit()
    await db.refresh(customer)
    return await get_customer(id, db)


@router.delete("/{id}", status_code=204)
async def delete_customer(id: int, db: AsyncSession = Depends(get_db)):
    customer = await db.get(Customer, id)
    if not customer:
        raise HTTPException(404, "Cliente não encontrado")
    await db.delete(customer)
    await db.commit()


@router.get("/{id}/timeline")
async def get_timeline(id: int, db: AsyncSession = Depends(get_db)):
    from app.models import Appointment
    sales = (await db.execute(select(Sale).where(Sale.customer_id == id).order_by(desc(Sale.created_at)))).scalars().all()
    appointments = (await db.execute(select(Appointment).where(Appointment.customer_id == id).order_by(desc(Appointment.data_hora)))).scalars().all()
    messages = (await db.execute(select(WhatsappMessage).where(WhatsappMessage.customer_id == id).order_by(desc(WhatsappMessage.enviado_em)))).scalars().all()

    timeline = []
    for s in sales:
        timeline.append({"tipo": "venda", "data": s.created_at, "valor": float(s.valor_total), "id": s.id})
    for a in appointments:
        timeline.append({"tipo": "agendamento", "data": a.data_hora, "status": a.status, "id": a.id})
    for m in messages:
        timeline.append({"tipo": "whatsapp", "data": m.enviado_em, "template": m.tipo, "status": m.status})

    timeline.sort(key=lambda x: x["data"], reverse=True)
    return timeline
