// 实训业务类型定义（对应 training_practice 业务表）

export interface ClassInfo {
  id: string;
  name: string;
  university_email: string;
  description?: string;
  created_at: string;
}

export interface ClassStudent {
  id: string;
  class_id: string;
  student_no: string;
  gender?: string;
  political_status?: string;
  display_name: string;
  created_at: string;
}

// 实训场景类型
export type SceneType =
  | 'project_defense'   // 项目结题答辩
  | 'tech_report'       // 技术方案汇报
  | 'conflict_communication' // 小组冲突沟通
  | 'pressure_query';   // 压力质询

export interface TrainingTask {
  id: string;
  title: string;
  description: string;
  class_id?: string;
  scene_type?: SceneType;
  difficulty?: string;
  deadline?: string;
  status: string;
  university_email?: string;
  created_at: string;
  updated_at: string;
}

// 对话证据链消息
export interface EvidenceMessage {
  role: 'user' | 'assistant';
  content: string;
  ts: string;
}

// 评估分数
export interface TrainingScores {
  logic_score: number;
  pressure_score: number;
  scenario_score: number;
  communication_score: number;
  skill_score: number;
}

export interface TrainingSubmission {
  id: string;
  task_id: string;
  class_id: string;
  student_no: string;
  evidence_chain: EvidenceMessage[];
  script?: Record<string, unknown>;
  scores: Partial<TrainingScores>;
  ai_comment?: string;
  teacher_override?: Record<string, unknown>;
  status: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// 雷达图维度配置（与 Edge Function SCORE_DIMENSIONS 保持一致）
export const RADAR_DIMENSIONS = [
  { key: 'logic_score', label: '逻辑思维', fullMark: 100 },
  { key: 'pressure_score', label: '抗压能力', fullMark: 100 },
  { key: 'scenario_score', label: '情境应对', fullMark: 100 },
  { key: 'communication_score', label: '沟通表达', fullMark: 100 },
  { key: 'skill_score', label: '专业素养', fullMark: 100 },
] as const;

export const SCENE_OPTIONS: { value: SceneType; label: string; desc: string }[] = [
  { value: 'project_defense', label: '项目结题答辩', desc: '技术方案被评委盘问' },
  { value: 'tech_report', label: '技术方案汇报', desc: '压力质询' },
  { value: 'conflict_communication', label: '小组冲突沟通', desc: '团队协作与冲突化解' },
  { value: 'pressure_query', label: '压力质询', desc: '高压追问应对' },
];