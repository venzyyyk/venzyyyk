from pathlib import Path

from core.alert_engine import AlertEngine, create_alert
from core.logger import setup_logger
from core.utils import calculate_entropy, compute_sha256, find_suspicious_strings, validate_path


class SandboxLite:
    def __init__(self) -> None:
        self.logger = setup_logger()
        self.alert_engine = AlertEngine()

    def analyze(self, path_str: str) -> dict:
        path = validate_path(path_str)
        if not path.exists():
            raise FileNotFoundError(f"File not found: {path}")

        data = path.read_bytes()
        sha256 = compute_sha256(path)
        entropy = calculate_entropy(data)
        suspicious_strings = find_suspicious_strings(data[:1024 * 1024].decode("utf-8", errors="ignore"))
        size_kb = path.stat().st_size / 1024

        risk_score = 0
        if entropy >= 7.5:
            risk_score += 40
        if size_kb > 1024:
            risk_score += 20
        risk_score += min(len(suspicious_strings) * 10, 40)

        severity = "low"
        if risk_score >= 70:
            severity = "high"
        elif risk_score >= 40:
            severity = "medium"

        alert = create_alert(
            "sandbox_lite",
            f"Risk score {risk_score} for file {path.name}",
            severity,
        )
        self.alert_engine.record(alert)

        report = {
            "file": str(path),
            "sha256": sha256,
            "size_kb": round(size_kb, 2),
            "entropy": round(entropy, 2),
            "suspicious_strings": suspicious_strings,
            "risk_score": risk_score,
            "severity": severity,
        }
        return report
