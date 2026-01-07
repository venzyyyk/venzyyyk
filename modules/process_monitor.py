import psutil

from core.alert_engine import AlertEngine, create_alert
from core.logger import setup_logger
from core.utils import summarize_list


SUSPICIOUS_KEYWORDS = ["powershell", "cmd.exe", "temp", "appdata", "\" -enc", "-nop"]


class ProcessMonitor:
    def __init__(self) -> None:
        self.logger = setup_logger()
        self.alert_engine = AlertEngine()

    def snapshot(self) -> dict:
        processes = []
        suspicious = []
        alerts = []

        for proc in psutil.process_iter(["pid", "name", "exe", "cmdline"]):
            try:
                info = proc.info
                connections = proc.connections(kind="inet")
                process_data = {
                    "pid": info.get("pid"),
                    "name": info.get("name"),
                    "path": info.get("exe"),
                    "cmdline": " ".join(info.get("cmdline") or []),
                    "connections": [
                        f"{conn.raddr.ip}:{conn.raddr.port}" for conn in connections if conn.raddr
                    ],
                }
                processes.append(process_data)

                if self._is_suspicious(process_data):
                    suspicious.append(process_data)
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue

        for entry in suspicious:
            alerts.append(
                create_alert(
                    "process_monitor",
                    f"Suspicious process: {entry['name']} ({entry['pid']})",
                    "medium",
                )
            )
        self.alert_engine.record_batch(alerts)

        report = {
            "process_count": len(processes),
            "suspicious_count": len(suspicious),
            "suspicious_processes": summarize_list(
                [f"{proc['name']} ({proc['pid']})" for proc in suspicious]
            ),
            "alerts_generated": len(alerts),
        }
        return report

    def _is_suspicious(self, process_data: dict) -> bool:
        name = (process_data.get("name") or "").lower()
        path = (process_data.get("path") or "").lower()
        cmdline = (process_data.get("cmdline") or "").lower()
        for keyword in SUSPICIOUS_KEYWORDS:
            if keyword in name or keyword in path or keyword in cmdline:
                return True
        return False
