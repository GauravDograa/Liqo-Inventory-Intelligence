from __future__ import annotations

import subprocess
import sys
from pathlib import Path
import shutil


ROOT = Path(__file__).resolve().parent
BACKEND_DIR = ROOT.parent / "backend"
DATASET_PATH = ROOT / "training_dataset.json"


def main() -> None:
    history_window_days = sys.argv[1] if len(sys.argv) > 1 else "180"
    horizon_days = sys.argv[2] if len(sys.argv) > 2 else "30"
    step_days = sys.argv[3] if len(sys.argv) > 3 else "30"

    run(
        [resolve_command("npm"), "run", "build"],
        cwd=BACKEND_DIR,
    )
    run(
        [
            resolve_command("node"),
            "scripts/export-ml-training-dataset.js",
            str(DATASET_PATH),
            "",
            history_window_days,
            horizon_days,
            step_days,
        ],
        cwd=BACKEND_DIR,
    )
    run(
        [sys.executable, "train_baseline.py"],
        cwd=ROOT,
    )
    run(
        [sys.executable, "train_challenger.py"],
        cwd=ROOT,
    )
    run(
        [sys.executable, "train_lag_trend.py"],
        cwd=ROOT,
    )
    run(
        [sys.executable, "evaluate_baseline.py"],
        cwd=ROOT,
    )


def run(command: list[str], cwd: Path) -> None:
    result = subprocess.run(command, cwd=str(cwd), check=False)
    if result.returncode != 0:
        raise SystemExit(result.returncode)


def resolve_command(name: str) -> str:
    direct = shutil.which(name)
    if direct:
        return direct

    if sys.platform.startswith("win"):
        cmd = shutil.which(f"{name}.cmd")
        if cmd:
            return cmd

        exe = shutil.which(f"{name}.exe")
        if exe:
            return exe

    return name


if __name__ == "__main__":
    main()
