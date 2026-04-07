"""In-memory session store with disk persistence.

Sessions are written to .sessions/<uuid>.json on every mutation so that
a uvicorn --reload (triggered e.g. by settings.json changes) does not
lose the loaded expense data.
"""
import uuid
from pathlib import Path

from backend.models import ParsedData, Expense

_store: dict[str, ParsedData] = {}

_SESSIONS_DIR = Path(__file__).parent.parent.parent / ".sessions"


def _session_path(session_id: str) -> Path:
    return _SESSIONS_DIR / f"{session_id}.json"


def _save(session_id: str, data: ParsedData) -> None:
    try:
        _SESSIONS_DIR.mkdir(exist_ok=True)
        _session_path(session_id).write_text(
            data.model_dump_json(), encoding="utf-8"
        )
    except Exception:
        pass  # disk persistence is best-effort


def _load(session_id: str) -> ParsedData | None:
    path = _session_path(session_id)
    if not path.exists():
        return None
    try:
        return ParsedData.model_validate_json(path.read_text(encoding="utf-8"))
    except Exception:
        return None


def create_session(data: ParsedData) -> str:
    session_id = str(uuid.uuid4())
    _store[session_id] = data
    _save(session_id, data)
    return session_id


def get_session(session_id: str) -> ParsedData | None:
    if session_id in _store:
        return _store[session_id]
    # Re-hydrate from disk after a server restart
    data = _load(session_id)
    if data is not None:
        _store[session_id] = data
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
