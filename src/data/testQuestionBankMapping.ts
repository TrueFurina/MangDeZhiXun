// 测试题库映射系统
import { getQuestionsByPosition, getAllSupportedPositions, isPositionSupported } from './questionBankMapping';

console.log('='.repeat(60));
console.log('📊 题库映射系统测试报告');
console.log('='.repeat(60));

// 1. 测试支持的标准总数
const allPositions = getAllSupportedPositions();
console.log(`\n✅ 支持的标准总数: ${allPositions.length}`);

// 2. 按分类统计
const categories = {
  '技术开发': 0,
  'AI与数据': 0,
  '产品运营': 0,
  '设计': 0,
  '管理': 0,
  '新兴技术': 0,
};

// 简单分类统计（基于标准名称关键词）
allPositions.forEach(pos => {
  if (pos.includes('开发') || pos.includes('工程师') || pos.includes('测试') || pos.includes('运维')) {
    categories['技术开发']++;
  } else if (pos.includes('AI') || pos.includes('算法') || pos.includes('数据') || pos.includes('机器学习') || pos.includes('NLP') || pos.includes('视觉')) {
    categories['AI与数据']++;
  } else if (pos.includes('产品') || pos.includes('运营') || pos.includes('增长') || pos.includes('市场') || pos.includes('商务')) {
    categories['产品运营']++;
  } else if (pos.includes('设计') || pos.includes('UI') || pos.includes('UX')) {
    categories['设计']++;
  } else if (pos.includes('经理') || pos.includes('总监') || pos.includes('CTO') || pos.includes('架构师') || pos.includes('PMO')) {
    categories['管理']++;
  } else {
    categories['新兴技术']++;
  }
});

console.log('\n📈 标准分类统计:');
Object.entries(categories).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count}个`);
});

// 3. 随机测试15个标准
console.log('\n🎯 随机测试15个标准的题库映射:');
const testPositions = [
  '前端开发工程师',
  '前端架构师',
  '后端开发工程师',
  '后端架构师',
  'AI模型工程师',
  'NLP算法工程师',
  '计算机视觉工程师',
  '数据分析师',
  '产品经理',
  'UI设计师',
  '项目经理',
  '云计算工程师',
  '区块链工程师',
  '游戏开发工程师',
  '智能制造工程师',
];

testPositions.forEach((pos, index) => {
  const questions = getQuestionsByPosition(pos);
  const supported = isPositionSupported(pos);
  console.log(`  ${index + 1}. ${pos}: ${supported ? '✅' : '❌'} (${questions.length}道题)`);
});

// 4. 检查是否有标准没有题库
console.log('\n🔍 检查未映射的标准:');
let unmappedCount = 0;
allPositions.forEach(pos => {
  if (!isPositionSupported(pos)) {
    console.log(`  ⚠️ ${pos} - 未找到题库`);
    unmappedCount++;
  }
});

if (unmappedCount === 0) {
  console.log('  ✅ 所有标准都已正确映射！');
} else {
  console.log(`  ⚠️ 发现 ${unmappedCount} 个未映射的标准`);
}

// 5. 题库使用统计
console.log('\n📚 题库复用情况:');
const questionBankUsage: Record<string, string[]> = {};

allPositions.forEach(pos => {
  const questions = getQuestionsByPosition(pos);
  const bankKey = questions[0]?.id.toString() || 'unknown'; // 使用第一道题的ID作为题库标识
  
  if (!questionBankUsage[bankKey]) {
    questionBankUsage[bankKey] = [];
  }
  questionBankUsage[bankKey].push(pos);
});

console.log(`  共有 ${Object.keys(questionBankUsage).length} 个独立题库`);
console.log(`  平均每个题库服务 ${(allPositions.length / Object.keys(questionBankUsage).length).toFixed(1)} 个标准`);

console.log('\n' + '='.repeat(60));
console.log('✅ 测试完成！');
console.log('='.repeat(60));
