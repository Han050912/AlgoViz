"""
AI service: async OpenAI client for code analysis and trace generation.
"""
import json
from typing import AsyncIterator
from openai import AsyncOpenAI

ANALYSIS_SYSTEM_PROMPT = """你是一个算法分析专家。请分析给定代码，直接输出纯文本分析报告，不要使用 Markdown 格式（不加粗、不加标题符号、不使用代码块）。

报告应包含以下内容：

1. 算法概述
- 识别代码中使用的算法
- 用通俗语言描述核心逻辑

2. 复杂度分析
- 时间复杂度：给出 Big-O 表示法及简要推导
- 空间复杂度：给出 Big-O 表示法及推理过程

3. 逐步执行演示
- 用一个具体小例子 walkthrough 算法执行过程
- 展示每个步骤中变量的变化

4. 优缺点分析
- 列出该方法的优点和不足

5. 优化建议
- 如有可行的改进方案，至少提出一条实用建议

要求：简洁准确，使用中文输出，不要使用任何 Markdown 语法。"""

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
        self.client = AsyncOpenAI(base_url=base_url, api_key=api_key, timeout=180.0)
        self.model = model_name

    async def analyze_code_stream(self, code: str, language: str) -> AsyncIterator[str]:
        """Stream the plain-text analysis report chunk by chunk."""
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
        """Generate a simulated execution trace. Retries on JSON parse failure.

        Returns empty trace on failure — the analysis step will still run.
        """
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
                content = (response.choices[0].message.content or "").strip()
                # Remove markdown code fences if present
                if content.startswith("```"):
                    content = content[content.find("\n") + 1 :]
                if content.endswith("```"):
                    content = content[: content.rfind("```")]
                trace = json.loads(content)
                trace["language"] = language
                return trace
            except json.JSONDecodeError:
                # Retry only on JSON parse failure
                last_error = None
                if attempt < max_retries:
                    continue
                else:
                    break
            except Exception as e:
                last_error = e
                if attempt < max_retries:
                    continue
                break

        # Fallback: return empty trace so analysis can still proceed
        return {"language": language, "steps": []}

