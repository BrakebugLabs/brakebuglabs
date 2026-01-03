from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()
# print("Banco de dados:", os.getenv("DATABASE_URL"))
# print("SECRET_KEY:", os.getenv("SECRET_KEY"))

# load_dotenv(".env.admin") "segunda opção caso o código quebre
class Settings(BaseSettings):
    """
    Configurações da aplicação carregadas de variáveis de ambiente ou arquivo .env
    """
    # Configurações do banco de dados
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./synchrogest.db")
    # DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./brakebuglabs.db")
    
    # Configurações de segurança
    SECRET_KEY: str = os.getenv("SECRET_KEY", "temporarysecretkey123456789abcdefghijklmnopqrstuvwxyz")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    
    
    # Configurações da aplicação
    APP_NAME: str = "Brakebug Labs"
    APP_VERSION: str = "2.0"
    APP_DESCRIPTION: str = "Sistema de Gestão Integrado"
    
    class Config:
        env_file = ".env"
        # env_file = ".env.admin" #segunda opção caso o código quebre
        case_sensitive = True

# Instância global das configurações
settings = Settings()
