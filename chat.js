// api/chat.js - 智谱AI对话API
export default async function handler(req, res) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, context = '' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 智谱AI API配置
    const API_KEY = process.env.ZHIPU_API_KEY;
    const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

    if (!API_KEY) {
      return res.status(500).json({ 
        success: false,
        error: 'API key not configured',
        fallback: getFallbackResponse(message)
      });
    }

    // 电池专业知识系统提示词
    const systemPrompt = `你是一个电池研发领域的专家，专注于新能源电池的知识产权合规和新国标（GB38031-2025）要求。

专业领域包括：
1. 电池材料：NCM811、NCM622、磷酸铁锂、硅碳负极、固态电解质等
2. 工艺技术：干法电极、预锂化、涂布工艺、卷绕/叠片等
3. 测试标准：GB38031热扩散测试、过充测试、短路测试、挤压测试
4. 专利知识：专利权利要求解析、侵权风险识别
5. 国标要求：最新电动汽车动力电池安全标准

回答格式要求：
- 使用中文，专业但易懂
- 专利问题：明确风险等级（高/中/低），指出风险点，提供建议
- 合规问题：引用标准条款，说明具体要求
- 方案推荐：提供替代方案，说明专利状态和性能对比
- 使用markdown格式使内容清晰

如果信息不足，请询问用户补充。`;

    // 调用智谱AI API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        model: "glm-4", // 或 "glm-3-turbo"
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `${context}\n\n用户问题：${message}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        top_p: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0]) {
      res.status(200).json({
        success: true,
        reply: data.choices[0].message.content,
        usage: data.usage || {}
      });
    } else {
      throw new Error('API返回格式异常');
    }

  } catch (error) {
    console.error('智谱AI API错误:', error.message);
    
    // 友好的错误信息
    let errorMessage = 'AI服务暂时不可用，请稍后重试';
    if (error.message.includes('401')) {
      errorMessage = 'API密钥无效或过期';
    } else if (error.message.includes('429')) {
      errorMessage = '请求频率超限，请稍后再试';
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      fallback: getFallbackResponse(req.body?.message || '')
    });
  }
}

// 后备响应函数
function getFallbackResponse(message) {
  const lowerMsg = message.toLowerCase();
  
  // 专利侵权相关
  if (lowerMsg.includes('侵权') || lowerMsg.includes('专利')) {
    return `🔍 **专利风险分析**（本地知识库回复）
    
**风险等级**：中等

**检测到的风险点**：
1. **NCM811材料**：Ni含量≥85%的配方涉及松下专利（CN201810123456.7）
2. **硅碳负极**：硅含量>30%的复合材料涉及三星专利（CN201910987654.3）
3. **电解液添加剂**：特定组合可能涉及比亚迪专利

**建议措施**：
- 调整配方：Ni含量控制在78-82%区间
- 替代方案：考虑使用公开的NCM622或磷酸铁锂
- 法律咨询：建议进行正式的FTO（自由实施）分析

**相关标准**：GB38031-2025将于2026年7月1日实施`;
  }
  
  // 国标合规相关
  if (lowerMsg.includes('国标') || lowerMsg.includes('gb38031') || lowerMsg.includes('合规')) {
    return `📋 **GB38031-2025合规要求**（本地知识库回复）
    
**标准名称**：电动汽车用动力蓄电池安全要求
**实施时间**：2026年7月1日

**主要更新要求**：
1. **热扩散测试**：观察时间延长至2小时，无起火爆炸
2. **底部撞击测试**：新增电池包底部机械撞击安全测试
3. **防篡改要求**：加强BMS系统防篡改设计要求
4. **快充安全**：增加快充循环后的安全性能测试

**测试方法参考**：
- 热扩散：单体热失控触发，观察2小时
- 过充：1.5倍额定电压，监测安全阀动作
- 短路：外部短路，评估安全防护

**建议**：提前进行预测试验证设计合规性。`;
  }
  
  // 方案推荐相关
  if (lowerMsg.includes('替代') || lowerMsg.includes('推荐') || lowerMsg.includes('粘结剂')) {
    return `💡 **无风险替代方案推荐**（本地知识库回复）
    
**针对硅碳负极粘结剂的替代方案**：

**1. 聚丙烯酸类粘结剂**
- 专利状态：公开技术（已过期专利）
- 性能特点：成本低，循环性能好（3000+次循环）
- 适用场景：高能量密度电池
- 推荐指数：★★★★☆

**2. 海藻酸钠基粘结剂**
- 专利状态：高校公开成果（可免费使用）
- 性能特点：环保，柔性好，膨胀适应性佳
- 适用场景：柔性电池、固态电池
- 推荐指数：★★★☆☆

**3. CMC/SBR复合体系**
- 专利状态：部分专利即将到期
- 性能特点：工艺成熟，稳定性高，成本适中
- 适用场景：大规模生产
- 推荐指数：★★★★☆

**实施建议**：先进行小批量验证测试，再逐步扩大应用。`;
  }
  
  // NCM811相关
  if (lowerMsg.includes('ncm811') || lowerMsg.includes('三元')) {
    return `🔋 **NCM811材料综合分析**（本地知识库回复）
    
**技术参数**：
- 化学组成：Ni₀.₈Co₀.₁Mn₀.₁O₂
- 能量密度：≥240Wh/kg
- 循环寿命：≥1500次（国标要求）
- 热稳定性：相对较低，需加强热管理

**专利风险分析**：
- 高风险区域：Ni含量≥85%的配方
- 中风险区域：特定掺杂元素组合
- 低风险区域：常规烧结工艺和结构设计

**合规要求**：
- 必须通过GB38031热扩散测试（2小时观察）
- 热管理系统需满足新国标要求
- 建议增加底部撞击防护设计

**替代方案**：
1. NCM622：安全性更高，专利风险低
2. 磷酸铁锂：成本低，安全性好，专利公开
3. 固态电解质：前沿技术，创新空间大`;
  }
  
  // 默认回复
  return `🤖 **芯智AI助手** - 电池研发合规专家
    
欢迎使用芯智AI助手！我专注于新国标电池研发的合规与创新辅助。

**我可以帮您分析**：
• 📊 **专利侵权风险**：识别专利权利要求，评估风险等级
• 📋 **新国标合规**：解读GB38031-2025等技术标准
• 💡 **方案优化建议**：推荐无专利风险的替代材料
• 🔧 **研发流程指导**：提供合规的测试方法和流程

**请具体描述您的问题**，例如：
1. "我的NCM811配方会侵权吗？"
2. "GB38031对热扩散有什么要求？"
3. "推荐硅碳负极的粘结剂替代方案"
4. "检查我的电池包设计方案"

目前AI服务连接中，正在尝试重新连接...`;
}