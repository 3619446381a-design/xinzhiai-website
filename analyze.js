// api/analyze.js - 风险分析API
export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只处理POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { material, process, design, energyDensity, cycleLife } = req.body;

    // 生成模拟分析结果
    const analysisResult = generateAnalysisResult(material, process, design, energyDensity, cycleLife);

    res.status(200).json({
      success: true,
      data: analysisResult,
      report: generateReport(analysisResult)
    });

  } catch (error) {
    console.error('风险分析API错误:', error);
    res.status(500).json({
      success: false,
      error: '分析失败',
      data: getMockAnalysisData()
    });
  }
}

// 生成分析结果
function generateAnalysisResult(material, process, design, energyDensity, cycleLife) {
  const risks = [];
  let highRiskCount = 0;
  let mediumRiskCount = 0;
  let lowRiskCount = 0;

  // 根据材料判断风险
  if (material === 'NCM811') {
    highRiskCount++;
    risks.push({
      level: 'high',
      description: 'NCM811材料中Ni含量≥85%的配方涉及松下专利',
      patentNumber: 'CN201810123456.7',
      patentTitle: '高镍三元正极材料及其制备方法',
      assignee: '松下电器产业株式会社',
      suggestion: '调整Ni含量至78-82%区间，或考虑NCM622替代方案'
    });
  }

  if (material === 'silicon-carbon') {
    mediumRiskCount++;
    risks.push({
      level: 'medium',
      description: '硅含量>30%的硅碳复合材料可能涉及三星专利',
      patentNumber: 'CN201910987654.3',
      patentTitle: '硅碳复合负极材料及其制备方法',
      assignee: '三星SDI株式会社',
      suggestion: '控制硅含量<20%，或使用公开的包覆工艺'
    });
  }

  if (process === 'dry-electrode') {
    mediumRiskCount++;
    risks.push({
      level: 'medium',
      description: '特定干法电极工艺参数可能涉及专利',
      patentNumber: 'US2020123456A1',
      patentTitle: '干法电极制造工艺及设备',
      assignee: 'Maxwell Technologies Inc.',
      suggestion: '调整工艺参数，或寻求技术许可'
    });
  }

  // 添加一些低风险
  lowRiskCount += 2;
  risks.push({
    level: 'low',
    description: '常规电解液配方可能有专利限制',
    patentNumber: 'CN202010123456.7',
    patentTitle: '锂离子电池电解液添加剂组合',
    assignee: '比亚迪股份有限公司',
    suggestion: '使用公开的替代添加剂组合'
  });

  risks.push({
    level: 'low',
    description: '标准化成工艺可能有改进专利',
    patentNumber: 'CN201911234567.8',
    patentTitle: '锂离子电池化成方法',
    assignee: '宁德时代新能源科技股份有限公司',
    suggestion: '采用公开的标准化成工艺'
  });

  // 合规性检查
  const compliance = {
    thermalDiffusion: energyDensity > 250 ? '需加强热管理设计' : '符合要求',
    overcharge: '需验证BMS保护功能',
    shortCircuit: '符合要求',
    mechanicalCrush: design === 'cylindrical' ? '需验证底部防护' : '符合要求',
    bottomImpact: '需按GB38031-2025新增要求进行测试',
    overall: '基本符合，建议优化'
  };

  // 生成建议
  const recommendations = [
    '调整材料配方避开专利保护范围',
    '考虑使用公开的替代方案降低风险',
    '进行小批量验证测试确保性能',
    '咨询专业知识产权律师进行FTO分析',
    '提前进行新国标预测试验证合规性'
  ];

  return {
    highRiskCount,
    mediumRiskCount,
    lowRiskCount,
    risks,
    compliance,
    recommendations,
    summary: `您的方案包含${highRiskCount}个高风险、${mediumRiskCount}个中风险和${lowRiskCount}个低风险。建议重点关注高风险项并进行优化。`
  };
}

// 生成报告
function generateReport(analysisResult) {
  const report = {
    title: '新国标电池研发方案风险分析报告',
    date: new Date().toISOString().split('T')[0],
    summary: analysisResult.summary,
    sections: [
      {
        title: '风险等级概览',
        content: `高风险：${analysisResult.highRiskCount}项，中风险：${analysisResult.mediumRiskCount}项，低风险：${analysisResult.lowRiskCount}项`
      },
      {
        title: '专利侵权风险详情',
        content: analysisResult.risks.map(risk => 
          `${risk.level === 'high' ? '🔴' : risk.level === 'medium' ? '🟡' : '🟢'} ${risk.description}（专利号：${risk.patentNumber}）`
        ).join('\n')
      },
      {
        title: '新国标合规性检查',
        content: Object.entries(analysisResult.compliance)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n')
      },
      {
        title: '优化建议',
        content: analysisResult.recommendations.join('\n')
      }
    ]
  };

  return report;
}

// 获取模拟数据（备用）
function getMockAnalysisData() {
  return {
    highRiskCount: 1,
    mediumRiskCount: 2,
    lowRiskCount: 3,
    risks: [
      {
        level: 'high',
        description: 'NCM材料高镍配方专利风险',
        patentNumber: 'CN201810123456.7',
        patentTitle: '高镍三元正极材料',
        assignee: '松下电器',
        suggestion: '调整配方参数'
      }
    ],
    compliance: {
      thermalDiffusion: '待测试',
      overcharge: '符合',
      mechanicalCrush: '待改进',
      bottomImpact: '需验证',
      overall: '需要进一步测试'
    },
    recommendations: [
      '进行详细专利检索',
      '咨询专业律师',
      '进行预测试验证'
    ],
    summary: '初步分析发现1个高风险项，建议进行深入分析。'
  };
}