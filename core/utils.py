import hashlib
import json
import math
import re
from pathlib import Path
from typing import Iterable


SAFE_PATH_PATTERN = re.compile(r"^[\w\-\./\\: ]+$")


def validate_path(path_str: str) -> Path:
    if not path_str:
        raise ValueError("Path is empty")
    if not SAFE_PATH_PATTERN.match(path_str):
        raise ValueError("Path contains invalid characters")
    return Path(path_str).expanduser().resolve()


def compute_sha256(path: Path) -> str:
    hasher = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(8192), b""):
            hasher.update(chunk)
    return hasher.hexdigest()


def calculate_entropy(data: bytes) -> float:
    if not data:
        return 0.0
    freq = {byte: data.count(byte) for byte in set(data)}
    entropy = 0.0
    data_len = len(data)
    for count in freq.values():
        probability = count / data_len
        entropy -= probability * math.log2(probability)
    return entropy


def find_suspicious_strings(text: str) -> list[str]:
    patterns = [
        r"powershell",
        r"cmd\.exe",
        r"http://",
        r"https://",
        r"autorun",
        r"reg add",
        r"curl",
        r"wget",
    ]
    findings = []
    lowered = text.lower()
    for pattern in patterns:
        if re.search(pattern, lowered):
            findings.append(pattern)
    return findings


def write_report(report_dir: Path, name: str, data: dict) -> tuple[Path, Path]:
    report_dir.mkdir(parents=True, exist_ok=True)
    json_path = report_dir / f"{name}.json"
    txt_path = report_dir / f"{name}.txt"

    with json_path.open("w", encoding="utf-8") as handle:
        json.dump(data, handle, ensure_ascii=False, indent=2)

    with txt_path.open("w", encoding="utf-8") as handle:
        for key, value in data.items():
            handle.write(f"{key}: {value}\n")

    return json_path, txt_path


def summarize_list(values: Iterable[str], limit: int = 10) -> list[str]:
    items = list(values)
    if len(items) <= limit:
        return items
    return items[:limit] + [f"... and {len(items) - limit} more"]
