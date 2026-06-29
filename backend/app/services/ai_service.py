"""
AI service: async OpenAI client for code analysis and trace generation.
"""
from typing import AsyncIterator
from openai import AsyncOpenAI

ANALYSIS_SYSTEM_PROMPT = """You are an algorithm analysis expert. Analyze the given code and produce a structured Markdown report with these sections:

## 1. Algorithm Overview
- Identify the algorithm(s) used in the code.
- Describe the core logic in plain language.

## 2. Complexity Analysis
- **Time Complexity**: Give the Big-O notation with a brief derivation.
- **Space Complexity**: Give the Big-O notation with reasoning.

## 3. Step-by-step Execution Walkthrough
- Walk through the algorithm with a concrete small example.
- Show how variables change at each step.

## 4. Strengths & Weaknesses
- List pros and cons of this approach.

## 5. Optimization Suggestions
- Suggest at least one practical improvement if applicable.

Keep the report concise, accurate, and in proper Markdown."""

TRACE_SYSTEM_PROMPT = """You are a code execution simulator. Given source code in {language}, simulate the execution step by step
and produce a JSON object with the following structure:

{{
  "steps": [
    {{
      "step": 0,
      "line": 1,
      "action": "call",
      "function": "function_name",
      "call_stack": ["function_name(args)"],
      "locals": {{}},
      "globals": {{}},
      "output": ""
    }}
  ]
}}

Include every meaningful execution step including variable assignments, comparisons, branches, and returns.
Use the exact line numbers from the source code. Return ONLY valid JSON, no markdown, no explanation."""


class AIService:
    """Async OpenAI client wrapper for code analysis and trace generation."""

    def __init__(self, base_url: str, api_key: str, model_name: str):
        self.client = AsyncOpenAI(base_url=base_url, api_key=api_key, timeout=5.0)
        self.model = model_name

    async def analyze_code_stream(self, code: str, language: str) -> AsyncIterator[str]:
        """Stream the Markdown analysis report chunk by chunk."""
        stream = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"Language: {language}\n\nCode:\n```{language}\n{code}\n```",
                },
            ],
            stream=True,
            temperature=0.3,
        )
        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    async def generate_trace(self, code: str, language: str, max_retries: int = 2) -> dict:
        """Generate a simulated execution trace. Retries on JSON parse failure."""
        prompt = TRACE_SYSTEM_PROMPT.format(language=language)
        last_error = None

        for attempt in range(max_retries + 1):
            try:
                response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": prompt},
                        {
                            "role": "user",
                            "content": f"Language: {language}\n\nCode:\n```{language}\n{code}\n```\n\nProduce ONLY valid JSON:",
                        },
                    ],
                    temperature=0.1,
                )
                content = response.choices[0].message.content.strip()
                # Remove markdown code fences if present
                if content.startswith("```"):
                    content = content[content.find("\n") + 1 :]
                if content.endswith("```"):
                    content = content[: content.rfind("```")]
                import json
                trace = json.loads(content)
                trace["language"] = language
                return trace
            except Exception as e:
                last_error = e
                if attempt < max_retries:
                    continue
                raise last_error

