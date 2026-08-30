// 智能题库映射系统
// 将115个标准映射到对应的题库

import { Question } from './questionBank';
import {
  aiEngineerQuestions,
  frontendEngineerQuestions,
  seniorFrontendEngineerQuestions,
  productManagerQuestions,
  backendEngineerQuestions,
  uiDesignerQuestions,
  dataAnalystQuestions,
  devopsEngineerQuestions,
  fullstackEngineerQuestions,
  testEngineerQuestions,
  mobileEngineerQuestions,
  algorithmEngineerQuestions,
  mlEngineerQuestions,
  bigdataEngineerQuestions,
  productOperationsQuestions,
  contentOperationsQuestions,
  growthSpecialistQuestions,
  communityOperationsQuestions,
  frontendArchitectQuestions,
  backendArchitectQuestions,
  nlpEngineerQuestions,
  cvEngineerQuestions,
} from './questionBank';

// 题库映射表：标准名称 -> 题库
export const positionToQuestionBankMap: Record<string, Question[]> = {
  // ==================== 技术开发类 ====================
  // 前端方向（8个标准）
  '前端开发工程师': frontendEngineerQuestions.questions,
  '高级前端开发工程师': seniorFrontendEngineerQuestions.questions,
  '前端架构师': frontendArchitectQuestions.questions,
  'Web前端工程师': frontendEngineerQuestions.questions,
  'H5开发工程师': frontendEngineerQuestions.questions,
  'React开发工程师': frontendEngineerQuestions.questions,
  'Vue开发工程师': frontendEngineerQuestions.questions,
  '小程序开发工程师': frontendEngineerQuestions.questions,
  
  // 后端方向（10个标准）
  '后端开发工程师': backendEngineerQuestions.questions,
  '高级后端开发工程师': backendEngineerQuestions.questions,
  '后端架构师': backendArchitectQuestions.questions,
  'Java开发工程师': backendEngineerQuestions.questions,
  'Python开发工程师': backendEngineerQuestions.questions,
  'Go开发工程师': backendEngineerQuestions.questions,
  'Node.js开发工程师': backendEngineerQuestions.questions,
  'PHP开发工程师': backendEngineerQuestions.questions,
  'C++开发工程师': backendEngineerQuestions.questions,
  '.NET开发工程师': backendEngineerQuestions.questions,
  
  // 全栈与移动端（7个标准）
  '全栈开发工程师': fullstackEngineerQuestions.questions,
  '高级全栈工程师': fullstackEngineerQuestions.questions,
  '移动端开发工程师': mobileEngineerQuestions.questions,
  'iOS开发工程师': mobileEngineerQuestions.questions,
  'Android开发工程师': mobileEngineerQuestions.questions,
  'Flutter开发工程师': mobileEngineerQuestions.questions,
  'React Native开发工程师': mobileEngineerQuestions.questions,
  
  // 测试与运维（10个标准）
  '测试开发工程师': testEngineerQuestions.questions,
  '高级测试工程师': testEngineerQuestions.questions,
  '自动化测试工程师': testEngineerQuestions.questions,
  '性能测试工程师': testEngineerQuestions.questions,
  '运维开发工程师': devopsEngineerQuestions.questions,
  'DevOps工程师': devopsEngineerQuestions.questions,
  'SRE工程师': devopsEngineerQuestions.questions,
  '运维工程师': devopsEngineerQuestions.questions,
  '系统工程师': devopsEngineerQuestions.questions,
  '网络工程师': devopsEngineerQuestions.questions,

  // ==================== AI与数据类 ====================
  'AI模型工程师': aiEngineerQuestions.questions,
  'AI算法工程师': algorithmEngineerQuestions.questions,
  '算法工程师': algorithmEngineerQuestions.questions,
  '机器学习工程师': mlEngineerQuestions.questions,
  '深度学习工程师': mlEngineerQuestions.questions,
  'NLP算法工程师': nlpEngineerQuestions.questions,
  '计算机视觉工程师': cvEngineerQuestions.questions,
  '推荐算法工程师': algorithmEngineerQuestions.questions,
  '搜索算法工程师': algorithmEngineerQuestions.questions,
  '大数据工程师': bigdataEngineerQuestions.questions,
  '数据开发工程师': bigdataEngineerQuestions.questions,
  '数据分析师': dataAnalystQuestions.questions,
  '数据科学家': mlEngineerQuestions.questions, // 复用ML题库
  '数据挖掘工程师': mlEngineerQuestions.questions,
  'BI工程师': dataAnalystQuestions.questions,
  '数据仓库工程师': bigdataEngineerQuestions.questions,
  'ETL工程师': bigdataEngineerQuestions.questions,
  '数据架构师': bigdataEngineerQuestions.questions,
  'AI产品经理': productManagerQuestions.questions, // 复用产品经理题库
  'AI应用工程师': aiEngineerQuestions.questions,

  // ==================== 产品运营类 ====================
  '产品经理': productManagerQuestions.questions,
  '高级产品经理': productManagerQuestions.questions,
  '产品总监': productManagerQuestions.questions,
  'B端产品经理': productManagerQuestions.questions,
  'C端产品经理': productManagerQuestions.questions,
  '产品运营': productOperationsQuestions.questions,
  '用户运营': productOperationsQuestions.questions, // 复用产品运营题库
  '内容运营': contentOperationsQuestions.questions,
  '活动运营': productOperationsQuestions.questions,
  '社区运营': communityOperationsQuestions.questions,
  '用户增长专员': growthSpecialistQuestions.questions,
  '增长黑客': growthSpecialistQuestions.questions,
  '数据运营': dataAnalystQuestions.questions, // 复用数据分析题库
  '新媒体运营': contentOperationsQuestions.questions,
  '电商运营': productOperationsQuestions.questions,
  '市场营销专员': productOperationsQuestions.questions,
  '品牌经理': productOperationsQuestions.questions,
  '商务拓展': productOperationsQuestions.questions,
  '客户成功经理': productOperationsQuestions.questions,
  '运营总监': productOperationsQuestions.questions,

  // ==================== 设计类 ====================
  'UI设计师': uiDesignerQuestions.questions,
  'UX设计师': uiDesignerQuestions.questions,
  'UI/UX设计师': uiDesignerQuestions.questions,
  '交互设计师': uiDesignerQuestions.questions,
  '视觉设计师': uiDesignerQuestions.questions,
  '平面设计师': uiDesignerQuestions.questions,
  '品牌设计师': uiDesignerQuestions.questions,
  '动效设计师': uiDesignerQuestions.questions,
  '插画设计师': uiDesignerQuestions.questions,
  '3D设计师': uiDesignerQuestions.questions,
  '用户研究员': uiDesignerQuestions.questions,
  '设计总监': uiDesignerQuestions.questions,
  '资深UI设计师': uiDesignerQuestions.questions,
  '产品设计师': uiDesignerQuestions.questions,
  '体验设计师': uiDesignerQuestions.questions,

  // ==================== 管理类 ====================
  '项目经理': productManagerQuestions.questions, // 复用产品经理题库
  '技术经理': backendArchitectQuestions.questions, // 复用后端架构师题库
  '研发经理': backendArchitectQuestions.questions,
  '技术总监': backendArchitectQuestions.questions,
  'CTO': backendArchitectQuestions.questions,
  '架构师': backendArchitectQuestions.questions,
  '解决方案架构师': backendArchitectQuestions.questions,
  'Scrum Master': productManagerQuestions.questions,
  '敏捷教练': productManagerQuestions.questions,
  'PMO': productManagerQuestions.questions,

  // ==================== 新兴技术类 ====================
  '云计算工程师': devopsEngineerQuestions.questions, // 复用运维题库
  '云原生工程师': devopsEngineerQuestions.questions,
  '区块链工程师': backendEngineerQuestions.questions, // 复用后端题库
  '智能合约工程师': backendEngineerQuestions.questions,
  '物联网工程师': backendEngineerQuestions.questions,
  '嵌入式工程师': backendEngineerQuestions.questions,
  '网络安全工程师': backendEngineerQuestions.questions,
  '安全工程师': backendEngineerQuestions.questions,
  '游戏开发工程师': fullstackEngineerQuestions.questions, // 复用全栈题库
  'Unity开发工程师': fullstackEngineerQuestions.questions,
  '智能制造工程师': aiEngineerQuestions.questions, // 复用AI题库
  '工业互联网工程师': backendEngineerQuestions.questions,
  '数字孪生工程师': aiEngineerQuestions.questions,
  '元宇宙工程师': fullstackEngineerQuestions.questions,
  'AR/VR工程师': fullstackEngineerQuestions.questions,
};

/**
 * 根据标准名称获取对应的题库
 * @param positionName 标准名称
 * @returns 题目数组
 */
export function getQuestionsByPosition(positionName: string): Question[] {
  const questions = positionToQuestionBankMap[positionName];
  
  if (questions) {
    console.log(`✅ 找到标准"${positionName}"的题库，题目数量: ${questions.length}`);
    return questions;
  } else {
    console.warn(`⚠️ 未找到标准"${positionName}"的题库，使用默认题库`);
    // 默认返回AI工程师题库
    return aiEngineerQuestions.questions;
  }
}

/**
 * 获取所有支持的标准名称列表
 * @returns 标准名称数组
 */
export function getAllSupportedPositions(): string[] {
  return Object.keys(positionToQuestionBankMap);
}

/**
 * 检查标准是否有对应的题库
 * @param positionName 标准名称
 * @returns 是否支持
 */
export function isPositionSupported(positionName: string): boolean {
  return positionName in positionToQuestionBankMap;
}
