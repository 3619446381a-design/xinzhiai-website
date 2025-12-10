// 芯智AI助手 - 交互逻辑
// 知识库数据
const knowledgeBase = {
    // 侵权相关问题
    "侵权": {
        patterns: ["侵权", "专利风险", "会不会侵权", "专利冲突", "侵犯专利"],
        responses: [
            `🔍 <strong>专利风险分析报告</strong><br>
            ✅ 已完成对您的方案扫描<br>
            📊 检测到相关专利：<strong>3项</strong><br>
            ⚠️ 潜在冲突点：<br>
            • Ni含量≥85%的NCM正极材料<br>
            • 硅碳负极中硅含量>30%的配方<br>
            • 特定电解液添加剂组合<br>
            💡 <strong>建议调整</strong>：<br>
            1. 将Ni含量控制在78-82%区间<br>
            2. 使用公开的粘结剂替代方案<br>
            3. 咨询专家进行FTO分析`
        ]
    },
    
    // 国标合规问题
    "合规": {
        patterns: ["国标", "GB38031", "合规", "测试要求", "热扩散", "安全要求"],
        responses: [
            `📋 <strong>GB38031-2025合规要求</strong><br>
            ⏰ 实施时间：<strong>2026年7月1日</strong><br>
            🔥 热扩散测试：<br>
            • 观察时间：≥2小时<br>
            • 触发条件：单个电芯热失控<br>
            • 通过标准：无起火、无爆炸<br>
            🚗 新增测试项目：<br>
            1. 电池包底部撞击测试<br>
            2. 快充循环后安全测试<br>
            3. 防篡改安全要求<br>
            📝 <strong>建议</strong>：提前进行预测试，确保一次通过`
        ]
    },
    
    // 方案推荐问题
    "方案": {
        patterns: ["推荐", "替代", "方案", "粘结剂", "材料", "工艺"],
        responses: [
            `💡 <strong>无风险替代方案推荐</strong><br>
            🔋 针对硅碳负极粘结剂：<br>
            <strong>1. 聚丙烯酸类粘结剂（公开技术）</strong><br>
            • 优势：成本低，循环性能好<br>
            • 专利状态：已过期专利<br>
            • 推荐指数：★★★★☆<br><br>
            <strong>2. 海藻酸钠基粘结剂（创新方向）</strong><br>
            • 优势：环保，柔性好<br>
            • 专利状态：高校公开成果<br>
            • 推荐指数：★★★☆☆<br><br>
            <strong>3. CMC/SBR复合体系（成熟方案）</strong><br>
            • 优势：工艺成熟，稳定性高<br>
            • 专利状态：部分专利即将到期<br>
            • 推荐指数：★★★★☆`
        ]
    },
    
    // 合规检查
    "检查": {
        patterns: ["检查", "分析", "扫描", "评估", "风险分析"],
        responses: [
            `🛡️ <strong>合规与风险综合评估</strong><br>
            📈 分析结果：<br>
            <div class="risk-result">
                <div class="d-flex justify-content-between">
                    <span>专利侵权风险：</span>
                    <span class="badge bg-warning">中等</span>
                </div>
                <div class="d-flex justify-content-between">
                    <span>新国标符合性：</span>
                    <span class="badge bg-success">良好</span>
                </div>
                <div class="d-flex justify-content-between">
                    <span>技术可行性：</span>
                    <span class="badge bg-info">高</span>
                </div>
            </div>
            📋 <strong>具体建议</strong>：<br>
            1. 完善热管理系统设计<br>
            2. 增加底部防护结构<br>
            3. 进行小批量验证测试<br>
            4. 申请相关实用新型专利`
        ]
    },
    
    // 默认回答
    "默认": {
        responses: [
            `🤖 <strong>芯智AI助手</strong><br>
            我是专为新国标电池研发设计的智能合规助手。<br><br>
            🔍 <strong>我可以帮您</strong>：<br>
            • 分析专利侵权风险<br>
            • 查询GB38031等国家标准<br>
            • 推荐无风险替代方案<br>
            • 评估研发方案合规性<br><br>
            💡 <strong>请具体描述您的需求</strong>，例如：<br>
            "我的磷酸铁锂电池方案会侵权吗？"<br>
            "新国标对热扩散有什么要求？"`
        ]
    }
};

// 对话历史
let chatHistory = [];

// 发送消息
function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    
    if (message === '') return;
    
    // 添加用户消息
    addMessage(message, 'user');
    
    // 清空输入框
    input.value = '';
    
    // 模拟AI思考（延迟1秒回复）
    setTimeout(() => {
        const aiResponse = getAIResponse(message);
        addMessage(aiResponse, 'ai');
    }, 1000);
}

// 处理回车键
function handleEnter(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// 快速提问
function askQuestion(question) {
    document.getElementById('user-input').value = question;
    sendMessage();
}

// 添加消息到对话框
function addMessage(text, sender) {
    const chatMessages = document.getElementById('chat-messages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    
    const content = document.createElement('div');
    content.className = 'content';
    
    if (sender === 'ai') {
        avatar.innerHTML = '<i class="fas fa-robot"></i>';
        content.innerHTML = `<strong>芯智AI：</strong> ${text}`;
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
    } else {
        avatar.innerHTML = '<i class="fas fa-user"></i>';
        content.innerHTML = `<strong>您：</strong> ${text}`;
        messageDiv.appendChild(content);
        messageDiv.appendChild(avatar);
    }
    
    chatMessages.appendChild(messageDiv);
    
    // 保存到历史
    chatHistory.push({
        sender: sender,
        text: text,
        time: new Date().toLocaleTimeString()
    });
    
    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 获取AI回复
function getAIResponse(userMessage) {
    userMessage = userMessage.toLowerCase();
    
    // 检查匹配模式
    for (const category in knowledgeBase) {
        if (category === '默认') continue;
        
        const patterns = knowledgeBase[category].patterns;
        for (const pattern of patterns) {
            if (userMessage.includes(pattern)) {
                const responses = knowledgeBase[category].responses;
                return responses[Math.floor(Math.random() * responses.length)];
            }
        }
    }
    
    // 默认回复
    const defaultResponses = knowledgeBase['默认'].responses;
    return defaultResponses[0];
}

// 显示国标详情
function showStandard(stdCode) {
    let content = '';
    
    if (stdCode === 'GB38031') {
        content = `
            <strong>GB38031-2025 电动汽车用动力蓄电池安全要求</strong><br><br>
            📅 实施日期：2026年7月1日<br>
            🎯 适用范围：所有电动汽车用动力电池<br><br>
            🔥 <strong>主要更新内容</strong>：<br>
            1. 热扩散测试观察时间延长至2小时<br>
            2. 新增电池包底部撞击安全测试<br>
            3. 增加防篡改设计要求<br>
            4. 完善热管理系统安全标准<br><br>
            ⚠️ <strong>企业应对建议</strong>：<br>
            • 提前进行设计调整<br>
            • 开展预测试验证<br>
            • 建立合规管理体系
        `;
    } else if (stdCode === 'GB34014') {
        content = `
            <strong>GB/T 34014-2023 汽车用动力电池编码规则</strong><br><br>
            📊 核心要求：一池一码，全生命周期追溯<br><br>
            🏷️ <strong>编码结构</strong>：<br>
            • 第一部分：企业代码<br>
            • 第二部分：产品型号<br>
            • 第三部分：生产序列号<br>
            • 第四部分：生产日期<br><br>
            🔗 <strong>应用场景</strong>：<br>
            • 生产质量管理<br>
            • 售后维修追溯<br>
            • 回收利用管理<br>
            • 安全责任认定
        `;
    }
    
    addMessage(content, 'ai');
}

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    console.log('芯智AI助手已启动');
    
    // 添加一些示例对话
    setTimeout(() => {
        addMessage('欢迎使用芯智AI助手！点击上方快速提问按钮开始体验。', 'ai');
    }, 500);
});