from __future__ import annotations
from dataclasses import dataclass
import datetime
import json
from tricount_extractor.models.member import Member
from tricount_extractor.models.entry import Entry
from tricount_extractor.models.pagination import Pagination


@dataclass
class Registry:
    id: int
    uuid: str
    title: str
    currency: str
    created: datetime.datetime
    updated: datetime.datetime
    members: list[Member]
    entries: list[Entry]
    pagination: Pagination

    @classmethod
    def from_json(cls, data: dict) -> Registry:
        pagination = data["Pagination"]
        data = data["Response"][0]["Registry"]

        return cls(
            id=data["id"],
            uuid=data["uuid"],
            title=data["title"],
            currency=data["currency"],
            created=datetime.datetime.fromisoformat(data["created"]),
            updated=datetime.datetime.fromisoformat(data["updated"]),
            members=[Member.from_json(m) for m in data["memberships"]],
            entries=[Entry.from_json(e) for e in data.get("all_registry_entry", [])],
            pagination=Pagination.from_json(pagination),
        )

    @classmethod
    def from_file(cls, path: str) -> Registry:
        with open(path, "r", encoding="utf-8") as f:
            return cls.from_json(json.load(f))

