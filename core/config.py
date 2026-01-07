from dataclasses import dataclass
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
REPORTS_DIR = BASE_DIR / "reports"
SAMPLES_DIR = BASE_DIR / "samples"


@dataclass(frozen=True)
class AppConfig:
    app_name: str = "CyberGuard"
    alert_db_path: Path = DATA_DIR / "alerts.db"
    alert_json_path: Path = DATA_DIR / "alerts.json"
    report_dir: Path = REPORTS_DIR
    log_time_window_seconds: int = 120
    brute_force_threshold: int = 5
    suspicious_ip_threshold: int = 10
    max_connections_per_ip: int = 20
    connection_spike_threshold: int = 50
    default_port_range: str = "1-1024"


CONFIG = AppConfig()
