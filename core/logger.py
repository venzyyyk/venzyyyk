import logging
from pathlib import Path

from core.config import DATA_DIR


LOG_FILE = DATA_DIR / "cyberguard.log"


def setup_logger(name: str = "cyberguard", level: int = logging.INFO) -> logging.Logger:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    logger = logging.getLogger(name)
    if logger.handlers:
        return logger

    logger.setLevel(level)
    formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(message)s")

    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(formatter)
    logger.addHandler(stream_handler)

    file_handler = logging.FileHandler(Path(LOG_FILE))
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    return logger
