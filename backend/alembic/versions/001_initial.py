"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-04-23
"""
from alembic import op
import sqlalchemy as sa

revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('customers',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('nome', sa.String(200), nullable=False),
        sa.Column('telefone', sa.String(20), nullable=False, unique=True),
        sa.Column('cpf', sa.String(14), nullable=True, unique=True),
        sa.Column('data_nascimento', sa.Date(), nullable=True),
        sa.Column('sexo', sa.String(30), nullable=True),
        sa.Column('email', sa.String(200), nullable=True),
        sa.Column('observacoes', sa.Text(), nullable=True),
        sa.Column('segmento_manual', sa.String(20), nullable=True),
        sa.Column('primeiro_atendimento', sa.Date(), nullable=True),
        sa.Column('num_compras_anterior', sa.Integer(), server_default='0'),
        sa.Column('total_gasto_anterior', sa.Float(), server_default='0'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('ix_customers_telefone', 'customers', ['telefone'])

    op.create_table('appointments',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('customer_id', sa.Integer(), sa.ForeignKey('customers.id'), nullable=False),
        sa.Column('data_hora', sa.DateTime(), nullable=False),
        sa.Column('duracao_min', sa.Integer(), server_default='30'),
        sa.Column('status', sa.String(20), server_default='agendado'),
        sa.Column('observacoes', sa.Text(), nullable=True),
        sa.Column('origem', sa.String(20), server_default='manual'),  # manual|whatsapp
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('ix_appointments_customer_id', 'appointments', ['customer_id'])
    op.create_index('ix_appointments_data_hora', 'appointments', ['data_hora'])

    op.create_table('sales',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('customer_id', sa.Integer(), sa.ForeignKey('customers.id'), nullable=False),
        sa.Column('appointment_id', sa.Integer(), sa.ForeignKey('appointments.id'), nullable=True),
        sa.Column('valor_total', sa.Numeric(10, 2), nullable=False),
        sa.Column('forma_pagamento', sa.String(30), nullable=False),
        sa.Column('parcelas', sa.Integer(), server_default='1'),
        sa.Column('grau_od', sa.String(100), nullable=True),
        sa.Column('grau_oe', sa.String(100), nullable=True),
        sa.Column('observacoes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('ix_sales_customer_id', 'sales', ['customer_id'])

    op.create_table('sale_photos',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('sale_id', sa.Integer(), sa.ForeignKey('sales.id'), nullable=False),
        sa.Column('tipo', sa.String(20), nullable=False),
        sa.Column('url', sa.String(500), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table('whatsapp_messages',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('customer_id', sa.Integer(), sa.ForeignKey('customers.id'), nullable=False),
        sa.Column('template_name', sa.String(100), nullable=True),
        sa.Column('tipo', sa.String(30), nullable=False),
        sa.Column('corpo', sa.Text(), nullable=True),
        sa.Column('status', sa.String(20), server_default='enviado'),
        sa.Column('external_id', sa.String(100), nullable=True),
        sa.Column('enviado_em', sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table('app_settings',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('nome_otica', sa.String(200), server_default='Ótica Nina'),
        sa.Column('cor_primaria', sa.String(7), server_default='#0C5FA8'),
        sa.Column('cor_secundaria', sa.String(7), server_default='#094A84'),
        sa.Column('logo_url', sa.String(500), nullable=True),
        sa.Column('cupom_aniversario_valor', sa.String(20), server_default='10'),
        sa.Column('cupom_aniversario_tipo', sa.String(10), server_default='percentual'),
        sa.Column('horario_disparo_diario', sa.String(5), server_default='09:00'),
        sa.Column('meta_wa_phone_number_id', sa.String(100), nullable=True),
    )

    # Seed settings padrão
    op.execute("INSERT INTO app_settings (id) VALUES (1)")


def downgrade() -> None:
    op.drop_table('app_settings')
    op.drop_table('whatsapp_messages')
    op.drop_table('sale_photos')
    op.drop_table('sales')
    op.drop_table('appointments')
    op.drop_table('customers')
