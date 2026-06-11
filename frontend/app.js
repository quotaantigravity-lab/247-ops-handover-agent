// App state
let logsState = [];
let sopsState = [];
let apiConfig = { api_key: "", model_name: "minimax/minimax-m2.5" };
let chatHistory = [];

// DOM Elements
const logForm = document.getElementById("form-add-log");
const logComponent = document.getElementById("log-component");
const logType = document.getElementById("log-type");
const logSeverity = document.getElementById("log-severity");
const logStatus = document.getElementById("log-status");
const logContent = document.getElementById("log-content");
const logsList = document.getElementById("logs-list");
const logsCount = document.getElementById("logs-count");

const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const btnSelectFile = document.getElementById("btn-select-file");
const sopList = document.getElementById("sop-list");
const sopsCount = document.getElementById("sops-count");

const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");
const chatMessagesContainer = document.getElementById("chat-messages-container");
const chatTriggers = document.querySelectorAll(".btn-trigger");

const btnGenerateHandover = document.getElementById("btn-generate-handover");
const btnCopyHandover = document.getElementById("btn-copy-handover");
const handoverPreview = document.getElementById("handover-preview");

const settingsModal = document.getElementById("settings-modal");
const btnOpenSettings = document.getElementById("btn-open-settings");
const btnCloseSettings = document.getElementById("btn-close-settings");
const btnCancelSettings = document.getElementById("btn-cancel-settings");
const btnSaveSettings = document.getElementById("btn-save-settings");
const apiKeyInput = document.getElementById("api-key-input");

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    initApp();
    setupEventListeners();
});

async function initApp() {
    await fetchConfig();
    await fetchLogs();
    await fetchSOPs();
}

// Event Listeners Setup
function setupEventListeners() {
    // Log Form
    logForm.addEventListener("submit", handleAddLog);

    // Settings Modal
    btnOpenSettings.addEventListener("click", () => {
        apiKeyInput.value = apiConfig.api_key;
        settingsModal.classList.add("active");
    });
    const closeModal = () => settingsModal.classList.remove("active");
    btnCloseSettings.addEventListener("click", closeModal);
    btnCancelSettings.addEventListener("click", closeModal);
    btnSaveSettings.addEventListener("click", handleSaveSettings);

    // File Upload Click
    btnSelectFile.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });

    // Drag and drop SOP files
    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("dragover");
    });
    dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("dragover");
    });
    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("dragover");
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });

    // Chatbot Form
    chatForm.addEventListener("submit", handleChatSubmit);

    // Chat Quick Triggers
    chatTriggers.forEach(trigger => {
        trigger.addEventListener("click", () => {
            const query = trigger.getAttribute("data-query");
            chatInput.value = query;
            chatForm.dispatchEvent(new Event("submit"));
        });
    });

    // Handover actions
    btnGenerateHandover.addEventListener("click", handleGenerateHandover);
    btnCopyHandover.addEventListener("click", handleCopyHandover);
}

// API Calls & Event Handlers

// 1. Config management
async function fetchConfig() {
    try {
        const res = await fetch("/api/config");
        apiConfig = await res.json();
        if (apiConfig.api_key) {
            apiKeyInput.value = apiConfig.api_key;
        }
    } catch (err) {
        console.error("Error fetching config:", err);
    }
}

async function handleSaveSettings() {
    const newApiKey = apiKeyInput.value.trim();
    try {
        const res = await fetch("/api/config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ api_key: newApiKey })
        });
        if (res.ok) {
            apiConfig.api_key = newApiKey;
            showToast("Đã lưu cấu hình API Key thành công!", "success");
            settingsModal.classList.remove("active");
        } else {
            showToast("Lỗi khi lưu cấu hình.", "error");
        }
    } catch (err) {
        showToast("Không thể kết nối đến server.", "error");
    }
}

// 2. Incident Logs CRUD
async function fetchLogs() {
    try {
        const res = await fetch("/api/logs");
        logsState = await res.json();
        renderLogs();
    } catch (err) {
        console.error("Error fetching logs:", err);
    }
}

async function handleAddLog(e) {
    e.preventDefault();
    const logItem = {
        type: logType.value,
        component: logComponent.value.trim(),
        severity: logSeverity.value,
        status: logStatus.value,
        content: logContent.value.trim()
    };

    try {
        const res = await fetch("/api/logs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(logItem)
        });
        if (res.ok) {
            logForm.reset();
            logSeverity.value = "medium";
            logStatus.value = "resolving";
            showToast("Ghi nhận log sự vụ thành công!", "success");
            await fetchLogs();
        }
    } catch (err) {
        showToast("Không thể lưu log ca trực.", "error");
    }
}

async function handleResolveLog(logId) {
    const log = logsState.find(l => l.id === logId);
    if (!log) return;
    
    log.status = "resolved";
    try {
        const res = await fetch(`/api/logs/${logId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(log)
        });
        if (res.ok) {
            showToast("Đã chuyển trạng thái sự cố thành Khắc phục!", "success");
            await fetchLogs();
        }
    } catch (err) {
        showToast("Lỗi khi cập nhật trạng thái.", "error");
    }
}

async function handleDeleteLog(logId) {
    if (!confirm("Bạn có chắc chắn muốn xóa log này khỏi ca trực?")) return;
    try {
        const res = await fetch(`/api/logs/${logId}`, { method: "DELETE" });
        if (res.ok) {
            showToast("Đã xóa log ca trực.", "success");
            await fetchLogs();
        }
    } catch (err) {
        showToast("Lỗi khi xóa log.", "error");
    }
}

function renderLogs() {
    logsCount.textContent = `${logsState.length} logs`;
    if (logsState.length === 0) {
        logsList.innerHTML = `<div class="no-data"><i class="fa-solid fa-clipboard-list"></i> Chưa có sự vụ nào được ghi nhận.</div>`;
        return;
    }

    logsList.innerHTML = logsState.map(log => {
        const severityClass = log.severity;
        const statusClass = log.status;
        
        let resolveBtn = "";
        if (log.status !== "resolved" && log.type === "incident") {
            resolveBtn = `<button class="btn-action resolve" onclick="handleResolveLog('${log.id}')" title="Đánh dấu đã khắc phục"><i class="fa-solid fa-circle-check"></i> Đóng lỗi</button>`;
        }

        return `
            <div class="log-item" id="${log.id}">
                <div class="log-header">
                    <span class="log-title">
                        <i class="${log.type === 'incident' ? 'fa-solid fa-triangle-exclamation text-red' : log.type === 'maintenance' ? 'fa-solid fa-screwdriver-wrench text-purple' : 'fa-solid fa-info-circle'}"></i>
                        ${log.component}
                    </span>
                    <div class="log-tags">
                        <span class="tag tag-type ${log.type}">${log.type}</span>
                        <span class="tag tag-severity ${severityClass}">${log.severity}</span>
                        <span class="tag tag-status ${statusClass}">${log.status}</span>
                    </div>
                </div>
                <div class="log-desc">${log.content}</div>
                <div class="log-header">
                    <span class="log-time"><i class="fa-regular fa-clock"></i> ${log.created_at} ${log.resolved_at ? '➔ ' + log.resolved_at : ''}</span>
                    <div class="log-actions">
                        ${resolveBtn}
                        <button class="btn-action delete" onclick="handleDeleteLog('${log.id}')" title="Xóa log"><i class="fa-solid fa-trash"></i> Xóa</button>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

// 3. SOPs Knowledge Base
async function fetchSOPs() {
    try {
        const res = await fetch("/api/sops");
        sopsState = await res.json();
        renderSOPs();
    } catch (err) {
        console.error("Error fetching sops:", err);
    }
}

async function handleFileUpload(file) {
    const fileTitle = prompt("Nhập tiêu đề hoặc tên quy trình cho tài liệu này:", file.name.replace(/\.[^/.]+$/, ""));
    if (fileTitle === null) return; // Cancelled

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", fileTitle || file.name);

    showToast("Đang tải lên và phân tích tài liệu...", "info");
    
    try {
        const res = await fetch("/api/sops/upload", {
            method: "POST",
            body: formData
        });
        if (res.ok) {
            showToast("Tải lên và nạp tài liệu vào AI thành công!", "success");
            fileInput.value = "";
            await fetchSOPs();
        } else {
            const errData = await res.json();
            showToast(`Lỗi: ${errData.detail || "Không thể tải tài liệu."}`, "error");
        }
    } catch (err) {
        showToast("Lỗi kết nối khi upload file.", "error");
    }
}

async function handleDeleteSOP(sopId) {
    if (!confirm("Bạn có muốn xóa tài liệu quy trình này?")) return;
    try {
        const res = await fetch(`/api/sops/${sopId}`, { method: "DELETE" });
        if (res.ok) {
            showToast("Đã xóa tài liệu khỏi AI.", "success");
            await fetchSOPs();
        }
    } catch (err) {
        showToast("Lỗi khi xóa SOP.", "error");
    }
}

function renderSOPs() {
    sopsCount.textContent = `${sopsState.length} quy trình`;
    if (sopsState.length === 0) {
        sopList.innerHTML = `<div class="no-data"><i class="fa-regular fa-folder-open"></i> Chưa tải lên tài liệu SOP nào.</div>`;
        return;
    }

    sopList.innerHTML = sopsState.map(sop => {
        let fileIcon = "fa-file-lines";
        if (sop.filename.endsWith(".pdf")) fileIcon = "fa-file-pdf text-red";
        else if (sop.filename.endsWith(".docx") || sop.filename.endsWith(".doc")) fileIcon = "fa-file-word text-blue";
        else if (sop.filename.endsWith(".xlsx") || sop.filename.endsWith(".xls")) fileIcon = "fa-file-excel text-green";

        return `
            <div class="sop-item" id="${sop.id}">
                <div class="sop-info">
                    <div class="sop-icon"><i class="fa-solid ${fileIcon}"></i></div>
                    <div class="sop-details">
                        <div class="sop-title" title="${sop.title}">${sop.title}</div>
                        <div class="sop-file">${sop.filename}</div>
                    </div>
                </div>
                <button class="btn-action delete" onclick="handleDeleteSOP('${sop.id}')" title="Xóa tài liệu"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;
    }).join("");
}

// 4. AI Chatbot
async function handleChatSubmit(e) {
    e.preventDefault();
    const query = chatInput.value.trim();
    if (!query) return;

    // Append User Message
    appendMessage("user", query);
    chatInput.value = "";

    // Show Loading state
    const loadingId = appendLoading();

    try {
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: query,
                history: chatHistory
            })
        });
        
        removeLoading(loadingId);
        
        if (res.ok) {
            const data = await res.json();
            appendMessage("assistant", data.response);
            // Push to chat history
            chatHistory.push({ role: "user", content: query });
            chatHistory.push({ role: "assistant", content: data.response });
            // Cap history to last 10 exchanges for performance
            if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
        } else {
            appendMessage("assistant", "Xin lỗi, đã xảy ra lỗi khi liên lạc với AI Server. Vui lòng kiểm tra lại kết nối.");
        }
    } catch (err) {
        removeLoading(loadingId);
        appendMessage("assistant", "Lỗi kết nối. Không thể nhận phản hồi từ AI.");
    }
}

function appendMessage(role, text) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${role}`;
    
    const avatarIcon = role === "assistant" ? "fa-headset" : "fa-user";
    const parsedText = role === "assistant" ? renderMarkdown(text) : `<p>${text}</p>`;

    msgDiv.innerHTML = `
        <div class="msg-avatar"><i class="fa-solid ${avatarIcon}"></i></div>
        <div class="msg-content">${parsedText}</div>
    `;

    chatMessages.appendChild(msgDiv);
    scrollToBottom();
}

function appendLoading() {
    const id = `loading-${Date.now()}`;
    const loadDiv = document.createElement("div");
    loadDiv.className = "message assistant";
    loadDiv.id = id;
    loadDiv.innerHTML = `
        <div class="msg-avatar"><i class="fa-solid fa-headset"></i></div>
        <div class="msg-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    chatMessages.appendChild(loadDiv);
    scrollToBottom();
    return id;
}

function removeLoading(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function scrollToBottom() {
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

// 5. Shift Handover Report
async function handleGenerateHandover() {
    try {
        showToast("Đang sinh báo cáo ca trực...", "info");
        const res = await fetch("/api/handover");
        const data = await res.json();
        
        handoverPreview.innerHTML = renderMarkdown(data.markdown);
        // Save raw markdown on attribute to copy
        handoverPreview.setAttribute("data-raw", data.markdown);
        showToast("Báo cáo ca trực đã được tạo!", "success");
    } catch (err) {
        showToast("Không thể tạo báo cáo ca trực.", "error");
    }
}

function handleCopyHandover() {
    const rawMarkdown = handoverPreview.getAttribute("data-raw");
    if (!rawMarkdown) {
        showToast("Vui lòng tạo báo cáo trước khi sao chép.", "info");
        return;
    }

    navigator.clipboard.writeText(rawMarkdown).then(() => {
        showToast("Đã sao chép báo cáo Markdown vào clipboard!", "success");
    }).catch(err => {
        showToast("Không thể sao chép tự động.", "error");
    });
}

// Simple Helper for Markdown Rendering
function renderMarkdown(md) {
    if (!md) return "";
    let html = md;
    
    // Protect raw content inside pre/code blocks
    const codeBlocks = [];
    html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
        const id = `###CODEBLOCK_${codeBlocks.length}###`;
        codeBlocks.push(`<pre><code>${escapeHTML(code.trim())}</code></pre>`);
        return id;
    });

    // Escape basic tags to avoid raw HTML issues
    html = escapeHTML(html);

    // Headers
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Inline code
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');

    // List rendering line by line
    let lines = html.split('\n');
    let inList = false;
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (line.startsWith('- ') || line.startsWith('* ')) {
            let content = line.substring(2);
            if (!inList) {
                lines[i] = '<ul><li>' + content + '</li>';
                inList = true;
            } else {
                lines[i] = '<li>' + content + '</li>';
            }
        } else {
            if (inList) {
                lines[i-1] += '</ul>';
                inList = false;
            }
        }
    }
    if (inList) {
        lines[lines.length-1] += '</ul>';
    }
    
    html = lines.join('\n');
    
    // Restore protected code blocks
    codeBlocks.forEach((block, idx) => {
        html = html.replace(`###CODEBLOCK_${idx}###`, block);
    });

    // Paragraph breaks
    html = html.replace(/\n\n/g, '<br><br>');
    html = html.replace(/\n/g, '<br>');

    return html;
}

function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Floating Toast Notification
function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let icon = "fa-info-circle";
    if (type === "success") icon = "fa-check-circle";
    else if (type === "error") icon = "fa-exclamation-circle";
    else if (type === "info") icon = "fa-circle-info";
    
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add("active"), 10);
    
    // Animate out and destroy
    setTimeout(() => {
        toast.classList.remove("active");
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Global click handlers bound to window for inline onclick elements
window.handleResolveLog = handleResolveLog;
window.handleDeleteLog = handleDeleteLog;
window.handleDeleteSOP = handleDeleteSOP;
