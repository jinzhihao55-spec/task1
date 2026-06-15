# 翻译助手路由
# 支持中英互译和文本润色

from flask import Blueprint, request, jsonify
from services.ai_service import ai_service

translate_bp = Blueprint('translate', __name__)

# 翻译系统提示词
TRANSLATE_PROMPT = """你是一位专业翻译专家，精通中英双语。用户会给你一段文本，你需要：
1. 准确翻译文本内容
2. 保持原文的语气和风格
3. 对专业术语给出注释
4. 如果原文有语法或表达问题，给出润色建议
5. 用Markdown格式输出

翻译原则：信、达、雅。"""


@translate_bp.route('/translate', methods=['POST'])
def translate_text():
    """
    翻译接口
    请求体：{ "text": "待翻译文本", "target_lang": "目标语言(zh/en,可选,自动检测)" }
    返回：{ "success": true, "result": "翻译结果(Markdown)" }
    """
    data = request.get_json()

    if not data or 'text' not in data:
        return jsonify({
            "success": False,
            "error": "请提供待翻译文本，字段名：text"
        }), 400

    text = data['text'].strip()
    target_lang = data.get('target_lang', 'auto')

    if len(text) < 1:
        return jsonify({"success": False, "error": "翻译内容不能为空"}), 400

    # 构建提示词
    if target_lang == 'auto':
        user_prompt = f"请自动检测语言并翻译为另一种语言（中→英 或 英→中）：\n\n{text}"
    elif target_lang == 'zh':
        user_prompt = f"请将以下英文翻译为中文：\n\n{text}"
    elif target_lang == 'en':
        user_prompt = f"请将以下中文翻译为英文：\n\n{text}"
    else:
        user_prompt = f"请将以下文本翻译为{target_lang}：\n\n{text}"

    result = ai_service.chat(
        system_prompt=TRANSLATE_PROMPT,
        user_prompt=user_prompt,
        temperature=0.3  # 低温度，保证翻译准确性
    )

    return jsonify({
        "success": True,
        "result": result,
        "source_lang": target_lang
    })


@translate_bp.route('/polish', methods=['POST'])
def polish_text():
    """
    文本润色接口
    请求体：{ "text": "待润色文本", "lang": "语言(zh/en,可选)" }
    返回：{ "success": true, "result": "润色后的文本及修改说明" }
    """
    data = request.get_json()

    if not data or 'text' not in data:
        return jsonify({"success": False, "error": "请提供待润色文本"}), 400

    text = data['text'].strip()
    lang = data.get('lang', 'zh')

    polish_prompt = f"""请对以下{lang}文文本进行润色优化：

原文：
{text}

要求：
1. 保持原文核心含义不变
2. 优化表达，使其更流畅、更专业
3. 列出主要修改点及原因
4. 同时给出润色后的完整文本"""

    result = ai_service.chat(
        system_prompt="你是资深编辑和语言专家，擅长文本润色和优化。",
        user_prompt=polish_prompt,
        temperature=0.4
    )

    return jsonify({
        "success": True,
        "result": result
    })
