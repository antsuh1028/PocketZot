#!/usr/bin/env python3
"""
Upload the training dataset and create an OpenAI fine-tuning job.
Requires: pip install openai
Requires: OPENAI_API_KEY environment variable
"""

import os
import sys
from pathlib import Path

try:
    from openai import OpenAI
except ImportError as e:
    print("Error: Could not import openai.", file=sys.stderr)
    print(f"  {e}", file=sys.stderr)
    print("\nYou may be using a different Python than where openai is installed.", file=sys.stderr)
    print("Try: python -c \"import openai; print('OK')\"  # or: python3", file=sys.stderr)
    print("Install in current env: pip install openai", file=sys.stderr)
    sys.exit(1)


def main():
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    dataset_path = project_root / "data" / "dataset.jsonl"

    if len(sys.argv) >= 2:
        dataset_path = Path(sys.argv[1])

    if not dataset_path.exists():
        print(f"Error: Dataset not found: {dataset_path}", file=sys.stderr)
        print("Run: python3 scripts/convert_dataset_to_messages.py", file=sys.stderr)
        sys.exit(1)

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("Error: Set OPENAI_API_KEY environment variable", file=sys.stderr)
        sys.exit(1)

    client = OpenAI()

    # 1. Upload the training file
    print(f"Uploading {dataset_path}...")
    with open(dataset_path, "rb") as f:
        file_response = client.files.create(file=f, purpose="fine-tune")
    training_file_id = file_response.id
    print(f"Uploaded. File ID: {training_file_id}")

    # 2. Create the fine-tuning job
    # gpt-4o-mini requires Tier 4+ usage; use gpt-4.1-mini or gpt-4.1-nano for lower tiers
    model = "gpt-4o-mini-2024-07-18"
    suffix = "taxonomy-classifier"

    print(f"Creating fine-tuning job (model={model}, suffix={suffix})...")
    job = client.fine_tuning.jobs.create(
        training_file=training_file_id,
        model=model,
        suffix=suffix,
    )

    print(f"\nJob created successfully!")
    print(f"  Job ID: {job.id}")
    print(f"  Status: {job.status}")
    print(f"\nCheck status in the dashboard: https://platform.openai.com/finetune")


if __name__ == "__main__":
    main()
