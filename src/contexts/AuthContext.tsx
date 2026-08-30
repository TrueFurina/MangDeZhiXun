import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUserEmail, setCurrentUserEmail } from '@/lib/supabase';
import { getUserProfile, type UserProfile } from '@/db/api';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userInfo: UserProfile) => void;
  logout: () => void;
  updateUser: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 检查登录状态
  useEffect(() => {
    checkAuthStatus();
    // 监听应用内登录态变更事件，及时刷新当前用户（如登录/注册/演示登录后）
    const handler = () => checkAuthStatus();
    window.addEventListener('app-auth-change', handler);
    return () => window.removeEventListener('app-auth-change', handler);
  }, []);

  const checkAuthStatus = async () => {
    try {
      // 从localStorage获取用户信息
      const userEmail = localStorage.getItem('user_email');
      const userId = localStorage.getItem('user_id');
      const userNickname = localStorage.getItem('user_nickname');
      const userPhone = localStorage.getItem('user_phone');
      const userVipLevel = localStorage.getItem('user_vip_level') as 'free' | 'premium' | 'enterprise';
      const userAvatarUrl = localStorage.getItem('user_avatar_url');
      const userRole = localStorage.getItem('user_role') as 'student' | 'company_hr' | 'university_staff' | 'admin';

      if (userEmail && userId) {
        // 尝试从数据库获取最新用户信息
        const profile = await getUserProfile(userEmail);
        
        if (profile) {
          setUser(profile);
          setCurrentUserEmail(profile.email);
          if (profile.user_role) {
            localStorage.setItem('user_role', profile.user_role);
          }
        } else {
          // 如果数据库没有，使用localStorage的数据
          setUser({
            id: userId,
            email: userEmail,
            nickname: userNickname || '用户',
            phone: userPhone || '',
            avatar_url: userAvatarUrl || '',
            vip_level: userVipLevel || 'free',
            vip_expire_at: undefined,
            user_role: userRole || 'student',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          setCurrentUserEmail(userEmail);
        }
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 从数据库获取最新 profile 并同步到 state 与 localStorage
  const refreshProfile = async (email: string) => {
    try {
      const profile = await getUserProfile(email);
      if (profile) {
        setUser(profile);
        setCurrentUserEmail(profile.email);
        if (profile.user_role) localStorage.setItem('user_role', profile.user_role);
        if (profile.nickname) localStorage.setItem('user_nickname', profile.nickname);
        if (profile.phone) localStorage.setItem('user_phone', profile.phone);
        if (profile.avatar_url) localStorage.setItem('user_avatar_url', profile.avatar_url);
        if (profile.vip_level) localStorage.setItem('user_vip_level', profile.vip_level);
      }
      return profile;
    } catch (error) {
      console.error('刷新用户信息失败:', error);
      return null;
    }
  };

  const login = (userInfo: UserProfile) => {
    // 先用传入信息立即更新，保证 UI 无延迟
    setUser(userInfo);
    setCurrentUserEmail(userInfo.email);

    // 保存到localStorage，实现永久登录
    localStorage.setItem('user_id', userInfo.id);
    localStorage.setItem('user_email', userInfo.email);
    localStorage.setItem('user_nickname', userInfo.nickname);
    if (userInfo.phone) {
      localStorage.setItem('user_phone', userInfo.phone);
    }
    localStorage.setItem('user_vip_level', userInfo.vip_level);
    if (userInfo.avatar_url) {
      localStorage.setItem('user_avatar_url', userInfo.avatar_url);
    }
    if (userInfo.user_role) {
      localStorage.setItem('user_role', userInfo.user_role);
    }

    // 立即从数据库拉取最新 profile（角色、资料可能更完整），异步更新
    refreshProfile(userInfo.email);
  };

  const logout = () => {
    setUser(null);
    
    // 清除localStorage
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_nickname');
    localStorage.removeItem('user_phone');
    localStorage.removeItem('user_vip_level');
    localStorage.removeItem('user_avatar_url');
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
      // 同步更新localStorage
      if (updates.nickname) {
        localStorage.setItem('user_nickname', updates.nickname);
      }
      if (updates.phone) {
        localStorage.setItem('user_phone', updates.phone);
      }
      if (updates.avatar_url) {
        localStorage.setItem('user_avatar_url', updates.avatar_url);
      }
      if (updates.vip_level) {
        localStorage.setItem('user_vip_level', updates.vip_level);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
