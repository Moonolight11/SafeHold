import hmac
import hashlib
import json
from urllib.parse import unquote
from fastapi import HTTPException, Request

BOT_TOKEN = os.getenv("BOT_TOKEN", "YOUR_BOT_TOKEN")

def validate_telegram_init_data(init_data: str) -> dict:
    """Validate Telegram WebApp initData using HMAC-SHA256"""
    params = dict(x.split('=') for x in unquote(init_data).split('&'))
    hash_value = params.pop('hash', None)
    if not hash_value:
        raise HTTPException(401, "Missing hash")
    
    data_check_string = '\n'.join(f"{k}={v}" for k, v in sorted(params.items()))
    secret_key = hmac.new(
        key=b"WebAppData",
        msg=BOT_TOKEN.encode(),
        digestmod=hashlib.sha256
    ).digest()
    computed_hash = hmac.new(
        key=secret_key,
        msg=data_check_string.encode(),
        digestmod=hashlib.sha256
    ).hexdigest()
    
    if computed_hash != hash_value:
        raise HTTPException(401, "Invalid hash")
    return params
