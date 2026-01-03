brakebug-labs/
├── apps
│   └──.qodo
│   └──.venv
│   ├── assurelog (integrando com o projeto)
│   │       └── .qodo
│   │       └── backend
│   │       │    ├── scripts
│   │       │    ├── generated_pdfs
│   │       │    ├── migrations
│   │       │    ├── node_modules
│   │       │    ├── src
│   │       │    │    ├── database
│   │       │    │    ├── models
│   │       │    │    ├── routes
│   │       │    │    │     ├── admin.py
│   │       │    │    │     ├── auth.py
│   │       │    │    │     ├── excel_import.py
│   │       │    │    │     ├── pdf.py
│   │       │    │    │     ├── report_secure.py
│   │       │    │    │     ├── search.py
│   │       │    │    │     ├── upload.py
│   │       │    │    │     └── user.py
│   │       │    │    ├── static
│   │       │    │    ├── __init__.py
│   │       │    │    ├── analyze_excel.py
│   │       │    │    ├── auth.py
│   │       │    │    ├── config.py
│   │       │    │    ├── extensions.py
│   │       │    │    ├── main_database_fix.py
│   │       │    │    ├── main_fixed.py
│   │       │    │    └── main.py    
│   │       │    ├── uploads
│   │       │    ├── venv
│   │       │    ├── alembic.ini
│   │       │    ├── config.py
│   │       │    ├── create_db.py
│   │       │    ├── diagnose_database.py
│   │       │    ├── package-lock.json
│   │       │    ├── package.json
│   │       │    └── requeriment.txt
│   │       ├──frontend
│   │       │    ├── node_modules
│   │       │    ├── public
│   │       │    ├── src
│   │       │    │    ├── database
│   │       │    │    ├── models
│   │       │    │    ├── routes
│   │       │    │    ├── static
│   │       │    │    ├── __init__.py
│   │       │    │    ├── analyze_excel.py
│   │       │    │    ├── auth.py
│   │       │    │    ├── config.py
│   │       │    │    ├── extensions.py
│   │       │    │    ├── main_database_fix.py
│   │       │    │    ├── main_fixed.py
│   │       │    │    └── main.py    
│   │       │    ├── components.json
│   │       │    ├── eslint.config.js
│   │       │    ├── index.html
│   │       │    ├── jsconfig.json (Está apresentando erro com base nas alteraçãoes que já fizemos)
│   │       │    ├── package.json
│   │       │    ├── pnpm-lock.yaml
│   │       │    └── vite.config.js
│   │       ├──venv
│   │       ├──.env
│   │       ├──.gitignore
│   │       ├──LICENSE
│   │       └──READM.md
│   ├── brakebug-api
│   │    ├── alembic
│   │    ├── app
│   │    │     ├──dependencies
│   │    │     ├──models
│   │    │     ├──routers
│   │    │     ├──schemas
│   │    │     ├──services
│   │    │     ├──utils
│   │    │     ├──__init__.py
│   │    │     ├──config.py
│   │    │     ├──database.py
│   │    │     └───main.py
│   │    ├── scripts
│   │    ├── venv
│   │    ├── .env
│   │    ├── alembic.ini
│   │    ├── initial.py
│   │    ├── requirements.txt
│   │    ├── runtime.txt
│   │    └── schema.sql
│   ├── brakbug-front
│   │    ├── build
│   │    ├── node_modules
│   │    ├── public
│   │    │     └── bph
│   │    │           ├──app
│   │    │           ├──assets
│   │    │           ├── index.html
│   │    │           └── ...
│   │    ├── src
│   │    │     ├──components
│   │    │     ├──context
│   │    │     ├──hooks
│   │    │     ├──pages
│   │    │     │   ├──assurelog
│   │    │     │   │    ├── context
│   │    │     │   │    ├── pages
│   │    │     │   │    │   ├── ExportButton.jsx
│   │    │     │   │    │   ├── ExportButton.jsx
│   │    │     │   │    │   ├── FileUpload.jsx
│   │    │     │   │    │   ├── Header.jsx
│   │    │     │   │    │   ├── QuichSearch.jsx
│   │    │     │   │    │   ├── ReportForm.jsx
│   │    │     │   │    │   ├── ReportList.jsx
│   │    │     │   │    │   ├── ReportViel.jsx
│   │    │     │   │    │   ├── SearchFilter.jsx
│   │    │     │   │    │   ├── ReportViel.jsx
│   │    │     │   │    │   └── TestCaseForm.jsx
│   │    │     │   │    └── stylesassure
│   │    │     │   ├──auth
│   │    │     │   ├──categorias
│   │    │     │   ├──clientes
│   │    │     │   ├──common
│   │    │     │   ├──dashboard
│   │    │     │   ├──layout
│   │    │     │   ├──movimentacoes
│   │    │     │   ├──pagamentos
│   │    │     │   ├──produtos
│   │    │     │   └──vendas
│   │    │     ├──portal
│   │    │     │   ├──components
│   │    │     │   ├──evolucao-QA
│   │    │     │   ├──gamificacao
│   │    │     │   ├──pages
│   │    │     │   ├──ranking
│   │    │     │   └───styles
│   │    │     ├──styles
│   │    │     ├──services
│   │    │     ├──utils
│   │    │     ├──App.js
│   │    │     ├──AppAssure.js
│   │    │     ├──index.css
│   │    │     ├──index.js
│   │    │     ├──...
│   │    ├── .env.local
│   │    ├── package-lock.json
│   │    └── packege.json
│   ├── .gitignore
│   ├── LICENSE
│   ├── package-lock.json
│   ├── README.md
│   ├── render.yaml
│   └── schema.sql│
├── tests
├── utils
├── .env
├── Markfile
└── README.md



Criar tabela WAITING LIST

schema.sql
CREATE TABLE waiting_list (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    data_cadastro TIMESTAMP DEFAULT NOW()
);

app/models/waiting_list.py
from sqlalchemy import Column, Integer, String, DateTime, func
from app.database import Base

class WaitingList(Base):
    __tablename__ = "waiting_list"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    email = Column(String(150), nullable=False, unique=True)
    telefone = Column(String(20))
    data_cadastro = Column(DateTime, server_default=func.now())


app/schemas/waiting_list.py
from pydantic import BaseModel, EmailStr

class WaitingListCreate(BaseModel):
    nome: str
    email: EmailStr
    telefone: str

class WaitingListResponse(WaitingListCreate):
    id: int

    class Config:
        orm_mode = True


app/routers/waiting_list.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.waiting_list import WaitingList
from app.schemas.waiting_list import WaitingListCreate, WaitingListResponse

router = APIRouter(prefix="/waiting-list", tags=["Waiting List"])

@router.post("/", response_model=WaitingListResponse)
def add_to_waiting_list(data: WaitingListCreate, db: Session = Depends(get_db)):
    item = WaitingList(**data.dict())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


E registrar no main.py:
app.include_router(waiting_list.router)