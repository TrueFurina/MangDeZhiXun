// 标准专业题库数据
// 基于胜任力理论，为每个标准设计20+道专业题目

export interface Question {
  id: number;
  type: 'single' | 'multiple' | 'judge' | 'fill' | 'essay' | 'scenario' | 'code';
  dimension: 'tech' | 'general' | 'behavior' | 'experience';
  difficulty: 'basic' | 'intermediate' | 'advanced';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  score: number;
}

export interface JobQuestionBank {
  jobId: string;
  jobTitle: string;
  category: string;
  questions: Question[];
}

// AI算法工程师题库
export const aiEngineerQuestions: JobQuestionBank = {
  jobId: 'ai-engineer',
  jobTitle: 'AI算法工程师',
  category: '技术开发',
  questions: [
    // 专业技能题（40%权重）
    {
      id: 1, type: 'single', dimension: 'tech', difficulty: 'basic',
      question: '在深度学习中，以下哪个激活函数可以有效缓解梯度消失问题？',
      options: ['Sigmoid', 'Tanh', 'ReLU', 'Softmax'],
      correctAnswer: 'ReLU',
      explanation: 'ReLU函数在正区间梯度恒为1，可以有效缓解梯度消失问题，是目前最常用的激活函数之一。',
      score: 5
    },
    {
      id: 2, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: '在训练神经网络时，出现过拟合现象，以下哪种方法最不适合解决该问题？',
      options: ['增加训练数据', '使用Dropout', '减少网络层数', '增加学习率'],
      correctAnswer: '增加学习率',
      explanation: '增加学习率会导致模型训练不稳定，无法有效解决过拟合。应该使用正则化、Dropout、数据增强等方法。',
      score: 5
    },
    {
      id: 3, type: 'multiple', dimension: 'tech', difficulty: 'intermediate',
      question: 'Transformer模型的核心组件包括哪些？（多选）',
      options: ['Self-Attention机制', 'Position Encoding', 'LSTM单元', 'Feed Forward Network'],
      correctAnswer: ['Self-Attention机制', 'Position Encoding', 'Feed Forward Network'],
      explanation: 'Transformer的核心是Self-Attention机制，配合Position Encoding和FFN，不使用RNN/LSTM结构。',
      score: 8
    },
    {
      id: 4, type: 'single', dimension: 'tech', difficulty: 'advanced',
      question: '在大规模预训练模型（如GPT-3）中，以下哪种技术可以显著降低推理时的显存占用？',
      options: ['混合精度训练', '模型量化', '梯度累积', '学习率预热'],
      correctAnswer: '模型量化',
      explanation: '模型量化将FP32参数转换为INT8，可以显著降低显存占用和推理延迟，是部署大模型的关键技术。',
      score: 8
    },
    {
      id: 5, type: 'single', dimension: 'tech', difficulty: 'basic',
      question: '以下哪个损失函数适用于多分类问题？',
      options: ['MSE', 'Binary Cross Entropy', 'Categorical Cross Entropy', 'Hinge Loss'],
      correctAnswer: 'Categorical Cross Entropy',
      explanation: '多分类问题使用Categorical Cross Entropy（交叉熵损失），二分类使用Binary Cross Entropy。',
      score: 5
    },
    {
      id: 6, type: 'scenario', dimension: 'tech', difficulty: 'advanced',
      question: '你正在训练一个图像分类模型，训练集准确率95%，验证集准确率70%。请分析可能的原因并提出解决方案。',
      options: ['过拟合，增加数据增强和Dropout', '欠拟合，增加模型复杂度', '数据泄露，检查数据划分', '学习率过大，降低学习率'],
      correctAnswer: '过拟合，增加数据增强和Dropout',
      explanation: '训练集和验证集准确率差距大，典型的过拟合现象。应增加正则化、数据增强、Dropout等方法。',
      score: 10
    },
    {
      id: 7, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: '在目标检测任务中，YOLO系列算法的核心优势是什么？',
      options: ['准确率最高', '实时性好', '模型最小', '训练最快'],
      correctAnswer: '实时性好',
      explanation: 'YOLO（You Only Look Once）将目标检测转化为回归问题，单阶段检测，速度快，适合实时应用。',
      score: 6
    },
    {
      id: 8, type: 'judge', dimension: 'tech', difficulty: 'basic',
      question: 'Batch Normalization只能用于卷积神经网络，不能用于全连接网络。',
      options: ['正确', '错误'],
      correctAnswer: '错误',
      explanation: 'Batch Normalization可以用于任何类型的神经网络，包括CNN、RNN、全连接网络等。',
      score: 4
    },
    
    // 通用能力题（30%权重）
    {
      id: 9, type: 'scenario', dimension: 'general', difficulty: 'intermediate',
      question: '项目中需要在1周内完成一个新算法的原型验证，但你对该算法不熟悉。你会如何安排？',
      options: [
        '先花3天系统学习理论，再用4天实现',
        '直接找开源代码修改，边做边学',
        '先用1天快速了解核心思想，然后实现最小可行版本，逐步优化',
        '向同事请教，让他们帮忙实现'
      ],
      correctAnswer: '先用1天快速了解核心思想，然后实现最小可行版本，逐步优化',
      explanation: '在时间紧迫的情况下，应采用敏捷开发思想，快速迭代。先实现MVP，验证可行性，再优化。',
      score: 8
    },
    {
      id: 10, type: 'scenario', dimension: 'general', difficulty: 'intermediate',
      question: '你的算法在测试集上表现不佳，产品经理要求你解释原因。你会如何沟通？',
      options: [
        '直接说"数据质量不好，不是算法的问题"',
        '用大量技术术语解释算法原理',
        '用可视化图表展示问题，提出改进方案和时间计划',
        '承认算法有问题，但不知道如何改进'
      ],
      correctAnswer: '用可视化图表展示问题，提出改进方案和时间计划',
      explanation: '与非技术人员沟通时，应使用可视化手段，清晰说明问题和解决方案，建立信任。',
      score: 8
    },
    {
      id: 11, type: 'single', dimension: 'general', difficulty: 'basic',
      question: '在团队协作中，你发现同事的代码有明显bug，你会怎么做？',
      options: [
        '直接在群里指出问题',
        '私下友好地提醒，并提供修改建议',
        '不管，等他自己发现',
        '向领导汇报'
      ],
      correctAnswer: '私下友好地提醒，并提供修改建议',
      explanation: '团队协作中应注重沟通方式，私下友好提醒既能解决问题，又能维护同事关系。',
      score: 6
    },
    
    // 行为特质题（20%权重）
    {
      id: 12, type: 'scenario', dimension: 'behavior', difficulty: 'intermediate',
      question: '你花了2周时间训练的模型，在最终评估时发现效果不如baseline。你会？',
      options: [
        '感到沮丧，考虑放弃这个方向',
        '分析失败原因，记录实验结果，尝试新方法',
        '隐瞒结果，继续调参',
        '责怪数据质量问题'
      ],
      correctAnswer: '分析失败原因，记录实验结果，尝试新方法',
      explanation: '科研精神的核心是从失败中学习。记录实验、分析原因、持续改进是优秀算法工程师的特质。',
      score: 8
    },
    {
      id: 13, type: 'single', dimension: 'behavior', difficulty: 'basic',
      question: '面对一个技术难题，你通常会？',
      options: [
        '立即向同事求助',
        '先自己研究1-2小时，实在解决不了再求助',
        '放弃，换个简单的方法',
        '在网上找现成代码'
      ],
      correctAnswer: '先自己研究1-2小时，实在解决不了再求助',
      explanation: '独立解决问题的能力很重要，但也要懂得适时求助，避免浪费时间。',
      score: 6
    },
    {
      id: 14, type: 'scenario', dimension: 'behavior', difficulty: 'intermediate',
      question: '你的研究方向与公司业务方向出现偏差，你会？',
      options: [
        '坚持自己的研究方向，认为技术更重要',
        '完全放弃研究兴趣，只做业务需求',
        '在完成业务需求的基础上，利用业余时间研究感兴趣的方向',
        '跳槽到更匹配的公司'
      ],
      correctAnswer: '在完成业务需求的基础上，利用业余时间研究感兴趣的方向',
      explanation: '平衡业务需求和个人兴趣是职业发展的关键。优先完成工作，同时保持学习热情。',
      score: 8
    },
    
    // 经验背景题（10%权重）
    {
      id: 15, type: 'scenario', dimension: 'experience', difficulty: 'basic',
      question: '你是否有深度学习相关的项目经验？',
      options: ['有完整的项目经验', '有课程作业经验', '只有理论学习', '没有相关经验'],
      correctAnswer: '有完整的项目经验',
      explanation: '项目经验是评估实践能力的重要指标。完整项目经验包括问题定义、数据处理、模型训练、部署上线。',
      score: 5
    },
    {
      id: 16, type: 'scenario', dimension: 'experience', difficulty: 'intermediate',
      question: '你最熟悉的深度学习框架是？',
      options: ['PyTorch', 'TensorFlow', 'Keras', '都不熟悉'],
      correctAnswer: 'PyTorch',
      explanation: 'PyTorch是目前最流行的深度学习框架，灵活性高，适合研究和工程应用。',
      score: 5
    },
    {
      id: 17, type: 'scenario', dimension: 'experience', difficulty: 'advanced',
      question: '你是否有论文发表或开源项目经验？',
      options: ['有顶会论文发表', '有开源项目贡献', '有技术博客', '没有相关经验'],
      correctAnswer: '有顶会论文发表',
      explanation: '论文发表和开源贡献体现了技术深度和影响力，是高级算法工程师的加分项。',
      score: 5
    },
    
    // 补充专业题目到20+道
    {
      id: 18, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: '在自然语言处理中，BERT模型使用的预训练任务是？',
      options: ['Masked Language Model', 'Next Sentence Prediction', 'A和B都是', '都不是'],
      correctAnswer: 'A和B都是',
      explanation: 'BERT使用MLM和NSP两个预训练任务，学习上下文表示和句子关系。',
      score: 6
    },
    {
      id: 19, type: 'single', dimension: 'tech', difficulty: 'advanced',
      question: '在分布式训练中，以下哪种并行策略适合超大模型（参数量>100B）？',
      options: ['数据并行', '模型并行', '流水线并行', '混合并行'],
      correctAnswer: '混合并行',
      explanation: '超大模型需要结合数据并行、模型并行、流水线并行等多种策略，才能高效训练。',
      score: 8
    },
    {
      id: 20, type: 'scenario', dimension: 'tech', difficulty: 'advanced',
      question: '你需要部署一个实时推荐系统，QPS要求10000+，延迟<50ms。你会选择什么方案？',
      options: [
        '使用Python Flask + TensorFlow',
        '使用C++ + ONNX Runtime + 模型量化',
        '使用Java + DL4J',
        '使用GPU推理服务'
      ],
      correctAnswer: '使用C++ + ONNX Runtime + 模型量化',
      explanation: '高QPS低延迟场景需要使用C++等高性能语言，配合模型量化和推理优化框架。',
      score: 10
    },
    {
      id: 21, type: 'single', dimension: 'tech', difficulty: 'basic',
      question: '以下哪个指标适合评估不平衡分类问题？',
      options: ['准确率(Accuracy)', 'F1-Score', 'MSE', 'R²'],
      correctAnswer: 'F1-Score',
      explanation: '不平衡分类问题中，准确率会误导，应使用F1-Score、AUC等指标综合评估。',
      score: 5
    },
    {
      id: 22, type: 'multiple', dimension: 'tech', difficulty: 'intermediate',
      question: '以下哪些是常用的数据增强方法？（多选）',
      options: ['随机裁剪', '颜色抖动', '梯度裁剪', 'Mixup'],
      correctAnswer: ['随机裁剪', '颜色抖动', 'Mixup'],
      explanation: '数据增强包括几何变换、颜色变换、Mixup等。梯度裁剪是训练技巧，不是数据增强。',
      score: 7
    },
    {
      id: 23, type: 'scenario', dimension: 'general', difficulty: 'advanced',
      question: '你发现竞品使用了一个新算法，效果显著提升。你会如何应对？',
      options: [
        '立即复现该算法',
        '分析算法原理，结合自身业务特点改进',
        '忽略，继续优化现有方案',
        '向领导汇报，等待指示'
      ],
      correctAnswer: '分析算法原理，结合自身业务特点改进',
      explanation: '学习竞品的同时要有自己的思考，结合业务特点创新，而不是简单复现。',
      score: 8
    },
    {
      id: 24, type: 'scenario', dimension: 'behavior', difficulty: 'advanced',
      question: '你的论文被顶会拒稿，审稿意见认为创新性不足。你会？',
      options: [
        '放弃投稿，转投其他会议',
        '仔细分析审稿意见，补充实验，改进方法后重新投稿',
        '认为审稿人不专业，投诉',
        '不再做学术研究'
      ],
      correctAnswer: '仔细分析审稿意见，补充实验，改进方法后重新投稿',
      explanation: '审稿意见是宝贵的反馈。优秀的研究者会从拒稿中学习，持续改进。',
      score: 8
    },
  ]
};

// 前端开发工程师题库
export const frontendEngineerQuestions: JobQuestionBank = {
  jobId: 'frontend-engineer',
  jobTitle: '前端开发工程师',
  category: '技术开发',
  questions: [
    // 专业技能题
    {
      id: 1, type: 'single', dimension: 'tech', difficulty: 'basic',
      question: '以下哪个不是JavaScript的数据类型？',
      options: ['String', 'Number', 'Float', 'Symbol'],
      correctAnswer: 'Float',
      explanation: 'JavaScript的基本数据类型包括String、Number、Boolean、Null、Undefined、Symbol、BigInt。',
      score: 5
    },
    {
      id: 2, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: 'React中，以下哪个Hook用于处理副作用？',
      options: ['useState', 'useEffect', 'useContext', 'useMemo'],
      correctAnswer: 'useEffect',
      explanation: 'useEffect用于处理副作用，如数据获取、订阅、DOM操作等。',
      score: 6
    },
    {
      id: 3, type: 'multiple', dimension: 'tech', difficulty: 'intermediate',
      question: '以下哪些是CSS布局方式？（多选）',
      options: ['Flexbox', 'Grid', 'Float', 'Position'],
      correctAnswer: ['Flexbox', 'Grid', 'Float', 'Position'],
      explanation: '现代CSS布局包括Flexbox、Grid、Float、Position等多种方式。',
      score: 7
    },
    {
      id: 4, type: 'scenario', dimension: 'tech', difficulty: 'advanced',
      question: '页面首屏加载时间过长（>3s），你会如何优化？',
      options: [
        '代码分割 + 懒加载 + CDN加速',
        '减少图片大小',
        '使用缓存',
        '升级服务器'
      ],
      correctAnswer: '代码分割 + 懒加载 + CDN加速',
      explanation: '首屏优化需要综合手段：代码分割减少初始加载量，懒加载延迟非关键资源，CDN加速静态资源。',
      score: 10
    },
    {
      id: 5, type: 'single', dimension: 'tech', difficulty: 'basic',
      question: '以下哪个方法可以阻止事件冒泡？',
      options: ['event.preventDefault()', 'event.stopPropagation()', 'event.stopImmediatePropagation()', 'event.cancelBubble'],
      correctAnswer: 'event.stopPropagation()',
      explanation: 'stopPropagation()阻止事件冒泡，preventDefault()阻止默认行为。',
      score: 5
    },
    {
      id: 6, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: 'Vue3相比Vue2的主要改进是什么？',
      options: ['更好的TypeScript支持', 'Composition API', '性能提升', '以上都是'],
      correctAnswer: '以上都是',
      explanation: 'Vue3引入了Composition API，提升了TypeScript支持和性能，是全面的升级。',
      score: 6
    },
    {
      id: 7, type: 'scenario', dimension: 'tech', difficulty: 'advanced',
      question: '如何实现一个高性能的虚拟列表（Virtual List）？',
      options: [
        '渲染所有列表项，用CSS隐藏不可见项',
        '只渲染可视区域的列表项，动态计算位置',
        '使用分页加载',
        '使用懒加载'
      ],
      correctAnswer: '只渲染可视区域的列表项，动态计算位置',
      explanation: '虚拟列表的核心是只渲染可视区域，通过计算滚动位置动态更新DOM，大幅提升性能。',
      score: 10
    },
    {
      id: 8, type: 'judge', dimension: 'tech', difficulty: 'basic',
      question: 'const声明的变量可以被重新赋值。',
      options: ['正确', '错误'],
      correctAnswer: '错误',
      explanation: 'const声明的变量不能被重新赋值，但对象的属性可以修改。',
      score: 4
    },
    
    // 通用能力题
    {
      id: 9, type: 'scenario', dimension: 'general', difficulty: 'intermediate',
      question: '设计师给的UI稿在移动端显示异常，你会如何处理？',
      options: [
        '直接按设计稿实现，让设计师改稿',
        '与设计师沟通，说明技术限制，协商解决方案',
        '自己修改设计，不告诉设计师',
        '向领导汇报'
      ],
      correctAnswer: '与设计师沟通，说明技术限制，协商解决方案',
      explanation: '跨部门协作需要有效沟通，说明问题，共同找到平衡技术和设计的方案。',
      score: 8
    },
    {
      id: 10, type: 'scenario', dimension: 'general', difficulty: 'intermediate',
      question: '产品经理要求在2天内完成一个复杂功能，你评估需要5天。你会？',
      options: [
        '答应2天完成，然后加班赶工',
        '拒绝需求，说不可能完成',
        '说明评估依据，协商优先级，提出分阶段交付方案',
        '先答应，到时候再说'
      ],
      correctAnswer: '说明评估依据，协商优先级，提出分阶段交付方案',
      explanation: '专业的开发者应给出合理评估，协商方案，而不是盲目答应或直接拒绝。',
      score: 8
    },
    
    // 行为特质题
    {
      id: 11, type: 'scenario', dimension: 'behavior', difficulty: 'intermediate',
      question: '你写的代码在Code Review中被指出很多问题，你会？',
      options: [
        '感到羞愧，认为自己能力不行',
        '虚心接受，记录问题，下次改进',
        '辩解说时间紧没办法',
        '认为审查者太严格'
      ],
      correctAnswer: '虚心接受，记录问题，下次改进',
      explanation: 'Code Review是学习和成长的机会，优秀的工程师会从反馈中持续改进。',
      score: 8
    },
    {
      id: 12, type: 'single', dimension: 'behavior', difficulty: 'basic',
      question: '面对新技术（如React Server Components），你会？',
      options: [
        '立即在项目中使用',
        '先学习了解，在个人项目中实践，成熟后再用于生产',
        '等别人用了再说',
        '不学习，用现有技术就够了'
      ],
      correctAnswer: '先学习了解，在个人项目中实践，成熟后再用于生产',
      explanation: '对新技术保持学习热情，但在生产环境中要谨慎，先验证再应用。',
      score: 6
    },
    
    // 经验背景题
    {
      id: 13, type: 'scenario', dimension: 'experience', difficulty: 'basic',
      question: '你是否有完整的前端项目经验？',
      options: ['有商业项目经验', '有个人项目经验', '只有课程作业', '没有项目经验'],
      correctAnswer: '有商业项目经验',
      explanation: '商业项目经验包括需求分析、技术选型、开发、测试、上线、维护全流程。',
      score: 5
    },
    {
      id: 14, type: 'scenario', dimension: 'experience', difficulty: 'intermediate',
      question: '你最熟悉的前端框架是？',
      options: ['React', 'Vue', 'Angular', '都不熟悉'],
      correctAnswer: 'React',
      explanation: 'React是目前最流行的前端框架，生态丰富，适合大型项目。',
      score: 5
    },
    
    // 补充题目到20+道
    {
      id: 15, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: '以下哪个不是HTTP缓存策略？',
      options: ['强缓存', '协商缓存', '分布式缓存', 'Service Worker缓存'],
      correctAnswer: '分布式缓存',
      explanation: 'HTTP缓存包括强缓存、协商缓存、Service Worker缓存等。分布式缓存是服务端概念。',
      score: 6
    },
    {
      id: 16, type: 'multiple', dimension: 'tech', difficulty: 'advanced',
      question: '以下哪些是前端性能优化手段？（多选）',
      options: ['Tree Shaking', 'Code Splitting', '防抖节流', '图片懒加载'],
      correctAnswer: ['Tree Shaking', 'Code Splitting', '防抖节流', '图片懒加载'],
      explanation: '前端性能优化是多方面的，包括构建优化、运行时优化、资源优化等。',
      score: 8
    },
    {
      id: 17, type: 'single', dimension: 'tech', difficulty: 'basic',
      question: '以下哪个CSS属性可以实现元素水平垂直居中？',
      options: ['text-align: center', 'display: flex; justify-content: center; align-items: center', 'margin: auto', 'position: center'],
      correctAnswer: 'display: flex; justify-content: center; align-items: center',
      explanation: 'Flexbox是实现居中最简单的方式，justify-content控制主轴，align-items控制交叉轴。',
      score: 5
    },
    {
      id: 18, type: 'scenario', dimension: 'tech', difficulty: 'advanced',
      question: '如何实现一个支持SSR的React应用？',
      options: [
        '使用create-react-app',
        '使用Next.js框架',
        '手动配置Webpack和Node服务器',
        '使用Vite'
      ],
      correctAnswer: '使用Next.js框架',
      explanation: 'Next.js是React官方推荐的SSR框架，开箱即用，支持SSR、SSG、ISR等多种渲染模式。',
      score: 10
    },
    {
      id: 19, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: 'Webpack中，以下哪个loader用于处理CSS文件？',
      options: ['babel-loader', 'css-loader', 'file-loader', 'url-loader'],
      correctAnswer: 'css-loader',
      explanation: 'css-loader用于解析CSS文件，style-loader用于将CSS注入DOM。',
      score: 6
    },
    {
      id: 20, type: 'scenario', dimension: 'general', difficulty: 'advanced',
      question: '你发现项目中有大量重复代码，但重构需要2周时间，产品经理催着上新功能。你会？',
      options: [
        '先上新功能，技术债以后再还',
        '坚持先重构，拒绝新功能',
        '与PM沟通，说明技术债的风险，协商在新功能中逐步重构',
        '偷偷加班重构'
      ],
      correctAnswer: '与PM沟通，说明技术债的风险，协商在新功能中逐步重构',
      explanation: '技术债需要管理，不能无限累积。在业务压力下，可以采用渐进式重构策略。',
      score: 8
    },
    {
      id: 21, type: 'single', dimension: 'tech', difficulty: 'basic',
      question: '以下哪个方法可以深拷贝一个对象？',
      options: ['Object.assign()', 'JSON.parse(JSON.stringify())', '扩展运算符...', 'Object.create()'],
      correctAnswer: 'JSON.parse(JSON.stringify())',
      explanation: 'JSON方法可以深拷贝，但有局限（不支持函数、循环引用等）。生产环境建议使用lodash.cloneDeep。',
      score: 5
    },
    {
      id: 22, type: 'scenario', dimension: 'behavior', difficulty: 'intermediate',
      question: '你发现团队使用的技术栈已经过时，但大家都习惯了。你会？',
      options: [
        '保持沉默，随大流',
        '在团队会议上提出，分享新技术的优势，提议逐步迁移',
        '自己偷偷用新技术',
        '抱怨但不行动'
      ],
      correctAnswer: '在团队会议上提出，分享新技术的优势，提议逐步迁移',
      explanation: '技术领导力体现在推动团队进步。通过分享和说服，而不是强制或抱怨。',
      score: 8
    },
    {
      id: 23, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: 'TypeScript中，以下哪个关键字用于定义接口？',
      options: ['class', 'interface', 'type', 'B和C都可以'],
      correctAnswer: 'B和C都可以',
      explanation: 'TypeScript中interface和type都可以定义接口，但interface更适合对象类型，type更灵活。',
      score: 6
    },
    {
      id: 24, type: 'scenario', dimension: 'experience', difficulty: 'advanced',
      question: '你是否有前端工程化经验（如搭建脚手架、配置CI/CD）？',
      options: ['有完整经验', '有部分经验', '只使用过', '没有经验'],
      correctAnswer: '有完整经验',
      explanation: '前端工程化能力是高级工程师的标志，包括构建优化、自动化部署、代码规范等。',
      score: 5
    },
  ]
};

// 产品经理题库
export const productManagerQuestions: JobQuestionBank = {
  jobId: 'product-manager',
  jobTitle: '产品经理',
  category: '产品运营',
  questions: [
    // 专业技能题
    {
      id: 1, type: 'scenario', dimension: 'tech', difficulty: 'intermediate',
      question: '用户反馈产品某个功能难用，你会如何分析和改进？',
      options: [
        '立即修改功能',
        '收集更多用户反馈，分析问题根源，设计解决方案，A/B测试验证',
        '忽略少数用户意见',
        '让设计师重新设计'
      ],
      correctAnswer: '收集更多用户反馈，分析问题根源，设计解决方案，A/B测试验证',
      explanation: '产品优化需要数据驱动，系统性分析问题，通过实验验证方案效果。',
      score: 10
    },
    {
      id: 2, type: 'single', dimension: 'tech', difficulty: 'basic',
      question: '以下哪个不是产品需求文档（PRD）的必要内容？',
      options: ['需求背景', '功能描述', '代码实现', '验收标准'],
      correctAnswer: '代码实现',
      explanation: 'PRD关注"做什么"和"为什么"，不涉及"怎么做"的技术实现细节。',
      score: 5
    },
    {
      id: 3, type: 'multiple', dimension: 'tech', difficulty: 'intermediate',
      question: '以下哪些是常用的用户研究方法？（多选）',
      options: ['用户访谈', '问卷调查', '可用性测试', '代码审查'],
      correctAnswer: ['用户访谈', '问卷调查', '可用性测试'],
      explanation: '用户研究包括定性方法（访谈、测试）和定量方法（问卷、数据分析）。代码审查是技术方法。',
      score: 7
    },
    {
      id: 4, type: 'scenario', dimension: 'tech', difficulty: 'advanced',
      question: '老板要求在1个月内上线一个新产品，但你评估需要3个月。你会？',
      options: [
        '答应1个月，然后拼命赶工',
        '拒绝，说不可能完成',
        '提出MVP方案，先上核心功能，后续迭代',
        '让开发团队加班'
      ],
      correctAnswer: '提出MVP方案，先上核心功能，后续迭代',
      explanation: 'MVP（最小可行产品）是快速验证想法的有效方法，先上核心功能，根据反馈迭代。',
      score: 10
    },
    {
      id: 5, type: 'single', dimension: 'tech', difficulty: 'basic',
      question: '以下哪个指标用于衡量用户留存？',
      options: ['DAU', '次日留存率', 'GMV', 'CTR'],
      correctAnswer: '次日留存率',
      explanation: '留存率（次日、7日、30日）是衡量产品粘性的核心指标。',
      score: 5
    },
    
    // 通用能力题
    {
      id: 6, type: 'scenario', dimension: 'general', difficulty: 'intermediate',
      question: '开发团队说你的需求技术实现难度大，要延期2周。你会？',
      options: [
        '坚持原计划，要求开发加班',
        '了解技术难点，协商简化方案或调整优先级',
        '向老板汇报，让老板施压',
        '直接同意延期'
      ],
      correctAnswer: '了解技术难点，协商简化方案或调整优先级',
      explanation: '产品经理需要理解技术，与开发协作找到平衡业务和技术的方案。',
      score: 8
    },
    {
      id: 7, type: 'scenario', dimension: 'general', difficulty: 'intermediate',
      question: '设计师的方案很炫酷但不符合用户习惯，你会？',
      options: [
        '直接否决设计方案',
        '用数据和用户反馈说服设计师，共同优化方案',
        '让设计师自己决定',
        '向老板汇报'
      ],
      correctAnswer: '用数据和用户反馈说服设计师，共同优化方案',
      explanation: '跨部门协作需要用数据说话，尊重专业，共同找到最优解。',
      score: 8
    },
    
    // 行为特质题
    {
      id: 8, type: 'scenario', dimension: 'behavior', difficulty: 'intermediate',
      question: '你负责的产品上线后数据不达预期，老板质疑你的能力。你会？',
      options: [
        '感到沮丧，考虑离职',
        '分析数据，找出问题，提出改进方案',
        '甩锅给开发或设计',
        '辩解说市场环境不好'
      ],
      correctAnswer: '分析数据，找出问题，提出改进方案',
      explanation: '优秀的产品经理会从失败中学习，用数据分析问题，持续改进。',
      score: 8
    },
    {
      id: 9, type: 'single', dimension: 'behavior', difficulty: 'basic',
      question: '面对用户的负面评价，你会？',
      options: [
        '忽略，认为用户不懂产品',
        '认真分析，从中找到改进方向',
        '删除负面评价',
        '与用户争辩'
      ],
      correctAnswer: '认真分析，从中找到改进方向',
      explanation: '负面反馈是产品改进的宝贵来源，优秀的PM会从中发现机会。',
      score: 6
    },
    
    // 经验背景题
    {
      id: 10, type: 'scenario', dimension: 'experience', difficulty: 'basic',
      question: '你是否有完整的产品项目经验（从0到1）？',
      options: ['有从0到1的经验', '有功能迭代经验', '只有实习经验', '没有经验'],
      correctAnswer: '有从0到1的经验',
      explanation: '从0到1的产品经验包括市场调研、需求分析、产品设计、上线运营全流程。',
      score: 5
    },
    
    // 补充题目到20+道
    {
      id: 11, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: '以下哪个不是产品优先级排序方法？',
      options: ['RICE模型', 'Kano模型', 'SWOT分析', 'Scrum敏捷'],
      correctAnswer: 'Scrum敏捷',
      explanation: 'RICE、Kano、SWOT都是优先级排序方法。Scrum是敏捷开发框架。',
      score: 6
    },
    {
      id: 12, type: 'scenario', dimension: 'tech', difficulty: 'advanced',
      question: '如何设计一个To B SaaS产品的定价策略？',
      options: [
        '按用户数收费',
        '按功能模块收费',
        '按使用量收费',
        '综合考虑用户价值、竞品定价、成本，设计分层定价'
      ],
      correctAnswer: '综合考虑用户价值、竞品定价、成本，设计分层定价',
      explanation: 'To B定价需要综合考虑多个因素，通常采用分层定价（基础版、专业版、企业版）。',
      score: 10
    },
    {
      id: 13, type: 'multiple', dimension: 'tech', difficulty: 'intermediate',
      question: '以下哪些是产品经理的核心能力？（多选）',
      options: ['需求分析', '数据分析', '编程能力', '沟通协调'],
      correctAnswer: ['需求分析', '数据分析', '沟通协调'],
      explanation: '产品经理的核心能力是需求分析、数据分析、沟通协调。编程不是必须，但了解技术有帮助。',
      score: 7
    },
    {
      id: 14, type: 'single', dimension: 'tech', difficulty: 'basic',
      question: '以下哪个工具常用于产品原型设计？',
      options: ['Photoshop', 'Axure', 'Excel', 'Word'],
      correctAnswer: 'Axure',
      explanation: 'Axure、Figma、Sketch等是常用的原型设计工具。',
      score: 5
    },
    {
      id: 15, type: 'scenario', dimension: 'general', difficulty: 'advanced',
      question: '两个重要功能都很紧急，但资源有限只能做一个。你会如何决策？',
      options: [
        '凭直觉选一个',
        '让老板决定',
        '用RICE模型量化评估，选择价值更大的',
        '两个都做，让团队加班'
      ],
      correctAnswer: '用RICE模型量化评估，选择价值更大的',
      explanation: 'RICE模型（Reach、Impact、Confidence、Effort）可以量化评估优先级，做出理性决策。',
      score: 8
    },
    {
      id: 16, type: 'scenario', dimension: 'behavior', difficulty: 'intermediate',
      question: '你发现竞品推出了一个爆款功能，老板要求立即抄袭。你会？',
      options: [
        '立即抄袭',
        '分析竞品功能背后的逻辑，结合自身产品特点创新',
        '拒绝抄袭',
        '先抄袭再优化'
      ],
      correctAnswer: '分析竞品功能背后的逻辑，结合自身产品特点创新',
      explanation: '学习竞品但不盲目抄袭，要理解背后的用户需求，结合自身优势创新。',
      score: 8
    },
    {
      id: 17, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: '以下哪个不是用户画像的组成部分？',
      options: ['人口统计特征', '行为特征', '需求痛点', '代码能力'],
      correctAnswer: '代码能力',
      explanation: '用户画像包括人口统计、行为特征、需求痛点、使用场景等，不涉及技术能力。',
      score: 6
    },
    {
      id: 18, type: 'scenario', dimension: 'tech', difficulty: 'advanced',
      question: '如何验证一个新功能的价值？',
      options: [
        '上线后看数据',
        '做A/B测试，对比实验组和对照组的核心指标',
        '问用户喜不喜欢',
        '看竞品有没有'
      ],
      correctAnswer: '做A/B测试，对比实验组和对照组的核心指标',
      explanation: 'A/B测试是验证功能价值的科学方法，通过对比实验组和对照组的数据得出结论。',
      score: 10
    },
    {
      id: 19, type: 'single', dimension: 'tech', difficulty: 'basic',
      question: '以下哪个指标用于衡量用户活跃度？',
      options: ['GMV', 'DAU/MAU', 'NPS', 'ARPU'],
      correctAnswer: 'DAU/MAU',
      explanation: 'DAU/MAU（日活/月活）比例反映用户活跃度和粘性。',
      score: 5
    },
    {
      id: 20, type: 'scenario', dimension: 'general', difficulty: 'intermediate',
      question: '运营团队抱怨产品功能不好用，影响运营效率。你会？',
      options: [
        '辩解说产品没问题',
        '深入了解运营痛点，优化产品',
        '让运营自己适应',
        '向老板汇报'
      ],
      correctAnswer: '深入了解运营痛点，优化产品',
      explanation: '内部用户（运营、客服等）的反馈同样重要，优化内部工具可以提升整体效率。',
      score: 8
    },
    {
      id: 21, type: 'scenario', dimension: 'behavior', difficulty: 'advanced',
      question: '你坚持的产品方向被老板否决，你会？',
      options: [
        '消极怠工',
        '理解老板的考虑，执行决策，同时保留数据验证',
        '坚持己见，拒绝执行',
        '离职'
      ],
      correctAnswer: '理解老板的考虑，执行决策，同时保留数据验证',
      explanation: '产品经理要有自己的判断，但也要理解公司战略。执行决策，用数据说话。',
      score: 8
    },
    {
      id: 22, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: '以下哪个不是敏捷开发的核心价值观？',
      options: ['个体和互动高于流程和工具', '工作的软件高于详尽的文档', '完美的代码高于快速迭代', '响应变化高于遵循计划'],
      correctAnswer: '完美的代码高于快速迭代',
      explanation: '敏捷开发强调快速迭代、拥抱变化，而不是追求完美。',
      score: 6
    },
    {
      id: 23, type: 'scenario', dimension: 'experience', difficulty: 'intermediate',
      question: '你是否有数据分析经验（如SQL、Excel、BI工具）？',
      options: ['熟练使用', '基本使用', '只会看报表', '不会使用'],
      correctAnswer: '熟练使用',
      explanation: '数据分析是产品经理的核心能力，需要熟练使用SQL、Excel、BI工具进行数据分析。',
      score: 5
    },
    {
      id: 24, type: 'scenario', dimension: 'behavior', difficulty: 'intermediate',
      question: '你负责的产品被用户吐槽"抄袭竞品"，你会？',
      options: [
        '忽略，继续抄袭',
        '反思产品定位，找到差异化价值',
        '辩解说行业都这样',
        '删除负面评论'
      ],
      correctAnswer: '反思产品定位，找到差异化价值',
      explanation: '被指抄袭说明产品缺乏差异化。优秀的PM会反思定位，找到独特价值。',
      score: 8
    },
  ]
};

// 后端开发工程师题库
export const backendEngineerQuestions: JobQuestionBank = {
  jobId: 'backend-engineer',
  jobTitle: '后端开发工程师',
  category: '技术开发',
  questions: [
    {
      id: 1, type: 'single', dimension: 'tech', difficulty: 'basic',
      question: '在RESTful API设计中，以下哪个HTTP方法用于更新资源？',
      options: ['GET', 'POST', 'PUT', 'DELETE'],
      correctAnswer: 'PUT',
      explanation: 'PUT方法用于更新资源，POST用于创建，GET用于查询，DELETE用于删除。',
      score: 5
    },
    {
      id: 2, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: '数据库索引的主要作用是什么？',
      options: ['提高查询速度', '减少存储空间', '保证数据一致性', '简化SQL语句'],
      correctAnswer: '提高查询速度',
      explanation: '索引通过创建数据结构（如B+树）来加速数据检索，但会占用额外空间。',
      score: 5
    },
    {
      id: 3, type: 'multiple', dimension: 'tech', difficulty: 'intermediate',
      question: 'Redis常见的数据类型包括哪些？（多选）',
      options: ['String', 'List', 'Set', 'Graph'],
      correctAnswer: ['String', 'List', 'Set'],
      explanation: 'Redis支持String、List、Set、Hash、Sorted Set等数据类型，不支持Graph。',
      score: 8
    },
    {
      id: 4, type: 'single', dimension: 'tech', difficulty: 'advanced',
      question: '在微服务架构中，如何解决分布式事务问题？',
      options: ['使用两阶段提交', '使用Saga模式', '使用分布式锁', '使用消息队列'],
      correctAnswer: '使用Saga模式',
      explanation: 'Saga模式通过一系列本地事务和补偿机制来实现分布式事务，是微服务中常用的方案。',
      score: 8
    },
    {
      id: 5, type: 'essay', dimension: 'tech', difficulty: 'advanced',
      question: '请描述你如何设计一个高并发的秒杀系统，需要考虑哪些关键技术点？',
      options: [],
      correctAnswer: '需要考虑：1.前端限流和防重复提交 2.后端接口限流（令牌桶/漏桶） 3.Redis缓存库存 4.消息队列削峰 5.数据库乐观锁防超卖 6.CDN加速静态资源',
      explanation: '秒杀系统需要从多个层面进行优化：前端防刷、后端限流、缓存预热、异步处理、数据库优化等。',
      score: 15
    },
    {
      id: 6, type: 'single', dimension: 'general', difficulty: 'intermediate',
      question: '代码审查（Code Review）的主要目的是什么？',
      options: ['找出代码错误', '提高代码质量和团队协作', '评估开发者能力', '减少开发时间'],
      correctAnswer: '提高代码质量和团队协作',
      explanation: 'Code Review不仅能发现问题，更重要的是促进知识分享、统一代码风格、提升团队整体水平。',
      score: 5
    },
    {
      id: 7, type: 'single', dimension: 'tech', difficulty: 'basic',
      question: 'SQL注入攻击的主要防御方法是什么？',
      options: ['使用参数化查询', '加密数据库密码', '限制数据库权限', '使用HTTPS'],
      correctAnswer: '使用参数化查询',
      explanation: '参数化查询（预编译语句）可以有效防止SQL注入，将SQL代码和数据分离。',
      score: 5
    },
    {
      id: 8, type: 'multiple', dimension: 'tech', difficulty: 'intermediate',
      question: '以下哪些是常见的API认证方式？（多选）',
      options: ['JWT', 'OAuth 2.0', 'Session Cookie', 'FTP'],
      correctAnswer: ['JWT', 'OAuth 2.0', 'Session Cookie'],
      explanation: 'JWT、OAuth 2.0、Session Cookie都是常见的认证方式，FTP是文件传输协议。',
      score: 6
    },
    {
      id: 9, type: 'essay', dimension: 'general', difficulty: 'intermediate',
      question: '在项目中遇到性能瓶颈时，你会如何定位和解决问题？请描述你的排查思路。',
      options: [],
      correctAnswer: '1.使用性能监控工具定位瓶颈（APM、日志分析） 2.分析慢查询和接口响应时间 3.检查数据库索引和查询优化 4.评估缓存策略 5.考虑代码层面优化 6.必要时进行架构调整（分库分表、微服务拆分）',
      explanation: '性能优化需要系统化的排查方法，从监控数据入手，逐层分析，找到真正的瓶颈点。',
      score: 12
    },
    {
      id: 10, type: 'single', dimension: 'behavior', difficulty: 'intermediate',
      question: '当产品经理提出一个技术上很难实现的需求时，你会怎么做？',
      options: ['直接拒绝', '先评估技术方案，再与产品沟通', '无条件接受', '转交给其他同事'],
      correctAnswer: '先评估技术方案，再与产品沟通',
      explanation: '专业的工程师会先进行技术评估，然后与产品经理沟通，讨论替代方案或分阶段实现。',
      score: 6
    },
    // ===== 扩充题目（11-15）=====
    {
      id: 11, type: 'single', dimension: 'tech', difficulty: 'advanced',
      question: '以下关于消息队列消息可靠性保证，错误的是？',
      options: ['生产者确认（Producer Confirm）确保消息到达Broker', '消费者手动ACK确保消息被正确消费', '消息队列自动幂等性，无需业务侧处理重复消费', '死信队列用于处理无法被消费的消息'],
      correctAnswer: '消息队列自动幂等性，无需业务侧处理重复消费',
      explanation: '消息队列本身不保证幂等性，在网络抖动或消费者重启等场景下消息可能被重复投递，业务侧必须实现幂等处理（如数据库唯一索引、Redis去重）。',
      score: 6
    },
    {
      id: 12, type: 'single', dimension: 'tech', difficulty: 'advanced',
      question: 'JVM调优中，出现频繁Full GC的常见原因不包括哪项？',
      options: ['老年代空间不足', '方法区（Metaspace）溢出', '代码中存在内存泄漏', 'CPU核心数过少'],
      correctAnswer: 'CPU核心数过少',
      explanation: 'Full GC频繁通常由老年代空间不足、Metaspace溢出、大对象直接进老年代或内存泄漏引起，与CPU核心数无直接关系。排查工具：jstat、GCEasy、Arthas。',
      score: 6
    },
    {
      id: 13, type: 'multiple', dimension: 'tech', difficulty: 'advanced',
      question: 'Kubernetes中，保证Pod高可用的机制有哪些？（多选）',
      options: ['PodDisruptionBudget（PDB）限制自愿中断数量', 'Deployment的滚动更新策略', 'Pod亲和性/反亲和性（Affinity/Anti-affinity）', 'ConfigMap版本控制'],
      correctAnswer: ['PodDisruptionBudget（PDB）限制自愿中断数量', 'Deployment的滚动更新策略', 'Pod亲和性/反亲和性（Affinity/Anti-affinity）'],
      explanation: 'PDB防止维护时过多Pod同时下线；滚动更新保证零停机部署；反亲和性将副本分散到不同节点防止单点故障。ConfigMap是配置管理，与高可用无直接关系。',
      score: 6
    },
    {
      id: 14, type: 'scenario', dimension: 'tech', difficulty: 'advanced',
      question: '【系统设计题】如何设计一个支持每秒10万QPS的短链接生成服务？请说明架构要点和数据库选型。',
      options: ['单机MySQL + 自增ID', 'Redis生成自增ID + MySQL持久化 + CDN缓存热点短链', '直接用UUID存储', '全部存在内存中'],
      correctAnswer: 'Redis生成自增ID + MySQL持久化 + CDN缓存热点短链',
      explanation: '短链服务核心：①ID生成用Redis INCR保证唯一且高性能；②Base62编码压缩ID；③MySQL持久化保证数据安全；④热点短链用CDN/Redis缓存，Read-Heavy场景命中率可达99%+；⑤水平扩展支持高QPS。',
      score: 8
    },
    {
      id: 15, type: 'scenario', dimension: 'behavior', difficulty: 'advanced',
      question: '线上数据库出现慢查询，直接导致接口超时，你的处理优先级和步骤是什么？',
      options: ['先回滚代码版本再排查', '立即扩容数据库实例', '先缓解（加缓存/降级）→再定位慢SQL（EXPLAIN分析）→最后优化索引/代码', '直接通知业务方暂停功能'],
      correctAnswer: '先缓解（加缓存/降级）→再定位慢SQL（EXPLAIN分析）→最后优化索引/代码',
      explanation: '生产事故处理原则：先止血（降低影响范围，如接口降级、加缓存兜底）→再定位根因（show processlist + EXPLAIN）→最后修复并复盘。不能在故障中贸然扩容或回滚，需有数据支撑。',
      score: 6
    }
  ]
};

// UI设计师题库
export const uiDesignerQuestions: JobQuestionBank = {
  jobId: 'ui-designer',
  jobTitle: 'UI设计师',
  category: '设计',
  questions: [
    {
      id: 1, type: 'single', dimension: 'tech', difficulty: 'basic',
      question: '在UI设计中，以下哪个颜色通常用于表示警告？',
      options: ['红色', '黄色', '绿色', '蓝色'],
      correctAnswer: '黄色',
      explanation: '黄色通常用于警告提示，红色表示错误或危险，绿色表示成功，蓝色表示信息。',
      score: 4
    },
    {
      id: 2, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: '什么是设计系统（Design System）？',
      options: ['一套设计软件', '一套可复用的设计规范和组件库', '一种设计风格', '一个设计团队'],
      correctAnswer: '一套可复用的设计规范和组件库',
      explanation: '设计系统包含设计原则、组件库、设计规范等，确保产品设计的一致性和效率。',
      score: 6
    },
    {
      id: 3, type: 'multiple', dimension: 'tech', difficulty: 'basic',
      question: '以下哪些是常用的UI设计工具？（多选）',
      options: ['Figma', 'Sketch', 'Photoshop', 'Excel'],
      correctAnswer: ['Figma', 'Sketch', 'Photoshop'],
      explanation: 'Figma、Sketch、Photoshop都是专业的UI设计工具，Excel是表格软件。',
      score: 5
    },
    {
      id: 4, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: '响应式设计中，移动端优先（Mobile First）的主要优势是什么？',
      options: ['开发更快', '确保核心功能在小屏幕上可用', '节省成本', '提高SEO'],
      correctAnswer: '确保核心功能在小屏幕上可用',
      explanation: 'Mobile First策略确保在资源受限的移动端也能提供良好体验，然后渐进增强到大屏幕。',
      score: 6
    },
    {
      id: 5, type: 'essay', dimension: 'tech', difficulty: 'advanced',
      question: '请描述你如何为一个电商APP设计购物车页面，需要考虑哪些用户体验要素？',
      options: [],
      correctAnswer: '需要考虑：1.商品信息清晰展示（图片、名称、规格、价格） 2.数量调整便捷 3.删除和收藏功能明显 4.优惠信息突出 5.结算按钮固定在底部 6.空购物车状态设计 7.加载和错误状态处理',
      explanation: '购物车设计需要平衡信息展示和操作便捷性，关注用户的核心任务流程。',
      score: 15
    },
    {
      id: 6, type: 'single', dimension: 'general', difficulty: 'intermediate',
      question: '在设计评审会上，开发提出你的设计难以实现，你会怎么做？',
      options: ['坚持原设计', '立即妥协', '了解技术限制，寻找平衡方案', '向上级投诉'],
      correctAnswer: '了解技术限制，寻找平衡方案',
      explanation: '优秀的设计师会与开发沟通，理解技术限制，在设计目标和实现成本之间找到最佳平衡。',
      score: 6
    },
    {
      id: 7, type: 'multiple', dimension: 'tech', difficulty: 'intermediate',
      question: '无障碍设计（Accessibility）需要考虑哪些方面？（多选）',
      options: ['颜色对比度', '字体大小', '键盘导航', '动画速度'],
      correctAnswer: ['颜色对比度', '字体大小', '键盘导航'],
      explanation: '无障碍设计要确保所有用户（包括残障人士）都能使用产品，需要考虑视觉、听觉、操作等多方面。',
      score: 8
    },
    {
      id: 8, type: 'essay', dimension: 'general', difficulty: 'intermediate',
      question: '请描述你如何收集用户反馈并将其转化为设计改进？',
      options: [],
      correctAnswer: '1.通过用户访谈、问卷、数据分析收集反馈 2.分类整理问题（功能、体验、视觉等） 3.评估问题优先级和影响范围 4.设计改进方案并制作原型 5.进行可用性测试验证 6.迭代优化并跟踪效果',
      explanation: '用户反馈是设计改进的重要来源，需要系统化的方法来收集、分析和应用。',
      score: 12
    },
    {
      id: 9, type: 'single', dimension: 'behavior', difficulty: 'basic',
      question: '设计师最重要的职业素养是什么？',
      options: ['软件技能', '同理心和用户思维', '艺术天赋', '沟通能力'],
      correctAnswer: '同理心和用户思维',
      explanation: '设计师需要站在用户角度思考问题，同理心是设计出好产品的基础。',
      score: 5
    },
    {
      id: 10, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: '什么是原子设计（Atomic Design）？',
      options: ['一种设计风格', '一种组件化设计方法论', '一种设计软件', '一种配色方案'],
      correctAnswer: '一种组件化设计方法论',
      explanation: '原子设计将界面拆分为原子、分子、组织、模板、页面五个层级，便于构建可复用的设计系统。',
      score: 6
    },
  ]
};

// 数据分析师题库
export const dataAnalystQuestions: JobQuestionBank = {
  jobId: 'data-analyst',
  jobTitle: '数据分析师',
  category: 'AI与数据',
  questions: [
    {
      id: 1, type: 'single', dimension: 'tech', difficulty: 'basic',
      question: '以下哪个指标用于衡量数据的离散程度？',
      options: ['平均值', '中位数', '标准差', '众数'],
      correctAnswer: '标准差',
      explanation: '标准差衡量数据的离散程度，值越大说明数据越分散。',
      score: 5
    },
    {
      id: 2, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: 'SQL中，以下哪个语句用于去除重复数据？',
      options: ['UNIQUE', 'DISTINCT', 'REMOVE', 'DELETE'],
      correctAnswer: 'DISTINCT',
      explanation: 'DISTINCT关键字用于返回唯一不同的值，去除重复记录。',
      score: 5
    },
    {
      id: 3, type: 'multiple', dimension: 'tech', difficulty: 'intermediate',
      question: '数据可视化常用的图表类型包括哪些？（多选）',
      options: ['柱状图', '折线图', '饼图', '流程图'],
      correctAnswer: ['柱状图', '折线图', '饼图'],
      explanation: '柱状图、折线图、饼图都是数据可视化的常用图表，流程图用于表示流程而非数据。',
      score: 6
    },
    {
      id: 4, type: 'single', dimension: 'tech', difficulty: 'advanced',
      question: '在A/B测试中，p值小于0.05通常意味着什么？',
      options: ['实验失败', '结果具有统计显著性', '样本量不足', '数据有误'],
      correctAnswer: '结果具有统计显著性',
      explanation: 'p值小于0.05（显著性水平）表示结果在统计上显著，不太可能是随机产生的。',
      score: 8
    },
    {
      id: 5, type: 'essay', dimension: 'tech', difficulty: 'advanced',
      question: '请描述你如何分析一个电商平台的用户流失问题，需要关注哪些指标和维度？',
      options: [],
      correctAnswer: '需要分析：1.流失率定义和计算 2.用户生命周期分析 3.流失用户画像（年龄、地域、消费习惯） 4.行为路径分析（最后活跃时间、浏览/购买频次） 5.对比留存用户特征 6.外部因素（竞品、市场变化） 7.提出针对性的挽回策略',
      explanation: '用户流失分析需要多维度数据支撑，找出流失的关键原因和高风险群体。',
      score: 15
    },
    {
      id: 6, type: 'single', dimension: 'general', difficulty: 'intermediate',
      question: '数据分析师在项目中的核心价值是什么？',
      options: ['制作精美的图表', '用数据驱动决策', '编写复杂的SQL', '管理数据库'],
      correctAnswer: '用数据驱动决策',
      explanation: '数据分析师的核心价值是通过数据洞察支持业务决策，而不仅仅是技术操作。',
      score: 6
    },
    {
      id: 7, type: 'multiple', dimension: 'tech', difficulty: 'basic',
      question: '以下哪些是常用的数据分析工具？（多选）',
      options: ['Excel', 'Python', 'Tableau', 'Word'],
      correctAnswer: ['Excel', 'Python', 'Tableau'],
      explanation: 'Excel、Python、Tableau都是数据分析的常用工具，Word是文档编辑软件。',
      score: 5
    },
    {
      id: 8, type: 'essay', dimension: 'general', difficulty: 'intermediate',
      question: '当业务方要求你在数据不足的情况下给出分析结论时，你会如何处理？',
      options: [],
      correctAnswer: '1.明确说明数据不足的情况和风险 2.基于现有数据给出初步分析和假设 3.提出需要补充的数据和收集方案 4.建议小范围试点验证 5.设置监控指标持续跟踪 6.避免过度解读和误导决策',
      explanation: '数据分析师需要保持专业性和诚信，不能为了迎合业务而做出不负责任的结论。',
      score: 12
    },
    {
      id: 9, type: 'single', dimension: 'behavior', difficulty: 'intermediate',
      question: '在数据分析报告中，最重要的是什么？',
      options: ['复杂的统计模型', '精美的图表', '清晰的洞察和建议', '大量的数据'],
      correctAnswer: '清晰的洞察和建议',
      explanation: '报告的核心是提供有价值的洞察和可执行的建议，而不是炫技或堆砌数据。',
      score: 6
    },
    {
      id: 10, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: '什么是数据清洗（Data Cleaning）？',
      options: ['删除所有数据', '处理缺失值、异常值和重复数据', '加密数据', '备份数据'],
      correctAnswer: '处理缺失值、异常值和重复数据',
      explanation: '数据清洗是数据分析的重要步骤，确保数据质量和分析结果的可靠性。',
      score: 5
    },
    // ===== 扩充题目（11-15）=====
    {
      id: 11, type: 'single', dimension: 'tech', difficulty: 'advanced',
      question: '在假设检验中，第一类错误（α错误）是指什么？',
      options: ['未能拒绝一个实际上错误的原假设', '拒绝了一个实际上正确的原假设', '样本量不足导致的误差', '模型过拟合导致的误差'],
      correctAnswer: '拒绝了一个实际上正确的原假设',
      explanation: '第一类错误（弃真错误）：原假设H₀实际为真，但被错误拒绝，即"误判显著"。第二类错误（存伪错误）：H₀实际为假，但未被拒绝，即"错过显著"。显著性水平α控制一类错误概率。',
      score: 6
    },
    {
      id: 12, type: 'scenario', dimension: 'tech', difficulty: 'advanced',
      question: '你负责分析一款App的用户留存，7日留存率从20%下降到12%。你如何拆解定位问题根因？',
      options: ['直接推断是产品功能出了问题', '按渠道/版本/新老用户分层下钻，结合行为漏斗找流失节点', '增加广告投放拉新', '立即上线新功能挽回用户'],
      correctAnswer: '按渠道/版本/新老用户分层下钻，结合行为漏斗找流失节点',
      explanation: '留存下降的系统排查路径：①分层（渠道/地区/设备/版本）定位是否局部问题；②行为漏斗找关键流失节点（首次体验、核心功能路径）；③结合版本发布时间线做相关性分析；④访谈流失用户补充定性洞察。',
      score: 8
    },
    {
      id: 13, type: 'multiple', dimension: 'tech', difficulty: 'advanced',
      question: '数仓建设中，ODS/DWD/DWS/ADS各层的核心职责描述正确的是？（多选）',
      options: ['ODS层：原始数据贴源存储，基本不做处理', 'DWD层：明细数据层，完成数据清洗、标准化和维度关联', 'DWS层：汇总层，按主题域进行轻度聚合', 'ADS层：应用数据层，面向具体业务场景的指标产出'],
      correctAnswer: ['ODS层：原始数据贴源存储，基本不做处理', 'DWD层：明细数据层，完成数据清洗、标准化和维度关联', 'DWS层：汇总层，按主题域进行轻度聚合', 'ADS层：应用数据层，面向具体业务场景的指标产出'],
      explanation: '数仓分层是大数据架构的核心概念：ODS（贴源）→DWD（明细/标准化）→DWS（汇总/宽表）→ADS（应用/指标），每层职责清晰，保证数据可复用性和一致性。',
      score: 8
    },
    {
      id: 14, type: 'single', dimension: 'general', difficulty: 'intermediate',
      question: 'Power BI、Tableau、Superset三种BI工具中，最适合非技术业务人员自助取数分析的是？',
      options: ['Superset（需要写SQL）', 'Power BI或Tableau（拖拽式操作，低代码）', '三者都需要编程基础', '用Excel更合适'],
      correctAnswer: 'Power BI或Tableau（拖拽式操作，低代码）',
      explanation: 'Power BI/Tableau面向业务用户设计，支持拖拽式图表制作和自动智能分析，业务人员无需编程即可自助分析。Superset适合技术人员，核心交互基于SQL编辑器。',
      score: 5
    },
    {
      id: 15, type: 'scenario', dimension: 'behavior', difficulty: 'advanced',
      question: '业务方提出一个分析需求，但你发现他们真正的业务问题和其描述的"数据需求"并不一致。你会怎么做？',
      options: ['按业务方说的需求直接做', '拒绝分析，让他们重新提需求', '先通过结构化提问理解真实业务目标，对齐分析方向后再动手', '直接将两种分析结果都输出'],
      correctAnswer: '先通过结构化提问理解真实业务目标，对齐分析方向后再动手',
      explanation: '优秀的数据分析师具备"需求翻译"能力：业务方描述的通常是表象需求，分析师需要用"5W1H"或"WHY树"追问真实业务目标，对齐后再制定分析框架，避免做无效分析。',
      score: 6
    }
  ]
};

// 运维开发工程师题库
export const devopsEngineerQuestions: JobQuestionBank = {
  jobId: 'devops-engineer',
  jobTitle: '运维开发工程师',
  category: '技术开发',
  questions: [
    {
      id: 1, type: 'single', dimension: 'tech', difficulty: 'basic',
      question: 'Docker容器和虚拟机的主要区别是什么？',
      options: ['容器更轻量', '虚拟机更快', '容器需要完整操作系统', '虚拟机不需要Hypervisor'],
      correctAnswer: '容器更轻量',
      explanation: '容器共享宿主机内核，不需要完整操作系统，启动快、资源占用少，比虚拟机更轻量。',
      score: 5
    },
    {
      id: 2, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: '在Kubernetes中，以下哪个组件负责容器编排和调度？',
      options: ['kubelet', 'kube-proxy', 'kube-scheduler', 'etcd'],
      correctAnswer: 'kube-scheduler',
      explanation: 'kube-scheduler负责Pod的调度，决定Pod运行在哪个节点上。',
      score: 6
    },
    {
      id: 3, type: 'multiple', dimension: 'tech', difficulty: 'intermediate',
      question: 'CI/CD流程通常包括哪些阶段？（多选）',
      options: ['代码提交', '自动化测试', '自动化部署', '手动审批'],
      correctAnswer: ['代码提交', '自动化测试', '自动化部署'],
      explanation: 'CI/CD的核心是自动化，包括代码集成、测试、部署等环节，减少手动操作。',
      score: 8
    },
    {
      id: 4, type: 'single', dimension: 'tech', difficulty: 'advanced',
      question: '在微服务架构中，如何实现服务的健康检查和自动恢复？',
      options: ['定时重启', '使用Kubernetes的Liveness和Readiness探针', '人工监控', '增加服务器'],
      correctAnswer: '使用Kubernetes的Liveness和Readiness探针',
      explanation: 'Liveness探针检查容器是否存活，Readiness探针检查是否准备好接收流量，实现自动化健康管理。',
      score: 8
    },
    {
      id: 5, type: 'essay', dimension: 'tech', difficulty: 'advanced',
      question: '请描述你如何设计一个高可用的部署架构，需要考虑哪些关键要素？',
      options: [],
      correctAnswer: '需要考虑：1.多副本部署（至少3个实例） 2.负载均衡（Nginx/LB） 3.健康检查和自动恢复 4.数据库主从/集群 5.缓存高可用（Redis Sentinel/Cluster） 6.监控告警系统 7.灾备方案（异地多活） 8.自动化运维（CI/CD）',
      explanation: '高可用架构需要从多个层面保障系统稳定性，消除单点故障，实现故障自动恢复。',
      score: 15
    },
    {
      id: 6, type: 'single', dimension: 'general', difficulty: 'intermediate',
      question: '当生产环境出现故障时，运维工程师的首要任务是什么？',
      options: ['找出责任人', '快速恢复服务', '写故障报告', '升级系统'],
      correctAnswer: '快速恢复服务',
      explanation: '故障发生时，首要任务是快速恢复服务，保障业务连续性，事后再分析原因和改进。',
      score: 6
    },
    {
      id: 7, type: 'multiple', dimension: 'tech', difficulty: 'basic',
      question: '以下哪些是常用的监控工具？（多选）',
      options: ['Prometheus', 'Grafana', 'ELK', 'Git'],
      correctAnswer: ['Prometheus', 'Grafana', 'ELK'],
      explanation: 'Prometheus用于指标采集，Grafana用于可视化，ELK用于日志分析，Git是版本控制工具。',
      score: 6
    },
    {
      id: 8, type: 'essay', dimension: 'general', difficulty: 'intermediate',
      question: '请描述你如何进行一次生产环境的数据库升级，需要注意哪些风险点？',
      options: [],
      correctAnswer: '1.提前备份数据 2.在测试环境验证升级流程 3.制定回滚方案 4.选择业务低峰期 5.通知相关团队 6.分步执行（先从库后主库） 7.监控升级过程 8.验证业务功能 9.保留旧版本一段时间',
      explanation: '数据库升级是高风险操作，需要充分准备和多重保障，确保可以快速回滚。',
      score: 12
    },
    {
      id: 9, type: 'single', dimension: 'behavior', difficulty: 'intermediate',
      question: '运维工程师最重要的职业素养是什么？',
      options: ['编程能力', '责任心和风险意识', '沟通能力', '学历背景'],
      correctAnswer: '责任心和风险意识',
      explanation: '运维工程师直接负责生产环境稳定性，需要高度的责任心和风险意识。',
      score: 6
    },
    {
      id: 10, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: '什么是蓝绿部署（Blue-Green Deployment）？',
      options: ['使用蓝色和绿色主题', '同时维护两套环境，切换流量实现无缝部署', '分批次部署', '回滚部署'],
      correctAnswer: '同时维护两套环境，切换流量实现无缝部署',
      explanation: '蓝绿部署通过维护两套生产环境，新版本部署到绿色环境，验证后切换流量，实现零停机部署。',
      score: 6
    },
  ]
};

// 导出所有题库
// 算法工程师题库
export const algorithmEngineerQuestions: JobQuestionBank = {
  jobId: 'algorithm-engineer',
  jobTitle: '算法工程师',
  category: 'AI与数据',
  questions: [
    {
      id: 1, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: '在推荐系统中，协同过滤算法的核心思想是什么？',
      options: ['基于内容相似度', '基于用户行为相似度', '基于规则匹配', '基于随机推荐'],
      correctAnswer: '基于用户行为相似度',
      explanation: '协同过滤通过分析用户行为模式，找到相似用户或物品进行推荐。',
      score: 6
    },
    {
      id: 2, type: 'multiple', dimension: 'tech', difficulty: 'advanced',
      question: '以下哪些是常见的特征工程方法？（多选）',
      options: ['归一化', '独热编码', '特征交叉', '数据删除'],
      correctAnswer: ['归一化', '独热编码', '特征交叉'],
      explanation: '特征工程包括数据预处理、特征变换、特征构造等，数据删除不是特征工程方法。',
      score: 8
    },
    {
      id: 3, type: 'single', dimension: 'tech', difficulty: 'advanced',
      question: '在处理类别不平衡问题时，以下哪种方法最有效？',
      options: ['增加训练轮数', '使用SMOTE过采样或欠采样', '降低学习率', '增加batch size'],
      correctAnswer: '使用SMOTE过采样或欠采样',
      explanation: 'SMOTE等采样方法可以平衡正负样本比例，改善模型在少数类上的表现。',
      score: 8
    },
    {
      id: 4, type: 'essay', dimension: 'tech', difficulty: 'advanced',
      question: '请描述你如何设计一个商品推荐算法，从数据收集到模型部署的完整流程。',
      options: [],
      correctAnswer: '1.数据收集：用户行为（点击、购买、收藏）、商品特征、上下文信息 2.特征工程：用户画像、商品画像、交叉特征 3.模型选择：协同过滤+深度学习（双塔模型） 4.离线训练和评估（AUC、NDCG） 5.在线AB测试 6.模型部署和监控 7.持续优化迭代',
      explanation: '推荐算法需要完整的工程化流程，从数据到部署的每个环节都很关键。',
      score: 15
    },
    {
      id: 5, type: 'single', dimension: 'tech', difficulty: 'basic',
      question: '什么是过拟合？',
      options: ['模型在训练集和测试集上表现都很好', '模型在训练集上表现好但测试集上表现差', '模型在训练集和测试集上表现都很差', '模型训练时间过长'],
      correctAnswer: '模型在训练集上表现好但测试集上表现差',
      explanation: '过拟合是指模型过度学习了训练数据的特征，导致泛化能力差。',
      score: 5
    },
    {
      id: 6, type: 'multiple', dimension: 'tech', difficulty: 'intermediate',
      question: '以下哪些是常用的模型评估指标？（多选）',
      options: ['准确率（Accuracy）', 'AUC', 'F1-Score', '学习率'],
      correctAnswer: ['准确率（Accuracy）', 'AUC', 'F1-Score'],
      explanation: '准确率、AUC、F1-Score都是评估模型性能的指标，学习率是训练超参数。',
      score: 6
    },
    {
      id: 7, type: 'single', dimension: 'general', difficulty: 'intermediate',
      question: '当算法模型上线后效果不如预期时，你会如何分析和改进？',
      options: ['立即回滚', '分析线上数据分布和badcase，迭代优化', '增加模型复杂度', '更换算法'],
      correctAnswer: '分析线上数据分布和badcase，迭代优化',
      explanation: '算法工程师需要通过数据分析找到问题根源，针对性地优化模型。',
      score: 6
    },
    {
      id: 8, type: 'essay', dimension: 'general', difficulty: 'intermediate',
      question: '请描述你如何向非技术人员解释一个复杂的机器学习模型的工作原理。',
      options: [],
      correctAnswer: '1.使用类比和生活化的例子 2.避免专业术语，用通俗语言 3.强调模型解决的问题和带来的价值 4.用可视化图表展示效果 5.举具体的应用场景 6.关注业务结果而非技术细节',
      explanation: '算法工程师需要具备将技术转化为业务语言的能力，促进跨部门协作。',
      score: 12
    },
    {
      id: 9, type: 'single', dimension: 'behavior', difficulty: 'intermediate',
      question: '算法工程师最重要的能力是什么？',
      options: ['数学功底', '编程能力', '问题抽象和建模能力', '论文阅读能力'],
      correctAnswer: '问题抽象和建模能力',
      explanation: '将实际业务问题抽象为算法问题，并设计合适的解决方案，是算法工程师的核心能力。',
      score: 6
    },
    {
      id: 10, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: '什么是A/B测试？',
      options: ['测试两个算法的训练速度', '对比两个版本的线上效果', '测试算法的准确率', '测试数据质量'],
      correctAnswer: '对比两个版本的线上效果',
      explanation: 'A/B测试通过对照实验，科学地评估新算法或策略的实际效果。',
      score: 6
    },
  ]
};

// 机器学习工程师题库
export const mlEngineerQuestions: JobQuestionBank = {
  jobId: 'ml-engineer',
  jobTitle: '机器学习工程师',
  category: 'AI与数据',
  questions: [
    {
      id: 1, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: '在机器学习中，什么是正则化？',
      options: ['增加模型复杂度', '防止过拟合的技术', '加快训练速度', '提高准确率'],
      correctAnswer: '防止过拟合的技术',
      explanation: '正则化通过在损失函数中添加惩罚项，限制模型复杂度，防止过拟合。',
      score: 6
    },
    {
      id: 2, type: 'multiple', dimension: 'tech', difficulty: 'intermediate',
      question: '以下哪些是监督学习算法？（多选）',
      options: ['线性回归', '决策树', 'K-Means聚类', 'SVM'],
      correctAnswer: ['线性回归', '决策树', 'SVM'],
      explanation: '线性回归、决策树、SVM都是监督学习算法，K-Means是无监督学习算法。',
      score: 8
    },
    {
      id: 3, type: 'single', dimension: 'tech', difficulty: 'advanced',
      question: '在深度学习中，Batch Normalization的主要作用是什么？',
      options: ['减少参数量', '加速训练和提高稳定性', '防止梯度爆炸', '增加模型容量'],
      correctAnswer: '加速训练和提高稳定性',
      explanation: 'Batch Normalization通过归一化每层的输入，加速训练收敛，提高模型稳定性。',
      score: 8
    },
    {
      id: 4, type: 'essay', dimension: 'tech', difficulty: 'advanced',
      question: '请描述你如何构建一个端到端的机器学习系统，包括数据处理、模型训练、部署和监控。',
      options: [],
      correctAnswer: '1.数据管道：数据采集、清洗、标注、存储 2.特征工程：特征提取、选择、转换 3.模型开发：选型、训练、调参、评估 4.模型部署：容器化、API服务、负载均衡 5.监控运维：性能监控、数据漂移检测、模型更新 6.反馈闭环：收集线上数据持续优化',
      explanation: 'ML工程师需要具备全栈能力，构建可靠的生产级机器学习系统。',
      score: 15
    },
    {
      id: 5, type: 'single', dimension: 'tech', difficulty: 'basic',
      question: '什么是交叉验证？',
      options: ['训练两个模型对比', '将数据分成多份轮流作为验证集', '验证数据质量', '交叉特征'],
      correctAnswer: '将数据分成多份轮流作为验证集',
      explanation: '交叉验证通过多次划分训练集和验证集，更准确地评估模型性能。',
      score: 5
    },
    {
      id: 6, type: 'multiple', dimension: 'tech', difficulty: 'intermediate',
      question: '以下哪些是常用的机器学习框架？（多选）',
      options: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'MySQL'],
      correctAnswer: ['TensorFlow', 'PyTorch', 'Scikit-learn'],
      explanation: 'TensorFlow、PyTorch、Scikit-learn都是ML框架，MySQL是数据库。',
      score: 6
    },
    {
      id: 7, type: 'single', dimension: 'general', difficulty: 'intermediate',
      question: '当模型在线上出现性能下降时，最可能的原因是什么？',
      options: ['代码bug', '数据分布发生变化（数据漂移）', '服务器故障', '用户增多'],
      correctAnswer: '数据分布发生变化（数据漂移）',
      explanation: '数据漂移是线上模型性能下降的常见原因，需要定期监控和更新模型。',
      score: 6
    },
    {
      id: 8, type: 'essay', dimension: 'general', difficulty: 'intermediate',
      question: '在资源有限的情况下，你会如何平衡模型性能和推理速度？',
      options: [],
      correctAnswer: '1.模型压缩：剪枝、量化、蒸馏 2.选择轻量级模型架构 3.特征工程优化减少计算量 4.使用模型缓存和批处理 5.根据业务场景权衡精度和速度 6.分层服务：核心场景用复杂模型，普通场景用简单模型',
      explanation: 'ML工程师需要在性能和效率之间找到最佳平衡点，满足业务需求。',
      score: 12
    },
    {
      id: 9, type: 'single', dimension: 'behavior', difficulty: 'intermediate',
      question: 'ML工程师与算法研究员的主要区别是什么？',
      options: ['学历要求', '更关注工程实现和系统稳定性', '只做模型训练', '不需要编程'],
      correctAnswer: '更关注工程实现和系统稳定性',
      explanation: 'ML工程师侧重于将算法落地到生产环境，关注系统的可靠性和可维护性。',
      score: 6
    },
    {
      id: 10, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: '什么是迁移学习？',
      options: ['将模型从一台服务器迁移到另一台', '将预训练模型应用到新任务上', '迁移数据', '迁移代码'],
      correctAnswer: '将预训练模型应用到新任务上',
      explanation: '迁移学习利用预训练模型的知识，在新任务上进行微调，减少训练成本。',
      score: 6
    },
  ]
};

// 大数据工程师题库
export const bigdataEngineerQuestions: JobQuestionBank = {
  jobId: 'bigdata-engineer',
  jobTitle: '大数据工程师',
  category: 'AI与数据',
  questions: [
    {
      id: 1, type: 'single', dimension: 'tech', difficulty: 'basic',
      question: 'Hadoop的核心组件包括哪些？',
      options: ['HDFS和MapReduce', 'MySQL和Redis', 'Nginx和Tomcat', 'Docker和Kubernetes'],
      correctAnswer: 'HDFS和MapReduce',
      explanation: 'Hadoop的核心是HDFS（分布式文件系统）和MapReduce（分布式计算框架）。',
      score: 5
    },
    {
      id: 2, type: 'multiple', dimension: 'tech', difficulty: 'intermediate',
      question: '以下哪些是常用的大数据处理框架？（多选）',
      options: ['Spark', 'Flink', 'Kafka', 'Excel'],
      correctAnswer: ['Spark', 'Flink', 'Kafka'],
      explanation: 'Spark、Flink是计算框架，Kafka是消息队列，Excel是办公软件。',
      score: 8
    },
    {
      id: 3, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: 'Spark相比MapReduce的主要优势是什么？',
      options: ['占用内存更少', '基于内存计算，速度更快', '不需要Hadoop', '更容易学习'],
      correctAnswer: '基于内存计算，速度更快',
      explanation: 'Spark将中间结果存储在内存中，避免频繁的磁盘IO，计算速度比MapReduce快很多。',
      score: 6
    },
    {
      id: 4, type: 'essay', dimension: 'tech', difficulty: 'advanced',
      question: '请描述你如何设计一个实时数据处理系统，处理每秒百万级的用户行为数据。',
      options: [],
      correctAnswer: '架构：Kafka消息队列 + Flink实时计算 + Redis缓存 + ClickHouse存储。流程：1.数据采集（埋点SDK） 2.Kafka接收和缓冲 3.Flink实时聚合和计算 4.结果写入Redis（实时查询）和ClickHouse（离线分析） 5.监控告警（数据延迟、丢失）。优化：分区、并行度调优、背压处理。',
      explanation: '实时数据处理需要高吞吐、低延迟的架构设计和性能优化。',
      score: 15
    },
    {
      id: 5, type: 'single', dimension: 'tech', difficulty: 'basic',
      question: '什么是数据仓库？',
      options: ['存储原始数据的地方', '面向主题的、集成的、稳定的数据集合', '数据库的备份', '云存储服务'],
      correctAnswer: '面向主题的、集成的、稳定的数据集合',
      explanation: '数据仓库是为分析决策服务的，经过ETL处理的结构化数据存储系统。',
      score: 5
    },
    {
      id: 6, type: 'multiple', dimension: 'tech', difficulty: 'intermediate',
      question: '以下哪些是数据仓库的分层架构？（多选）',
      options: ['ODS（原始数据层）', 'DW（数据仓库层）', 'ADS（应用数据层）', 'UI（界面层）'],
      correctAnswer: ['ODS（原始数据层）', 'DW（数据仓库层）', 'ADS（应用数据层）'],
      explanation: '数据仓库典型分层：ODS、DW（DWD、DWS）、ADS，UI不属于数据仓库层。',
      score: 6
    },
    {
      id: 7, type: 'single', dimension: 'general', difficulty: 'intermediate',
      question: '当数据处理任务出现性能瓶颈时，你会如何优化？',
      options: ['增加服务器数量', '分析瓶颈点，针对性优化（分区、索引、并行度）', '重写所有代码', '放弃优化'],
      correctAnswer: '分析瓶颈点，针对性优化（分区、索引、并行度）',
      explanation: '大数据性能优化需要先定位瓶颈，然后采用合适的优化策略，而不是盲目加资源。',
      score: 6
    },
    {
      id: 8, type: 'essay', dimension: 'general', difficulty: 'intermediate',
      question: '请描述你如何保证大数据处理任务的数据质量和准确性。',
      options: [],
      correctAnswer: '1.数据校验：格式、范围、逻辑校验 2.数据监控：数据量、空值率、异常值监控 3.数据血缘：追踪数据来源和处理流程 4.幂等性设计：避免重复处理 5.数据对账：关键指标定期对账 6.异常告警：及时发现和处理问题',
      explanation: '数据质量是大数据系统的生命线，需要建立完善的质量保障体系。',
      score: 12
    },
    {
      id: 9, type: 'single', dimension: 'behavior', difficulty: 'intermediate',
      question: '大数据工程师最重要的能力是什么？',
      options: ['编程能力', '系统架构和性能优化能力', '数学能力', '沟通能力'],
      correctAnswer: '系统架构和性能优化能力',
      explanation: '大数据工程师需要设计高效的数据处理架构，解决海量数据的存储和计算问题。',
      score: 6
    },
    {
      id: 10, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: '什么是数据湖？',
      options: ['数据库', '存储原始格式数据的集中式存储库', '数据仓库', '数据备份'],
      correctAnswer: '存储原始格式数据的集中式存储库',
      explanation: '数据湖存储各种格式的原始数据，提供灵活的数据访问和分析能力。',
      score: 6
    },
  ]
};

// 产品运营题库
export const productOperationsQuestions: JobQuestionBank = {
  jobId: 'product-operations',
  jobTitle: '产品运营',
  category: '产品运营',
  questions: [
    {
      id: 1, type: 'single', dimension: 'general', difficulty: 'basic',
      question: '产品运营的核心目标是什么？',
      options: ['增加产品功能', '提升用户活跃度和留存率', '降低开发成本', '美化产品界面'],
      correctAnswer: '提升用户活跃度和留存率',
      explanation: '产品运营的核心是通过各种手段提升用户的活跃度、留存率和转化率。',
      score: 5
    },
    {
      id: 2, type: 'multiple', dimension: 'general', difficulty: 'intermediate',
      question: '以下哪些是常见的运营手段？（多选）',
      options: ['活动策划', '内容运营', '用户运营', '代码开发'],
      correctAnswer: ['活动策划', '内容运营', '用户运营'],
      explanation: '活动、内容、用户运营都是常见手段，代码开发是技术工作。',
      score: 8
    },
    {
      id: 3, type: 'single', dimension: 'general', difficulty: 'intermediate',
      question: '什么是用户生命周期管理？',
      options: ['管理用户年龄', '针对用户不同阶段采取不同运营策略', '延长用户使用时间', '记结业户注册时间'],
      correctAnswer: '针对用户不同阶段采取不同运营策略',
      explanation: '用户生命周期包括获取、激活、留存、变现、推荐，每个阶段需要不同的运营策略。',
      score: 6
    },
    {
      id: 4, type: 'essay', dimension: 'general', difficulty: 'advanced',
      question: '请描述你如何策划一场拉新活动，从目标设定到效果评估的完整流程。',
      options: [],
      correctAnswer: '1.目标设定：新增用户数、成本、转化率 2.用户分析：目标人群画像、需求痛点 3.活动设计：裂变机制、奖励设置、传播路径 4.资源准备：预算、物料、技术支持 5.推广执行：渠道投放、KOL合作 6.数据监控：实时跟踪关键指标 7.效果评估：ROI分析、复盘总结',
      explanation: '运营活动需要系统化的策划和执行，数据驱动决策。',
      score: 15
    },
    {
      id: 5, type: 'single', dimension: 'general', difficulty: 'basic',
      question: '什么是DAU？',
      options: ['日活跃用户数', '月活跃用户数', '新增用户数', '付费用户数'],
      correctAnswer: '日活跃用户数',
      explanation: 'DAU（Daily Active Users）是衡量产品活跃度的重要指标。',
      score: 5
    },
    {
      id: 6, type: 'multiple', dimension: 'general', difficulty: 'intermediate',
      question: '以下哪些是用户留存的关键因素？（多选）',
      options: ['产品核心价值', '用户体验', '运营激励', '产品价格'],
      correctAnswer: ['产品核心价值', '用户体验', '运营激励'],
      explanation: '留存取决于产品价值、体验和运营手段，价格不是唯一因素。',
      score: 6
    },
    {
      id: 7, type: 'single', dimension: 'behavior', difficulty: 'intermediate',
      question: '当运营活动效果不达预期时，你会怎么做？',
      options: ['立即停止活动', '分析数据找出问题，快速调整优化', '增加预算', '更换活动形式'],
      correctAnswer: '分析数据找出问题，快速调整优化',
      explanation: '优秀的运营需要快速响应，通过数据分析找到问题并迭代优化。',
      score: 6
    },
    {
      id: 8, type: 'essay', dimension: 'general', difficulty: 'intermediate',
      question: '请描述你如何提升一个低活跃产品的用户留存率。',
      options: [],
      correctAnswer: '1.用户调研：了解流失原因和需求 2.产品优化：改进核心功能和体验 3.内容运营：提供有价值的内容 4.激励体系：签到、任务、积分 5.社交互动：社区、UGC 6.精准推送：个性化消息触达 7.数据分析：持续监控和优化',
      explanation: '提升留存需要从产品、内容、运营多个维度综合发力。',
      score: 12
    },
    {
      id: 9, type: 'single', dimension: 'behavior', difficulty: 'intermediate',
      question: '产品运营最重要的能力是什么？',
      options: ['文案能力', '数据分析和用户洞察能力', '设计能力', '技术能力'],
      correctAnswer: '数据分析和用户洞察能力',
      explanation: '运营需要通过数据洞察用户需求，制定有效的运营策略。',
      score: 6
    },
    {
      id: 10, type: 'single', dimension: 'general', difficulty: 'intermediate',
      question: '什么是AARRR模型？',
      options: ['产品开发模型', '用户增长模型（获取、激活、留存、变现、推荐）', '数据分析模型', '项目管理模型'],
      correctAnswer: '用户增长模型（获取、激活、留存、变现、推荐）',
      explanation: 'AARRR是海盗指标，描述了用户增长的完整生命周期。',
      score: 6
    },
  ]
};

// 全栈开发工程师题库
export const fullstackEngineerQuestions: JobQuestionBank = {
  jobId: 'fullstack-engineer',
  jobTitle: '全栈开发工程师',
  category: '技术开发',
  questions: [
    {
      id: 1, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: '全栈开发中，前后端分离架构的主要优势是什么？',
      options: ['开发速度更快', '前后端可以并行开发，职责清晰', '减少服务器成本', '提高数据库性能'],
      correctAnswer: '前后端可以并行开发，职责清晰',
      explanation: '前后端分离使得前后端团队可以独立开发、测试和部署，提高开发效率和代码可维护性。',
      score: 6
    },
    {
      id: 2, type: 'multiple', dimension: 'tech', difficulty: 'intermediate',
      question: '以下哪些是全栈开发工程师需要掌握的技能？（多选）',
      options: ['前端框架（React/Vue）', '后端语言（Node.js/Python/Java）', '数据库设计', '平面设计'],
      correctAnswer: ['前端框架（React/Vue）', '后端语言（Node.js/Python/Java）', '数据库设计'],
      explanation: '全栈工程师需要掌握前端、后端和数据库技术，平面设计不是必须技能。',
      score: 8
    },
    {
      id: 3, type: 'single', dimension: 'tech', difficulty: 'advanced',
      question: '在全栈项目中，如何处理跨域请求（CORS）？',
      options: ['禁用浏览器安全策略', '在后端设置Access-Control-Allow-Origin响应头', '使用HTTP协议', '修改前端代码'],
      correctAnswer: '在后端设置Access-Control-Allow-Origin响应头',
      explanation: 'CORS问题需要在后端配置响应头，允许特定域名的跨域请求。',
      score: 8
    },
    {
      id: 4, type: 'essay', dimension: 'tech', difficulty: 'advanced',
      question: '请描述你如何从零搭建一个全栈Web应用，包括技术选型、架构设计和部署方案。',
      options: [],
      correctAnswer: '技术选型：前端React+TypeScript，后端Node.js+Express，数据库PostgreSQL。架构：前后端分离，RESTful API。部署：前端部署到Vercel，后端部署到云服务器，数据库使用云数据库服务。包含CI/CD流程、监控告警、日志系统。',
      explanation: '全栈项目需要考虑技术栈选择、架构设计、开发流程、部署运维等多个方面。',
      score: 15
    },
    {
      id: 5, type: 'single', dimension: 'general', difficulty: 'intermediate',
      question: '全栈开发工程师在团队中的核心价值是什么？',
      options: ['写代码最快', '能够独立完成整个项目', '只做前端开发', '只做后端开发'],
      correctAnswer: '能够独立完成整个项目',
      explanation: '全栈工程师的核心价值在于能够理解和实现完整的业务流程，独立交付产品。',
      score: 6
    },
    {
      id: 6, type: 'single', dimension: 'tech', difficulty: 'basic',
      question: 'JWT（JSON Web Token）主要用于什么场景？',
      options: ['数据加密', '用户认证和授权', '数据压缩', '文件上传'],
      correctAnswer: '用户认证和授权',
      explanation: 'JWT是一种无状态的认证方式，常用于前后端分离的身份验证。',
      score: 5
    },
    {
      id: 7, type: 'multiple', dimension: 'tech', difficulty: 'intermediate',
      question: '以下哪些是常见的API设计风格？（多选）',
      options: ['RESTful', 'GraphQL', 'RPC', 'FTP'],
      correctAnswer: ['RESTful', 'GraphQL', 'RPC'],
      explanation: 'RESTful、GraphQL、RPC都是常见的API设计风格，FTP是文件传输协议。',
      score: 6
    },
    {
      id: 8, type: 'essay', dimension: 'general', difficulty: 'intermediate',
      question: '当前端和后端开发进度不一致时，你会如何协调和推进项目？',
      options: [],
      correctAnswer: '1.制定清晰的接口文档和Mock数据 2.前端使用Mock服务器独立开发 3.定期同步进度和接口变更 4.优先完成核心功能 5.建立自动化测试保证质量 6.灵活调整开发计划',
      explanation: '全栈工程师需要具备项目协调能力，确保前后端开发高效协同。',
      score: 12
    },
    {
      id: 9, type: 'single', dimension: 'behavior', difficulty: 'intermediate',
      question: '全栈开发工程师最重要的能力是什么？',
      options: ['精通某一门语言', '快速学习和适应新技术', '设计能力', '管理能力'],
      correctAnswer: '快速学习和适应新技术',
      explanation: '全栈工程师需要掌握多种技术栈，快速学习能力是核心竞争力。',
      score: 6
    },
    {
      id: 10, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: '什么是服务端渲染（SSR）？',
      options: ['在浏览器渲染页面', '在服务器生成HTML后返回给浏览器', '使用CSS渲染', '使用Canvas渲染'],
      correctAnswer: '在服务器生成HTML后返回给浏览器',
      explanation: 'SSR在服务端生成完整HTML，提高首屏加载速度和SEO效果。',
      score: 6
    },
  ]
};

// 测试开发工程师题库
export const testEngineerQuestions: JobQuestionBank = {
  jobId: 'test-engineer',
  jobTitle: '测试开发工程师',
  category: '技术开发',
  questions: [
    {
      id: 1, type: 'single', dimension: 'tech', difficulty: 'basic',
      question: '以下哪种测试方法属于黑盒测试？',
      options: ['代码审查', '等价类划分', '路径覆盖', '语句覆盖'],
      correctAnswer: '等价类划分',
      explanation: '黑盒测试不关注内部实现，等价类划分是典型的黑盒测试方法。',
      score: 5
    },
    {
      id: 2, type: 'multiple', dimension: 'tech', difficulty: 'intermediate',
      question: '自动化测试的优势包括哪些？（多选）',
      options: ['提高测试效率', '减少人工错误', '降低测试成本', '完全替代手工测试'],
      correctAnswer: ['提高测试效率', '减少人工错误', '降低测试成本'],
      explanation: '自动化测试有很多优势，但不能完全替代手工测试，某些场景仍需人工介入。',
      score: 8
    },
    {
      id: 3, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: '在敏捷开发中，测试左移（Shift Left）的含义是什么？',
      options: ['测试团队坐在左边', '尽早开始测试活动', '减少测试时间', '只做单元测试'],
      correctAnswer: '尽早开始测试活动',
      explanation: '测试左移强调在开发早期就介入测试，而不是等到开发完成后才开始。',
      score: 6
    },
    {
      id: 4, type: 'essay', dimension: 'tech', difficulty: 'advanced',
      question: '请描述你如何为一个电商网站设计完整的测试方案，包括测试类型、测试工具和测试流程。',
      options: [],
      correctAnswer: '测试类型：单元测试、接口测试、UI自动化测试、性能测试、安全测试。工具：Jest/Pytest（单元）、Postman/JMeter（接口）、Selenium/Playwright（UI）、Locust（性能）。流程：需求分析→测试计划→用例设计→环境搭建→执行测试→缺陷管理→测试报告。',
      explanation: '完整的测试方案需要覆盖多个测试层级，使用合适的工具，建立规范的流程。',
      score: 15
    },
    {
      id: 5, type: 'single', dimension: 'tech', difficulty: 'basic',
      question: '什么是回归测试？',
      options: ['测试新功能', '重新测试修复的缺陷', '验证修改后系统的原有功能是否正常', '性能测试'],
      correctAnswer: '验证修改后系统的原有功能是否正常',
      explanation: '回归测试确保代码修改不会影响已有功能，是质量保证的重要环节。',
      score: 5
    },
    {
      id: 6, type: 'multiple', dimension: 'tech', difficulty: 'intermediate',
      question: '以下哪些是常用的自动化测试框架？（多选）',
      options: ['Selenium', 'JUnit', 'Pytest', 'Git'],
      correctAnswer: ['Selenium', 'JUnit', 'Pytest'],
      explanation: 'Selenium用于Web UI测试，JUnit用于Java单元测试，Pytest用于Python测试，Git是版本控制工具。',
      score: 6
    },
    {
      id: 7, type: 'single', dimension: 'general', difficulty: 'intermediate',
      question: '当开发人员认为某个bug不需要修复时，测试工程师应该怎么做？',
      options: ['直接关闭bug', '坚持己见，强制要求修复', '提供数据和用户场景，与开发和产品沟通', '向上级投诉'],
      correctAnswer: '提供数据和用户场景，与开发和产品沟通',
      explanation: '专业的测试工程师会用数据和场景说话，通过沟通达成共识。',
      score: 6
    },
    {
      id: 8, type: 'essay', dimension: 'general', difficulty: 'intermediate',
      question: '在项目时间紧张的情况下，你会如何平衡测试覆盖率和交付时间？',
      options: [],
      correctAnswer: '1.识别核心功能和高风险模块优先测试 2.采用风险驱动的测试策略 3.利用自动化测试提高效率 4.与团队沟通，明确质量底线 5.记录未覆盖的测试点，后续补充 6.建立快速反馈机制',
      explanation: '测试工程师需要在质量和效率之间找到平衡，采用科学的测试策略。',
      score: 12
    },
    {
      id: 9, type: 'single', dimension: 'behavior', difficulty: 'intermediate',
      question: '测试工程师最重要的职业素养是什么？',
      options: ['编程能力', '细心和责任心', '沟通能力', '学历背景'],
      correctAnswer: '细心和责任心',
      explanation: '测试工程师是质量的守门员，细心和责任心是最基本也是最重要的素养。',
      score: 6
    },
    {
      id: 10, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: '什么是持续集成（CI）中的冒烟测试？',
      options: ['性能测试', '快速验证核心功能是否可用的测试', '安全测试', '压力测试'],
      correctAnswer: '快速验证核心功能是否可用的测试',
      explanation: '冒烟测试是一组快速测试，用于验证构建版本的基本功能是否正常，决定是否进行更深入的测试。',
      score: 6
    },
  ]
};

// 移动端开发工程师题库
export const mobileEngineerQuestions: JobQuestionBank = {
  jobId: 'mobile-engineer',
  jobTitle: '移动端开发工程师',
  category: '技术开发',
  questions: [
    {
      id: 1, type: 'single', dimension: 'tech', difficulty: 'basic',
      question: 'Android开发中，以下哪个是应用的入口组件？',
      options: ['Service', 'Activity', 'BroadcastReceiver', 'ContentProvider'],
      correctAnswer: 'Activity',
      explanation: 'Activity是Android四大组件之一，是用户交互的入口，承载UI界面。',
      score: 5
    },
    {
      id: 2, type: 'multiple', dimension: 'tech', difficulty: 'intermediate',
      question: '以下哪些是跨平台移动开发框架？（多选）',
      options: ['React Native', 'Flutter', 'Swift', 'Kotlin'],
      correctAnswer: ['React Native', 'Flutter'],
      explanation: 'React Native和Flutter是跨平台框架，Swift是iOS原生语言，Kotlin是Android原生语言。',
      score: 8
    },
    {
      id: 3, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: 'iOS开发中，什么是ARC？',
      options: ['应用审核中心', '自动引用计数', '应用资源中心', '异步请求控制'],
      correctAnswer: '自动引用计数',
      explanation: 'ARC（Automatic Reference Counting）是iOS的内存管理机制，自动管理对象的生命周期。',
      score: 6
    },
    {
      id: 4, type: 'essay', dimension: 'tech', difficulty: 'advanced',
      question: '请描述你如何优化移动应用的启动速度和运行性能，需要考虑哪些方面？',
      options: [],
      correctAnswer: '启动优化：1.减少启动时的初始化操作 2.延迟加载非必要模块 3.优化首屏渲染 4.使用启动图占位。性能优化：1.图片压缩和懒加载 2.列表虚拟化 3.减少重绘和回流 4.使用缓存策略 5.代码分包和按需加载 6.内存泄漏检测和修复。',
      explanation: '移动端性能优化需要从启动、渲染、内存、网络等多个维度进行。',
      score: 15
    },
    {
      id: 5, type: 'single', dimension: 'tech', difficulty: 'basic',
      question: '移动应用中，什么是响应式布局？',
      options: ['固定像素布局', '根据屏幕尺寸自适应的布局', '只支持竖屏的布局', '只支持横屏的布局'],
      correctAnswer: '根据屏幕尺寸自适应的布局',
      explanation: '响应式布局能够适配不同尺寸和分辨率的设备，提供良好的用户体验。',
      score: 5
    },
    {
      id: 6, type: 'multiple', dimension: 'tech', difficulty: 'intermediate',
      question: '移动应用的数据持久化方案包括哪些？（多选）',
      options: ['SharedPreferences/UserDefaults', 'SQLite数据库', '文件存储', '内存缓存'],
      correctAnswer: ['SharedPreferences/UserDefaults', 'SQLite数据库', '文件存储'],
      explanation: '移动端常用的持久化方案包括轻量级存储、数据库和文件，内存缓存不是持久化方案。',
      score: 6
    },
    {
      id: 7, type: 'single', dimension: 'general', difficulty: 'intermediate',
      question: '移动应用开发中，如何处理不同设备的适配问题？',
      options: ['只支持一种设备', '使用相对布局和适配方案', '固定像素布局', '不考虑适配'],
      correctAnswer: '使用相对布局和适配方案',
      explanation: '移动端需要适配各种屏幕尺寸和分辨率，使用相对布局、dp/pt单位、适配库等方案。',
      score: 6
    },
    {
      id: 8, type: 'essay', dimension: 'general', difficulty: 'intermediate',
      question: '当应用在某些设备上出现崩溃，但无法复现时，你会如何定位和解决问题？',
      options: [],
      correctAnswer: '1.收集崩溃日志和设备信息 2.使用崩溃监控平台（Bugly、Sentry） 3.分析堆栈信息定位代码位置 4.尝试在相同设备或模拟器复现 5.添加更多日志和异常捕获 6.灰度发布验证修复效果',
      explanation: '移动端崩溃问题需要借助监控工具和日志分析，系统化地定位和解决。',
      score: 12
    },
    {
      id: 9, type: 'single', dimension: 'behavior', difficulty: 'intermediate',
      question: '移动端开发工程师最需要关注的用户体验要素是什么？',
      options: ['代码优雅', '流畅性和响应速度', '功能复杂度', '技术先进性'],
      correctAnswer: '流畅性和响应速度',
      explanation: '移动端用户对流畅度和响应速度非常敏感，这是用户体验的核心。',
      score: 6
    },
    {
      id: 10, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: '什么是热更新（Hot Update）？',
      options: ['应用商店更新', '不重新安装应用即可更新部分代码和资源', '系统更新', '数据库更新'],
      correctAnswer: '不重新安装应用即可更新部分代码和资源',
      explanation: '热更新允许在不发布新版本的情况下修复bug或更新内容，提高迭代效率。',
      score: 6
    },
  ]
};

// 内容运营题库
export const contentOperationsQuestions: JobQuestionBank = {
  jobId: 'content-operations',
  jobTitle: '内容运营',
  category: '产品运营',
  questions: [
    {
      id: 1, type: 'single', dimension: 'general', difficulty: 'basic',
      question: '内容运营的核心目标是什么？',
      options: ['生产大量内容', '通过优质内容吸引和留存用户', '降低成本', '增加广告'],
      correctAnswer: '通过优质内容吸引和留存用户',
      explanation: '内容运营的核心是通过有价值的内容满足用户需求，提升用户粘性。',
      score: 5
    },
    {
      id: 2, type: 'multiple', dimension: 'general', difficulty: 'intermediate',
      question: '以下哪些是内容运营的关键指标？（多选）',
      options: ['阅读量', '互动率', '转化率', '服务器数量'],
      correctAnswer: ['阅读量', '互动率', '转化率'],
      explanation: '内容运营关注内容的传播效果和用户互动，服务器数量不是内容指标。',
      score: 8
    },
    {
      id: 3, type: 'essay', dimension: 'general', difficulty: 'advanced',
      question: '请描述你如何策划一个爆款内容，从选题到传播的完整流程。',
      options: [],
      correctAnswer: '1.选题：热点追踪、用户需求分析、数据洞察 2.内容创作：标题吸引、结构清晰、观点独特 3.视觉呈现：配图、排版、多媒体 4.发布时机：用户活跃时段 5.传播推广：多渠道分发、KOL转发、社群传播 6.数据监控：实时跟踪反馈，快速优化 7.二次传播：精选评论、UGC引导',
      explanation: '爆款内容需要选题、创作、传播的全链路运营能力。',
      score: 15
    },
    {
      id: 4, type: 'single', dimension: 'general', difficulty: 'intermediate',
      question: '什么是UGC？',
      options: ['用户生成内容', '官方生成内容', '广告内容', '付费内容'],
      correctAnswer: '用户生成内容',
      explanation: 'UGC（User Generated Content）是用户自发创作的内容，是社区活跃的重要标志。',
      score: 5
    },
    {
      id: 5, type: 'single', dimension: 'behavior', difficulty: 'intermediate',
      question: '内容运营最重要的能力是什么？',
      options: ['写作能力', '用户洞察和内容策划能力', '设计能力', '技术能力'],
      correctAnswer: '用户洞察和内容策划能力',
      explanation: '内容运营需要深刻理解用户需求，策划出用户喜欢的内容。',
      score: 6
    },
    {
      id: 6, type: 'essay', dimension: 'general', difficulty: 'intermediate',
      question: '当内容数据表现不佳时，你会如何分析和改进？',
      options: [],
      correctAnswer: '1.数据分析：阅读量、停留时间、跳出率、转化率 2.用户反馈：评论、私信、问卷 3.竞品对比：同类内容表现 4.问题诊断：选题、标题、内容质量、发布时机 5.优化方向：调整内容方向、优化呈现形式 6.AB测试：验证优化效果',
      explanation: '内容运营需要数据驱动，持续迭代优化。',
      score: 12
    },
    {
      id: 7, type: 'single', dimension: 'general', difficulty: 'basic',
      question: '什么是内容日历？',
      options: ['日历应用', '内容发布的时间规划表', '用户活跃时间', '节假日安排'],
      correctAnswer: '内容发布的时间规划表',
      explanation: '内容日历帮助运营团队规划内容主题、发布时间，保证内容的持续性和节奏感。',
      score: 5
    },
    {
      id: 8, type: 'multiple', dimension: 'general', difficulty: 'intermediate',
      question: '以下哪些是优质内容的特征？（多选）',
      options: ['有价值', '易传播', '引发共鸣', '字数很多'],
      correctAnswer: ['有价值', '易传播', '引发共鸣'],
      explanation: '优质内容需要对用户有价值、容易传播、能引发情感共鸣，字数多不代表质量高。',
      score: 6
    },
    {
      id: 9, type: 'single', dimension: 'behavior', difficulty: 'intermediate',
      question: '当热点事件发生时，内容运营应该如何应对？',
      options: ['忽略热点', '快速判断相关性，及时跟进', '等待竞品反应', '随意蹭热点'],
      correctAnswer: '快速判断相关性，及时跟进',
      explanation: '热点运营需要快速反应，但要判断与品牌的相关性，避免盲目蹭热点。',
      score: 6
    },
    {
      id: 10, type: 'single', dimension: 'general', difficulty: 'intermediate',
      question: '什么是内容矩阵？',
      options: ['内容排列方式', '多平台、多形式的内容布局策略', '内容数量', '内容分类'],
      correctAnswer: '多平台、多形式的内容布局策略',
      explanation: '内容矩阵通过在不同平台发布不同形式的内容，扩大传播范围和影响力。',
      score: 6
    },
  ]
};

// 用户增长专员题库
export const growthSpecialistQuestions: JobQuestionBank = {
  jobId: 'growth-specialist',
  jobTitle: '用户增长专员',
  category: '产品运营',
  questions: [
    {
      id: 1, type: 'single', dimension: 'general', difficulty: 'basic',
      question: '用户增长的核心指标是什么？',
      options: ['用户满意度', '新增用户数和留存率', '产品功能数量', '团队规模'],
      correctAnswer: '新增用户数和留存率',
      explanation: '用户增长关注用户数量的增加和用户的持续使用，这是增长的核心指标。',
      score: 5
    },
    {
      id: 2, type: 'multiple', dimension: 'general', difficulty: 'intermediate',
      question: '以下哪些是常见的增长策略？（多选）',
      options: ['病毒式传播', '裂变营销', 'SEO优化', '降低产品质量'],
      correctAnswer: ['病毒式传播', '裂变营销', 'SEO优化'],
      explanation: '病毒传播、裂变营销、SEO都是有效的增长策略，降低质量会损害增长。',
      score: 8
    },
    {
      id: 3, type: 'essay', dimension: 'general', difficulty: 'advanced',
      question: '请描述你如何设计一个裂变活动，实现用户快速增长。',
      options: [],
      correctAnswer: '1.目标设定：新增用户数、成本、病毒系数 2.裂变机制：老带新奖励、阶梯奖励、社交货币 3.传播路径：分享海报、邀请链接、社群传播 4.激励设计：即时奖励、进度可视化 5.降低门槛：一键分享、简化流程 6.数据监控：转化漏斗、分享率、注册率 7.快速迭代：AB测试优化',
      explanation: '裂变增长需要精心设计机制，降低传播门槛，提供足够的激励。',
      score: 15
    },
    {
      id: 4, type: 'single', dimension: 'general', difficulty: 'intermediate',
      question: '什么是增长黑客？',
      options: ['黑客技术', '以数据驱动的低成本增长方法论', '非法增长手段', '快速开发'],
      correctAnswer: '以数据驱动的低成本增长方法论',
      explanation: '增长黑客强调通过数据分析和创意手段，实现低成本、高效率的用户增长。',
      score: 6
    },
    {
      id: 5, type: 'single', dimension: 'general', difficulty: 'basic',
      question: '什么是病毒系数（K因子）？',
      options: ['病毒感染率', '每个用户平均带来的新用户数', '用户活跃度', '用户留存率'],
      correctAnswer: '每个用户平均带来的新用户数',
      explanation: '病毒系数K>1时，产品可以实现自增长，是衡量传播效果的关键指标。',
      score: 5
    },
    {
      id: 6, type: 'essay', dimension: 'general', difficulty: 'intermediate',
      question: '当获客成本持续上升时，你会如何应对？',
      options: [],
      correctAnswer: '1.优化转化漏斗，提高转化率 2.开拓新的低成本渠道 3.提升产品留存和LTV 4.建立用户推荐机制 5.精准投放，提高ROI 6.内容营销和SEO 7.社群运营和口碑传播',
      explanation: '降低获客成本需要多管齐下，从渠道、转化、留存多个维度优化。',
      score: 12
    },
    {
      id: 7, type: 'multiple', dimension: 'general', difficulty: 'intermediate',
      question: '以下哪些是有效的用户激活手段？（多选）',
      options: ['新手引导', '首单优惠', '个性化推荐', '强制注册'],
      correctAnswer: ['新手引导', '首单优惠', '个性化推荐'],
      explanation: '新手引导、优惠激励、个性化推荐都能促进激活，强制注册会提高门槛。',
      score: 6
    },
    {
      id: 8, type: 'single', dimension: 'behavior', difficulty: 'intermediate',
      question: '用户增长专员最重要的能力是什么？',
      options: ['创意能力', '数据分析和实验能力', '设计能力', '技术能力'],
      correctAnswer: '数据分析和实验能力',
      explanation: '增长需要通过数据发现机会，通过实验验证假设，快速迭代优化。',
      score: 6
    },
    {
      id: 9, type: 'single', dimension: 'general', difficulty: 'intermediate',
      question: '什么是北极星指标？',
      options: ['最重要的业务指标', '用户数量', '收入', '活跃度'],
      correctAnswer: '最重要的业务指标',
      explanation: '北极星指标是最能反映产品核心价值和长期增长的关键指标，指导团队决策。',
      score: 6
    },
    {
      id: 10, type: 'single', dimension: 'general', difficulty: 'basic',
      question: '什么是LTV（用户生命周期价值）？',
      options: ['用户注册时间', '用户在整个生命周期内带来的总价值', '用户活跃天数', '用户等级'],
      correctAnswer: '用户在整个生命周期内带来的总价值',
      explanation: 'LTV是衡量用户价值的重要指标，LTV > CAC（获客成本）是健康增长的前提。',
      score: 5
    },
  ]
};

// 社区运营题库
export const communityOperationsQuestions: JobQuestionBank = {
  jobId: 'community-operations',
  jobTitle: '社区运营',
  category: '产品运营',
  questions: [
    {
      id: 1, type: 'single', dimension: 'general', difficulty: 'basic',
      question: '社区运营的核心目标是什么？',
      options: ['增加内容数量', '建立活跃、有价值的用户社群', '降低成本', '增加广告'],
      correctAnswer: '建立活跃、有价值的用户社群',
      explanation: '社区运营的核心是构建用户归属感，促进用户互动和价值共创。',
      score: 5
    },
    {
      id: 2, type: 'multiple', dimension: 'general', difficulty: 'intermediate',
      question: '以下哪些是社区运营的关键要素？（多选）',
      options: ['用户分层', '内容引导', '氛围营造', '强制发言'],
      correctAnswer: ['用户分层', '内容引导', '氛围营造'],
      explanation: '社区需要用户分层管理、优质内容引导、良好氛围营造，强制发言会破坏体验。',
      score: 8
    },
    {
      id: 3, type: 'essay', dimension: 'general', difficulty: 'advanced',
      question: '请描述你如何从零搭建一个活跃的用户社区。',
      options: [],
      correctAnswer: '1.定位：明确社区主题和目标用户 2.种子用户：邀请KOL和核心用户 3.内容运营：官方内容引导、UGC激励 4.规则制定：社区公约、内容审核 5.用户分层：普通用户、活跃用户、KOL、管理员 6.活动策划：话题讨论、线上线下活动 7.氛围营造：及时互动、正向激励 8.数据监控：活跃度、内容质量、用户留存',
      explanation: '社区运营需要系统化的规划和持续的投入，从冷启动到规模化运营。',
      score: 15
    },
    {
      id: 4, type: 'single', dimension: 'general', difficulty: 'intermediate',
      question: '什么是社区KOL？',
      options: ['社区管理员', '关键意见领袖，有影响力的活跃用户', '付费用户', '新用户'],
      correctAnswer: '关键意见领袖，有影响力的活跃用户',
      explanation: 'KOL（Key Opinion Leader）是社区中有影响力的用户，能带动社区氛围和内容生产。',
      score: 6
    },
    {
      id: 5, type: 'essay', dimension: 'general', difficulty: 'intermediate',
      question: '当社区出现负面舆情时，你会如何处理？',
      options: [],
      correctAnswer: '1.快速响应：及时关注和回应 2.了解原因：倾听用户诉求 3.公开透明：说明情况和处理方案 4.积极解决：落实改进措施 5.情绪安抚：理解用户情绪 6.引导讨论：正向引导话题 7.总结复盘：避免类似问题',
      explanation: '负面舆情处理需要快速、透明、真诚，将危机转化为增强信任的机会。',
      score: 12
    },
    {
      id: 6, type: 'single', dimension: 'behavior', difficulty: 'intermediate',
      question: '社区运营最重要的能力是什么？',
      options: ['写作能力', '同理心和沟通能力', '设计能力', '技术能力'],
      correctAnswer: '同理心和沟通能力',
      explanation: '社区运营需要理解用户需求，建立情感连接，促进用户互动。',
      score: 6
    },
    {
      id: 7, type: 'multiple', dimension: 'general', difficulty: 'intermediate',
      question: '以下哪些是激励用户参与社区的有效方式？（多选）',
      options: ['积分体系', '荣誉勋章', '优质内容曝光', '强制任务'],
      correctAnswer: ['积分体系', '荣誉勋章', '优质内容曝光'],
      explanation: '积分、荣誉、曝光都是正向激励，强制任务会降低用户体验。',
      score: 6
    },
    {
      id: 8, type: 'single', dimension: 'general', difficulty: 'basic',
      question: '什么是社区氛围？',
      options: ['社区人数', '社区的整体文化和互动风格', '社区功能', '社区规则'],
      correctAnswer: '社区的整体文化和互动风格',
      explanation: '社区氛围是用户在社区中的整体感受，影响用户的参与意愿和归属感。',
      score: 5
    },
    {
      id: 9, type: 'single', dimension: 'general', difficulty: 'intermediate',
      question: '如何提升社区的用户留存率？',
      options: ['增加广告', '提供有价值的内容和互动体验', '限制用户发言', '减少功能'],
      correctAnswer: '提供有价值的内容和互动体验',
      explanation: '社区留存依赖于持续的价值提供和良好的互动体验。',
      score: 6
    },
    {
      id: 10, type: 'single', dimension: 'behavior', difficulty: 'intermediate',
      question: '当社区用户之间发生冲突时，运营应该如何处理？',
      options: ['忽略冲突', '删除所有相关内容', '及时介入，公正调解', '偏袒一方'],
      correctAnswer: '及时介入，公正调解',
      explanation: '运营需要及时、公正地处理冲突，维护社区秩序和用户体验。',
      score: 6
    },
  ]
};

// 前端架构师题库
export const frontendArchitectQuestions: JobQuestionBank = {
  jobId: 'frontend-architect',
  jobTitle: '前端架构师',
  category: '技术开发',
  questions: [
    {
      id: 1, type: 'single', dimension: 'tech', difficulty: 'advanced',
      question: '在大型前端项目中，如何设计微前端架构？',
      options: ['使用iframe隔离', '使用qiankun等微前端框架', '使用多个独立SPA', '使用Monorepo'],
      correctAnswer: '使用qiankun等微前端框架',
      explanation: '微前端框架提供了应用隔离、通信机制和生命周期管理，是大型项目的最佳实践。',
      score: 8
    },
    {
      id: 2, type: 'multiple', dimension: 'tech', difficulty: 'advanced',
      question: '前端性能优化的关键指标包括哪些？（多选）',
      options: ['FCP（首次内容绘制）', 'LCP（最大内容绘制）', 'TTI（可交互时间）', 'FPS（帧率）'],
      correctAnswer: ['FCP（首次内容绘制）', 'LCP（最大内容绘制）', 'TTI（可交互时间）'],
      explanation: 'Web Vitals核心指标包括FCP、LCP、TTI等，FPS主要用于动画性能评估。',
      score: 8
    },
    {
      id: 3, type: 'essay', dimension: 'tech', difficulty: 'advanced',
      question: '请描述你如何设计一个支持百万级用户的前端架构，包括技术选型、性能优化和监控体系。',
      options: [],
      correctAnswer: '技术选型：React/Vue+TypeScript，状态管理Redux/Pinia，构建工具Vite。性能优化：代码分割、懒加载、CDN加速、SSR/SSG、图片优化。监控体系：性能监控（Lighthouse CI）、错误监控（Sentry）、用户行为分析。架构设计：微前端、组件库、设计系统、CI/CD流程。',
      explanation: '大型前端架构需要从技术选型、性能、监控、工程化等多个维度综合考虑。',
      score: 15
    },
    {
      id: 4, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: '什么是前端工程化？',
      options: ['使用构建工具', '规范化开发流程和工具链', '使用框架开发', '代码压缩'],
      correctAnswer: '规范化开发流程和工具链',
      explanation: '前端工程化是通过工具和流程提升开发效率和代码质量的系统化方法。',
      score: 6
    },
    {
      id: 5, type: 'multiple', dimension: 'general', difficulty: 'advanced',
      question: '前端架构师的核心职责包括哪些？（多选）',
      options: ['技术选型', '架构设计', '代码review', '写业务代码'],
      correctAnswer: ['技术选型', '架构设计', '代码review'],
      explanation: '架构师主要负责技术决策和架构设计，写业务代码不是核心职责。',
      score: 6
    },
    {
      id: 6, type: 'single', dimension: 'tech', difficulty: 'advanced',
      question: '如何解决前端应用的首屏加载慢问题？',
      options: ['增加服务器带宽', '使用SSR+代码分割+预加载+CDN', '减少功能', '使用更快的框架'],
      correctAnswer: '使用SSR+代码分割+预加载+CDN',
      explanation: '首屏优化需要综合使用多种技术手段，从渲染、加载、传输等多个环节优化。',
      score: 8
    },
    {
      id: 7, type: 'essay', dimension: 'general', difficulty: 'advanced',
      question: '当团队技术栈老旧需要升级时，你会如何制定技术升级方案？',
      options: [],
      correctAnswer: '1.评估现状和痛点 2.调研新技术方案 3.制定渐进式迁移计划 4.建立双轨运行机制 5.培训团队 6.小范围试点 7.逐步推广 8.建立监控和回滚机制 9.总结复盘',
      explanation: '技术升级需要平衡风险和收益，采用渐进式策略确保业务稳定。',
      score: 12
    },
    {
      id: 8, type: 'single', dimension: 'behavior', difficulty: 'intermediate',
      question: '前端架构师最重要的能力是什么？',
      options: ['编码能力', '技术视野和架构思维', '沟通能力', '项目管理'],
      correctAnswer: '技术视野和架构思维',
      explanation: '架构师需要有全局视野，能够设计可扩展、可维护的系统架构。',
      score: 6
    },
    {
      id: 9, type: 'single', dimension: 'tech', difficulty: 'advanced',
      question: '什么是BFF（Backend For Frontend）？',
      options: ['后端框架', '为前端定制的中间层服务', '前端框架', '数据库'],
      correctAnswer: '为前端定制的中间层服务',
      explanation: 'BFF是介于前端和后端之间的服务层，为前端提供定制化的API聚合和数据处理。',
      score: 6
    },
    {
      id: 10, type: 'single', dimension: 'tech', difficulty: 'advanced',
      question: '如何设计前端组件库的架构？',
      options: ['直接复制粘贴组件', '基于原子设计理论，建立组件分层和设计系统', '使用第三方组件库', '每个项目独立开发'],
      correctAnswer: '基于原子设计理论，建立组件分层和设计系统',
      explanation: '组件库需要系统化设计，建立原子、分子、组织、模板、页面的分层体系。',
      score: 8
    },
  ]
};

// 后端架构师题库
export const backendArchitectQuestions: JobQuestionBank = {
  jobId: 'backend-architect',
  jobTitle: '后端架构师',
  category: '技术开发',
  questions: [
    {
      id: 1, type: 'single', dimension: 'tech', difficulty: 'advanced',
      question: '在高并发场景下，如何设计缓存架构？',
      options: ['只用Redis', '多级缓存（本地缓存+Redis+CDN）', '只用数据库', '不使用缓存'],
      correctAnswer: '多级缓存（本地缓存+Redis+CDN）',
      explanation: '多级缓存可以减少网络开销，提高系统性能和可用性。',
      score: 8
    },
    {
      id: 2, type: 'multiple', dimension: 'tech', difficulty: 'advanced',
      question: '微服务架构的核心组件包括哪些？（多选）',
      options: ['服务注册与发现', '配置中心', 'API网关', '数据库'],
      correctAnswer: ['服务注册与发现', '配置中心', 'API网关'],
      explanation: '微服务需要服务治理组件，数据库不是微服务特有组件。',
      score: 8
    },
    {
      id: 3, type: 'essay', dimension: 'tech', difficulty: 'advanced',
      question: '请设计一个支持千万级用户的电商系统架构，包括技术选型、高可用方案和性能优化。',
      options: [],
      correctAnswer: '架构：微服务+分布式+高可用。技术栈：Spring Cloud/Dubbo、MySQL分库分表、Redis集群、Kafka消息队列、Elasticsearch搜索。高可用：多机房部署、服务降级、熔断限流、数据备份。性能优化：缓存、CDN、数据库优化、异步处理、读写分离。',
      explanation: '大型电商系统需要分布式架构和完善的高可用方案。',
      score: 15
    },
    {
      id: 4, type: 'single', dimension: 'tech', difficulty: 'advanced',
      question: '什么是CAP理论？',
      options: ['缓存理论', '分布式系统的一致性、可用性、分区容错性理论', '数据库理论', '网络理论'],
      correctAnswer: '分布式系统的一致性、可用性、分区容错性理论',
      explanation: 'CAP理论指出分布式系统最多只能同时满足一致性、可用性、分区容错性中的两个。',
      score: 6
    },
    {
      id: 5, type: 'single', dimension: 'tech', difficulty: 'advanced',
      question: '如何解决分布式事务问题？',
      options: ['使用本地事务', '使用2PC、TCC、Saga等分布式事务方案', '不处理', '使用数据库事务'],
      correctAnswer: '使用2PC、TCC、Saga等分布式事务方案',
      explanation: '分布式事务需要专门的解决方案来保证数据一致性。',
      score: 8
    },
    {
      id: 6, type: 'multiple', dimension: 'tech', difficulty: 'advanced',
      question: '系统限流的常见算法包括哪些？（多选）',
      options: ['令牌桶', '漏桶', '计数器', '哈希表'],
      correctAnswer: ['令牌桶', '漏桶', '计数器'],
      explanation: '令牌桶、漏桶、计数器都是常见的限流算法，哈希表是数据结构。',
      score: 6
    },
    {
      id: 7, type: 'essay', dimension: 'general', difficulty: 'advanced',
      question: '当系统出现性能瓶颈时，你会如何定位和优化？',
      options: [],
      correctAnswer: '1.监控分析：CPU、内存、IO、网络 2.定位瓶颈：慢查询、热点代码、资源竞争 3.优化方案：数据库优化、缓存、异步、代码优化 4.压测验证 5.灰度发布 6.持续监控',
      explanation: '性能优化需要系统化的方法，从监控、定位到优化、验证。',
      score: 12
    },
    {
      id: 8, type: 'single', dimension: 'behavior', difficulty: 'intermediate',
      question: '后端架构师最重要的能力是什么？',
      options: ['编码能力', '系统设计和架构能力', '沟通能力', '业务理解'],
      correctAnswer: '系统设计和架构能力',
      explanation: '架构师需要能够设计高可用、高性能、可扩展的系统架构。',
      score: 6
    },
    {
      id: 9, type: 'single', dimension: 'tech', difficulty: 'advanced',
      question: '什么是服务降级？',
      options: ['关闭服务', '在系统压力大时关闭非核心功能保证核心服务', '降低服务质量', '减少服务器'],
      correctAnswer: '在系统压力大时关闭非核心功能保证核心服务',
      explanation: '服务降级是保证系统核心功能可用的重要手段。',
      score: 6
    },
    {
      id: 10, type: 'single', dimension: 'tech', difficulty: 'advanced',
      question: '如何设计一个高可用的系统？',
      options: ['使用好的服务器', '多机房部署+负载均衡+故障转移+监控告警', '增加服务器数量', '使用云服务'],
      correctAnswer: '多机房部署+负载均衡+故障转移+监控告警',
      explanation: '高可用需要从架构、部署、监控等多个维度综合保障。',
      score: 8
    },
  ]
};

// NLP算法工程师题库
export const nlpEngineerQuestions: JobQuestionBank = {
  jobId: 'nlp-engineer',
  jobTitle: 'NLP算法工程师',
  category: 'AI与数据',
  questions: [
    {
      id: 1, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: 'Transformer模型的核心机制是什么？',
      options: ['RNN', '自注意力机制（Self-Attention）', 'CNN', 'LSTM'],
      correctAnswer: '自注意力机制（Self-Attention）',
      explanation: 'Transformer通过自注意力机制捕捉序列中的长距离依赖关系。',
      score: 6
    },
    {
      id: 2, type: 'multiple', dimension: 'tech', difficulty: 'advanced',
      question: '以下哪些是常见的预训练语言模型？（多选）',
      options: ['BERT', 'GPT', 'T5', 'ResNet'],
      correctAnswer: ['BERT', 'GPT', 'T5'],
      explanation: 'BERT、GPT、T5都是NLP预训练模型，ResNet是计算机视觉模型。',
      score: 8
    },
    {
      id: 3, type: 'essay', dimension: 'tech', difficulty: 'advanced',
      question: '请描述你如何构建一个智能客服系统，包括意图识别、实体抽取和对话管理。',
      options: [],
      correctAnswer: '1.意图识别：使用BERT分类模型识别用户意图 2.实体抽取：使用NER模型提取关键信息 3.对话管理：使用对话状态跟踪和策略网络 4.回复生成：检索式+生成式混合 5.知识库：构建FAQ和知识图谱 6.持续优化：收集badcase迭代模型',
      explanation: '智能客服需要NLU、对话管理、NLG等多个模块协同工作。',
      score: 15
    },
    {
      id: 4, type: 'single', dimension: 'tech', difficulty: 'basic',
      question: '什么是词嵌入（Word Embedding）？',
      options: ['词频统计', '将词语映射为稠密向量表示', '分词算法', '词性标注'],
      correctAnswer: '将词语映射为稠密向量表示',
      explanation: '词嵌入将离散的词语表示为连续的向量，捕捉词语的语义信息。',
      score: 5
    },
    {
      id: 5, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: 'BERT和GPT的主要区别是什么？',
      options: ['模型大小', 'BERT是双向编码器，GPT是单向解码器', '训练数据', '应用场景'],
      correctAnswer: 'BERT是双向编码器，GPT是单向解码器',
      explanation: 'BERT使用Masked LM双向建模，GPT使用自回归单向建模。',
      score: 6
    },
    {
      id: 6, type: 'multiple', dimension: 'tech', difficulty: 'intermediate',
      question: 'NLP的常见任务包括哪些？（多选）',
      options: ['文本分类', '命名实体识别', '机器翻译', '图像识别'],
      correctAnswer: ['文本分类', '命名实体识别', '机器翻译'],
      explanation: '文本分类、NER、机器翻译都是NLP任务，图像识别是CV任务。',
      score: 6
    },
    {
      id: 7, type: 'essay', dimension: 'general', difficulty: 'intermediate',
      question: '当NLP模型在特定领域表现不佳时，你会如何优化？',
      options: [],
      correctAnswer: '1.领域数据收集和标注 2.领域预训练（继续预训练） 3.领域微调 4.数据增强 5.引入领域知识（知识图谱） 6.模型集成 7.badcase分析和迭代',
      explanation: 'NLP模型的领域适配需要数据、模型、知识多方面的优化。',
      score: 12
    },
    {
      id: 8, type: 'single', dimension: 'behavior', difficulty: 'intermediate',
      question: 'NLP工程师最重要的能力是什么？',
      options: ['数学能力', '语言学知识和模型实现能力', '编程能力', '英语能力'],
      correctAnswer: '语言学知识和模型实现能力',
      explanation: 'NLP需要理解语言现象，并能够用模型解决实际问题。',
      score: 6
    },
    {
      id: 9, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: '什么是Few-shot Learning？',
      options: ['快速训练', '使用少量样本进行学习', '减少模型参数', '降低学习率'],
      correctAnswer: '使用少量样本进行学习',
      explanation: 'Few-shot Learning通过预训练和元学习，使模型能够从少量样本中学习新任务。',
      score: 6
    },
    {
      id: 10, type: 'single', dimension: 'tech', difficulty: 'advanced',
      question: '如何评估生成式对话模型的质量？',
      options: ['只看准确率', '使用BLEU、ROUGE、困惑度和人工评估', '只看损失函数', '只看速度'],
      correctAnswer: '使用BLEU、ROUGE、困惑度和人工评估',
      explanation: '生成式模型需要多维度评估，包括自动指标和人工评估。',
      score: 8
    },
  ]
};

// 计算机视觉工程师题库

export const seniorFrontendEngineerQuestions: JobQuestionBank = {
  jobId: 'senior-frontend-engineer',
  jobTitle: '高级前端开发工程师',
  category: '技术开发',
  questions: [
    // ===== 专业技能题（tech）=====
    {
      id: 1, type: 'single', dimension: 'tech', difficulty: 'advanced',
      question: '在React 18的Concurrent Mode下，关于useTransition和useDeferredValue，以下说法正确的是？',
      options: ['两者都可以用来降低状态更新的优先级，但useTransition用于处理值，useDeferredValue用于处理函数', '两者都会阻塞UI渲染，直到后台更新完成', 'useTransition用于将状态更新标记为非紧急，useDeferredValue用于获取一个延后更新的值', '在Concurrent Mode下，所有的状态更新都会自动应用这些特性'],
      correctAnswer: 'useTransition用于将状态更新标记为非紧急，useDeferredValue用于获取一个延后更新的值',
      explanation: '在React 18中，useTransition用于包裹非紧急的状态更新函数，而useDeferredValue用于获取一个延迟更新的状态值，两者都是并发模式下优化UI响应的利器。',
      score: 5
    },
    {
      id: 2, type: 'multiple', dimension: 'tech', difficulty: 'advanced',
      question: '微前端架构中，常见的应用隔离（沙箱）方案有哪些？（多选）',
      options: ['SnapshotSandbox（快照沙箱）', 'ProxySandbox（代理沙箱）', 'Iframe沙箱', 'Webpack动态隔离'],
      correctAnswer: ['SnapshotSandbox（快照沙箱）', 'ProxySandbox（代理沙箱）', 'Iframe沙箱'],
      explanation: '常见微前端沙箱方案包括基于Proxy的代理沙箱、快照沙箱、Iframe沙箱。Webpack动态隔离不是标准的JS运行环境沙箱概念。',
      score: 5
    },
    {
      id: 3, type: 'single', dimension: 'tech', difficulty: 'advanced',
      question: '在V8引擎的垃圾回收机制中，关于新生代和老生代，描述错误的是？',
      options: ['新生代采用Scavenge算法，分为From和To两个空间', '老生代采用Mark-Sweep和Mark-Compact算法', '存活时间长或体积过大的对象会从新生代晋升到老生代', '新生代的垃圾回收过程完全不会引起Stop-The-World'],
      correctAnswer: '新生代的垃圾回收过程完全不会引起Stop-The-World',
      explanation: 'V8不管新老生代，执行某些阶段（如初始标记或对象复制）时仍会引起Stop-The-World停顿，只是新生代空间小，停顿时间短。',
      score: 5
    },
    {
      id: 4, type: 'single', dimension: 'tech', difficulty: 'advanced',
      question: '在现代前端性能优化中，以下哪种做法不能有效优化LCP（Largest Contentful Paint）？',
      options: ['使用preload提前获取LCP关键资源', '将所有CSS内联到HTML头部', '对LCP图像使用loading="lazy"懒加载', '使用CDN加速关键资源传输'],
      correctAnswer: '对LCP图像使用loading="lazy"懒加载',
      explanation: '对首屏LCP元素使用懒加载会延迟加载时间，从而恶化LCP指标。LCP元素应尽可能早地被加载。',
      score: 5
    },
    {
      id: 5, type: 'single', dimension: 'tech', difficulty: 'advanced',
      question: 'TypeScript中，infer关键字的主要用途是什么？',
      options: ['用于声明接口继承关系', '在条件类型中推断并提取类型', '用于泛型约束', '用于联合类型分发'],
      correctAnswer: '在条件类型中推断并提取类型',
      explanation: 'infer只能在条件类型（T extends ... ? infer U : ...）的extends子句中使用，用于捕获待推断的类型变量，常见于ReturnType、Parameters等工具类型的实现。',
      score: 5
    },
    {
      id: 6, type: 'single', dimension: 'tech', difficulty: 'advanced',
      question: 'Webpack5中Module Federation（模块联邦）的核心作用是什么？',
      options: ['提升单应用的打包速度', '允许多个独立构建的应用共享代码，实现运行时依赖共享', '替代Tree Shaking进行代码优化', '实现CSS Modules的自动命名'],
      correctAnswer: '允许多个独立构建的应用共享代码，实现运行时依赖共享',
      explanation: '模块联邦是Webpack5的核心特性，允许不同构建产物在运行时互相引用代码，是实现微前端架构的重要技术手段，可避免多应用重复打包相同依赖。',
      score: 5
    },
    {
      id: 7, type: 'multiple', dimension: 'tech', difficulty: 'advanced',
      question: '以下哪些是常见的前端安全漏洞及其对应防御手段？（多选）',
      options: ['XSS攻击 → 对用户输入进行HTML实体转义', 'CSRF攻击 → 使用SameSite Cookie + CSRF Token', 'SQL注入 → 前端参数校验', '点击劫持 → 设置X-Frame-Options响应头'],
      correctAnswer: ['XSS攻击 → 对用户输入进行HTML实体转义', 'CSRF攻击 → 使用SameSite Cookie + CSRF Token', '点击劫持 → 设置X-Frame-Options响应头'],
      explanation: 'SQL注入是后端安全问题，前端参数校验无法根本防御，必须在后端使用参数化查询。其他三项前后端配合均可有效防御。',
      score: 6
    },
    {
      id: 8, type: 'single', dimension: 'tech', difficulty: 'advanced',
      question: 'React的Fiber架构相比Stack架构最核心的改进是什么？',
      options: ['提升了组件状态管理的性能', '将同步不可中断的渲染改为异步可中断的增量渲染', '引入了JSX语法糖', '优化了虚拟DOM的diff算法复杂度'],
      correctAnswer: '将同步不可中断的渲染改为异步可中断的增量渲染',
      explanation: 'Fiber架构将渲染工作切分成小单元，利用requestIdleCallback思想在浏览器空闲时段执行，实现了可中断、可恢复、可设置优先级的渲染，是实现Concurrent Mode的基础。',
      score: 5
    },
    // ===== 工程实践/经验题（experience）=====
    {
      id: 9, type: 'scenario', dimension: 'experience', difficulty: 'advanced',
      question: '【架构设计题】请描述如何为大型电商平台设计一套基于Monorepo的前端工程化体系，包括工具链选型、包依赖管理、CI/CD流水线和版本发布策略。',
      correctAnswer: '开放性题目',
      explanation: '优秀答案应涵盖：1. 工具选型（pnpm workspace + Turborepo/Nx）；2. 依赖管理（避免幽灵依赖）；3. CI/CD（增量构建、并行测试、Changesets自动发布）；4. 版本策略（语义化版本 + Changelog自动生成）。',
      score: 10
    },
    {
      id: 10, type: 'scenario', dimension: 'experience', difficulty: 'advanced',
      question: '线上某页面白屏率突增至5%，你将如何系统排查和定位问题根因？',
      options: ['查看Sentry错误日志，定位JS报错', '检查CDN资源是否正常加载', '分析用户设备和浏览器分布，判断是否兼容性问题', '以上都需要，但应从错误监控平台优先入手快速分类'],
      correctAnswer: '以上都需要，但应从错误监控平台优先入手快速分类',
      explanation: '白屏排查需要：1. 错误监控（Sentry/Fundebug）分类错误堆栈；2. CDN/资源可用性检查；3. 用户环境分析（UA、网络）；4. 实时录屏/PerformanceObserver数据复现。优先通过监控平台快速缩小范围。',
      score: 8
    },
    // ===== 通用能力题（general）=====
    {
      id: 11, type: 'scenario', dimension: 'general', difficulty: 'advanced',
      question: '你负责的前端项目技术债严重，而业务需求不断涌入，你如何平衡技术重构与业务迭代的优先级？',
      options: ['暂停所有业务需求，集中时间重构', '边开发新功能边顺手重构，没有计划', '建立技术债看板，对重构任务进行优先级量化，与PM谈判争取技术时间窗口', '等待项目下线时再做彻底重构'],
      correctAnswer: '建立技术债看板，对重构任务进行优先级量化，与PM谈判争取技术时间窗口',
      explanation: '高级工程师需要具备技术影响力和业务全局观：1. 量化技术债的风险和收益；2. 通过数据（故障率、开发效率）说服业务方；3. 将重构拆分为可迭代的小任务，在业务版本中穿插执行。',
      score: 6
    },
    {
      id: 12, type: 'scenario', dimension: 'general', difficulty: 'intermediate',
      question: '团队新来一名初级工程师提交的PR代码质量较低，但他/她态度认真。作为高级工程师你如何处理？',
      options: ['直接打回PR，让他/她重写', '帮他/她直接修改并合并', '通过详细的Code Review注释指出问题并解释原因，安排1on1辅导', '忽略代码质量，不影响功能就合并'],
      correctAnswer: '通过详细的Code Review注释指出问题并解释原因，安排1on1辅导',
      explanation: '高级工程师的职责包括团队赋能，应通过建设性的CR反馈、配对编程和持续指导来帮助初级工程师成长，而非代替或打击。',
      score: 5
    },
    // ===== 行为特质题（behavior）=====
    {
      id: 13, type: 'scenario', dimension: 'behavior', difficulty: 'advanced',
      question: '距离某关键版本上线还有3天，你发现核心模块存在一个严重性能问题（页面帧率下降到20fps），修复需要约5天。你会怎么做？',
      options: ['强行加班5天修复', '隐瞒问题，先上线再说', '立即同步PM和测试，评估降级方案（如功能简化、分批上线），同时并行修复', '推迟上线等修复完成'],
      correctAnswer: '立即同步PM和测试，评估降级方案（如功能简化、分批上线），同时并行修复',
      explanation: '高级工程师面临风险时应：1. 及时透明地同步信息（不隐瞒）；2. 提供多个备选方案（降级/分批/延期），而不是单一选项；3. 主动承担解决责任，而非推卸。',
      score: 6
    },
    {
      id: 14, type: 'scenario', dimension: 'behavior', difficulty: 'intermediate',
      question: '你与后端工程师在某接口设计方案上有分歧（前端希望BFF聚合，后端希望前端直接调多个接口）。如何解决？',
      options: ['强硬坚持自己的方案', '完全妥协，按后端意见来', '组织技术评审会议，双方用数据和业务场景论证各自方案的利弊，求同存异', '直接找领导仲裁'],
      correctAnswer: '组织技术评审会议，双方用数据和业务场景论证各自方案的利弊，求同存异',
      explanation: '技术分歧的正确处理方式是通过数据和业务场景（如网络请求数量、维护成本、团队能力）进行客观论证，而不是以权力或情绪解决，同时保持对不同观点的开放心态。',
      score: 5
    },
    // ===== 通用行为题（general）=====
    {
      id: 15, type: 'scenario', dimension: 'general', difficulty: 'advanced',
      question: '作为高级前端，你如何推动团队建立并落地前端规范（代码风格、组件设计、性能指标）？',
      options: ['直接发邮件通知大家遵守', '写好规范文档，等领导审批后强制执行', '组织工作坊共同制定规范，配合ESLint/Prettier等工具自动化检测，通过CI强制卡点', '规范是形式主义，不需要'],
      correctAnswer: '组织工作坊共同制定规范，配合ESLint/Prettier等工具自动化检测，通过CI强制卡点',
      explanation: '有效的团队规范需要：1. 参与感（工作坊共建，不是单方面发布）；2. 自动化工具保障（ESLint/Prettier/Stylelint）；3. CI强制卡点（不符合规范不能合并）；4. 持续review与迭代优化。',
      score: 6
    }
  ]
};

export const cvEngineerQuestions: JobQuestionBank = {
  jobId: 'cv-engineer',
  jobTitle: '计算机视觉工程师',
  category: 'AI与数据',
  questions: [
    {
      id: 1, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: 'CNN（卷积神经网络）的核心优势是什么？',
      options: ['参数少', '局部感知和权值共享', '训练快', '不需要数据'],
      correctAnswer: '局部感知和权值共享',
      explanation: 'CNN通过局部感知和权值共享，有效提取图像特征并减少参数量。',
      score: 6
    },
    {
      id: 2, type: 'multiple', dimension: 'tech', difficulty: 'intermediate',
      question: '以下哪些是经典的目标检测算法？（多选）',
      options: ['YOLO', 'Faster R-CNN', 'ResNet', 'SSD'],
      correctAnswer: ['YOLO', 'Faster R-CNN', 'SSD'],
      explanation: 'YOLO、Faster R-CNN、SSD都是目标检测算法，ResNet是分类网络。',
      score: 8
    },
    {
      id: 3, type: 'essay', dimension: 'tech', difficulty: 'advanced',
      question: '请描述你如何构建一个人脸识别系统，包括人脸检测、特征提取和识别。',
      options: [],
      correctAnswer: '1.人脸检测：使用MTCNN或RetinaFace检测人脸 2.人脸对齐：关键点检测和仿射变换 3.特征提取：使用ArcFace或FaceNet提取特征向量 4.特征比对：余弦相似度或欧氏距离 5.活体检测：防止照片攻击 6.优化：模型压缩、加速推理',
      explanation: '人脸识别系统需要检测、对齐、特征提取、比对等多个环节。',
      score: 15
    },
    {
      id: 4, type: 'single', dimension: 'tech', difficulty: 'basic',
      question: '什么是图像分类？',
      options: ['检测图像中的物体', '判断图像属于哪个类别', '分割图像', '生成图像'],
      correctAnswer: '判断图像属于哪个类别',
      explanation: '图像分类是判断整张图像的类别，是计算机视觉的基础任务。',
      score: 5
    },
    {
      id: 5, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: '目标检测和图像分割的区别是什么？',
      options: ['没有区别', '检测给出边界框，分割给出像素级标注', '检测更准确', '分割更快'],
      correctAnswer: '检测给出边界框，分割给出像素级标注',
      explanation: '目标检测定位物体位置，图像分割给出每个像素的类别。',
      score: 6
    },
    {
      id: 6, type: 'multiple', dimension: 'tech', difficulty: 'intermediate',
      question: '图像数据增强的常见方法包括哪些？（多选）',
      options: ['旋转', '翻转', '裁剪', '删除数据'],
      correctAnswer: ['旋转', '翻转', '裁剪'],
      explanation: '旋转、翻转、裁剪都是数据增强方法，删除数据不是增强。',
      score: 6
    },
    {
      id: 7, type: 'essay', dimension: 'general', difficulty: 'intermediate',
      question: '当CV模型在实际场景中准确率下降时，你会如何分析和改进？',
      options: [],
      correctAnswer: '1.数据分析：检查训练集和测试集分布差异 2.badcase分析：找出错误样本的共性 3.数据补充：收集更多实际场景数据 4.模型优化：调整网络结构、超参数 5.后处理：添加规则过滤 6.模型集成：多模型融合',
      explanation: 'CV模型优化需要从数据、模型、后处理等多个角度分析。',
      score: 12
    },
    {
      id: 8, type: 'single', dimension: 'behavior', difficulty: 'intermediate',
      question: 'CV工程师最重要的能力是什么？',
      options: ['数学能力', '图像处理和深度学习能力', '编程能力', '硬件知识'],
      correctAnswer: '图像处理和深度学习能力',
      explanation: 'CV工程师需要理解图像特性，并能够设计和优化深度学习模型。',
      score: 6
    },
    {
      id: 9, type: 'single', dimension: 'tech', difficulty: 'intermediate',
      question: '什么是迁移学习？',
      options: ['迁移数据', '使用预训练模型在新任务上微调', '迁移代码', '迁移服务器'],
      correctAnswer: '使用预训练模型在新任务上微调',
      explanation: '迁移学习利用预训练模型的知识，加速新任务的训练。',
      score: 6
    },
    {
      id: 10, type: 'single', dimension: 'tech', difficulty: 'advanced',
      question: '如何解决小样本学习问题？',
      options: ['增加训练轮数', '使用数据增强、迁移学习、Few-shot Learning', '降低模型复杂度', '不处理'],
      correctAnswer: '使用数据增强、迁移学习、Few-shot Learning',
      explanation: '小样本学习需要综合使用多种技术来提升模型泛化能力。',
      score: 8
    },
  ]
};

// 导出所有题库
export const allQuestionBanks: JobQuestionBank[] = [
  aiEngineerQuestions,
  frontendEngineerQuestions,
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
];

// 根据标准ID获取题库
export const getQuestionBankByJobId = (jobId: string): JobQuestionBank | undefined => {
  return allQuestionBanks.find(bank => bank.jobId === jobId);
};

// 根据标准分类获取题库列表
export const getQuestionBanksByCategory = (category: string): JobQuestionBank[] => {
  return allQuestionBanks.filter(bank => bank.category === category);
};
