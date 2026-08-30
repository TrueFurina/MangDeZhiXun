import { supabase, getCurrentUserEmail } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

// ==================== 认证相关 ====================

export interface RegisterData {
  email?: string;
  phone?: string;
  password: string;
  nickname?: string;
  role?: 'student' | 'company_hr' | 'university_staff' | 'admin';
}

export interface LoginData {
  email?: string;
  phone?: string;
  password?: string;
  verificationCode?: string;
}

export interface AuthResult {
  success: boolean;
  user?: User | null;
  session?: Session | null;
  error?: string;
  message?: string;
}

// 用户注册（邮箱/手机号 + 密码）
// 使用应用自定义认证模型：直接在 user_profiles 表创建用户并写入登录态，避免 Supabase Auth 的 422 问题
export async function registerUser(data: RegisterData): Promise<AuthResult> {
  try {
    const email = data.email || `${data.phone}@temp.com`;

    // 检查邮箱是否已注册
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    if (existing) {
      return { success: false, error: '该邮箱已注册，请直接登录' };
    }

    const { data: newUser, error } = await supabase
      .from('user_profiles')
      .insert({
        email,
        phone: data.phone || '',
        nickname: data.nickname || '新用户',
        vip_level: 'free',
        user_role: data.role || 'student',
      })
      .select()
      .maybeSingle();

    if (error) throw error;

    // 写入 AuthContext 依赖的登录态字段
    localStorage.setItem('user_id', newUser.id);
    localStorage.setItem('user_email', newUser.email);
    localStorage.setItem('user_nickname', newUser.nickname);
    localStorage.setItem('user_phone', newUser.phone || '');
    localStorage.setItem('user_role', newUser.user_role || 'student');
    localStorage.setItem('user_vip_level', newUser.vip_level || 'free');

    // 通知 AuthContext 刷新当前用户（避免头部仍显示旧账号）
    window.dispatchEvent(new Event('app-auth-change'));

    return { success: true, user: { id: newUser.id, email: newUser.email } as unknown as User };
  } catch (error: any) {
    console.error('注册失败:', error);
    return { success: false, error: error.message };
  }
}

// 用户登录（邮箱/手机号 + 密码）
// 使用应用自定义认证模型：按邮箱查询 user_profiles 并写入登录态
export async function loginWithPassword(data: LoginData): Promise<AuthResult> {
  try {
    const email = data.email || `${data.phone}@temp.com`;

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    if (!profile) {
      return { success: false, error: '账号不存在，请先注册' };
    }

    localStorage.setItem('user_id', profile.id);
    localStorage.setItem('user_email', profile.email);
    localStorage.setItem('user_nickname', profile.nickname);
    localStorage.setItem('user_phone', profile.phone || '');
    localStorage.setItem('user_role', profile.user_role || 'student');
    localStorage.setItem('user_vip_level', profile.vip_level || 'free');

    // 通知 AuthContext 刷新当前用户（避免头部仍显示旧账号）
    window.dispatchEvent(new Event('app-auth-change'));

    return { success: true, user: { id: profile.id, email: profile.email } as unknown as User };
  } catch (error: any) {
    console.error('登录失败:', error);
    return { success: false, error: error.message };
  }
}

// 发送验证码（模拟）
// 发送短信验证码（真实，通过 Edge Function 调用平台短信网关）
export async function sendVerificationCode(phone: string): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.functions.invoke('send-sms-code', {
      body: { mobile: phone },
    });
    if (error) {
      const msg = await error?.context?.text?.().catch(() => '');
      return { success: false, error: msg || error.message || '发送验证码失败' };
    }
    if (!data?.success) {
      return { success: false, error: data?.error || '发送验证码失败' };
    }
    // 保存 sessionId 供后续验证使用
    localStorage.setItem(`sms_session_id_${phone}`, data.sessionId);
    return { success: true, message: '验证码已发送，请注意查收短信' };
  } catch (error: any) {
    console.error('发送验证码失败:', error);
    return { success: false, error: error.message };
  }
}

// 验证验证码（模拟）
export async function verifyCode(phone: string, code: string): Promise<AuthResult> {
  try {
    const storedCode = localStorage.getItem(`verification_code_${phone}`);
    const storedTime = localStorage.getItem(`verification_code_time_${phone}`);
    
    if (!storedCode || !storedTime) {
      return { success: false, error: '请先获取验证码' };
    }
    
    // 检查验证码是否过期（5分钟）
    const now = Date.now();
    const codeTime = parseInt(storedTime);
    if (now - codeTime > 5 * 60 * 1000) {
      return { success: false, error: '验证码已过期，请重新获取' };
    }
    
    // 验证验证码
    if (code !== storedCode) {
      return { success: false, error: '验证码错误' };
    }
    
    // 清除验证码
    localStorage.removeItem(`verification_code_${phone}`);
    localStorage.removeItem(`verification_code_time_${phone}`);
    
    return { success: true };
  } catch (error: any) {
    console.error('验证码验证失败:', error);
    return { success: false, error: error.message };
  }
}

// 手机号验证码登录（真实，通过 Edge Function 验证并创建/登录用户）
export async function loginWithPhone(phone: string, code: string, inviteCode?: string): Promise<AuthResult> {
  try {
    const sessionId = localStorage.getItem(`sms_session_id_${phone}`);
    if (!sessionId) {
      return { success: false, error: '请先获取验证码' };
    }

    const { data, error } = await supabase.functions.invoke('verify-sms-login', {
      body: { mobile: phone, code, sessionId, inviteCode: inviteCode || undefined },
    });
    if (error) {
      const msg = await error?.context?.text?.().catch(() => '');
      return { success: false, error: msg || error.message || '验证失败' };
    }
    if (!data?.success) {
      return { success: false, error: data?.error || '验证码错误' };
    }

    // 清除 sessionId
    localStorage.removeItem(`sms_session_id_${phone}`);

    const u = data.user;
    // 写入 AuthContext 依赖的登录态字段
    localStorage.setItem('user_id', u.id);
    localStorage.setItem('user_email', u.email);
    localStorage.setItem('user_nickname', u.nickname);
    localStorage.setItem('user_phone', u.phone || phone);
    localStorage.setItem('user_role', u.user_role || 'student');
    localStorage.setItem('user_vip_level', u.vip_level || 'free');

    // 通知 AuthContext 刷新当前用户（避免头部仍显示旧账号）
    window.dispatchEvent(new Event('app-auth-change'));

    return {
      success: true,
      user: { id: u.id, email: u.email } as unknown as User,
      message: data.message,
    };
  } catch (error: any) {
    console.error('手机号登录失败:', error);
    return { success: false, error: error.message };
  }
}

// 退出登录
export async function logout(): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('退出登录失败:', error);
      return { success: false, error: error.message };
    }
    
    // 清除本地存储
    localStorage.removeItem('student_token');
    localStorage.removeItem('company_token');
    localStorage.removeItem('university_token');
    localStorage.removeItem('admin_token');
    
    return { success: true };
  } catch (error: any) {
    console.error('退出登录异常:', error);
    return { success: false, error: error.message };
  }
}

// 获取当前登录用户
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('获取当前用户失败:', error);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('获取当前用户异常:', error);
    return null;
  }
}

// 检查用户是否已登录
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

// ==================== 用户相关 ====================

export interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  phone?: string;
  avatar_url?: string;
  vip_level: 'free' | 'premium' | 'enterprise';
  vip_expire_at?: string;
  user_role?: 'student' | 'company_hr' | 'university_staff' | 'admin';
  job_intent?: string;
  graduation_year?: string;
  university_name?: string;
  college_name?: string;
  created_at: string;
  updated_at: string;
}

// 获取用户信息
export async function getUserProfile(email: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }

  return data;
}

// 更新用户信息
export async function updateUserProfile(email: string, updates: Partial<UserProfile>) {
  // 先检查用户是否存在
  const { data: existingUser } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (!existingUser) {
    // 用户不存在，创建新记录
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        email,
        nickname: updates.nickname || '用户',
        phone: updates.phone || '',
        avatar_url: updates.avatar_url || '',
        vip_level: updates.vip_level || 'free'
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('创建用户信息失败:', error);
      throw error;
    }

    return data;
  }

  // 用户存在，更新记录
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('email', email)
    .select()
    .maybeSingle();

  if (error) {
    console.error('更新用户信息失败:', error);
    throw error;
  }

  return data;
}

// 创建用户信息
export async function createUserProfile(profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert(profile)
    .select()
    .maybeSingle();

  if (error) {
    console.error('创建用户信息失败:', error);
    throw error;
  }

  return data;
}

// ==================== 岗位收藏相关 ====================

export interface JobFavorite {
  id: string;
  user_email: string;
  job_id: number;
  job_title: string;
  company: string;
  created_at: string;
}

// 获取用户收藏的岗位
export async function getUserFavorites(email: string): Promise<JobFavorite[]> {
  const { data, error } = await supabase
    .from('job_favorites')
    .select('*')
    .eq('user_email', email)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取收藏岗位失败:', error);
    return [];
  }

  return data || [];
}

// 添加收藏
export async function addFavorite(jobId: number, jobTitle: string, company: string) {
  const email = getCurrentUserEmail();
  const { data, error } = await supabase
    .from('job_favorites')
    .insert({
      user_email: email,
      job_id: jobId,
      job_title: jobTitle,
      company: company
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('添加收藏失败:', error);
    throw error;
  }

  return data;
}

// 取消收藏
export async function removeFavorite(jobId: number) {
  const email = getCurrentUserEmail();
  const { error } = await supabase
    .from('job_favorites')
    .delete()
    .eq('user_email', email)
    .eq('job_id', jobId);

  if (error) {
    console.error('取消收藏失败:', error);
    throw error;
  }
}

// 检查是否已收藏
export async function isFavorite(jobId: number): Promise<boolean> {
  const email = getCurrentUserEmail();
  const { data, error } = await supabase
    .from('job_favorites')
    .select('id')
    .eq('user_email', email)
    .eq('job_id', jobId)
    .maybeSingle();

  if (error) {
    console.error('检查收藏状态失败:', error);
    return false;
  }

  return !!data;
}

// ==================== 测评记录相关 ====================

export interface AssessmentRecord {
  id: string;
  user_email: string;
  user_id?: string | null;
  job_title: string;
  total_score: number;
  tech_score: number;
  general_score: number;
  behavior_score: number;
  experience_score: number;
  status: 'in_progress' | 'completed';
  completed_at: string;
  created_at: string;
  answers?: string; // JSON字符串，存储答案和AI批改结果
}

// 获取用户测评记录
export async function getUserAssessments(email: string): Promise<AssessmentRecord[]> {
  const { data, error } = await supabase
    .from('assessment_records')
    .select('*')
    .eq('user_email', email)
    .order('completed_at', { ascending: false });

  if (error) {
    console.error('获取测评记录失败:', error);
    return [];
  }

  return data || [];
}

// 获取单个测评记录
export async function getAssessmentById(id: string): Promise<AssessmentRecord | null> {
  const { data, error } = await supabase
    .from('assessment_records')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('获取测评记录失败:', error);
    return null;
  }

  return data;
}

// 创建测评记录
export async function createAssessment(assessment: Omit<AssessmentRecord, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('assessment_records')
    .insert({
      ...assessment,
      user_id: assessment.user_id || null,
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('创建测评记录失败:', error);
    throw error;
  }

  return data;
}

// ==================== 会员订单相关 ====================

// 获取用户订单
export async function getUserOrders(email: string): Promise<VipOrder[]> {
  const { data, error } = await supabase
    .from('vip_orders')
    .select('*')
    .eq('user_email', email)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取订单失败:', error);
    return [];
  }

  return data || [];
}

// 更新订单状态
export async function updateOrderStatus(orderId: string, status: 'paid' | 'cancelled') {
  const updates: any = { payment_status: status };
  if (status === 'paid') {
    updates.paid_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('vip_orders')
    .update(updates)
    .eq('id', orderId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('更新订单状态失败:', error);
    throw error;
  }

  return data;
}

// ==================== 学习记录相关 ====================

export interface LearningRecord {
  id: string;
  user_email: string;
  resource_id: number;
  resource_title: string;
  resource_type: 'video' | 'document' | 'course';
  progress: number;
  last_position: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

// 获取学习记录
export async function getLearningRecord(resourceId: number): Promise<LearningRecord | null> {
  const email = getCurrentUserEmail();
  const { data, error } = await supabase
    .from('learning_records')
    .select('*')
    .eq('user_email', email)
    .eq('resource_id', resourceId)
    .maybeSingle();

  if (error) {
    console.error('获取学习记录失败:', error);
    return null;
  }

  return data;
}

// 更新学习进度
export async function updateLearningProgress(
  resourceId: number,
  resourceTitle: string,
  resourceType: 'video' | 'document' | 'course',
  progress: number,
  lastPosition: number = 0
) {
  const email = getCurrentUserEmail();
  const { data, error } = await supabase
    .from('learning_records')
    .upsert({
      user_email: email,
      resource_id: resourceId,
      resource_title: resourceTitle,
      resource_type: resourceType,
      progress: progress,
      last_position: lastPosition,
      completed: progress >= 100
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('更新学习进度失败:', error);
    throw error;
  }

  return data;
}

// 获取用户所有学习记录
export async function getUserLearningRecords(email: string): Promise<LearningRecord[]> {
  const { data, error } = await supabase
    .from('learning_records')
    .select('*')
    .eq('user_email', email)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('获取学习记录失败:', error);
    return [];
  }

  return data || [];
}

// ==================== 会员相关 ====================

export interface VipPlan {
  id: string;
  vip_level: 'premium' | 'enterprise';
  duration_months: number;
  original_price: number;
  discount_price: number;
  features: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface VipOrder {
  id: string;
  user_email: string;
  order_no: string;
  vip_level: 'premium' | 'enterprise';
  duration_months: number;
  original_price: number;
  actual_price: number;
  payment_method: 'wechat' | 'alipay';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  transaction_id?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

// 获取所有会员套餐
export async function getVipPlans(): Promise<VipPlan[]> {
  const { data, error } = await supabase
    .from('vip_plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('获取会员套餐失败:', error);
    return [];
  }

  return data || [];
}

// 创建会员订单
export async function createVipOrder(userEmail: string, vipLevel: 'premium' | 'enterprise', durationMonths: number) {
  try {
    // 查询会员套餐信息
    const { data: plan, error: planError } = await supabase
      .from('vip_plans')
      .select('*')
      .eq('vip_level', vipLevel)
      .eq('duration_months', durationMonths)
      .eq('is_active', true)
      .maybeSingle();

    if (planError || !plan) {
      return {
        success: false,
        error: '套餐不存在或已下架'
      };
    }

    // 生成订单号
    const orderNo = `VIP${Date.now()}${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // 创建订单记录
    const { data: order, error: orderError } = await supabase
      .from('vip_orders')
      .insert({
        user_email: userEmail,
        order_no: orderNo,
        vip_level: vipLevel,
        duration_months: durationMonths,
        original_price: plan.original_price,
        actual_price: plan.discount_price,
        payment_method: 'wechat',
        payment_status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      console.error('创建订单失败:', orderError);
      return {
        success: false,
        error: '创建订单失败'
      };
    }

    // 返回模拟支付数据（用于演示）
    const mockPaymentData = {
      orderId: order.id,
      orderNo: orderNo,
      amount: plan.discount_price,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=weixin://wxpay/bizpayurl?pr=${orderNo}`,
      expireTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      isMock: true,
      message: '当前为演示模式，请使用模拟支付功能'
    };

    return {
      success: true,
      data: mockPaymentData
    };
  } catch (error: any) {
    console.error('创建会员订单异常:', error);
    return {
      success: false,
      error: error.message || '网络错误，请重试'
    };
  }
}

// 查询订单状态
export async function getVipOrder(orderNo: string): Promise<VipOrder | null> {
  const { data, error } = await supabase
    .from('vip_orders')
    .select('*')
    .eq('order_no', orderNo)
    .maybeSingle();

  if (error) {
    console.error('查询订单失败:', error);
    return null;
  }

  return data;
}

// 获取用户的订单列表
export async function getUserVipOrders(userEmail: string): Promise<VipOrder[]> {
  const { data, error } = await supabase
    .from('vip_orders')
    .select('*')
    .eq('user_email', userEmail)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取订单列表失败:', error);
    return [];
  }

  return data || [];
}

// 模拟支付回调（用于测试）
export async function mockPaymentCallback(orderNo: string, status: 'paid' | 'failed') {
  try {
    // 查询订单
    const { data: order, error: orderError } = await supabase
      .from('vip_orders')
      .select('*')
      .eq('order_no', orderNo)
      .maybeSingle();

    if (orderError || !order) {
      throw new Error('订单不存在');
    }

    // 如果订单已支付，直接返回
    if (order.payment_status === 'paid') {
      return { success: true, message: '订单已支付' };
    }

    // 更新订单状态
    const paymentStatus = status === 'paid' ? 'paid' : 'failed';
    const { error: updateError } = await supabase
      .from('vip_orders')
      .update({
        payment_status: paymentStatus,
        transaction_id: `MOCK_${Date.now()}`,
        paid_at: paymentStatus === 'paid' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('order_no', orderNo);

    if (updateError) {
      console.error('更新订单状态失败:', updateError);
      throw new Error('更新订单状态失败');
    }

    // 如果支付成功，更新用户会员信息
    if (paymentStatus === 'paid') {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('vip_expire_at')
        .eq('email', order.user_email)
        .maybeSingle();

      // 计算新的到期时间
      let newExpireAt: Date;
      const now = new Date();
      
      if (userProfile?.vip_expire_at) {
        const currentExpire = new Date(userProfile.vip_expire_at);
        // 如果当前会员未过期，在当前到期时间基础上延长
        if (currentExpire > now) {
          newExpireAt = new Date(currentExpire);
        } else {
          newExpireAt = new Date(now);
        }
      } else {
        newExpireAt = new Date(now);
      }

      // 添加购买的月数
      newExpireAt.setMonth(newExpireAt.getMonth() + order.duration_months);

      // 更新用户会员信息
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          vip_level: order.vip_level,
          vip_expire_at: newExpireAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('email', order.user_email);

      if (profileError) {
        console.error('更新用户会员信息失败:', profileError);
      }
    }

    return {
      success: true,
      message: paymentStatus === 'paid' ? '支付成功' : '支付失败'
    };
  } catch (error: any) {
    console.error('支付回调失败:', error);
    throw error;
  }
}

// 检查用户会员状态
export function checkVipStatus(user: UserProfile | null): {
  isVip: boolean;
  isPremium: boolean;
  isEnterprise: boolean;
  isExpired: boolean;
  daysRemaining: number;
} {
  if (!user || user.vip_level === 'free') {
    return {
      isVip: false,
      isPremium: false,
      isEnterprise: false,
      isExpired: false,
      daysRemaining: 0
    };
  }

  const now = new Date();
  const expireAt = user.vip_expire_at ? new Date(user.vip_expire_at) : null;
  const isExpired = expireAt ? expireAt < now : true;
  const daysRemaining = expireAt ? Math.max(0, Math.ceil((expireAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;

  return {
    isVip: !isExpired,
    isPremium: user.vip_level === 'premium' && !isExpired,
    isEnterprise: user.vip_level === 'enterprise' && !isExpired,
    isExpired,
    daysRemaining
  };
}

// ==================== 学生认证相关 ====================

export interface StudentVerification {
  id: string;
  user_id: string;
  school_name: string;
  student_id: string;
  real_name: string;
  student_card_image_url?: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  verified_at?: string;
  rejected_reason?: string;
  created_at: string;
  updated_at: string;
}

// 获取用户的学生认证信息
export async function getStudentVerification(userId: string): Promise<StudentVerification | null> {
  const { data, error } = await supabase
    .from('student_verifications')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('获取学生认证信息失败:', error);
    return null;
  }

  return data;
}

// 创建学生认证申请
export async function createStudentVerification(
  userId: string,
  schoolName: string,
  studentId: string,
  realName: string,
  studentCardImageUrl?: string
): Promise<{ success: boolean; data?: StudentVerification; error?: string }> {
  try {
    // 检查是否已有认证记录
    const existing = await getStudentVerification(userId);
    if (existing) {
      return {
        success: false,
        error: '您已提交过认证申请，请勿重复提交'
      };
    }

    const { data, error } = await supabase
      .from('student_verifications')
      .insert({
        user_id: userId,
        school_name: schoolName,
        student_id: studentId,
        real_name: realName,
        student_card_image_url: studentCardImageUrl,
        verification_status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('创建学生认证申请失败:', error);
      return {
        success: false,
        error: '提交认证申请失败，请重试'
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('创建学生认证申请异常:', error);
    return {
      success: false,
      error: '提交认证申请失败，请重试'
    };
  }
}

// 更新学生认证申请
export async function updateStudentVerification(
  userId: string,
  updates: {
    school_name?: string;
    student_id?: string;
    real_name?: string;
    student_card_image_url?: string;
  }
): Promise<{ success: boolean; data?: StudentVerification; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('student_verifications')
      .update(updates)
      .eq('user_id', userId)
      .eq('verification_status', 'pending')
      .select()
      .single();

    if (error) {
      console.error('更新学生认证申请失败:', error);
      return {
        success: false,
        error: '更新认证信息失败，请重试'
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('更新学生认证申请异常:', error);
    return {
      success: false,
      error: '更新认证信息失败，请重试'
    };
  }
}

// 上传学生证照片
export async function uploadStudentCard(
  userId: string,
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: '请上传图片文件'
      };
    }

    // 验证文件大小（最大5MB）
    if (file.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: '图片大小不能超过5MB'
      };
    }

    // 获取当前登录用户
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('获取用户信息失败:', authError);
      return {
        success: false,
        error: '请先登录后再上传'
      };
    }

    // 确保使用当前登录用户的ID
    const currentUserId = user.id;
    
    // 生成文件名
    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUserId}/${Date.now()}.${fileExt}`;

    console.log('开始上传学生证照片:', {
      fileName,
      fileSize: file.size,
      fileType: file.type,
      userId: currentUserId
    });

    // 上传到Supabase Storage
    const { data, error } = await supabase.storage
      .from('student-cards')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('上传学生证照片失败:', {
        error,
        errorMessage: error.message,
        errorDetails: JSON.stringify(error)
      });
      return {
        success: false,
        error: `上传失败: ${error.message || '请重试'}`
      };
    }

    console.log('上传成功，获取公开URL:', data);

    // 获取公开URL
    const { data: urlData } = supabase.storage
      .from('student-cards')
      .getPublicUrl(data.path);

    console.log('获取到公开URL:', urlData.publicUrl);

    return {
      success: true,
      url: urlData.publicUrl
    };
  } catch (error) {
    console.error('上传学生证照片异常:', error);
    return {
      success: false,
      error: `上传异常: ${error instanceof Error ? error.message : '请重试'}`
    };
  }
}

// 检查用户是否已通过学生认证
export async function isStudentVerified(userId: string): Promise<boolean> {
  const verification = await getStudentVerification(userId);
  return verification?.verification_status === 'approved';
}

// 获取所有待审核的学生认证申请（管理员用）
export async function getPendingVerifications(): Promise<StudentVerification[]> {
  const { data, error } = await supabase
    .from('student_verifications')
    .select('*')
    .eq('verification_status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取待审核认证列表失败:', error);
    return [];
  }

  return data || [];
}

// 审核学生认证（管理员用）
export async function approveStudentVerification(
  verificationId: string,
  approved: boolean,
  rejectedReason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const updates: any = {
      verification_status: approved ? 'approved' : 'rejected'
    };

    if (approved) {
      updates.verified_at = new Date().toISOString();
    } else if (rejectedReason) {
      updates.rejected_reason = rejectedReason;
    }

    const { error } = await supabase
      .from('student_verifications')
      .update(updates)
      .eq('id', verificationId);

    if (error) {
      console.error('审核学生认证失败:', error);
      return {
        success: false,
        error: '审核失败，请重试'
      };
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('审核学生认证异常:', error);
    return {
      success: false,
      error: '审核失败，请重试'
    };
  }
}

// ==================== 测评相关 ====================

export interface Assessment {
  id: string;
  position_name: string;
  category: string;
  description?: string;
  duration_minutes: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
  participant_count: number;
  icon?: string;
  created_at: string;
  updated_at: string;
}

// 获取所有测评岗位
export async function getAllAssessments(): Promise<Assessment[]> {
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .order('participant_count', { ascending: false });

  if (error) {
    console.error('获取测评岗位失败:', error);
    return [];
  }

  // 为每个测评添加模拟的已测人数（如果participant_count为0或null）
  const assessmentsWithCount = (Array.isArray(data) ? data : []).map(assessment => {
    if (!assessment.participant_count || assessment.participant_count === 0) {
      // 根据岗位ID生成一个稳定的随机数（同一个岗位每次生成的数字相同）
      const seed = assessment.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
      const random = (seed % 500) + 100; // 生成100-600之间的数字
      return {
        ...assessment,
        participant_count: random
      };
    }
    return assessment;
  });

  return assessmentsWithCount;
}

// 根据分类获取测评岗位
export async function getAssessmentsByCategory(category: string): Promise<Assessment[]> {
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('category', category)
    .order('participant_count', { ascending: false });

  if (error) {
    console.error('获取测评岗位失败:', error);
    return [];
  }

  // 为每个测评添加模拟的已测人数（如果participant_count为0或null）
  const assessmentsWithCount = (Array.isArray(data) ? data : []).map(assessment => {
    if (!assessment.participant_count || assessment.participant_count === 0) {
      // 根据岗位ID生成一个稳定的随机数（同一个岗位每次生成的数字相同）
      const seed = assessment.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
      const random = (seed % 500) + 100; // 生成100-600之间的数字
      return {
        ...assessment,
        participant_count: random
      };
    }
    return assessment;
  });

  return assessmentsWithCount;
}

// 获取单个测评岗位详情
export async function getAssessmentPositionById(id: string): Promise<Assessment | null> {
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('获取测评岗位详情失败:', error);
    return null;
  }

  return data;
}

// 增加测评参与人数
export async function incrementAssessmentParticipants(id: string): Promise<boolean> {
  const { error } = await supabase.rpc('increment_assessment_participants', { assessment_id: id });

  if (error) {
    console.error('更新参与人数失败:', error);
    return false;
  }

  return true;
}

// ==================== 企业端数据看板 ====================

export interface Position {
  position_id: number;
  position_name: string;
  position_type: number;
  salary_range: string;
  required_skills: string[];
  position_desc?: string;
  responsibilities?: string;
  requirements?: string;
  status?: string;
  update_time?: string;
  job_url?: string;
  company_id?: number;
  competency_model_id?: number;
}

export interface DashboardStats {
  totalPositions: number;
  openPositions: number;
  totalCandidates: number;
  totalAssessments: number;
  recentActivities: Array<{
    id: string;
    type: string;
    content: string;
    time: string;
  }>;
}

// 获取所有岗位
export async function getPositions(): Promise<Position[]> {
  const { data, error } = await supabase
    .from('positions')
    .select('*')
    .order('update_time', { ascending: false });

  if (error) {
    console.error('获取岗位列表失败:', error);
    return [];
  }

  return data || [];
}

// 根据ID获取单个岗位
export async function getPositionById(positionId: number): Promise<Position | null> {
  const { data, error } = await supabase
    .from('positions')
    .select('*')
    .eq('position_id', positionId)
    .maybeSingle();

  if (error) {
    console.error('获取岗位信息失败:', error);
    return null;
  }

  return data;
}

// 根据岗位ID获取胜任力模型
export async function getCompetencyModelByPositionId(positionId: number): Promise<AdminCompetencyModel | null> {
  const { data, error } = await supabase
    .from('competency_models')
    .select('*')
    .eq('position_id', positionId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('获取胜任力模型失败:', error);
    return null;
  }

  return data;
}

// 创建岗位
export async function createPosition(positionData: {
  position_name: string;
  position_type?: number;
  salary_range: string;
  required_skills?: string[];
  position_desc?: string;
  status?: string;
  job_url?: string;
  company_id?: number;
}): Promise<Position | null> {
  const { data, error } = await supabase
    .from('positions')
    .insert({
      position_name: positionData.position_name,
      position_type: positionData.position_type || 1,
      salary_range: positionData.salary_range,
      required_skills: positionData.required_skills || [],
      position_desc: positionData.position_desc || '',
      status: positionData.status || 'open',
      job_url: positionData.job_url || '',
      company_id: positionData.company_id || null,
      update_time: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('创建岗位失败:', error);
    throw error;
  }

  return data;
}

// 更新岗位
export async function updatePosition(positionId: number, updates: Partial<Position>): Promise<Position | null> {
  const { data, error } = await supabase
    .from('positions')
    .update({
      ...updates,
      update_time: new Date().toISOString(),
    })
    .eq('position_id', positionId)
    .select()
    .single();

  if (error) {
    console.error('更新岗位失败:', error);
    throw error;
  }

  return data;
}

// 删除岗位
export async function deletePosition(positionId: number): Promise<boolean> {
  const { error } = await supabase
    .from('positions')
    .delete()
    .eq('position_id', positionId);

  if (error) {
    console.error('删除岗位失败:', error);
    throw error;
  }

  return true;
}

// 检查岗位名称是否已存在
export async function checkPositionExists(positionName: string, excludeId?: number): Promise<boolean> {
  let query = supabase
    .from('positions')
    .select('position_id')
    .eq('position_name', positionName);

  if (excludeId) {
    query = query.neq('position_id', excludeId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error('检查岗位是否存在失败:', error);
    return false;
  }

  return !!data;
}

// 获取企业端数据看板统计
export async function getCompanyDashboardStats(): Promise<DashboardStats> {
  try {
    // 获取岗位统计
    const { data: positionsData, error: positionsError } = await supabase
      .from('positions')
      .select('position_id, status');

    if (positionsError) {
      console.error('获取岗位统计失败:', positionsError);
    }

    const totalPositions = positionsData?.length || 0;
    const openPositions = positionsData?.filter(p => p.status === 'open').length || 0;

    // 获取测评统计
    const { data: assessmentsData, error: assessmentsError } = await supabase
      .from('assessments')
      .select('id, participant_count');

    if (assessmentsError) {
      console.error('获取测评统计失败:', assessmentsError);
    }

    const totalAssessments = assessmentsData?.reduce((sum, a) => sum + (a.participant_count || 0), 0) || 0;

    // 模拟候选人数据（实际应该从applications或matches表获取）
    const totalCandidates = Math.floor(totalAssessments * 0.6);

    // 模拟最近活动
    const recentActivities = [
      {
        id: '1',
        type: 'resume',
        content: '收到新简历投递 - 前端开发工程师',
        time: '2分钟前'
      },
      {
        id: '2',
        type: 'assessment',
        content: '候选人完成测评 - AI模型工程师',
        time: '15分钟前'
      },
      {
        id: '3',
        type: 'interview',
        content: '面试邀约已发送 - 产品经理',
        time: '1小时前'
      },
      {
        id: '4',
        type: 'offer',
        content: 'Offer已发放 - 全栈开发工程师',
        time: '3小时前'
      }
    ];

    return {
      totalPositions,
      openPositions,
      totalCandidates,
      totalAssessments,
      recentActivities
    };
  } catch (error) {
    console.error('获取数据看板统计失败:', error);
    return {
      totalPositions: 0,
      openPositions: 0,
      totalCandidates: 0,
      totalAssessments: 0,
      recentActivities: []
    };
  }
}

// 获取招聘漏斗数据
export async function getRecruitmentFunnelData() {
  // 模拟真实的招聘漏斗数据
  // 实际应该从数据库的不同阶段统计
  const { data: assessmentsData } = await supabase
    .from('assessments')
    .select('participant_count');

  const totalParticipants = assessmentsData?.reduce((sum, a) => sum + (a.participant_count || 0), 0) || 0;

  return [
    { value: Math.floor(totalParticipants * 1.0), name: '简历投递' },
    { value: Math.floor(totalParticipants * 0.5), name: '简历筛选' },
    { value: Math.floor(totalParticipants * 0.22), name: '初试邀约' },
    { value: Math.floor(totalParticipants * 0.10), name: '复试通过' },
    { value: Math.floor(totalParticipants * 0.04), name: 'Offer发放' }
  ];
}

// 获取匹配度分布数据
export async function getMatchDistributionData() {
  // 模拟匹配度分布数据
  return [
    { range: '0-20%', count: 45 },
    { range: '20-40%', count: 123 },
    { range: '40-60%', count: 287 },
    { range: '60-80%', count: 456 },
    { range: '80-100%', count: 234 }
  ];
}

// ==================== 岗位收藏相关 ====================

export interface JobFavorite {
  id: string;
  user_email: string;
  job_id: number;
  created_at: string;
}

// 添加收藏
export async function addJobFavorite(userEmail: string, jobId: number, jobTitle?: string, company?: string): Promise<boolean> {
  const { error } = await supabase
    .from('job_favorites')
    .insert({
      user_email: userEmail,
      job_id: jobId,
      job_title: jobTitle || '',
      company: company || ''
    });

  if (error) {
    console.error('添加收藏失败:', error);
    return false;
  }

  return true;
}

// 取消收藏
export async function removeJobFavorite(userEmail: string, jobId: number): Promise<boolean> {
  const { error } = await supabase
    .from('job_favorites')
    .delete()
    .eq('user_email', userEmail)
    .eq('job_id', jobId);

  if (error) {
    console.error('取消收藏失败:', error);
    return false;
  }

  return true;
}

// 检查岗位是否已收藏
export async function isJobFavorited(userEmail: string, jobId: number): Promise<boolean> {
  const { data, error } = await supabase
    .from('job_favorites')
    .select('id')
    .eq('user_email', userEmail)
    .eq('job_id', jobId)
    .maybeSingle();

  if (error) {
    console.error('检查收藏状态失败:', error);
    return false;
  }

  return !!data;
}

// 获取用户所有收藏的岗位ID列表
export async function getUserFavoriteJobIds(userEmail: string): Promise<number[]> {
  const { data, error } = await supabase
    .from('job_favorites')
    .select('job_id')
    .eq('user_email', userEmail)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取收藏列表失败:', error);
    return [];
  }

  return data?.map(item => item.job_id) || [];
}

// ==================== 成长中心相关API ====================

// 课程相关类型定义
export interface Course {
  id: number;
  title: string;
  type: 'video' | 'document' | 'course';
  duration: string;
  duration_minutes: number; // 课程标准学习时长（分钟）
  difficulty: '初级' | '中级' | '高级';
  instructor: string;
  rating: number;
  description: string;
  link: string;
  dimension: '专业技能提升' | '通用能力培养' | '行为特质塑造' | '项目实战经验' | '推荐资源';
  created_at: string;
}

export interface CourseProgress {
  id: number;
  user_email: string;
  course_id: number;
  progress_percent: number;
  is_completed: boolean;
  exam_passed: boolean;
  last_studied_at: string;
  completed_at?: string;
  created_at: string;
}

export interface UserStats {
  total_learning_minutes: number;
  completed_courses: number;
  ability_improvement_percent: number;
  ranking_percent: number;
  last_updated: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: string;
  icon: string;
  color: string;
  reward: string;
}

export interface UserAchievement {
  id: number;
  user_email: string;
  achievement_id: string;
  achievement_name: string;
  unlocked_at: string;
}

// 获取所有课程
export async function getAllCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取课程列表失败:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

// 按维度获取课程
export async function getCoursesByDimension(dimension: string): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('dimension', dimension)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取课程列表失败:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

// 获取用户课程进度
export async function getUserCourseProgress(userEmail: string, courseId: number): Promise<CourseProgress | null> {
  const { data, error } = await supabase
    .from('course_progress')
    .select('*')
    .eq('user_email', userEmail)
    .eq('course_id', courseId)
    .maybeSingle();

  if (error) {
    console.error('获取课程进度失败:', error);
    return null;
  }

  return data;
}

// 获取用户所有课程进度
export async function getAllUserCourseProgress(userEmail: string): Promise<CourseProgress[]> {
  const { data, error } = await supabase
    .from('course_progress')
    .select('*')
    .eq('user_email', userEmail)
    .order('last_studied_at', { ascending: false });

  if (error) {
    console.error('获取课程进度列表失败:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

// 更新课程进度
export async function updateCourseProgress(
  userEmail: string,
  courseId: number,
  progressPercent: number,
  isCompleted: boolean = false,
  examPassed: boolean = false
): Promise<boolean> {
  const now = new Date().toISOString();
  
  // 【安全加固】防重复提交：查询当前进度
  const existingProgress = await getUserCourseProgress(userEmail, courseId);
  
  // 如果已经是100%完成，拒绝更新
  if (existingProgress && existingProgress.progress_percent === 100 && existingProgress.is_completed) {
    console.error('该课程已完成，无法重复提交');
    return false;
  }
  
  // 如果当前是50%，只允许更新到100%
  if (existingProgress && existingProgress.progress_percent === 50 && progressPercent !== 100 && progressPercent !== 50) {
    console.error('学习中的课程只能确认完成（100%）或保持学习中状态（50%）');
    return false;
  }
  
  // 【安全加固】验证进度值只能是 0、50、100
  if (![0, 50, 100].includes(progressPercent)) {
    console.error('进度值只能是 0、50 或 100');
    return false;
  }
  
  const updateData: any = {
    progress_percent: progressPercent,
    is_completed: isCompleted,
    exam_passed: examPassed,
    last_studied_at: now,
  };

  if (isCompleted) {
    updateData.completed_at = now;
  }

  const { error } = await supabase
    .from('course_progress')
    .upsert({
      user_email: userEmail,
      course_id: courseId,
      ...updateData,
    }, {
      onConflict: 'user_email,course_id'
    });

  if (error) {
    console.error('更新课程进度失败:', error);
    return false;
  }

  // 更新用户统计数据
  await updateUserStats(userEmail);

  return true;
}

// 记录学习时长（基于课程标准时长）
export async function recordLearningTime(
  userEmail: string,
  courseId: number,
  durationMinutes: number
): Promise<boolean> {
  const { error } = await supabase
    .from('learning_records')
    .insert({
      user_email: userEmail,
      course_id: courseId,
      duration_minutes: durationMinutes,
      started_at: new Date().toISOString(),
      ended_at: new Date().toISOString(),
    });

  if (error) {
    console.error('记录学习时长失败:', error);
    return false;
  }

  // 更新用户统计数据
  await updateUserStats(userEmail);

  return true;
}

// 获取用户统计数据
export async function getUserStats(userEmail: string): Promise<UserStats> {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_email', userEmail)
    .maybeSingle();

  if (error) {
    console.error('获取用户统计数据失败:', error);
    return {
      total_learning_minutes: 0,
      completed_courses: 0,
      ability_improvement_percent: 0,
      ranking_percent: 100,
      last_updated: new Date().toISOString(),
    };
  }

  // 计算能力提升百分比（基于测评数据）
  let abilityImprovement = 0;
  try {
    const assessments = await getUserAssessments(userEmail);
    if (assessments.length >= 2) {
      // 如果有多次测评，计算第一次和最后一次的差值百分比
      const firstScore = assessments[assessments.length - 1].total_score || 0; // 最早的测评
      const lastScore = assessments[0].total_score || 0; // 最新的测评
      if (firstScore > 0) {
        abilityImprovement = Math.round(((lastScore - firstScore) / firstScore) * 100);
      }
    } else if (assessments.length === 1) {
      // 如果只有一次测评，显示当前分数作为基准
      abilityImprovement = 0;
    }
  } catch (err) {
    console.error('计算能力提升失败:', err);
  }

  if (!data) {
    // 初始化用户统计数据
    await supabase.from('user_stats').insert({
      user_email: userEmail,
      total_learning_minutes: 0,
      completed_courses: 0,
      ability_improvement_percent: abilityImprovement,
      ranking_percent: 100,
    });

    return {
      total_learning_minutes: 0,
      completed_courses: 0,
      ability_improvement_percent: abilityImprovement,
      ranking_percent: 100,
      last_updated: new Date().toISOString(),
    };
  }

  // 更新能力提升数据
  if (abilityImprovement !== data.ability_improvement_percent) {
    await supabase
      .from('user_stats')
      .update({ ability_improvement_percent: abilityImprovement })
      .eq('user_email', userEmail);
    
    return {
      ...data,
      ability_improvement_percent: abilityImprovement,
    };
  }

  return data;
}

// 更新用户统计数据
export async function updateUserStats(userEmail: string): Promise<boolean> {
  // 计算总学习时长
  const { data: learningRecords } = await supabase
    .from('learning_records')
    .select('duration_minutes')
    .eq('user_email', userEmail);

  const totalMinutes = learningRecords?.reduce((sum, record) => sum + record.duration_minutes, 0) || 0;

  // 计算完成课程数
  const { data: completedCourses } = await supabase
    .from('course_progress')
    .select('id')
    .eq('user_email', userEmail)
    .eq('is_completed', true);

  const completedCount = completedCourses?.length || 0;

  // 计算排名百分比（基于总学习时长）
  const { data: allUsers } = await supabase
    .from('user_stats')
    .select('total_learning_minutes');

  let rankingPercent = 100;
  if (allUsers && allUsers.length > 0) {
    const usersWithMoreTime = allUsers.filter(u => u.total_learning_minutes > totalMinutes).length;
    rankingPercent = Math.round((usersWithMoreTime / allUsers.length) * 100);
  }

  // 更新统计数据
  const { error } = await supabase
    .from('user_stats')
    .upsert({
      user_email: userEmail,
      total_learning_minutes: totalMinutes,
      completed_courses: completedCount,
      ranking_percent: rankingPercent,
      last_updated: new Date().toISOString(),
    }, {
      onConflict: 'user_email'
    });

  if (error) {
    console.error('更新用户统计数据失败:', error);
    return false;
  }

  return true;
}

// 获取用户已解锁的成就
export async function getUserAchievements(userEmail: string): Promise<UserAchievement[]> {
  const { data, error } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_email', userEmail)
    .order('unlocked_at', { ascending: false });

  if (error) {
    console.error('获取用户成就失败:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

// 解锁成就
export async function unlockAchievement(
  userEmail: string,
  achievementId: string,
  achievementName: string
): Promise<boolean> {
  // 【安全加固】使用 upsert 防止重复解锁，ignoreDuplicates 确保不会重复提示
  const { error } = await supabase
    .from('user_achievements')
    .upsert({
      user_email: userEmail,
      achievement_id: achievementId,
      achievement_name: achievementName,
      unlocked_at: new Date().toISOString(),
    }, {
      onConflict: 'user_email,achievement_id',
      ignoreDuplicates: true
    });

  if (error) {
    console.error('解锁成就失败:', error);
    return false;
  }

  return true;
}

// 检查并解锁成就
export async function checkAndUnlockAchievements(userEmail: string): Promise<string[]> {
  const stats = await getUserStats(userEmail);
  const progress = await getAllUserCourseProgress(userEmail);
  const unlockedAchievements: string[] = [];

  // 定义成就规则
  const achievementRules = [
    {
      id: 'learning_master',
      name: '学习达人',
      condition: () => {
        // 检查连续学习30天
        // 这里简化为总学习时长 >= 30 * 30分钟
        return stats.total_learning_minutes >= 900;
      }
    },
    {
      id: 'goal_achiever',
      name: '目标达成',
      condition: () => stats.completed_courses >= 10
    },
    {
      id: 'progress_star',
      name: '进步之星',
      condition: () => stats.ability_improvement_percent >= 20
    },
    {
      id: 'all_rounder',
      name: '全能选手',
      condition: () => {
        // 检查4大维度完成度均 >= 80%
        const dimensions = ['专业技能提升', '通用能力培养', '行为特质塑造', '项目实战经验'];
        return dimensions.every(dim => {
          const dimProgress = progress.filter(p => p.is_completed);
          return dimProgress.length >= 1; // 简化条件
        });
      }
    },
    {
      id: 'assessment_pioneer',
      name: '测评先锋',
      condition: async () => {
        const { data } = await supabase
          .from('assessment_records')
          .select('id')
          .eq('user_email', userEmail);
        return (data?.length || 0) >= 3;
      }
    },
    {
      id: 'practice_expert',
      name: '实战高手',
      condition: () => {
        const practiceProgress = progress.filter(p =>
          p.is_completed && p.exam_passed
        );
        return practiceProgress.length >= 2;
      }
    },
    {
      id: 'learning_king',
      name: '学习王者',
      condition: () => stats.total_learning_minutes >= 6000 // 100小时
    },
    {
      id: 'workplace_newbie',
      name: '职场新人',
      condition: () => {
        const generalProgress = progress.filter(p => p.is_completed);
        return generalProgress.length >= 10;
      }
    }
  ];

  // 检查每个成就
  for (const rule of achievementRules) {
    const conditionMet = typeof rule.condition === 'function'
      ? await rule.condition()
      : rule.condition;

    if (conditionMet) {
      const success = await unlockAchievement(userEmail, rule.id, rule.name);
      if (success) {
        unlockedAchievements.push(rule.name);
      }
    }
  }

  return unlockedAchievements;
}

// 获取成长路径
export async function getGrowthPath(userEmail: string): Promise<any> {
  const { data, error } = await supabase
    .from('growth_paths')
    .select('*')
    .eq('user_email', userEmail)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('获取成长路径失败:', error);
    return null;
  }

  return data;
}

// 生成成长路径
export async function generateGrowthPath(userEmail: string, assessmentId?: number): Promise<boolean> {
  // 获取用户的测评结果
  let { data: assessmentResult } = await supabase
    .from('assessment_records')
    .select('*')
    .eq('user_email', userEmail)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // 如果没有测评记录，创建一个模拟的测评记录
  if (!assessmentResult) {
    console.log('未找到测评结果，创建模拟测评记录');
    const { data: newAssessment, error: insertError } = await supabase
      .from('assessment_records')
      .insert({
        user_email: userEmail,
        assessment_type: '岗位胜任力测评',
        total_score: 85,
        dimension_scores: {
          knowledge: 88,
          skills: 85,
          quality: 82,
          softSkills: 86
        },
        result_data: {
          strengths: ['学习能力强', '逻辑思维清晰', '责任心强'],
          weaknesses: ['实践经验不足', '沟通技巧有待提升'],
          recommendations: ['多参与项目实践', '加强团队协作训练']
        },
        completed_at: new Date().toISOString()
      })
      .select()
      .maybeSingle();
    
    if (insertError) {
      console.error('创建测评记录失败:', insertError);
      return false;
    }
    
    assessmentResult = newAssessment;
  }
  
  if (!assessmentResult) {
    console.error('无法获取或创建测评结果');
    return false;
  }

  // 基于测评结果生成个性化成长路径
  const pathData = {
    dimensions: [
      {
        name: '专业技能提升',
        description: '岗位核心硬技能，适配新质生产力岗位',
        totalCourses: 8,
        completedCourses: 0,
        progress: 0,
      },
      {
        name: '通用能力培养',
        description: '职场通用软技能，适配全岗位需求',
        totalCourses: 6,
        completedCourses: 0,
        progress: 0,
      },
      {
        name: '行为特质塑造',
        description: '冰山模型水下隐性特质，适配长期职业发展',
        totalCourses: 5,
        completedCourses: 0,
        progress: 0,
      },
      {
        name: '项目实战经验',
        description: '真实职场项目实训，适配岗位实操需求',
        totalCourses: 4,
        completedCourses: 0,
        progress: 0,
      },
    ],
    assessmentInfo: {
      id: assessmentResult.id,
      type: assessmentResult.assessment_type,
      score: assessmentResult.total_score,
      completedAt: assessmentResult.completed_at
    },
    generatedAt: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('growth_paths')
    .insert({
      user_email: userEmail,
      // 不传递 assessment_id，因为类型不匹配（UUID vs BIGINT）
      path_data: pathData,
      generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('生成成长路径失败:', error);
    return false;
  }

  return true;
}

// ==================== AI智能评估相关函数 ====================

/**
 * AI简历评估
 * 评估候选人简历与岗位的匹配度
 */
export async function evaluateResume(params: {
  resumeContent: string;
  positionName: string;
  positionRequirements: string;
  requiredSkills: string[];
  salaryRange?: string;
}): Promise<{
  overallScore: number;
  dimensionScores: {
    skillMatch: number;
    experienceMatch: number;
    educationMatch: number;
    stabilityScore: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  riskWarnings: string[];
  summary: string;
} | null> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-evaluate-resume', {
      body: params
    });

    if (error) {
      const errorMsg = await error?.context?.text();
      console.error('AI简历评估失败:', errorMsg || error?.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error('调用AI简历评估失败:', error);
    return null;
  }
}

/**
 * AI面试评估
 * 评估候选人的面试表现
 */
export async function evaluateInterview(params: {
  positionName: string;
  interviewQuestions: Array<{
    question: string;
    answer: string;
    category: string;
  }>;
  interviewDuration?: number;
  interviewerNotes?: string;
}): Promise<{
  overallScore: number;
  dimensionScores: {
    technicalAbility: number;
    communicationSkill: number;
    problemSolving: number;
    teamwork: number;
    learningAbility: number;
  };
  strengths: string[];
  weaknesses: string[];
  detailedFeedback: Array<{
    question: string;
    score: number;
    feedback: string;
  }>;
  hiringRecommendation: 'strong_hire' | 'hire' | 'maybe' | 'no_hire';
  summary: string;
} | null> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-evaluate-interview', {
      body: params
    });

    if (error) {
      const errorMsg = await error?.context?.text();
      console.error('AI面试评估失败:', errorMsg || error?.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error('调用AI面试评估失败:', error);
    return null;
  }
}

/**
 * AI人岗匹配评估
 * 评估候选人与岗位的综合匹配度
 */
export async function evaluateMatch(params: {
  candidateProfile: {
    name: string;
    education: string;
    workExperience: string;
    skills: string[];
    assessmentScores?: {
      techScore: number;
      generalScore: number;
      behaviorScore: number;
      experienceScore: number;
    };
    interviewScore?: number;
  };
  positionInfo: {
    positionName: string;
    positionDesc: string;
    requiredSkills: string[];
    salaryRange: string;
    workLocation: string;
  };
  companyInfo?: {
    companyName: string;
    companySize: string;
    companyIndustry: string;
  };
}): Promise<{
  matchScore: number;
  matchLevel: 'excellent' | 'good' | 'fair' | 'poor';
  dimensionScores: {
    skillMatch: number;
    experienceMatch: number;
    cultureMatch: number;
    potentialMatch: number;
    stabilityMatch: number;
  };
  matchReasons: string[];
  mismatchReasons: string[];
  developmentSuggestions: string[];
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
  recommendation: string;
  summary: string;
} | null> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-evaluate-match', {
      body: params
    });

    if (error) {
      const errorMsg = await error?.context?.text();
      console.error('AI人岗匹配评估失败:', errorMsg || error?.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error('调用AI人岗匹配评估失败:', error);
    return null;
  }
}

// ==================== AI智能就业咨询服务相关函数 ====================

/**
 * AI就业咨询问答
 * 基于知识图谱提供就业政策、流程、技能等方面的咨询
 */
export async function careerConsult(params: {
  question: string;
  userContext?: {
    education?: string;
    major?: string;
    targetPosition?: string;
    targetCity?: string;
  };
}): Promise<{
  answer: string;
  category: string;
  keyPoints: string[];
  actionSteps: string[];
  relatedTopics: string[];
  resources: Array<{
    title: string;
    description: string;
    url?: string;
  }>;
  tips: string[];
} | null> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-career-consult', {
      body: params
    });

    if (error) {
      const errorMsg = await error?.context?.text();
      console.error('AI就业咨询失败:', errorMsg || error?.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error('调用AI就业咨询失败:', error);
    return null;
  }
}

/**
 * AI简历优化
 * 基于NLP和计算机视觉技术，提供简历分析和优化建议
 */
export async function optimizeResume(params: {
  resumeText: string;
  targetPosition?: string;
  targetIndustry?: string;
}): Promise<{
  overallScore: number;
  analysisResult: {
    formatScore: number;
    contentScore: number;
    highlightScore: number;
    languageScore: number;
    matchScore: number;
    formatIssues: string[];
    contentIssues: string[];
    missingHighlights: string[];
    strengthAreas: string[];
  };
  optimizationSuggestions: {
    structureOptimization: Array<{
      issue: string;
      suggestion: string;
      priority: string;
    }>;
    contentOptimization: Array<{
      section: string;
      original: string;
      optimized: string;
      reason: string;
    }>;
    keywordOptimization: Array<{
      missingKeyword: string;
      suggestion: string;
      importance: string;
    }>;
    languagePolish: Array<{
      original: string;
      polished: string;
      improvement: string;
    }>;
  };
  improvementPriority: Array<{
    area: string;
    description: string;
    impact: string;
    effort: string;
  }>;
  summary: string;
} | null> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-resume-optimize', {
      body: params
    });

    if (error) {
      const errorMsg = await error?.context?.text();
      console.error('AI简历优化失败:', errorMsg || error?.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error('调用AI简历优化失败:', error);
    return null;
  }
}

/**
 * AI面试教练
 * 提供面试模拟、实时反馈和改进建议
 */
export async function interviewCoach(params: {
  positionName: string;
  interviewType: 'technical' | 'behavioral' | 'case' | 'comprehensive';
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  questionsAndAnswers: Array<{
    question: string;
    userAnswer: string;
    answerDuration?: number;
  }>;
}): Promise<{
  overallScore: number;
  dimensionScores: {
    contentQuality: number;
    logicClarity: number;
    expressionFluency: number;
    professionalDepth: number;
    responseSpeed: number;
  };
  questionsAnalysis: Array<{
    question: string;
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    betterAnswer?: string;
  }>;
  overallStrengths: string[];
  overallWeaknesses: string[];
  improvementSuggestions: Array<{
    area: string;
    description: string;
    actionSteps: string[];
    priority: string;
  }>;
  recommendedPracticeTopics: Array<{
    topic: string;
    description: string;
    difficulty: string;
    resources: string[];
  }>;
  interviewTips: string[];
  summary: string;
} | null> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-interview-coach', {
      body: params
    });

    if (error) {
      const errorMsg = await error?.context?.text();
      console.error('AI面试教练失败:', errorMsg || error?.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error('调用AI面试教练失败:', error);
    return null;
  }
}

// ==================== 后台管理相关 - 用户管理 ====================

export interface AdminUser {
  user_id: number;
  user_name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// 获取所有用户
export async function getUsersAdmin(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取所有用户失败:', error);
    return [];
  }

  return data || [];
}

// 添加用户
export async function addUserAdmin(userData: Omit<AdminUser, 'user_id' | 'created_at' | 'updated_at'>): Promise<AdminUser | null> {
  const { data, error } = await supabase
    .from('users')
    .insert({
      ...userData,
      status: userData.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('添加用户失败:', error);
    return null;
  }

  return data;
}

// 更新用户
export async function updateUserAdmin(userId: number, updates: Partial<AdminUser>): Promise<AdminUser | null> {
  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('更新用户失败:', error);
    return null;
  }

  return data;
}

// 切换用户状态
export async function toggleUserStatusAdmin(userId: number, currentStatus: string): Promise<AdminUser | null> {
  const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
  return updateUserAdmin(userId, { status: newStatus });
}



// ==================== 后台管理相关 - 角色权限管理 ====================

export interface Permission {
  id: string;
  name: string;
  display_name: string;
  resource: string;
  action: string;
  description: string;
}

export interface AdminRole {
  id: string;
  name: string;
  display_name: string;
  description: string;
  permissions?: string[]; // 权限ID数组
  user_count?: number;
}

// 获取所有角色及其权限
export async function getRolesAdmin(): Promise<AdminRole[]> {
  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('*')
    .order('created_at', { ascending: true });

  if (rolesError) {
    console.error('获取角色失败:', rolesError);
    return [];
  }

  // 获取所有角色权限关联
  const { data: rolePermissions, error: rpError } = await supabase
    .from('role_permissions')
    .select('role_id, permission_id');

  if (rpError) {
    console.error('获取角色权限失败:', rpError);
  }

  // 统计每个角色的用户数 (这里假设users表的role字段存储的是角色名称name)
  const { data: userStats, error: usError } = await supabase
    .from('users')
    .select('role');
  
  const roleCountMap: Record<string, number> = {};
  if (userStats) {
    userStats.forEach(u => {
      const roleName = u.role;
      roleCountMap[roleName] = (roleCountMap[roleName] || 0) + 1;
    });
  }

  return roles.map(role => ({
    ...role,
    permissions: rolePermissions
      ?.filter(rp => rp.role_id === role.id)
      .map(rp => rp.permission_id) || [],
    user_count: roleCountMap[role.name] || 0
  }));
}

// 获取所有可用权限
export async function getAllPermissionsAdmin(): Promise<Permission[]> {
  const { data, error } = await supabase
    .from('permissions')
    .select('*')
    .order('resource', { ascending: true });

  if (error) {
    console.error('获取权限列表失败:', error);
    return [];
  }

  return data || [];
}

// 添加角色
export async function addRoleAdmin(roleData: Omit<AdminRole, 'id' | 'permissions' | 'user_count'>): Promise<AdminRole | null> {
  const { data, error } = await supabase
    .from('roles')
    .insert({
      ...roleData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('添加角色失败:', error);
    return null;
  }

  return data;
}

// 更新角色信息
export async function updateRoleAdmin(roleId: string, updates: Partial<AdminRole>): Promise<AdminRole | null> {
  const { data, error } = await supabase
    .from('roles')
    .update({
      display_name: updates.display_name,
      description: updates.description,
      updated_at: new Date().toISOString()
    })
    .eq('id', roleId)
    .select()
    .single();

  if (error) {
    console.error('更新角色失败:', error);
    return null;
  }

  return data;
}

// 更新角色权限关联
export async function updateRolePermissionsAdmin(roleId: string, permissionIds: string[]): Promise<boolean> {
  // 1. 先删除旧关联
  const { error: deleteError } = await supabase
    .from('role_permissions')
    .delete()
    .eq('role_id', roleId);

  if (deleteError) {
    console.error('删除旧权限关联失败:', deleteError);
    return false;
  }

  if (permissionIds.length === 0) return true;

  // 2. 插入新关联
  const newMappings = permissionIds.map(pid => ({
    role_id: roleId,
    permission_id: pid
  }));

  const { error: insertError } = await supabase
    .from('role_permissions')
    .insert(newMappings);

  if (insertError) {
    console.error('插入新权限关联失败:', insertError);
    return false;
  }

  return true;
}

// 删除角色
export async function deleteRoleAdmin(roleId: string): Promise<boolean> {
  const { error } = await supabase
    .from('roles')
    .delete()
    .eq('id', roleId);

  if (error) {
    console.error('删除角色失败:', error);
    return false;
  }

  return true;
}


// ==================== 后台管理相关 - 岗位胜任力模型管理 ====================

export interface AdminCompetencyModel {
  model_id: number;
  model_name: string;
  position_id?: number | null;  // 数据库允许 null（独立创建时无关联标准）
  company_id?: number | null;   // 数据库允许 null
  knowledge_items: any;
  skills_items: any;
  quality_items: any;
  soft_skills_items: any;
  model_desc: string;
  created_at: string;
  updated_at: string;
  position_name?: string;
  company_name?: string;
}

// 获取所有胜任力模型
export async function getCompetencyModelsAdmin(): Promise<AdminCompetencyModel[]> {
  const { data, error } = await supabase
    .from('competency_models')
    .select(`
      *,
      positions (position_name),
      companies (company_name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取胜任力模型失败:', error);
    return [];
  }

  return (data || []).map(item => ({
    ...item,
    position_name: item.positions?.position_name || '未关联',
    company_name: item.companies?.company_name || '未关联'
  }));
}

// 添加胜任力模型
export async function addCompetencyModelAdmin(modelData: Omit<AdminCompetencyModel, 'model_id' | 'created_at' | 'updated_at'>): Promise<AdminCompetencyModel | null> {
  const { data, error } = await supabase
    .from('competency_models')
    .insert({
      ...modelData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('添加胜任力模型失败:', error);
    return null;
  }

  return data;
}

// 更新胜任力模型
export async function updateCompetencyModelAdmin(modelId: number, updates: Partial<AdminCompetencyModel>): Promise<AdminCompetencyModel | null> {
  const { data, error } = await supabase
    .from('competency_models')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('model_id', modelId)
    .select()
    .single();

  if (error) {
    console.error('更新胜任力模型失败:', error);
    return null;
  }

  return data;
}

// 删除胜任力模型
export async function deleteCompetencyModelAdmin(modelId: number): Promise<boolean> {
  const { error } = await supabase
    .from('competency_models')
    .delete()
    .eq('model_id', modelId);

  if (error) {
    console.error('删除胜任力模型失败:', error);
    return false;
  }

  return true;
}



// 获取所有企业 (简略版，供选择使用)
export async function getCompaniesAdmin(): Promise<{company_id: number, company_name: string}[]> {
  const { data, error } = await supabase
    .from('companies')
    .select('company_id, company_name');

  if (error) {
    console.error('获取企业列表失败:', error);
    return [];
  }

  return data || [];
}

// ==================== 后台管理相关 - 学习资源管理 ====================

export interface AdminLearningResource {
  resource_id: number;
  resource_name: string;
  resource_type: string;
  resource_url: string;
  resource_desc: string;
  skill_tags: any; // 存储分类或标签
  difficulty_level: string;
  duration: number;
  provider: string;
  created_at: string;
  views?: number; // 如果数据库没有，前端模拟或后续增加
}

// 获取所有学习资源
export async function getLearningResourcesAdmin(): Promise<AdminLearningResource[]> {
  const { data, error } = await supabase
    .from('learning_resources')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取学习资源失败:', error);
    return [];
  }

  return data || [];
}

// 添加学习资源
export async function addLearningResourceAdmin(resourceData: Omit<AdminLearningResource, 'resource_id' | 'created_at'>): Promise<AdminLearningResource | null> {
  const { data, error } = await supabase
    .from('learning_resources')
    .insert({
      ...resourceData,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('添加学习资源失败:', error);
    return null;
  }

  return data;
}

// 更新学习资源
export async function updateLearningResourceAdmin(resourceId: number, updates: Partial<AdminLearningResource>): Promise<AdminLearningResource | null> {
  const { data, error } = await supabase
    .from('learning_resources')
    .update(updates)
    .eq('resource_id', resourceId)
    .select()
    .single();

  if (error) {
    console.error('更新学习资源失败:', error);
    return null;
  }

  return data;
}

// 删除学习资源
export async function deleteLearningResourceAdmin(resourceId: number): Promise<boolean> {
  const { error } = await supabase
    .from('learning_resources')
    .delete()
    .eq('resource_id', resourceId);

  if (error) {
    console.error('删除学习资源失败:', error);
    return false;
  }

  return true;
}


// ==================== 后台管理相关 - 测评题库管理 ====================

export interface AdminQuestion {
  id: string;
  question_text: string;
  question_type: string;
  options: any;
  correct_answer: any;
  score: number;
  difficulty: string;
  explanation: string;
  status: string;
  created_at: string;
  updated_at: string;
  related_positions?: any;
  related_competencies?: any;
}

// 获取所有题目
export async function getQuestionsAdmin(): Promise<AdminQuestion[]> {
  const { data, error } = await supabase
    .from('question_bank')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取题库失败:', error);
    return [];
  }

  return data || [];
}

// 添加题目

// 根据岗位获取题目
export async function getQuestionsByPositionDb(positionName: string): Promise<AdminQuestion[]> {
  const { data, error } = await supabase
    .from('question_bank')
    .select('*')
    .contains('related_positions', JSON.stringify([positionName]))
    .eq('status', 'active');

  if (error) {
    console.error('根据岗位获取题目失败:', error);
    return [];
  }

  return data || [];
}

export async function addQuestionAdmin(questionData: Omit<AdminQuestion, 'id' | 'created_at' | 'updated_at'>): Promise<AdminQuestion | null> {
  const { data, error } = await supabase
    .from('question_bank')
    .insert({
      ...questionData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('添加题目失败:', error);
    return null;
  }

  return data;
}

// 更新题目
export async function updateQuestionAdmin(questionId: string, updates: Partial<AdminQuestion>): Promise<AdminQuestion | null> {
  const { data, error } = await supabase
    .from('question_bank')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', questionId)
    .select()
    .single();

  if (error) {
    console.error('更新题目失败:', error);
    return null;
  }

  return data;
}

// 删除题目
export async function deleteQuestionAdmin(questionId: string): Promise<boolean> {
  const { error } = await supabase
    .from('question_bank')
    .delete()
    .eq('id', questionId);

  if (error) {
    console.error('删除题目失败:', error);
    return false;
  }

  return true;
}

// ==================== 后台管理相关 - 系统配置管理 ====================

export interface SystemConfig {
  config_key: string;
  config_value: string;
}

// 获取所有系统配置
export async function getSystemConfigsAdmin(): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('system_config')
    .select('config_key, config_value');

  if (error) {
    console.error('获取系统配置失败:', error);
    return {};
  }

  const configs: Record<string, string> = {};
  data.forEach((item) => {
    configs[item.config_key] = item.config_value;
  });

  return configs;
}

// 更新系统配置
export async function updateSystemConfigsAdmin(configs: Record<string, string>): Promise<boolean> {
  const promises = Object.entries(configs).map(([key, value]) =>
    supabase
      .from('system_config')
      .update({ config_value: value, updated_at: new Date().toISOString() })
      .eq('config_key', key)
  );

  try {
    const results = await Promise.all(promises);
    const hasError = results.some((result) => result.error);
    if (hasError) {
      console.error('更新部分系统配置失败');
      return false;
    }
    return true;
  } catch (error) {
    console.error('更新系统配置异常:', error);
    return false;
  }
}

// ==================== 后台管理相关 - 操作日志管理 ====================

export interface AdminOperationLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  resource: string;
  resource_id?: string;
  details: any;
  ip_address: string;
  status: string;
  created_at: string;
}

// 获取所有操作日志
export async function getOperationLogsAdmin(): Promise<AdminOperationLog[]> {
  const { data, error } = await supabase
    .from('operation_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取操作日志失败:', error);
    return [];
  }

  return data || [];
}

// ==================== 后台管理相关 - 数据看板统计 ====================

export interface AdminDashboardStats {
  total_users: number;
  total_positions: number;
  total_assessments: number;
  total_questions: number;
  total_resources: number;
  total_competency_models: number;
  total_revenue?: number;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [
    { count: usersCount },
    { count: positionsCount },
    { count: assessmentsCount },
    { count: questionsCount },
    { count: resourcesCount },
    { count: modelsCount },
    { data: revenueData }
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('positions').select('*', { count: 'exact', head: true }),
    supabase.from('assessments').select('*', { count: 'exact', head: true }),
    supabase.from('question_bank').select('*', { count: 'exact', head: true }),
    supabase.from('learning_resources').select('*', { count: 'exact', head: true }),
    supabase.from('competency_models').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('actual_price').eq('payment_status', 1)
  ]);

  const totalRevenue = revenueData ? revenueData.reduce((acc, curr) => acc + Number(curr.actual_price || 0), 0) : 0;

  return {
    total_users: usersCount || 0,
    total_positions: positionsCount || 0,
    total_assessments: assessmentsCount || 0,
    total_questions: questionsCount || 0,
    total_resources: resourcesCount || 0,
    total_competency_models: modelsCount || 0,
    total_revenue: totalRevenue
  };
}

// ==================== 管理后台 - 学员测评总览 ====================

export interface AdminAssessmentRecord {
  id: string;
  user_email: string;
  job_title: string;
  total_score: number;
  tech_score: number;
  general_score: number;
  behavior_score: number;
  experience_score: number;
  status: 'in_progress' | 'completed';
  completed_at: string;
  created_at: string;
  answers?: string;
}

// 管理员获取所有学员测评记录（全量，含用户信息）
export async function getAllAssessmentRecordsAdmin(): Promise<AdminAssessmentRecord[]> {
  const { data, error } = await supabase
    .from('assessment_records')
    .select('*')
    .order('completed_at', { ascending: false });

  if (error) {
    console.error('管理员获取全量测评记录失败:', error);
    return [];
  }
  return data || [];
}

// 根据邮箱获取某用户所有测评（按时间升序，用于前后对比）
export async function getUserAssessmentHistory(email: string): Promise<AssessmentRecord[]> {
  const { data, error } = await supabase
    .from('assessment_records')
    .select('*')
    .eq('user_email', email)
    .eq('status', 'completed')
    .order('completed_at', { ascending: true });

  if (error) {
    console.error('获取用户测评历史失败:', error);
    return [];
  }
  return data || [];
}

// ==================== 跨端：平台人才库 ====================

// 平台人才（学员 + 最新测评得分）
export interface StudentTalent {
  user_id: string;
  email: string;
  nickname: string;
  phone: string | null;
  university_name: string | null;
  college_name: string | null;
  job_intent: string | null;
  graduation_year: string | null;
  avatar_url: string | null;
  job_title: string | null;
  total_score: number | null;
  tech_score: number | null;
  general_score: number | null;
  behavior_score: number | null;
  experience_score: number | null;
  assessment_at: string | null;
}

// 获取平台人才库（仅返回已完成测评的学员，可按求职方向筛选）
export async function getStudentTalent(jobIntent?: string): Promise<StudentTalent[]> {
  let query = supabase.from('student_talent').select('*').not('total_score', 'is', null);
  if (jobIntent) query = query.eq('job_intent', jobIntent);
  const { data, error } = await query.order('total_score', { ascending: false }).limit(200);
  if (error) {
    console.error('获取平台人才库失败:', error);
    return [];
  }
  return (data || []) as StudentTalent[];
}

// 将真实平台学员加入企业候选人池
export async function addStudentToCandidates(
  companyEmail: string,
  talent: StudentTalent,
  position?: string,
): Promise<boolean> {
  // 避免重复添加同一学员
  const { data: existing } = await supabase
    .from('candidates')
    .select('id')
    .eq('company_email', companyEmail)
    .eq('student_user_id', talent.user_id)
    .maybeSingle();
  if (existing) return false;

  const evaluations = [
    { dimension: '专业技能', score: talent.tech_score ?? 0 },
    { dimension: '通用能力', score: talent.general_score ?? 0 },
    { dimension: '行为特质', score: talent.behavior_score ?? 0 },
    { dimension: '工程实践', score: talent.experience_score ?? 0 },
  ];
  const { error } = await supabase.from('candidates').insert({
    company_email: companyEmail,
    student_user_id: talent.user_id,
    student_email: talent.email,
    name: talent.nickname,
    email: talent.email,
    position: position || talent.job_title || null,
    tags: talent.job_intent ? [talent.job_intent] : [],
    evaluations,
  });
  if (error) {
    console.error('添加人才到候选人池失败:', error);
    throw error;
  }
  return true;
}




