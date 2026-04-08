"""In-memory session store with disk persistence and TTL expiration.

Sessions are written to .sessions/<uuid>.json on every mutation so that
a uvicorn --reload (triggered e.g. by settings.json changes) does not
lose the loaded expense data. Sessions expire after SESSION_TTL_HOURS.
"""
import logging
import time
import uuid
from pathlib import Path

from backend.models import ParsedData, Expense

logger = logging.getLogger("tricountreport.sessions")

_store: dict[str, ParsedData] = {}
_timestamps: dict[str, float] = {}  # session_id -> creation time (epoch)

SESSION_TTL_HOURS = 6
_SESSION_TTL_SECONDS = SESSION_TTL_HOURS * 3600

_SESSIONS_DIR = Path(__file__).parent.parent.parent / ".sessions"


def _session_path(session_id: str) -> Path:
    return _SESSIONS_DIR / f"{session_id}.json"


def _evict(session_id: str) -> None:
    _store.pop(session_id, None)
    _timestamps.pop(session_id, None)
    path = _session_path(session_id)
    try:
        path.unlink(missing_ok=True)
    except Exception:
        pass
    logger.info("Session %s expired and evicted", session_id)


def _is_expired(session_id: str) -> bool:
    ts = _timestamps.get(session_id)
    if ts is None:
        return False
    return (time.time() - ts) > _SESSION_TTL_SECONDS


def _save(session_id: str, data: ParsedData) -> None:
    try:
        _SESSIONS_DIR.mkdir(exist_ok=True)
        path = _session_path(session_id)
        path.write_text(data.model_dump_json(), encoding="utf-8")
        try:
            path.chmod(0o600)  # owner read/write only — no world-readable session data
        except Exception:
            pass
    except Exception:
        logger.warning("Could not persist session %s to disk", session_id)


def _load(session_id: str) -> ParsedData | None:
    path = _session_path(session_id)
    if not path.exists():
        return None
    # Check disk TTL via file mtime
    try:
        age = time.time() - path.stat().st_mtime
        if age > _SESSION_TTL_SECONDS:
            path.unlink(missing_ok=True)
            logger.info("Expired session file removed: %s", session_id)
            return None
    except Exception:
        pass
    try:
        return ParsedData.model_validate_json(path.read_text(encoding="utf-8"))
    except Exception:
        return None


def create_session(data: ParsedData) -> str:
    session_id = str(uuid.uuid4())
    _store[session_id] = data
    _timestamps[session_id] = time.time()
    _save(session_id, data)
    logger.info("Session created: %s (%d expenses)", session_id, len(data.expenses))
    return session_id


def get_session(session_id: str) -> ParsedData | None:
    if session_id in _store:
        if _is_expired(session_id):
            _evict(session_id)
            return None
        return _store[session_id]
    # Re-hydrate from disk after a server restart
    data = _load(session_id)
    if data is not None:
        _store[session_id] = data
        _timestamps[session_id] = time.time()
    return data


def patch_expense_category(session_id: str, entry_id: int, category: str) -> Expense | None:
    data = get_session(session_id)
    if data is None:
        return None
    for expense in data.expenses:
        if expense.entry_id == entry_id:
            expense.category = category
            _save(session_id, data)
            return expense
    return None


def add_custom_category(session_id: str, category: str) -> None:
    data = get_session(session_id)
    if data is None:
        return
    if category not in data.custom_categories:
        data.custom_categories.append(category)
        _save(session_id, data)


def apply_categorizations(session_id: str, applications: list[dict]) -> int:
    data = get_session(session_id)
    if data is None:
        return 0
    id_to_expense = {e.entry_id: e for e in data.expenses}
    count = 0
    for app in applications:
        entry_id = app.get("entry_id")
        category = app.get("category")
        if entry_id in id_to_expense and category:
            id_to_expense[entry_id].category = category
            count += 1
    if count:
        _save(session_id, data)
    return count
