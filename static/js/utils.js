// 共享前端工具函数

// ============== Markdown 渲染 ==============

function renderMarkdown(text) {
    if (!text) return '<p class="text-on-surface-variant">无内容</p>';

    let html = escapeHtml(text);

    // 标题
    html = html.replace(/^######\s+(.*)$/gm, '<h6 class="text-sm font-semibold text-on-surface mt-3 mb-2">$1</h6>');
    html = html.replace(/^#####\s+(.*)$/gm, '<h5 class="text-base font-semibold text-on-surface mt-3 mb-2">$1</h5>');
    html = html.replace(/^####\s+(.*)$/gm, '<h4 class="text-base font-semibold text-on-surface mt-3 mb-2">$1</h4>');
    html = html.replace(/^###\s+(.*)$/gm, '<h4 class="text-lg font-bold text-on-surface mt-4 mb-2">$1</h4>');
    html = html.replace(/^##\s+(.*)$/gm, '<h3 class="text-xl font-bold text-on-surface mt-6 mb-3">$1</h3>');
    html = html.replace(/^#\s+(.*)$/gm, '<h2 class="text-2xl font-bold text-on-surface mt-6 mb-3">$1</h2>');

    // 行内
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="text-secondary font-semibold">$1</strong>');
    html = html.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em class="text-tertiary">$1</em>');
    html = html.replace(/`([^`\n]+)`/g, '<code class="bg-surface-container px-1.5 py-0.5 rounded text-sm font-mono text-secondary">$1</code>');

    // 引用
    html = html.replace(/^>\s*(.*)$/gm, '<blockquote class="border-l-2 border-secondary pl-3 italic text-on-surface-variant my-3">$1</blockquote>');

    // 列表
    html = html.replace(/^(\d+)\.\s+(.*)$/gm, '<li class="ml-6 list-decimal text-on-surface">$2</li>');
    html = html.replace(/^[-*]\s+(.*)$/gm, '<li class="ml-6 list-disc text-on-surface">$1</li>');

    // 水平线
    html = html.replace(/^---+$/gm, '<hr class="border-outline-variant/30 my-4">');

    // 段落化
    const lines = html.split('\n');
    const result = lines.map(line => {
        const t = line.trim();
        if (!t) return '';
        if (/^<(h\d|blockquote|li|hr|p|pre|ul|ol|div)/.test(t)) return t;
        if (t.endsWith('</li>') || t.endsWith('</blockquote>') || t.endsWith('</hr>')) return t;
        return `<p class="text-on-surface leading-relaxed mb-3">${t}</p>`;
    }).filter(l => l !== '').join('\n');

    return `<div class="markdown-content">${result}</div>`;
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

// ============== 通用 UI ==============

function showToast(text, type = 'success') {
    const toast = document.createElement('div');
    const bg = type === 'success' ? 'bg-emerald-500/90' : type === 'error' ? 'bg-red-500/90' : 'bg-blue-500/90';
    toast.className = `fixed bottom-8 left-1/2 -translate-x-1/2 ${bg} text-white px-6 py-3 rounded-xl shadow-lg z-[200] text-sm font-medium`;
    toast.textContent = text;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2200);
}

function copyText(text) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => showToast('已复制到剪贴板'));
}

// ============== 历史记录 ==============

let CURRENT_TOOL = '';
let HISTORY_RECORDS = [];

function toggleHistorySidebar() {
    const sidebar = document.getElementById('history-sidebar');
    if (!sidebar) return;
    sidebar.classList.toggle('hidden');
    if (!sidebar.classList.contains('hidden')) {
        refreshHistory();
    }
}

async function initHistorySidebar(tool) {
    CURRENT_TOOL = tool;
    // 显示浮动按钮
    const btn = document.getElementById('history-toggle-btn');
    if (btn) btn.classList.remove('hidden');
    // 加载一次
    refreshHistory();
}

async function saveHistory(record) {
    try {
        const res = await fetch('/api/history/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record),
        });
        const data = await res.json();
        return data.id;
    } catch (e) {
        console.error('saveHistory error', e);
        return null;
    }
}

async function refreshHistory() {
    if (!CURRENT_TOOL) return;
    try {
        const res = await fetch(`/api/history/list?tool=${CURRENT_TOOL}&limit=30`);
        const data = await res.json();
        if (data.success) {
            HISTORY_RECORDS = data.records || [];
            renderHistory();
        }
    } catch (e) {
        console.error('refreshHistory error', e);
    }
}

function renderHistory() {
    const list = document.getElementById('history-list');
    const countEl = document.getElementById('history-count');
    if (!list) return;
    if (countEl) countEl.textContent = `${HISTORY_RECORDS.length} 条记录`;

    if (HISTORY_RECORDS.length === 0) {
        list.innerHTML = `<div class="text-center text-on-surface-variant text-sm py-12">
            <span class="material-symbols-outlined text-3xl mb-2">inbox</span>
            <p>暂无历史记录</p>
        </div>`;
        return;
    }

    list.innerHTML = HISTORY_RECORDS.map(r => `
        <div class="history-item glass-card rounded-xl p-3 mb-2 cursor-pointer hover:border-primary/50 transition-colors" data-id="${r.id}">
            <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-on-surface truncate">${escapeHtml(r.title || '未命名')}</p>
                    <p class="text-xs text-on-surface-variant mt-1 line-clamp-2">${escapeHtml((r.input_text || '').slice(0, 80))}</p>
                    <p class="text-xs text-on-surface-variant/60 mt-1">${(r.created_at || '').replace('T', ' ')}</p>
                </div>
                <div class="flex flex-col gap-1">
                    <button onclick="event.stopPropagation(); loadHistoryItem('${r.id}')" class="w-7 h-7 rounded-md hover:bg-white/10 text-on-surface-variant flex items-center justify-center" title="查看">
                        <span class="material-symbols-outlined text-base">visibility</span>
                    </button>
                    <button onclick="event.stopPropagation(); deleteHistoryItem('${r.id}')" class="w-7 h-7 rounded-md hover:bg-red-500/20 text-red-400 flex items-center justify-center" title="删除">
                        <span class="material-symbols-outlined text-base">delete</span>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

async function loadHistoryItem(id) {
    try {
        const res = await fetch(`/api/history/${id}`);
        const data = await res.json();
        if (data.success) {
            const rec = data.record;
            // 把内容填到当前页面的 result 区域
            if (typeof showResult === 'function') {
                showResult(rec.output_text);
            }
            if (typeof currentResultText !== 'undefined') {
                currentResultText = rec.output_text;
            }
            toggleHistorySidebar();
            showToast('已加载历史记录');
        }
    } catch (e) {
        showToast('加载失败', 'error');
    }
}

async function deleteHistoryItem(id) {
    if (!confirm('确定删除该历史记录？')) return;
    try {
        const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            showToast('已删除');
            refreshHistory();
        }
    } catch (e) {
        showToast('删除失败', 'error');
    }
}

async function clearAllHistory() {
    if (!confirm('确定清空所有历史记录？此操作不可恢复')) return;
    try {
        const res = await fetch(`/api/history/clear?tool=${CURRENT_TOOL}`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            showToast(`已清空 ${data.deleted} 条`);
            refreshHistory();
        }
    } catch (e) {
        showToast('清空失败', 'error');
    }
}

// ============== 文件上传（拖拽 + 点击） ==============

function initFileUpload({ dropzoneId, fileInputId, defaultId, successId, filenameId, onSelect }) {
    const dropzone = document.getElementById(dropzoneId);
    const fileInput = document.getElementById(fileInputId);
    if (!dropzone || !fileInput) return;

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('border-primary'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('border-primary'));
    dropzone.addEventListener('drop', e => {
        e.preventDefault();
        dropzone.classList.remove('border-primary');
        if (e.dataTransfer.files.length > 0) onSelect(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', e => {
        if (e.target.files.length > 0) onSelect(e.target.files[0]);
    });
}

function showUploadSuccess(defaultId, successId, filenameId, name) {
    const d = document.getElementById(defaultId);
    const s = document.getElementById(successId);
    const f = document.getElementById(filenameId);
    if (d) d.classList.add('hidden');
    if (s) s.classList.remove('hidden');
    if (f) f.textContent = name;
}

function clearUpload(defaultId, successId) {
    const d = document.getElementById(defaultId);
    const s = document.getElementById(successId);
    if (d) d.classList.remove('hidden');
    if (s) s.classList.add('hidden');
}

// ============== 导出 + 预览 ==============

async function exportAndPreview(format, content, title, previewContainerId = 'export-preview', style) {
    if (!content) {
        showToast('请先生成内容', 'error');
        return null;
    }
    try {
        const body = { format, title, content };
        if (style) body.style = style;
        const res = await fetch('/api/history/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.success) {
            showExportPreview(data.download_url, data.filename, previewContainerId);
            return data;
        } else {
            showToast('导出失败：' + (data.error || ''), 'error');
            return null;
        }
    } catch (e) {
        showToast('导出失败：' + e.message, 'error');
        return null;
    }
}

function showExportPreview(url, filename, previewContainerId = 'export-preview') {
    const preview = document.getElementById(previewContainerId);
    if (!preview) return;
    const iframe = preview.querySelector('iframe');
    const link = preview.querySelector('a[download]');
    if (iframe) iframe.src = url;
    if (link) { link.href = url; link.download = filename; }
    preview.classList.remove('hidden');
    setTimeout(() => preview.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}

function hideExportPreview(previewContainerId = 'export-preview') {
    const preview = document.getElementById(previewContainerId);
    if (preview) preview.classList.add('hidden');
}
