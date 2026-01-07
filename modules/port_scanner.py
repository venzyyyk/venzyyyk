import errno
import socket
from concurrent.futures import ThreadPoolExecutor, as_completed

from core.alert_engine import AlertEngine, create_alert
from core.config import CONFIG
from core.logger import setup_logger


class PortScanner:
    def __init__(self, timeout: float = 0.5, workers: int = 100) -> None:
        self.timeout = timeout
        self.workers = workers
        self.logger = setup_logger()
        self.alert_engine = AlertEngine()

    def scan(self, host: str, port_range: str | None = None) -> dict:
        ports = self._parse_ports(port_range or CONFIG.default_port_range)
        results: dict[int, str] = {}

        with ThreadPoolExecutor(max_workers=self.workers) as executor:
            future_map = {executor.submit(self._scan_port, host, port): port for port in ports}
            for future in as_completed(future_map):
                port = future_map[future]
                results[port] = future.result()

        open_ports = [port for port, state in results.items() if state == "OPEN"]
        alerts = []
        if open_ports:
            alerts.append(create_alert("port_scanner", f"Open ports on {host}: {open_ports}", "low"))
        self.alert_engine.record_batch(alerts)

        report = {
            "host": host,
            "scanned_ports": len(results),
            "open_ports": open_ports,
            "results": results,
            "alerts_generated": len(alerts),
        }
        return report

    def _scan_port(self, host: str, port: int) -> str:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(self.timeout)
        try:
            result = sock.connect_ex((host, port))
            if result == 0:
                return "OPEN"
            if result == errno.ECONNREFUSED:
                return "CLOSED"
            return "FILTERED"
        except socket.timeout:
            return "FILTERED"
        except OSError:
            return "FILTERED"
        finally:
            sock.close()

    def _parse_ports(self, range_str: str) -> list[int]:
        ports = set()
        for part in range_str.split(","):
            part = part.strip()
            if "-" in part:
                start, end = part.split("-", maxsplit=1)
                ports.update(range(int(start), int(end) + 1))
            else:
                ports.add(int(part))
        return sorted(ports)
