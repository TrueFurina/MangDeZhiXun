export interface UserPortrait {
  id?: string;
  user_id: string;
  basic_info?: any;
  job_target?: any;
  assessment_history?: any[];
  learning_behavior?: any;
  resume_experience?: any;
  competency_model?: any;
  ability_portrait?: any;
  interview_history?: any[];
  recommended_learning?: any;
  created_at?: string;
  updated_at?: string;
}

export interface AIInterviewRecord {
  id?: string;
  user_id: string;
  job_id?: string;
  enterprise_id?: string;
  interview_type?: string;
  status?: number; // 0未开始/1进行中/2已完成/3异常中断
  total_score?: number;
  round_count?: number;
  round_data?: any[];
  voice_features?: any;
  video_features?: any;
  logic_score?: number;
  pressure_score?: number;
  scenario_score?: number;
  skill_score?: number;
  ai_comment?: string;
  start_time?: string;
  end_time?: string;
  created_at?: string;
  updated_at?: string;
}