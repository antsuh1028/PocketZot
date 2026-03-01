#!/usr/bin/env python3
"""
Convert openai_dataset.jsonl (prompt/completion format) into OpenAI chat fine-tuning format:
  {"messages": [{"role": "system", "content": "..."}, {"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]}

Input: each line has "prompt" (taxonomy instructions + newline + student prompt) and "completion" (assistant JSON).
Output: one JSON object per line with "messages" array.
"""

import json
import sys
from pathlib import Path


def convert_line(record: dict) -> dict:
    """Convert one prompt/completion record to messages format."""
    prompt = record.get("prompt", "")
    completion = record.get("completion", "")

    # Prompt is "SYSTEM_INSTRUCTIONS\nUSER_MESSAGE"
    parts = prompt.split("\n", 1)
    system_content = parts[0].strip() if parts else ""
    user_content = parts[1].strip() if len(parts) > 1 else ""

    return {
        "messages": [
            {"role": "system", "content": system_content},
            {"role": "user", "content": user_content},
            {"role": "assistant", "content": completion},
        ]
    }


def main():
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    default_input_path = project_root / "data" / "openai_dataset.jsonl"
    default_output_path = project_root / "data" / "openai_finetune.jsonl"

    input_path = Path(sys.argv[1]) if len(sys.argv) >= 2 else default_input_path
    output_path = Path(sys.argv[2]) if len(sys.argv) >= 3 else default_output_path

    if not input_path.exists():
        print(f"Error: Input file not found: {input_path}", file=sys.stderr)
        sys.exit(1)

    count = 0
    with open(input_path, "r", encoding="utf-8") as fin, open(
        output_path, "w", encoding="utf-8"
    ) as fout:
        for line in fin:
            line = line.strip()
            if not line:
                continue
            record = json.loads(line)
            converted = convert_line(record)
            fout.write(json.dumps(converted, ensure_ascii=False) + "\n")
            count += 1

    print(f"Converted {count} records to {output_path}")


if __name__ == "__main__":
    main()
