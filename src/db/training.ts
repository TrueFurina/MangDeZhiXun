import { supabase } from '@/lib/supabase';
import type {
  ClassInfo,
  ClassStudent,
  TrainingTask,
  TrainingSubmission,
  EvidenceMessage,
  SceneType,
} from '@/types/training';

// ==================== 班级 ====================

export async function getClasses(email: string): Promise<ClassInfo[]> {
  const { data } = await supabase
    .from('classes')
    .select('*')
    .eq('university_email', email)
    .order('created_at', { ascending: false })
    .limit(100);
  return Array.isArray(data) ? data : [];
}

export async function createClass(payload: { name: string; university_email: string; description?: string }): Promise<ClassInfo | null> {
  const { data, error } = await supabase
    .from('classes')
    .insert({
      name: payload.name,
      university_email: payload.university_email,
      description: payload.description || null,
    })
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ==================== 班级学生 ====================

export async function getClassStudents(classId: string): Promise<ClassStudent[]> {
  const { data } = await supabase
    .from('class_students')
    .select('*')
    .eq('class_id', classId)
    .order('student_no', { ascending: true })
    .limit(500);
  return Array.isArray(data) ? data : [];
}

export async function importClassStudents(classId: string, students: { student_no: string; gender?: string; political_status?: string; display_name: string }[]): Promise<number> {
  const rows = students.map((s) => ({
    class_id: classId,
    student_no: s.student_no,
    gender: s.gender || null,
    political_status: s.political_status || null,
    display_name: s.display_name,
  }));
  const { error } = await supabase.from('class_students').upsert(rows, { onConflict: 'class_id,student_no' });
  if (error) throw error;
  return rows.length;
}

// ==================== 实训任务 ====================

export async function getTrainingTasks(email: string): Promise<TrainingTask[]> {
  let query = supabase
    .from('training_tasks')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(100);
  // 学生端传空email时展示全部已发布任务；教师端按email过滤自己班级
  if (email) query = query.eq('university_email', email);
  const { data, error } = await query;
  if (error) console.error('getTrainingTasks error:', error);
  return Array.isArray(data) ? data : [];
}

export async function getTrainingTask(taskId: string): Promise<TrainingTask | null> {
  const { data } = await supabase
    .from('training_tasks')
    .select('*')
    .eq('id', taskId)
    .maybeSingle();
  return data;
}

export async function createTrainingTask(payload: {
  title: string;
  description: string;
  class_id: string;
  scene_type: SceneType;
  difficulty: string;
  deadline?: string;
  university_email: string;
}): Promise<TrainingTask | null> {
  const { data, error } = await supabase
    .from('training_tasks')
    .insert({
      title: payload.title,
      description: payload.description,
      class_id: payload.class_id,
      scene_type: payload.scene_type,
      difficulty: payload.difficulty,
      deadline: payload.deadline || null,
      status: 'published',
      university_email: payload.university_email,
      task_type: 'soft_skill_training',
      difficulty_level: payload.difficulty,
      task_content: { scene_type: payload.scene_type },
      evaluation_criteria: {},
    })
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ==================== 实训提交 ====================

export async function getMySubmission(taskId: string, studentNo: string): Promise<TrainingSubmission | null> {
  const { data } = await supabase
    .from('training_submissions')
    .select('*')
    .eq('task_id', taskId)
    .eq('student_no', studentNo)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function createSubmission(payload: {
  task_id: string;
  class_id: string;
  student_no: string;
}): Promise<TrainingSubmission | null> {
  const { data, error } = await supabase
    .from('training_submissions')
    .insert({
      task_id: payload.task_id,
      class_id: payload.class_id,
      student_no: payload.student_no,
      status: 'in_progress',
      started_at: new Date().toISOString(),
    })
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateSubmissionEvidence(
  submissionId: string,
  evidenceChain: EvidenceMessage[],
): Promise<void> {
  const { error } = await supabase
    .from('training_submissions')
    .update({ evidence_chain: evidenceChain, updated_at: new Date().toISOString() })
    .eq('id', submissionId);
  if (error) throw error;
}

export async function completeSubmission(
  submissionId: string,
  payload: { evidence_chain: EvidenceMessage[]; script: Record<string, unknown>; scores: Record<string, number>; ai_comment: string },
): Promise<void> {
  const { error } = await supabase
    .from('training_submissions')
    .update({
      evidence_chain: payload.evidence_chain,
      script: payload.script,
      scores: payload.scores,
      ai_comment: payload.ai_comment,
      status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', submissionId);
  if (error) throw error;
}

export async function getSubmission(submissionId: string): Promise<TrainingSubmission | null> {
  const { data } = await supabase
    .from('training_submissions')
    .select('*')
    .eq('id', submissionId)
    .maybeSingle();
  return data;
}

// 获取某任务下所有提交（教师查看）
export async function getTaskSubmissions(taskId: string): Promise<TrainingSubmission[]> {
  const { data } = await supabase
    .from('training_submissions')
    .select('*')
    .eq('task_id', taskId)
    .order('updated_at', { ascending: false })
    .limit(500);
  return Array.isArray(data) ? data : [];
}

// 获取某学生历史已完成的实训交互（用于画像Agent构建画像）
export async function getStudentHistory(studentNo: string): Promise<EvidenceMessage[][]> {
  const { data } = await supabase
    .from('training_submissions')
    .select('evidence_chain, status')
    .eq('student_no', studentNo)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(5);
  const rows = Array.isArray(data) ? data : [];
  return rows.map((r: { evidence_chain: EvidenceMessage[] }) => r.evidence_chain || []);
}

// 教师人工复核：覆盖评分
export async function updateTeacherOverride(
  submissionId: string,
  override: Record<string, number>,
): Promise<void> {
  const { error } = await supabase
    .from('training_submissions')
    .update({ teacher_override: override, updated_at: new Date().toISOString() })
    .eq('id', submissionId);
  if (error) throw error;
}

// ==================== Edge Function 编排 ====================

export async function invokeOrchestrator(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.functions.invoke('training-orchestrator', { body });
  if (error) {
    const msg = await error?.context?.text?.();
    throw new Error(msg || error.message || '编排服务调用失败');
  }
  return data || {};
}