import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://backend.appmiaoda.com/projects/supabase290412401096962048';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoyMDg4NjY2OTEyLCJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJhbm9uIiwic3ViIjoiYW5vbiJ9.FEaX8KFrqQSccYu6Dk5nZ-D-YYS7OSH_A4v5YyfaeXQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 当前用户邮箱（模拟登录状态）
export const getCurrentUserEmail = () => {
  return localStorage.getItem('user_email') || 'zhangsan@example.com';
};

export const setCurrentUserEmail = (email: string) => {
  localStorage.setItem('user_email', email);
};
