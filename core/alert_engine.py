import json
import sqlite3
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Iterable

from core.config import CONFIG, DATA_DIR
from core.logger import setup_logger


@dataclass
class Alert:
    timestamp: str
    source: str
    message: str
    severity: str


class AlertEngine:
    def __init__(self, db_path: Path | None = None, json_path: Path | None = None) -> None:
        self.db_path = db_path or CONFIG.alert_db_path
        self.json_path = json_path or CONFIG.alert_json_path
        self.logger = setup_logger()
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _init_db(self) -> None:
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute(
                    """
                    CREATE TABLE IF NOT EXISTS alerts (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp TEXT,
                        source TEXT,
                        message TEXT,
                        severity TEXT
                    )
                    """
                )
        except sqlite3.Error as exc:
            self.logger.warning("SQLite unavailable: %s. Falling back to JSON.", exc)

    def record(self, alert: Alert) -> None:
        if self._record_sqlite(alert):
            return
        self._record_json(alert)

    def _record_sqlite(self, alert: Alert) -> bool:
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute(
                    "INSERT INTO alerts (timestamp, source, message, severity) VALUES (?, ?, ?, ?)",
                    (alert.timestamp, alert.source, alert.message, alert.severity),
                )
            return True
        except sqlite3.Error as exc:
            self.logger.warning("SQLite write failed: %s", exc)
            return False

    def _record_json(self, alert: Alert) -> None:
        existing = []
        if self.json_path.exists():
            try:
                existing = json.loads(self.json_path.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                existing = []
        existing.append(alert.__dict__)
        self.json_path.write_text(json.dumps(existing, ensure_ascii=False, indent=2), encoding="utf-8")

    def record_batch(self, alerts: Iterable[Alert]) -> None:
        for alert in alerts:
            self.record(alert)


def create_alert(source: str, message: str, severity: str) -> Alert:
    timestamp = datetime.utcnow().isoformat(timespec="seconds") + "Z"
    return Alert(timestamp=timestamp, source=source, message=message, severity=severity)
