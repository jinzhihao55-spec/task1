# 多功能智能助手平台 - 后端服务
# Python 3.11 + Flask

from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import os

# 注册蓝图
from routes.resume import resume_bp
from routes.copywriting import copywriting_bp
from routes.translate import translate_bp
from routes.pdf_summary import pdf_summary_bp
from routes.csv_preview import csv_preview_bp

app = Flask(__name__,
            template_folder='templates',
            static_folder='static')

# 跨域支持
CORS(app)

# 上传文件配置
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'static', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 最大16MB

# 注册路由蓝图
app.register_blueprint(resume_bp, url_prefix='/api/resume')
app.register_blueprint(copywriting_bp, url_prefix='/api/copywriting')
app.register_blueprint(translate_bp, url_prefix='/api/translate')
app.register_blueprint(pdf_summary_bp, url_prefix='/api/pdf')
app.register_blueprint(csv_preview_bp, url_prefix='/api/csv')


# 首页路由
@app.route('/')
def index():
    """返回主页，前端入口"""
    return render_template('index.html')


# 工具页面路由
@app.route('/resume')
def resume_page():
    return render_template('resume.html')


@app.route('/copywriting')
def copywriting_page():
    return render_template('copywriting.html')


@app.route('/translate')
def translate_page():
    return render_template('translate.html')


@app.route('/pdf')
def pdf_page():
    return render_template('pdf.html')


@app.route('/csv')
def csv_page():
    return render_template('csv.html')


# 健康检查
@app.route('/api/health')
def health():
    return jsonify({"status": "ok", "message": "多功能智能助手平台运行中"})


if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5001)
