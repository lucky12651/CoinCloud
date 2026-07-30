from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.deps import get_current_user
from app.models import User
from app.schemas import (
    ChangePasswordRequest,
    LoginRequest,
    MessageResponse,
    RegisterRequest,
    TokenResponse,
    UserMe,
    UserPublic,
)
from app.security import create_access_token, hash_password, verify_password
from app.services import wallet_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _to_public(user: User) -> UserPublic:
    return UserPublic.model_validate(user)


@router.post("/register", response_model=TokenResponse)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if not body.agree_terms:
        raise HTTPException(status_code=400, detail="You must agree to the terms")

    email = body.email.strip().lower()
    username = body.username.strip()

    if db.query(User).filter((User.username == username) | (func.lower(User.email) == email)).first():
        raise HTTPException(status_code=400, detail="Username or email already exists")

    is_first_user = db.query(User).count() == 0
    is_admin = bool(
        (settings.ADMIN_EMAIL and email == settings.ADMIN_EMAIL) or (not settings.ADMIN_EMAIL and is_first_user)
    )

    try:
        wallets = wallet_service.create_all_wallets()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Wallet creation failed: {e}") from e

    user = User(
        username=username,
        email=email,
        is_admin=is_admin,
        is_active=True,
        password_hash=hash_password(body.password),
        wallet_name=wallets.get("wallet_name"),
        wallet_name_ltc=wallets.get("wallet_name_ltc"),
        wallet_name_doge=wallets.get("wallet_name_doge"),
        wallet_address_btc=wallets.get("wallet_address_btc"),
        wallet_address_ltc=wallets.get("wallet_address_ltc"),
        wallet_address_doge=wallets.get("wallet_address_doge"),
        wallet_address_eth=wallets.get("wallet_address_eth"),
        passphrase=wallets.get("passphrase"),
        passphrase_eth=wallets.get("passphrase_eth") or wallets.get("passphrase"),
        private_master_key_wif_btc=wallets.get("private_master_key_wif_btc"),
        private_master_key_wif_ltc=wallets.get("private_master_key_wif_ltc"),
        private_master_key_wif_doge=wallets.get("private_master_key_wif_doge"),
        private_key_eth=wallets.get("private_key_eth"),
        created_at=datetime.now(timezone.utc),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id, user.email, user.is_admin)
    return TokenResponse(access_token=token, user=_to_public(user))


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    email = body.email.strip().lower()
    user = db.query(User).filter(func.lower(User.email) == email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if not getattr(user, "is_active", True):
        raise HTTPException(status_code=403, detail="Account is disabled")

    # Promote if matches ADMIN_EMAIL
    if settings.ADMIN_EMAIL and email == settings.ADMIN_EMAIL and not user.is_admin:
        user.is_admin = True

    user.last_login = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id, user.email, user.is_admin)
    return TokenResponse(access_token=token, user=_to_public(user))


@router.get("/me", response_model=UserMe)
def me(user: User = Depends(get_current_user)):
    wallet_service.ensure_addresses_backfill(user)
    return UserMe.model_validate(user)


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    body: ChangePasswordRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(body.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    user.password_hash = hash_password(body.new_password)
    db.commit()
    return MessageResponse(success=True, message="Password updated successfully")


@router.get("/recovery-phrase")
def recovery_phrase(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all recovery material for authenticated owner. Highly sensitive."""
    # Refresh keys from bitcoinlib / eth wallets into Postgres if empty
    wallet_service.ensure_addresses_backfill(user, db)
    db.refresh(user)
    bundle = wallet_service.recovery_bundle(user)
    # Back-compat flat fields for older clients
    bundle["passphrase"] = bundle["mnemonic_utxo"]["passphrase"]
    bundle["passphrase_eth"] = bundle["mnemonic_evm"]["passphrase"]
    return bundle
