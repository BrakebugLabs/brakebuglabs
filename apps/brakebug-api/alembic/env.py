from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

from app.config import settings  # 👈 Importa a URL correta - acessa as variáveis do .ini
config = context.config

# Configura os loggers, se o arquivo de config estiver presente
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Importa a Base de dados
from app.database import Base
from app import models  # Ativa o __init__.py com os modelos


# Importação dos modelos
from app.models.usuario import Usuario
from app.models.clientes import Cliente
from app.models.compra_clientes import CompraCliente
from app.models import compra_itens, produto, movimentacao
from app.models.pagamentos import Pagamento

# models Assurelog
from app.assurelog.models.report import Report
from app.assurelog.models.test_case import TestCase
from app.assurelog.models.user import User

# Define a metadata usada para geração automática
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Executa as migrações no modo offline."""
    url = settings.DATABASE_URL  # 👈 Substitui config.get_main_option(...)
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Executa as migrações no modo online."""
    from sqlalchemy import create_engine

    connectable = create_engine(  # 👈 Usa o mesmo método que no app principal
        settings.DATABASE_URL,
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


# Decide o modo de execução: offline ou online
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
