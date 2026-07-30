"""Create or promote an admin user.

Usage:
  python bootstrap_admin.py admin@example.com yourpassword
"""

import sys
from pathlib import Path

# Allow running from backend/ directory
sys.path.insert(0, str(Path(__file__).resolve().parent))

from sqlalchemy import func

from app.database import Base, SessionLocal, engine, ensure_postgres_columns
from app.models import User
from app.security import hash_password


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: python bootstrap_admin.py <email> <password>")
        return 2

    email = (sys.argv[1] or "").strip().lower()
    password = sys.argv[2] or ""
    if not email or not password:
        print("Usage: python bootstrap_admin.py <email> <password>")
        return 2

    Base.metadata.create_all(bind=engine)
    ensure_postgres_columns()
    db = SessionLocal()
    try:
        user = db.query(User).filter(func.lower(User.email) == email).first()
        if user is None:
            base = (email.split("@", 1)[0] or "admin").strip()[:140] or "admin"
            username = f"{base}_admin"
            i = 2
            while db.query(User).filter(User.username == username).first():
                username = f"{base}_admin{i}"
                i += 1
            user = User(
                username=username,
                email=email,
                is_admin=True,
                is_active=True,
                password_hash=hash_password(password),
            )
            db.add(user)
            db.commit()
            print(f"Created admin user: {email}")
            return 0

        user.is_admin = True
        user.password_hash = hash_password(password)
        db.commit()
        print(f"Updated admin user: {email}")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
