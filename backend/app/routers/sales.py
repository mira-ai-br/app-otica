from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from app.database import get_db
from app.models import Sale, SalePhoto
from app.services.storage import upload_photo

router = APIRouter(prefix="/api/sales", tags=["sales"])


@router.post("", status_code=201)
async def create_sale(
    customer_id: int = Form(...),
    valor_total: Decimal = Form(...),
    forma_pagamento: str = Form(...),
    parcelas: int = Form(1),
    grau_od: str | None = Form(None),
    grau_oe: str | None = Form(None),
    observacoes: str | None = Form(None),
    appointment_id: int | None = Form(None),
    foto_oculos: UploadFile | None = File(None),
    foto_nota: UploadFile | None = File(None),
    foto_os: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
):
    sale = Sale(
        customer_id=customer_id,
        appointment_id=appointment_id,
        valor_total=valor_total,
        forma_pagamento=forma_pagamento,
        parcelas=parcelas,
        grau_od=grau_od,
        grau_oe=grau_oe,
        observacoes=observacoes,
    )
    db.add(sale)
    await db.flush()

    photos_map = {"oculos": foto_oculos, "nota_fiscal": foto_nota, "ordem_servico": foto_os}
    for tipo, file in photos_map.items():
        if file:
            url = await upload_photo(file, f"sales/{sale.id}/{tipo}")
            db.add(SalePhoto(sale_id=sale.id, tipo=tipo, url=url))

    await db.commit()
    await db.refresh(sale)
    return sale


@router.get("/{id}")
async def get_sale(id: int, db: AsyncSession = Depends(get_db)):
    sale = await db.get(Sale, id)
    if not sale:
        raise HTTPException(404, "Venda não encontrada")
    return sale


@router.get("")
async def list_sales(customer_id: int | None = None, db: AsyncSession = Depends(get_db)):
    stmt = select(Sale).order_by(Sale.created_at.desc())
    if customer_id:
        stmt = stmt.where(Sale.customer_id == customer_id)
    result = await db.execute(stmt)
    return result.scalars().all()
