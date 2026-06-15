# AI 服务层 - 统一管理 AI 调用
# 支持多模型切换：OpenAI / 智谱AI / 模拟返回

import os
import json
from openai import OpenAI
from services.mock_data import MOCK_RESPONSES


class AIService:
    """统一的 AI 调用服务"""

    def __init__(self):
        # 从环境变量读取配置
        self.api_key = os.getenv('AI_API_KEY', '')
        self.api_base = os.getenv('AI_API_BASE', 'https://api.openai.com/v1')
        self.model = os.getenv('AI_MODEL', 'gpt-3.5-turbo')
        self.use_mock = os.getenv('USE_MOCK', 'true').lower() == 'true'

        # 初始化客户端（仅在有 API Key 时）
        self.client = None
        if self.api_key and not self.use_mock:
            self.client = OpenAI(
                api_key=self.api_key,
                base_url=self.api_base
            )

    def chat(self, system_prompt: str, user_prompt: str, temperature: float = 0.7) -> str:
        """
        统一的 AI 对话接口
        :param system_prompt: 系统提示词
        :param user_prompt: 用户输入
        :param temperature: 创造性程度 0-1
        :return: AI 回复文本
        """
        if self.use_mock or not self.client:
            return self._mock_response(system_prompt, user_prompt)

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=temperature
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"[AI 调用失败: {str(e)}，已切换到模拟返回]\n\n{self._mock_response(system_prompt, user_prompt)}"

    def _mock_response(self, system_prompt: str, user_prompt: str) -> str:
        """模拟返回 - 用于开发和演示"""
        # 根据系统提示词关键词匹配模拟数据
        for key, value in MOCK_RESPONSES.items():
            if key in system_prompt:
                return value
        return "这是模拟返回的 AI 响应。请配置 AI_API_KEY 环境变量以启用真实 AI 调用。"


# 全局单例
ai_service = AIService()
