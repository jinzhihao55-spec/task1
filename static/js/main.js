const API_BASE = '';

// 检查服务健康状态
async function checkHealth() {
    const statusEl = document.getElementById('status');
    statusEl.textContent = '检查连接中...';

    try {
        const res = await fetch(`${API_BASE}/api/health`);
        const data = await res.json();
        if (data.status === 'ok') {
            statusEl.textContent = `✅ 服务运行正常 - ${data.message}`;
            statusEl.style.color = '#28a745';
        } else {
            statusEl.textContent = '⚠️ 服务响应异常';
            statusEl.style.color = '#ffc107';
        }
    } catch (e) {
        statusEl.textContent = '❌ 无法连接后端服务';
        statusEl.style.color = '#dc3545';
    }
}

// 调用各功能API
async function callAPI(tool) {
    let endpoint, body, resultId;

    switch(tool) {
        case 'resume':
            endpoint = '/api/resume/optimize';
            const resumeText = document.getElementById('resume-input').value.trim();
            if (!resumeText) return alert('请输入简历内容');
            body = { text: resumeText };
            resultId = 'resume-result';
            break;

        case 'copywriting':
            endpoint = '/api/copywriting/generate';
            const scene = document.getElementById('copy-scene').value.trim();
            if (!scene) return alert('请输入场景描述');
            body = {
                scene: scene,
                style: document.getElementById('copy-style').value,
                count: parseInt(document.getElementById('copy-count').value) || 3
            };
            resultId = 'copywriting-result';
            break;

        case 'translate':
            endpoint = '/api/translate/translate';
            const transText = document.getElementById('translate-input').value.trim();
            if (!transText) return alert('请输入要翻译的文本');
            body = {
                text: transText,
                target_lang: document.getElementById('translate-lang').value
            };
            resultId = 'translate-result';
            break;

        case 'polish':
            endpoint = '/api/translate/polish';
            const polishText = document.getElementById('translate-input').value.trim();
            if (!polishText) return alert('请输入要润色的文本');
            body = { text: polishText, lang: 'zh' };
            resultId = 'translate-result';
            break;

        case 'pdf-text':
            endpoint = '/api/pdf/summarize';
            const pdfText = document.getElementById('pdf-text-area').value.trim();
            if (!pdfText) return alert('请输入PDF文本内容');
            body = { text: pdfText };
            resultId = 'pdf-result';
            break;

        case 'csv-data':
            endpoint = '/api/csv/analyze';
            const csvData = document.getElementById('csv-data').value.trim();
            if (!csvData) return alert('请输入CSV数据');
            body = { data: csvData };
            resultId = 'csv-result';
            break;

        default:
            return;
    }

    await executeAPI(endpoint, body, resultId);
}

async function executeAPI(endpoint, body, resultId) {
    const resultEl = document.getElementById(resultId);
    resultEl.classList.add('show');
    resultEl.innerHTML = '<div class="loading">⏳ 处理中，请稍候...</div>';

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (data.success) {
            let content = data.result || data.analysis || '';
            resultEl.innerHTML = `<pre>${escapeHtml(content)}</pre>`;
        } else {
            resultEl.innerHTML = `<div class="error">❌ ${data.error || '请求失败'}</div>`;
        }
    } catch (e) {
        resultEl.innerHTML = `<div class="error">❌ 网络错误: ${e.message}</div>`;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 页面加载时检查健康状态
document.addEventListener('DOMContentLoaded', checkHealth);
