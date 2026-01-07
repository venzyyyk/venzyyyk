import re
from collections import defaultdict
from datetime import datetime
from pathlib import Path

from core.alert_engine import AlertEngine, create_alert
from core.config import CONFIG
from core.logger import setup_logger
from core.utils import summarize_list, validate_path


LOG_PATTERN = re.compile(r"\[(?P<date>[^\]]+)\] \[(?P<level>[^\]]+)\] (?P<msg>.*)")
IP_PATTERN = re.compile(r"(?:\d{1,3}\.){3}\d{1,3}")


class LogAnalyzer:
    def __init__(self) -> None:
        self.logger = setup_logger()
        self.alert_engine = AlertEngine()

    def analyze(self, path_str: str) -> dict:
        path = validate_path(path_str)
        if not path.exists():
            raise FileNotFoundError(f"Log file not found: {path}")

        failed_logins = defaultdict(list)
        error_counts = defaultdict(int)
        ip_activity = defaultdict(int)
        total_lines = 0
        parse_errors = 0

        with path.open("r", encoding="utf-8", errors="ignore") as handle:
            for line in handle:
                total_lines += 1
                match = LOG_PATTERN.match(line.strip())
                if not match:
                    parse_errors += 1
                    continue

                timestamp = self._parse_date(match.group("date"))
                level = match.group("level")
                message = match.group("msg")
                ips = IP_PATTERN.findall(message)
                for ip in ips:
                    ip_activity[ip] += 1

                if "failed" in message.lower() and "login" in message.lower() and timestamp:
                    ip = ips[0] if ips else "unknown"
                    failed_logins[ip].append(timestamp)

                if level.upper() == "ERROR":
                    error_counts[message] += 1

        brute_force_ips = self._detect_bruteforce(failed_logins)
        suspicious_ips = [ip for ip, count in ip_activity.items() if count >= CONFIG.suspicious_ip_threshold]
        repeated_errors = [msg for msg, count in error_counts.items() if count >= 3]

        alerts = []
        for ip, count in brute_force_ips.items():
            alerts.append(create_alert("log_analyzer", f"Bruteforce suspected from {ip}: {count} failed logins", "high"))
        for ip in suspicious_ips:
            alerts.append(create_alert("log_analyzer", f"Suspicious IP activity: {ip}", "medium"))
        for error in repeated_errors:
            alerts.append(create_alert("log_analyzer", f"Repeated error: {error}", "low"))
        self.alert_engine.record_batch(alerts)

        report = {
            "file": str(path),
            "total_lines": total_lines,
            "parse_errors": parse_errors,
            "bruteforce_ips": brute_force_ips,
            "suspicious_ips": summarize_list(suspicious_ips),
            "repeated_errors": summarize_list(repeated_errors),
            "alerts_generated": len(alerts),
        }
        return report

    def _parse_date(self, date_str: str) -> datetime | None:
        for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%d.%m.%Y %H:%M:%S"):
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
        return None

    def _detect_bruteforce(self, failed_logins: dict[str, list[datetime]]) -> dict[str, int]:
        results: dict[str, int] = {}
        for ip, timestamps in failed_logins.items():
            timestamps.sort()
            for index, start in enumerate(timestamps):
                window = [t for t in timestamps[index:] if (t - start).total_seconds() <= CONFIG.log_time_window_seconds]
                if len(window) >= CONFIG.brute_force_threshold:
                    results[ip] = len(window)
                    break
        return results
