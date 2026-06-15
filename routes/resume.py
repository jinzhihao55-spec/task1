# 简历优化路由
# 接收简历文本，返回AI优化建议

from flask import Blueprint, request, jsonify
from services.ai_service import ai_service

resume_bp = Blueprint('resume', __name__)

# 系统提示词
SYSTEM_PROMPT = """你是一位专业的简历优化顾问。用户会给你一段简历内容，你需要：
1. 整体评价简历的优缺点
2. 逐条给出具体的修改建议
3. 对每条建议给出优化前后的对比示例
4. 提供格式和排版建议
5. 用Markdown格式输出，结构清晰

请用中文回答，语气专业且鼓励。"""


@resume_bp.route('/optimize', methods=['POST'])
def optimize_resume():
    """
    简历优化接口
    请求体：{ "text": "简历文本内容" }
    返回：{ "success": true, "result": "优化建议(Markdown)" }
    """
    data = request.get_json()

    if not data or 'text' not in data:
        return jsonify({
            "success": False,
            "error": "请提供简历文本内容，字段名：text"
        }), 400

    resume_text = data['text'].strip()

    if len(resume_text) < 10:
        return jsonify({
            "success": False,
            "error": "简历内容过短，请提供更完整的简历信息"
        }), 400

    # 调用AI服务
    result = ai_service.chat(
        system_prompt=SYSTEM_PROMPT,
        user_prompt=f"请帮我优化以下简历内容：\n\n{resume_text}",
        temperature=0.5  # 较低温度，保证建议的专业性
    )

    return jsonify({
        "success": True,
        "result": result,
        "input_length": len(resume_text)
    })


@resume_bp.route('/analyze', methods=['POST'])
def analyze_resume():
    """
    简历快速分析接口（轻量版）
    请求体：{ "text": "简历文本内容" }
    返回：{ "success": true, "scores": {...}, "keywords": [...] }
    """
    data = request.get_json()

    if not data or 'text' not in data:
        return jsonify({"success": False, "error": "请提供简历文本"}), 400

    resume_text = data['text'].strip()

    # 简单的本地分析（不需要AI）
    scores = {
        "completeness": min(100, len(resume_text) // 5),  # 基于长度估算完整度
        "keywords_count": len([w for w in ["Python", "Java", "React", "Vue", "SQL", "AI", "ML",
                                           "Flask", "Django", "Docker", "Git", "Linux",
                                           "项目", "经验", "负责", "主导", "优化", "设计"]
                                 if w in resume_text]),
        "has_education": "教育" in resume_text or "学历" in resume_text or "大学" in resume_text,
        "has_experience": "经验" in resume_text or "工作" in resume_text or "项目" in resume_text,
        "has_skills": "技能" in resume_text or "熟练" in resume_text or "精通" in resume_text
    }

    return jsonify({
        "success": True,
        "scores": scores
    })
