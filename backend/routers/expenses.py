from fastapi import APIRouter, HTTPException

from backend.models import ParsedData, Expense, PatchExpenseRequest, PRESET_CATEGORIES
from backend.storage import session_store

router = APIRouter()


@router.get("/expenses/{session_id}", response_model=ParsedData)
async def get_expenses(session_id: str):
    data = session_store.get_session(session_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return data


@router.patch("/expenses/{session_id}/{entry_id}", response_model=Expense)
async def patch_expense(session_id: str, entry_id: int, body: PatchExpenseRequest):
    # Basic category validation
    cat = body.category.strip()
    if not cat or not cat.strip():
        raise HTTPException(status_code=400, detail="Category must not be empty")
    if len(cat) > 100:
        raise HTTPException(status_code=400, detail="Category name too long (max 100 characters)")

    expense = session_store.patch_expense_category(session_id, entry_id, cat)
    if expense is None:
        raise HTTPException(status_code=404, detail="Session or expense not found")
    # Store as custom if not in presets
    if cat not in PRESET_CATEGORIES and cat != "UNCATEGORIZED":
        session_store.add_custom_category(session_id, cat)
    return expense


@router.get("/categories/{session_id}")
async def get_categories(session_id: str):
    data = session_store.get_session(session_id)
    custom = data.custom_categories if data else []
    return {"presets": PRESET_CATEGORIES, "custom": custom}


@router.get("/categories")
async def get_preset_categories():
    return {"presets": PRESET_CATEGORIES, "custom": []}
