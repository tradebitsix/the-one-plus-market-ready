import json
from datetime import datetime, timezone
import secrets
import re

def utcnow_naive():
    return datetime.now(timezone.utc).replace(tzinfo=None)

def json_dumps(obj) -> str:
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":"))

def json_loads(s: str):
    return json.loads(s) if s else None

def make_token(nbytes: int = 24) -> str:
    return secrets.token_hex(nbytes)

_slug_re = re.compile(r"^[a-z0-9-]+$")

def normalize_slug(slug: str) -> str:
    s = slug.strip().lower()
    if not _slug_re.match(s):
        raise ValueError("Invalid slug format")
    return s
