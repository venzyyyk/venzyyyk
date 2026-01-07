# CyberGuard

CyberGuard is a local Windows-ready cybersecurity CLI toolkit that monitors security events, analyzes logs, detects suspicious behavior, scans ports, and generates reports.

## Features
- Log analyzer for brute-force and suspicious IP patterns
- TCP port scanner with multithreading
- Network connection snapshot using `psutil`
- Process monitor with suspicious heuristics
- Sandbox Lite static risk scoring (hashes, entropy, strings)
- Unified alert engine (SQLite with JSON fallback)
- Reports saved as JSON and TXT

## Project structure
```
core/
  alert_engine.py
  config.py
  logger.py
  utils.py
modules/
  log_analyzer.py
  network_monitor.py
  port_scanner.py
  process_monitor.py
  sandbox_lite.py
ui/
  cli.py
samples/
main.py
```

## Requirements
- Python 3.11+
- `psutil`

Install dependencies:
```bash
python -m pip install -r requirements.txt
```

## Usage
Run the CLI menu:
```bash
python main.py
```

Example flow:
1. Choose **Analyze log file** and point to `samples/sample_log_1.txt`
2. Reports are written to `reports/` in JSON and TXT formats

## Reports
Reports are saved with a timestamp in `reports/`:
- `log_analysis_YYYYMMDD_HHMMSS.json`
- `log_analysis_YYYYMMDD_HHMMSS.txt`

## Building a single EXE (PyInstaller)
1. Install dependencies:
   ```bash
   python -m pip install -r requirements.txt
   python -m pip install pyinstaller
   ```
2. Build:
   ```bash
   pyinstaller --onefile --name CyberGuard main.py
   ```
3. The executable will be in `dist/CyberGuard.exe`.

### Including configuration
CyberGuard uses defaults in `core/config.py`. To bundle a custom config file:
1. Create `config.json` alongside `main.py`.
2. Load it in `core/config.py` (optional enhancement).
3. Package it with PyInstaller:
   ```bash
   pyinstaller --onefile --add-data "config.json;." --name CyberGuard main.py
   ```

## Samples
Five sample logs are included in `samples/` to demonstrate bruteforce and suspicious IP detections.
