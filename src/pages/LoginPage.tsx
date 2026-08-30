import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, Lock, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { getRoleHomePath } from '@/lib/auth';
import AgreementCheckbox from '@/components/auth/AgreementCheckbox';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [mobile, setMobile] = useState('');
  const [code, setCode] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // 获取邀请码
  const searchParams = new URLSearchParams(location.search);
  const inviteCode = searchParams.get('invite_code') || '';

  // 如果已登录，跳转到对应端首页
  useEffect(() => {
    if (isAuthenticated) {
      navigate(getRoleHomePath(), { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // 倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 验证手机号格式
  const validateMobile = (phone: string) => {
    return /^1[3-9]\d{9}$/.test(phone);
  };

  // 发送验证码
  const handleSendCode = async () => {
    if (!validateMobile(mobile)) {
      toast.error('请输入正确的手机号');
      return;
    }

    if (countdown > 0) {
      return;
    }

    setIsSendingCode(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-sms-code', {
        body: { mobile }
      });

      if (error) {
        const errorMsg = await error?.context?.text();
        throw new Error(errorMsg || error.message);
      }

      if (!data.success) {
        throw new Error(data.error || '发送验证码失败');
      }

      setSessionId(data.sessionId);
      setCountdown(60);
      toast.success(data.message || '验证码已发送');
    } catch (error: any) {
      console.error('发送验证码失败:', error);
      toast.error(error.message || '发送验证码失败，请稍后重试');
    } finally {
      setIsSendingCode(false);
    }
  };

  // 登录/注册
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreed) {
      toast.error('请先阅读并同意《用户协议》与《隐私政策》');
      return;
    }

    if (!validateMobile(mobile)) {
      toast.error('请输入正确的手机号');
      return;
    }

    if (!code) {
      toast.error('请输入验证码');
      return;
    }

    if (!sessionId) {
      toast.error('请先获取验证码');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('verify-sms-login', {
        body: {
          mobile,
          code,
          sessionId,
          inviteCode
        }
      });

      if (error) {
        const errorMsg = await error?.context?.text();
        throw new Error(errorMsg || error.message);
      }

      if (!data.success) {
        throw new Error(data.error || '验证失败');
      }

      // 写入 AuthContext 依赖的登录态字段
      const u = data.user;
      localStorage.setItem('user_id', u.id);
      localStorage.setItem('user_email', u.email);
      localStorage.setItem('user_nickname', u.nickname);
      localStorage.setItem('user_phone', u.phone || mobile);
      localStorage.setItem('user_role', u.user_role || 'student');
      localStorage.setItem('user_vip_level', u.vip_level || 'free');

      // 使用AuthContext保存登录状态（会自动保存到localStorage）
      login(data.user);

      toast.success(data.message || '登录成功');

      // 跳转到用户端首页（按角色分流）
      setTimeout(() => {
        navigate(getRoleHomePath(), { replace: true });
      }, 500);
    } catch (error: any) {
      console.error('登录失败:', error);
      toast.error(error.message || '登录失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Button
        variant="ghost"
        className="absolute left-4 top-4 z-10"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> 返回门户
      </Button>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">欢迎登录</CardTitle>
          <CardDescription className="text-base">
            三位一体AI能力评估与个性化学习中心
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            {/* 手机号输入 */}
            <div className="space-y-2">
              <Label htmlFor="mobile" className="text-base">
                手机号
              </Label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="请输入手机号"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="pl-10 text-base"
                  maxLength={11}
                  required
                />
              </div>
            </div>

            {/* 验证码输入 */}
            <div className="space-y-2">
              <Label htmlFor="code" className="text-base">
                验证码
              </Label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <CheckCircle2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="code"
                    type="text"
                    placeholder="请输入验证码"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="pl-10 text-base"
                    maxLength={6}
                    required
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendCode}
                  disabled={countdown > 0 || isSendingCode || !validateMobile(mobile)}
                  className="min-w-[120px]"
                >
                  {isSendingCode
                    ? '发送中...'
                    : countdown > 0
                    ? `${countdown}秒后重试`
                    : '获取验证码'}
                </Button>
              </div>
            </div>

            <AgreementCheckbox checked={agreed} onCheckedChange={setAgreed} />

            {/* 登录按钮 */}
            <Button
              type="submit"
              className="w-full text-base"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                '登录中...'
              ) : (
                <>
                  登录 / 注册
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>

            {/* 提示信息 */}
            <div className="space-y-3 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
              <p className="flex items-start space-x-2">
                <span className="mt-0.5">•</span>
                <span>首次登录将自动注册账号</span>
              </p>
              <p className="flex items-start space-x-2">
                <span className="mt-0.5">•</span>
                <span>验证码由百度短信服务发送，请注意查收</span>
              </p>
              <p className="flex items-start space-x-2">
                <span className="mt-0.5">•</span>
                <span>登录即表示同意用户协议和隐私政策</span>
              </p>
            </div>

            </form>
        </CardContent>
      </Card>
    </div>
  );
}
