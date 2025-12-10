// api/knowledge.js - 知识库API
export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET请求：获取知识库数据
  if (req.method === 'GET') {
    const knowledgeData = getKnowledgeData();
    return res.status(200).json({
      success: true,
      data: knowledgeData
    });
  }

  // POST请求：搜索知识库
  if (req.method === 'POST') {
    try {
      const { query, category } = req.body;
      const searchResults = searchKnowledge(query, category);
      
      return res.status(200).json({
        success: true,
        query,
        results: searchResults
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: '搜索失败'
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// 获取知识库数据
function getKnowledgeData() {
  return {
    materials: [
      {
        id: 'ncm811',
        name: 'NCM811',
        fullName: '镍钴锰三元材料（Ni:Co:Mn = 8:1:1）',
        description: '高镍三元正极材料，能量密度高但热稳定性相对较低',
        energyDensity: '220-260 Wh/kg',
        cycleLife: '≥1500 cycles',
        patentStatus: '高风险',
        alternatives: ['NCM622', 'NCA', '磷酸铁锂'],
        standards: ['GB38031-2025', 'GB/T 31484-2015']
      },
      {
        id: 'lfp',
        name: '磷酸铁锂（LFP）',
        fullName: 'LiFePO₄',
        description: '橄榄石结构正极材料，安全性高，循环寿命长',
        energyDensity: '140-160 Wh/kg',
        cycleLife: '≥3000 cycles',
        patentStatus: '低风险（专利已过期）',
        alternatives: ['磷酸锰铁锂', '三元材料'],
        standards: ['GB/T 30835-2014']
      },
      {
        id: 'silicon-carbon',
        name: '硅碳负极',
        fullName: '硅碳复合负极材料',
        description: '高容量负极材料，但存在膨胀问题',
        capacity: '≥500 mAh/g',
        cycleLife: '≥500 cycles',
        patentStatus: '中风险',
        alternatives: ['石墨', '硬碳', '钛酸锂'],
        standards: ['GB/T 30836-2014']
      }
    ],
    
    processes: [
      {
        id: 'dry-electrode',
        name: '干法电极',
        description: '不使用溶剂的电极制备工艺，环保且能量密度高',
        advantages: ['无溶剂污染', '能量密度高', '成本低'],
        disadvantages: ['工艺控制要求高', '专利限制多'],
        patentStatus: '中高风险',
        alternatives: ['湿法涂布', '挤出涂布']
      },
      {
        id: 'pre-lithiation',
        name: '预锂化',
        description: '预先补偿锂损失的工艺技术',
        advantages: ['提升首次效率', '延长循环寿命'],
        disadvantages: ['工艺复杂', '成本增加'],
        patentStatus: '中等风险',
        alternatives: ['负极补锂', '正极补锂']
      }
    ],
    
    standards: [
      {
        id: 'gb38031-2025',
        name: 'GB38031-2025',
        fullName: '电动汽车用动力蓄电池安全要求',
        effectiveDate: '2026-07-01',
        keyRequirements: [
          '热扩散测试观察时间≥2小时',
          '新增电池包底部撞击测试',
          '加强防篡改设计要求',
          '完善BMS安全标准'
        ],
        testingMethods: [
          '单体热失控触发测试',
          '过充保护测试',
          '短路安全测试',
          '机械冲击测试'
        ]
      },
      {
        id: 'gb/t-31484-2015',
        name: 'GB/T 31484-2015',
        fullName: '电动汽车用动力蓄电池循环寿命要求及试验方法',
        effectiveDate: '2015-05-15',
        keyRequirements: [
          '循环寿命≥1000次（容量保持率≥80%）',
          '不同温度下的循环性能',
          '存储性能要求'
        ]
      }
    ],
    
    patents: [
      {
        id: 'cn201810123456',
        number: 'CN201810123456.7',
        title: '高镍三元正极材料及其制备方法',
        assignee: '松下电器产业株式会社',
        filingDate: '2018-01-15',
        expirationDate: '2038-01-14',
        status: '有效',
        riskLevel: '高',
        claims: '保护Ni含量≥85%的三元正极材料'
      },
      {
        id: 'cn201910987654',
        number: 'CN201910987654.3',
        title: '硅碳复合负极材料及其制备方法',
        assignee: '三星SDI株式会社',
        filingDate: '2019-03-20',
        expirationDate: '2039-03-19',
        status: '有效',
        riskLevel: '中',
        claims: '保护硅含量>30%的硅碳复合材料'
      },
      {
        id: 'us2020123456',
        number: 'US2020123456A1',
        title: '干法电极制造工艺',
        assignee: 'Maxwell Technologies Inc.',
        filingDate: '2020-01-10',
        expirationDate: '2040-01-09',
        status: '有效',
        riskLevel: '中',
        claims: '保护特定干法电极工艺参数'
      }
    ]
  };
}

// 搜索知识库
function searchKnowledge(query, category) {
  const data = getKnowledgeData();
  const results = [];
  const queryLower = query.toLowerCase();
  
  // 搜索材料
  if (!category || category === 'materials') {
    data.materials.forEach(material => {
      if (material.name.toLowerCase().includes(queryLower) || 
          material.fullName.toLowerCase().includes(queryLower) ||
          material.description.toLowerCase().includes(queryLower)) {
        results.push({
          type: 'material',
          data: material
        });
      }
    });
  }
  
  // 搜索工艺
  if (!category || category === 'processes') {
    data.processes.forEach(process => {
      if (process.name.toLowerCase().includes(queryLower) || 
          process.description.toLowerCase().includes(queryLower)) {
        results.push({
          type: 'process',
          data: process
        });
      }
    });
  }
  
  // 搜索标准
  if (!category || category === 'standards') {
    data.standards.forEach(standard => {
      if (standard.name.toLowerCase().includes(queryLower) || 
          standard.fullName.toLowerCase().includes(queryLower)) {
        results.push({
          type: 'standard',
          data: standard
        });
      }
    });
  }
  
  // 搜索专利
  if (!category || category === 'patents') {
    data.patents.forEach(patent => {
      if (patent.number.toLowerCase().includes(queryLower) || 
          patent.title.toLowerCase().includes(queryLower) ||
          patent.assignee.toLowerCase().includes(queryLower)) {
        results.push({
          type: 'patent',
          data: patent
        });
      }
    });
  }
  
  return results;
}