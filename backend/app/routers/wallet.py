from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import TransactionLog, User
from app.schemas import AddressesResponse, BalanceResponse, SendRequest, SendResponse, TransactionItem
from app.services import wallet_service

router = APIRouter(prefix="/api/wallet", tags=["wallet"])


@router.get("/addresses", response_model=AddressesResponse)
def addresses(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    wallet_service.ensure_addresses_backfill(user, db)
    return AddressesResponse(
        BTC=user.wallet_address_btc,
        LTC=user.wallet_address_ltc,
        DOGE=getattr(user, "wallet_address_doge", None),
        ETH=user.wallet_address_eth,
        USDT=user.wallet_address_eth,
    )


@router.get("/balance", response_model=BalanceResponse)
def balance(
    coin: str = Query("BTC"),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    wallet_service.ensure_addresses_backfill(user, db)
    coin = coin.upper()
    if coin not in wallet_service.SUPPORTED_COINS:
        raise HTTPException(status_code=400, detail="Unsupported coin")
    try:
        data = wallet_service.get_balance(user, coin)
        return BalanceResponse(**data)
    except Exception as e:
        return BalanceResponse(coin=coin, balance=0, balance_raw=0, error=str(e))


@router.get("/balances")
def balances(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    wallet_service.ensure_addresses_backfill(user, db)
    result = {}
    for coin in wallet_service.SUPPORTED_COINS:
        try:
            result[coin] = wallet_service.get_balance(user, coin)
        except Exception as e:
            result[coin] = {"coin": coin, "balance": 0, "balance_raw": 0, "error": str(e)}
    return result


@router.post("/send", response_model=SendResponse)
def send(
    body: SendRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    coin = (body.coin or "BTC").upper()
    result = wallet_service.send_crypto(user, coin, body.address, body.amount, body.fee)
    if result.get("success"):
        log = TransactionLog(
            user_id=user.id,
            coin=coin,
            txid=result.get("txid"),
            recipient=body.address.strip(),
            amount=str(body.amount),
            fee=str(result.get("fee") or body.fee or ""),
            status="broadcast",
        )
        db.add(log)
        db.commit()
        return SendResponse(**result)
    raise HTTPException(status_code=500, detail=result.get("error") or "Send failed")


@router.get("/transactions", response_model=list[TransactionItem])
def transactions(
    coin: str = Query("BTC"),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    wallet_service.ensure_addresses_backfill(user, db)
    coin = coin.upper()
    if coin not in wallet_service.SUPPORTED_COINS:
        raise HTTPException(status_code=400, detail="Unsupported coin")
    try:
        txs = wallet_service.get_transactions(user, coin)
        return [TransactionItem(**t) for t in txs]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/send-history")
def send_history(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (
        db.query(TransactionLog)
        .filter(TransactionLog.user_id == user.id)
        .order_by(TransactionLog.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": r.id,
            "coin": r.coin,
            "txid": r.txid,
            "recipient": r.recipient,
            "amount": r.amount,
            "fee": r.fee,
            "status": r.status,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]
