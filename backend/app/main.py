from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func

from app.config import settings
from app.database import Base, SessionLocal, engine, ensure_postgres_columns
from app.models import User  # noqa: F401 — register models
from app.models import TransactionLog  # noqa: F401
from app.routers import admin, auth, market, wallet
from app.security import hash_password


def ensure_env_admin():
    if not settings.ADMIN_EMAIL or not settings.ADMIN_PASSWORD:
        return
    db = SessionLocal()
    try:
        user = db.query(User).filter(func.lower(User.email) == settings.ADMIN_EMAIL).first()
        if user is None:
            base = (settings.ADMIN_EMAIL.split("@", 1)[0] or "admin")[:140]
            username = f"{base}_admin"
            i = 2
            while db.query(User).filter(User.username == username).first():
                username = f"{base}_admin{i}"
                i += 1
            user = User(
                username=username,
                email=settings.ADMIN_EMAIL,
                is_admin=True,
                is_active=True,
                password_hash=hash_password(settings.ADMIN_PASSWORD),
            )
            db.add(user)
            db.commit()
        else:
            user.is_admin = True
            user.password_hash = hash_password(settings.ADMIN_PASSWORD)
            db.commit()
    except Exception as e:
        print(f"Admin bootstrap warning: {e}")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    ensure_postgres_columns()
    print(f"Database: PostgreSQL → {settings.DATABASE_URL.split('@')[-1]}")
    ensure_env_admin()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="Multi-chain crypto wallet API (BTC, LTC, ETH)",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(wallet.router)
app.include_router(admin.router)
app.include_router(market.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "app": settings.APP_NAME, "version": "2.0.0"}
