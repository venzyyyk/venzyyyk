from collections import Counter

import psutil

from core.alert_engine import AlertEngine, create_alert
from core.config import CONFIG
from core.logger import setup_logger
from core.utils import summarize_list


class NetworkMonitor:
    def __init__(self) -> None:
        self.logger = setup_logger()
        self.alert_engine = AlertEngine()

    def snapshot(self) -> dict:
        try:
            connections = psutil.net_connections(kind="inet")
        except psutil.AccessDenied:
            self.logger.warning("Insufficient permissions to access network connections")
            return {"error": "Access denied"}

        remote_ips = [conn.raddr.ip for conn in connections if conn.raddr]
        ip_counts = Counter(remote_ips)
        suspicious_ips = [ip for ip, count in ip_counts.items() if count >= CONFIG.max_connections_per_ip]
        total_connections = len(connections)

        alerts = []
        for ip in suspicious_ips:
            alerts.append(
                create_alert(
                    "network_monitor",
                    f"High number of connections to {ip}: {ip_counts[ip]}",
                    "medium",
                )
            )
        if total_connections >= CONFIG.connection_spike_threshold:
            alerts.append(
                create_alert(
                    "network_monitor",
                    f"Connection spike detected: {total_connections} active connections",
                    "medium",
                )
            )

        self.alert_engine.record_batch(alerts)

        report = {
            "total_connections": total_connections,
            "unique_remote_ips": len(ip_counts),
            "top_remote_ips": summarize_list([f"{ip} ({count})" for ip, count in ip_counts.most_common(10)]),
            "suspicious_ips": summarize_list(suspicious_ips),
            "alerts_generated": len(alerts),
        }
        return report
