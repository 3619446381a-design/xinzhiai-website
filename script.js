// script.js - 芯智AI助手前端交互

// DOM元素
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// 配置
const API_BASE = '/api'; // Vercel部署时使用相对路径

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('芯智AI助手初始化完成');
    
    // 添加欢迎消息
    setTimeout(() => {
        addMessage(`🤖 **芯智AI助手** - 电池研发合规专家
        
欢迎使用芯智AI助手！我专注于新国标电池研发的合规与创新辅助。

**我可以帮您分析**：
• 📊 **专利侵权风险**：识别专利权利要求，评估风险等级
• 📋 **新国标合规**：解读GB38031-2025等技术标准
• 💡 **方案优化建议**：推荐无专利风险的替代材料
• 🔧 **研发流程指导**：提供合规的测试方法和流程

**请尝试提问**，或点击下方快速提问按钮开始体验。`, 'ai');
    }, 1000);
    
    // 绑定事件
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
    
    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});

// 发送消息
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    
    // 添加用户消息
    addMessage(message, 'user');
    userInput.value = '';
    
    // 显示加载中
    const loadingId = showLoadingMessage();
    
    try {
        // 调用AI API
        const response = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                context: ''
            })
        });
        
        const data = await response.json();
        
        // 移除加载消息
        removeMessage(loadingId);
        
        if (data.success) {
            // 添加AI回复
            addMessage(data.reply, 'ai');
        } else {
            // 使用后备回复
            addMessage(data.fallback || '抱歉，服务暂时不可用', 'ai');
        }
        
    } catch (error) {
        console.error('API请求失败:', error);
        removeMessage(loadingId);
        addMessage('网络连接异常，请检查网络后重试', 'ai');
    }
}

// 快速提问
function quickQuestion(question) {
    userInput.value = question;
    sendMessage();
}

// 添加消息到聊天框
function addMessage(content, sender) {
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (sender === 'ai') {
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="message-header">
                    <strong>芯智AI</strong>
                    <span class="message-time">${timestamp}</span>
                </div>
                <div class="message-text">${formatMessage(content)}</div>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-header">
                    <strong>您</strong>
                    <span class="message-time">${timestamp}</span>
                </div>
                <div class="message-text">${content}</div>
            </div>
            <div class="message-avatar">
                <i class="fas fa-user"></i>
            </div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 显示加载消息
function showLoadingMessage() {
    const loadingId = 'loading-' + Date.now();
    
    const loadingDiv = document.createElement('div');
    loadingDiv.id = loadingId;
    loadingDiv.className = 'message ai-message loading';
    
    loadingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="message-header">
                <strong>芯智AI</strong>
                <span class="message-time">正在输入...</span>
            </div>
            <div class="message-text">
                <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return loadingId;
}

// 移除消息
function removeMessage(messageId) {
    const message = document.getElementById(messageId);
    if (message) {
        message.remove();
    }
}

// 格式化消息内容
function formatMessage(text) {
    // 简单的markdown转换
    let formatted = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/\*\s(.*?)(?=\n|$)/g, '<li>$1</li>')
        .replace(/#\s(.*?)(?=\n|$)/g, '<h4>$1</h4>')
        .replace(/✅/g, '<span class="badge bg-success">✅</span>')
        .replace(/⚠️/g, '<span class="badge bg-warning">⚠️</span>')
        .replace(/🔍/g, '<span class="badge bg-info">🔍</span>')
        .replace(/💡/g, '<span class="badge bg-primary">💡</span>');
    
    return `<p>${formatted}</p>`;
}

// 风险分析功能
async function analyzeRisk() {
    const material = document.getElementById('material-select')?.value || 'NCM811';
    const process = document.getElementById('process-select')?.value || '干法电极';
    
    // 显示分析中
    const resultDiv = document.getElementById('analysis-result');
    if (resultDiv) {
        resultDiv.innerHTML = `
            <div class="text-center p-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">分析中...</span>
                </div>
                <p class="mt-2">正在分析 ${material} + ${process} 的风险...</p>
            </div>
        `;
    }
    
    try {
        const response = await fetch(`${API_BASE}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                material: material,
                process: process
            })
        });
        
        const data = await response.json();
        
        if (resultDiv && data.success) {
            displayAnalysisResult(data.data);
        }
        
    } catch (error) {
        console.error('风险分析失败:', error);
        if (resultDiv) {
            resultDiv.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i>
                    分析失败：${error.message}
                </div>
            `;
        }
    }
}

// 显示分析结果
function displayAnalysisResult(data) {
    const resultDiv = document.getElementById('analysis-result');
    if (!resultDiv) return;
    
    let html = `
        <div class="analysis-report">
            <h4 class="mb-3">📊 风险分析报告</h4>
            
            <div class="risk-summary mb-4">
                <div class="row">
                    <div class="col-md-4 mb-3">
                        <div class="card bg-danger bg-opacity-10">
                            <div class="card-body text-center">
                                <h5 class="text-danger">高风险</h5>
                                <h2>${data.highRiskCount || 2}</h2>
                                <small>需立即处理</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="card bg-warning bg-opacity-10">
                            <div class="card-body text-center">
                                <h5 class="text-warning">中风险</h5>
                                <h2>${data.mediumRiskCount || 3}</h2>
                                <small>建议优化</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="card bg-success bg-opacity-10">
                            <div class="card-body text-center">
                                <h5 class="text-success">低风险</h5>
                                <h2>${data.lowRiskCount || 5}</h2>
                                <small>可接受</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="risk-details">
                <h5 class="mb-3">🔍 详细风险点</h5>
    `;
    
    // 添加风险详情
    if (data.risks && data.risks.length > 0) {
        html += '<ul class="list-group">';
        data.risks.forEach((risk, index) => {
            const badgeClass = risk.level === 'high' ? 'danger' : 
                              risk.level === 'medium' ? 'warning' : 'success';
            
            html += `
                <li class="list-group-item">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <span class="badge bg-${badgeClass} me-2">${risk.level === 'high' ? '高风险' : risk.level === 'medium' ? '中风险' : '低风险'}</span>
                            <strong>${risk.description}</strong>
                            <div class="mt-1">
                                <small class="text-muted">专利号：${risk.patentNumber || '未指定'}</small>
                            </div>
                        </div>
                        <button class="btn btn-sm btn-outline-primary" onclick="showPatentDetail(${index})">
                            详情
                        </button>
                    </div>
                    <div class="mt-2">
                        <strong>建议：</strong> ${risk.suggestion || '请咨询专家'}
                    </div>
                </li>
            `;
        });
        html += '</ul>';
    }
    
    html += `
            </div>
            
            <div class="recommendations mt-4">
                <h5 class="mb-3">💡 优化建议</h5>
                <div class="card">
                    <div class="card-body">
                        <ol>
                            <li>调整材料配方，避开专利保护范围</li>
                            <li>考虑使用公开的替代方案</li>
                            <li>进行小批量验证测试</li>
                            <li>咨询专业知识产权律师</li>
                        </ol>
                    </div>
                </div>
            </div>
            
            <div class="mt-4 text-center">
                <button class="btn btn-primary" onclick="downloadReport()">
                    <i class="fas fa-download me-2"></i>下载分析报告
                </button>
                <button class="btn btn-outline-primary ms-2" onclick="connectExpert()">
                    <i class="fas fa-headset me-2"></i>联系专家
                </button>
            </div>
        </div>
    `;
    
    resultDiv.innerHTML = html;
}

// 显示专利详情
function showPatentDetail(index) {
    alert(`专利详情功能开发中...\n这是第 ${index + 1} 个风险项的详细信息。\n完整功能将在后续版本中提供。`);
}

// 下载报告
function downloadReport() {
    alert('报告下载功能开发中...\n当前版本支持在线查看，后续版本将提供PDF导出功能。');
}

// 联系专家
function connectExpert() {
    window.location.href = 'expert.html';
}

// 导出函数供HTML调用
window.sendMessage = sendMessage;
window.quickQuestion = quickQuestion;
window.analyzeRisk = analyzeRisk;
