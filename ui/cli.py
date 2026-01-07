import json
from datetime import datetime

from core.config import CONFIG
from core.logger import setup_logger
from core.utils import write_report
from modules.log_analyzer import LogAnalyzer
from modules.network_monitor import NetworkMonitor
from modules.port_scanner import PortScanner
from modules.process_monitor import ProcessMonitor
from modules.sandbox_lite import SandboxLite


class CyberGuardCLI:
    def __init__(self) -> None:
        self.logger = setup_logger()
        self.log_analyzer = LogAnalyzer()
        self.network_monitor = NetworkMonitor()
        self.port_scanner = PortScanner()
        self.process_monitor = ProcessMonitor()
        self.sandbox_lite = SandboxLite()

    def run(self) -> None:
        while True:
            print("\nCyberGuard Menu")
            print("1. Analyze log file")
            print("2. Scan ports")
            print("3. Network monitor snapshot")
            print("4. Process monitor snapshot")
            print("5. Sandbox lite analysis")
            print("6. Exit")
            choice = input("Select option: ").strip()

            try:
                if choice == "1":
                    self._handle_log_analysis()
                elif choice == "2":
                    self._handle_port_scan()
                elif choice == "3":
                    self._handle_network_snapshot()
                elif choice == "4":
                    self._handle_process_snapshot()
                elif choice == "5":
                    self._handle_sandbox()
                elif choice == "6":
                    print("Exiting CyberGuard.")
                    break
                else:
                    print("Invalid option.")
            except Exception as exc:
                self.logger.error("Operation failed: %s", exc)
                print(f"Error: {exc}")

    def _handle_log_analysis(self) -> None:
        path = input("Path to log file: ").strip()
        report = self.log_analyzer.analyze(path)
        self._save_report("log_analysis", report)

    def _handle_port_scan(self) -> None:
        host = input("Host/IP to scan: ").strip()
        port_range = input(f"Port range ({CONFIG.default_port_range}): ").strip() or None
        report = self.port_scanner.scan(host, port_range)
        self._save_report("port_scan", report)

    def _handle_network_snapshot(self) -> None:
        report = self.network_monitor.snapshot()
        self._save_report("network_snapshot", report)

    def _handle_process_snapshot(self) -> None:
        report = self.process_monitor.snapshot()
        self._save_report("process_snapshot", report)

    def _handle_sandbox(self) -> None:
        path = input("Path to file: ").strip()
        report = self.sandbox_lite.analyze(path)
        self._save_report("sandbox_lite", report)

    def _save_report(self, prefix: str, report: dict) -> None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        name = f"{prefix}_{timestamp}"
        json_path, txt_path = write_report(CONFIG.report_dir, name, report)
        print("Report saved:")
        print(f"  JSON: {json_path}")
        print(f"  TXT: {txt_path}")
        print("Summary:")
        print(json.dumps(report, ensure_ascii=False, indent=2))
