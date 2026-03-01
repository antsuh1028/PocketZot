#!/usr/bin/env python3
"""
Test the fine-tuned taxonomy classifier model.
Usage: python scripts/test_finetune.py <model_id> [prompt]
"""

import json
import os
import sys

try:
    from openai import OpenAI
except ImportError:
    print("Error: pip install openai", file=sys.stderr)
    sys.exit(1)

SYSTEM_PROMPT = (
    "Classify the student prompt according to this taxonomy: "
    "-3 → Asks LLM to produce new or original work (essay, poem, story, solution only). "
    "-2 → Asks to justify or defend a position or decision. "
    "-1 → Asks to draw connections, compare, synthesize, or relate ideas. "
    "+1 → Asks for explanation, recall, or clarification of concepts. "
    "+2 → Alters LLM behavior to encourage deeper learning (e.g., 'Help me think step by step', 'Ask guiding questions')"
)


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/test_finetune.py <model_id> [prompt]")
        print("\nExample:")
        print('  python scripts/test_finetune.py ft:gpt-4o-mini-2024-07-18:org:taxonomy-classifier:xxxxx')
        print('  python scripts/test_finetune.py ft:... "What is photosynthesis?"')
        sys.exit(1)

    model_id = sys.argv[1]
    user_prompt = sys.argv[2] if len(sys.argv) > 2 else "Explain dijkstra's algorithm and how i can use it and what it is used for and why people use it"

    if not os.environ.get("OPENAI_API_KEY"):
        print("Error: Set OPENAI_API_KEY", file=sys.stderr)
        sys.exit(1)

    client = OpenAI()

    response = client.chat.completions.create(
        model=model_id,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0,
    )

    content = response.choices[0].message.content
    print(f"Prompt: {user_prompt}")
    print(f"Response: {content}")

    # Try to parse as JSON for pretty output
    try:
        parsed = json.loads(content)
        print(f"\nParsed: value={parsed.get('value')}, suggestion={parsed.get('suggestion')}")
    except json.JSONDecodeError:
        pass


if __name__ == "__main__":
    main()
