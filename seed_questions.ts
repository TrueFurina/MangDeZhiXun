
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const questions = [
  {
    question_text: '在深度学习中，以下哪个激活函数可以有效缓解梯度消失问题？',
    question_type: 'single_choice',
    options: ['Sigmoid', 'Tanh', 'ReLU', 'Softmax'],
    correct_answer: 'ReLU',
    score: 5,
    difficulty: 'easy',
    related_positions: ['AI算法工程师'],
    explanation: 'ReLU函数在正区间梯度恒为1，可以有效缓解梯度消失问题，是目前最常用的激活函数之一。',
    status: 'active'
  },
  {
    question_text: '在训练神经网络时，出现过拟合现象，以下哪种方法最不适合解决该问题？',
    question_type: 'single_choice',
    options: ['增加训练数据', '使用Dropout', '减少网络层数', '增加学习率'],
    correct_answer: '增加学习率',
    score: 5,
    difficulty: 'medium',
    related_positions: ['AI算法工程师'],
    explanation: '增加学习率会导致模型训练不稳定，无法有效解决过拟合。应该使用正则化、Dropout、数据增强等方法。',
    status: 'active'
  },
  {
    question_text: 'Transformer模型的核心组件包括哪些？（多选）',
    question_type: 'multiple_choice',
    options: ['Self-Attention机制', 'Position Encoding', 'LSTM单元', 'Feed Forward Network'],
    correct_answer: ['Self-Attention机制', 'Position Encoding', 'Feed Forward Network'],
    score: 8,
    difficulty: 'medium',
    related_positions: ['AI算法工程师'],
    explanation: 'Transformer的核心是Self-Attention机制，配合Position Encoding和FFN，不使用RNN/LSTM结构。',
    status: 'active'
  },
  {
    question_text: '在大规模预训练模型（如GPT-3）中，以下哪种技术可以显著降低推理时的显存占用？',
    question_type: 'single_choice',
    options: ['混合精度训练', '模型量化', '梯度累积', '学习率预热'],
    correct_answer: '模型量化',
    score: 8,
    difficulty: 'hard',
    related_positions: ['AI算法工程师'],
    explanation: '模型量化将FP32参数转换为INT8，可以显著降低显存占用和推理延迟，是部署大模型的关键技术。',
    status: 'active'
  },
  {
    question_text: '以下哪个不是JavaScript的数据类型？',
    question_type: 'single_choice',
    options: ['String', 'Number', 'Float', 'Symbol'],
    correct_answer: 'Float',
    score: 5,
    difficulty: 'easy',
    related_positions: ['前端开发工程师'],
    explanation: 'JavaScript的基本数据类型包括String、Number、Boolean、Null、Undefined、Symbol、BigInt。',
    status: 'active'
  },
  {
    question_text: 'React中，以下哪个Hook用于处理副作用？',
    question_type: 'single_choice',
    options: ['useState', 'useEffect', 'useContext', 'useMemo'],
    correct_answer: 'useEffect',
    score: 6,
    difficulty: 'medium',
    related_positions: ['前端开发工程师'],
    explanation: 'useEffect用于处理副作用，如数据获取、订阅、DOM操作等。',
    status: 'active'
  },
  {
    question_text: '以下哪些是CSS布局方式？（多选）',
    question_type: 'multiple_choice',
    options: ['Flexbox', 'Grid', 'Float', 'Position'],
    correct_answer: ['Flexbox', 'Grid', 'Float', 'Position'],
    score: 7,
    difficulty: 'medium',
    related_positions: ['前端开发工程师'],
    explanation: '现代CSS布局包括Flexbox、Grid、Float、Position等多种方式。',
    status: 'active'
  },
  {
    question_text: '页面首屏加载时间过长（>3s），你会如何优化？',
    question_type: 'scenario',
    options: ['代码分割 + 懒加载 + CDN加速', '减少图片大小', '使用缓存', '升级服务器'],
    correct_answer: '代码分割 + 懒加载 + CDN加速',
    score: 10,
    difficulty: 'hard',
    related_positions: ['前端开发工程师'],
    explanation: '首屏优化需要综合手段：代码分割减少初始加载量，懒加载延迟非关键资源，CDN加速静态资源。',
    status: 'active'
  }
];

async function seed() {
  console.log('开始同步题库数据...');
  
  for (const q of questions) {
    const { error } = await supabase
      .from('question_bank')
      .insert(q);
      
    if (error) {
      console.error(`导入题目失败: ${q.question_text}`, error);
    } else {
      console.log(`成功导入题目: ${q.question_text}`);
    }
  }
  
  console.log('题库数据同步完成！');
}

seed();
