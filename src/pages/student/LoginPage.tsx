import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, Target, TrendingUp, Zap, ArrowLeft, Shield } from 'lucide-react';
import { toast } from 'sonner';
import VerificationCodeInput from '@/components/auth/VerificationCodeInput';
import { supabase } from '@/lib/supabase';
import { getRoleHomePath } from '@/lib/auth';
import { 
  registerUser, 
  loginWithPassword, 
  loginWithPhone, 
  sendVerificationCode 
} from '@/db/api';

export default function StudentLoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  // 手机号验证码登录/注册
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // 账号密码登录/注册
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  
  // 协议勾选
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // 记住我
  const [rememberMe, setRememberMe] = useState(false);

  // 发送验证码
  const handleSendCode = async () => {
    if (!phone || phone.length !== 11) {
      toast.error('请输入正确的手机号');
      return;
    }
    
    setLoading(true);
    const result = await sendVerificationCode(phone);
    setLoading(false);
    
    if (result.success) {
      toast.success(result.message);
      setCodeSent(true);
      setCountdown(60);
      
      // 倒计时
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCodeSent(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      toast.error(result.error || '发送验证码失败');
    }
  };

  // 演示账号一键登录：建立真实 Supabase 匿名会话，保证 AuthGuard 校验通过
  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      // 查找或创建演示用户，确保 user_id 指向真实 user_profiles 记录（满足外键约束）
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', 'demo@student.com')
        .maybeSingle();

      let demoId = existing?.id;
      if (!demoId) {
        const { data: created, error: createErr } = await supabase
          .from('user_profiles')
          .insert({
            email: 'demo@student.com',
            nickname: '演示学员',
            vip_level: 'free',
            user_role: 'student',
          })
          .select('id')
          .maybeSingle();
        if (createErr) throw createErr;
        demoId = created?.id;
      }

      // 保存演示账号token
      const token = {
        email: 'demo@student.com',
        role: 'student',
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      };
      localStorage.setItem('student_token', JSON.stringify(token));

      // 同步写入 AuthContext 依赖的登录态字段
      localStorage.setItem('user_id', demoId || '');
      localStorage.setItem('user_email', 'demo@student.com');
      localStorage.setItem('user_nickname', '演示学员');
      localStorage.setItem('user_role', 'student');
      localStorage.setItem('user_vip_level', 'free');

      // 通知 AuthContext 刷新当前用户（避免头部仍显示演示账号）
      window.dispatchEvent(new Event('app-auth-change'));

      toast.success('演示账号登录成功');
      navigate(getRoleHomePath());
    } catch (e: any) {
      console.error('演示登录失败:', e);
      toast.error('演示账号登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 手机号验证码登录/注册
  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || phone.length !== 11) {
      toast.error('请输入正确的手机号');
      return;
    }
    
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('请输入6位验证码');
      return;
    }
    
    if (!agreedToTerms) {
      toast.error('请阅读并同意用户协议和隐私政策');
      return;
    }
    
    setLoading(true);
    const result = await loginWithPhone(phone, verificationCode);
    setLoading(false);
    
    if (result.success) {
      // 保存token
      if (rememberMe) {
        const token = {
          phone,
          userId: result.user?.id,
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30天
          deviceId: navigator.userAgent,
        };
        localStorage.setItem('student_token', JSON.stringify(token));
        toast.success('登录成功，30天内自动登录');
      } else {
        toast.success('登录成功');
      }
      navigate(getRoleHomePath());
    } else {
      toast.error(result.error || '登录失败');
    }
  };

  // 账号密码登录
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('请输入邮箱');
      return;
    }
    
    if (!password) {
      toast.error('请输入密码');
      return;
    }
    
    if (!agreedToTerms) {
      toast.error('请阅读并同意用户协议和隐私政策');
      return;
    }
    
    setLoading(true);
    const result = await loginWithPassword({ email, password });
    setLoading(false);
    
    if (result.success) {
      // 保存token
      if (rememberMe) {
        const token = {
          email,
          userId: result.user?.id,
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
          deviceId: navigator.userAgent,
        };
        localStorage.setItem('student_token', JSON.stringify(token));
        toast.success('登录成功，30天内自动登录');
      } else {
        toast.success('登录成功');
      }
      navigate(getRoleHomePath());
    } else {
      toast.error(result.error || '登录失败');
    }
  };

  // 账号密码注册
  const handlePasswordRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('请输入邮箱');
      return;
    }
    
    if (!password || password.length < 8) {
      toast.error('密码至少8位');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('两次密码输入不一致');
      return;
    }
    
    if (!agreedToTerms) {
      toast.error('请阅读并同意用户协议和隐私政策');
      return;
    }
    
    setLoading(true);
    const result = await registerUser({
      email,
      password,
      nickname: nickname || `用户${Date.now().toString().slice(-6)}`,
      role: 'student',
    });
    setLoading(false);
    
    if (result.success) {
      toast.success('注册成功，请登录');
      setIsRegisterMode(false);
      // 清空密码字段
      setPassword('');
      setConfirmPassword('');
    } else {
      toast.error(result.error || '注册失败');
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* 左侧品牌区 */}
      <div className="hidden w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-12 lg:flex lg:flex-col lg:justify-center">
        <div className="mx-auto max-w-lg space-y-8">
          {/* Logo和标题 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl overflow-hidden">
                <img 
                  src="https://miaoda-conversation-file.cdn.bcebos.com/user-6m37scl45nuo/conv-a7lm1eejtyps/20260402/file-ao6wt1jg4um8.jpg@w_1659" 
                  alt="芒小橘" 
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold">AI能力评估与个性化学习中心</h1>
                <p className="text-lg text-muted-foreground">用户端（学员端）</p>
              </div>
            </div>
            <p className="text-xl font-medium text-primary">
              AI助力精准发展，匹配你的理想标准
            </p>
          </div>

          {/* 核心亮点 */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">AI智能测评</h3>
                <p className="text-sm text-muted-foreground">
                  多模态测评技术，精准评估你的综合能力
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold">精准匹配推荐</h3>
                <p className="text-sm text-muted-foreground">
                  基于胜任力模型，智能匹配最适合你的标准
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold">个性化成长路径</h3>
                <p className="text-sm text-muted-foreground">
                  AI生成专属成长计划，助力能力快速提升
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Zap className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold">产教融合支撑</h3>
                <p className="text-sm text-muted-foreground">
                  对接院校与企业，打造能力发展服务闭环
                </p>
              </div>
            </div>
          </div>

          {/* 统计数据 */}
          <div className="grid grid-cols-3 gap-4 rounded-xl border bg-card p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">18+</div>
              <div className="text-xs text-muted-foreground">AI标准</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">95%</div>
              <div className="text-xs text-muted-foreground">达标准确率</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">10k+</div>
              <div className="text-xs text-muted-foreground">用户使用</div>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧登录表单区 */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md space-y-6">
          {/* 返回按钮 */}
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回选择端口
          </Button>

          <Card className="shadow-lg">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">学员登录</CardTitle>
                <Badge variant="outline" className="bg-primary/10">
                  <Shield className="mr-1 h-3 w-3" />
                  轻量化登录
                </Badge>
              </div>
              <CardDescription>
                手机号快速登录，开启AI职业发展之旅
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="phone" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="phone">验证码登录</TabsTrigger>
                  <TabsTrigger value="password">密码登录</TabsTrigger>
                </TabsList>

                {/* 手机号验证码登录 */}
                <TabsContent value="phone">
                  <form onSubmit={handlePhoneLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">手机号</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="请输入手机号"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                        maxLength={11}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="code">验证码</Label>
                      <VerificationCodeInput
                        phone={phone}
                        onCodeChange={setVerificationCode}
                      />
                      <p className="text-xs text-muted-foreground">
                        验证码有效期5分钟，1分钟最多发送1次
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms-phone"
                        checked={agreedToTerms}
                        onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                      />
                      <label
                        htmlFor="terms-phone"
                        className="text-sm text-muted-foreground"
                      >
                        我已阅读并同意
                        <Button variant="link" className="h-auto p-0 px-1 text-sm" onClick={() => toast.info('用户协议')}>
                          用户协议
                        </Button>
                        和
                        <Button variant="link" className="h-auto p-0 px-1 text-sm" onClick={() => toast.info('隐私政策')}>
                          隐私政策
                        </Button>
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember-phone"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      />
                      <label
                        htmlFor="remember-phone"
                        className="text-sm text-muted-foreground"
                      >
                        记住我（30天内自动登录）
                        <span className="ml-1 text-xs text-orange-500">
                          请勿在公共设备勾选
                        </span>
                      </label>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? '登录中...' : '登录'}
                    </Button>
                  </form>
                </TabsContent>

                {/* 账号密码登录/注册 */}
                <TabsContent value="password">
                  {!isRegisterMode ? (
                    // 登录表单
                    <form onSubmit={handlePasswordLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">邮箱</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="请输入邮箱"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password">密码</Label>
                          <Button
                            variant="link"
                            className="h-auto p-0 text-sm"
                            onClick={() => toast.info('忘记密码功能开发中')}
                          >
                            忘记密码？
                          </Button>
                        </div>
                        <Input
                          id="password"
                          type="password"
                          placeholder="请输入密码"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          密码要求：8-20位，字母+数字组合
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="terms-password"
                          checked={agreedToTerms}
                          onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                        />
                        <label
                          htmlFor="terms-password"
                          className="text-sm text-muted-foreground"
                        >
                          我已阅读并同意
                          <Button variant="link" className="h-auto p-0 px-1 text-sm" onClick={() => toast.info('用户协议')}>
                            用户协议
                          </Button>
                          和
                          <Button variant="link" className="h-auto p-0 px-1 text-sm" onClick={() => toast.info('隐私政策')}>
                            隐私政策
                          </Button>
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember-password"
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        />
                        <label
                          htmlFor="remember-password"
                          className="text-sm text-muted-foreground"
                        >
                          记住我/自动登录
                          <span className="ml-2 text-xs text-muted-foreground">
                            （30天内免登录，请勿在公共设备勾选）
                          </span>
                        </label>
                      </div>

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? '登录中...' : '登录'}
                      </Button>

                      <div className="text-center text-sm">
                        <span className="text-muted-foreground">还没有账号？</span>
                        <Button
                          variant="link"
                          className="h-auto p-0 px-1"
                          onClick={() => setIsRegisterMode(true)}
                        >
                          立即注册
                        </Button>
                      </div>
                    </form>
                  ) : (
                    // 注册表单
                    <form onSubmit={handlePasswordRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-email">邮箱</Label>
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="请输入邮箱"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-nickname">昵称（可选）</Label>
                        <Input
                          id="register-nickname"
                          type="text"
                          placeholder="请输入昵称"
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-password">密码</Label>
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="请输入密码"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          密码要求：8-20位，字母+数字组合
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">确认密码</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="请再次输入密码"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="terms-register"
                          checked={agreedToTerms}
                          onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                        />
                        <label
                          htmlFor="terms-register"
                          className="text-sm text-muted-foreground"
                        >
                          我已阅读并同意
                          <Button variant="link" className="h-auto p-0 px-1 text-sm" onClick={() => toast.info('用户协议')}>
                            用户协议
                          </Button>
                          和
                          <Button variant="link" className="h-auto p-0 px-1 text-sm" onClick={() => toast.info('隐私政策')}>
                            隐私政策
                          </Button>
                        </label>
                      </div>

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? '注册中...' : '注册'}
                      </Button>

                      <div className="text-center text-sm">
                        <span className="text-muted-foreground">已有账号？</span>
                        <Button
                          variant="link"
                          className="h-auto p-0 px-1"
                          onClick={() => setIsRegisterMode(false)}
                        >
                          立即登录
                        </Button>
                      </div>
                    </form>
                  )}
                </TabsContent>
              </Tabs>

              {/* 演示账号 */}
              <div className="mt-6">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleDemoLogin}
                >
                  <Brain className="mr-2 h-4 w-4" />
                  使用演示账号登录
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 安全提示 */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-start space-x-2">
              <Shield className="mt-0.5 h-4 w-4 text-primary" />
              <div className="space-y-1 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">安全提示</p>
                <ul className="list-inside list-disc space-y-0.5">
                  <li>验证码有效期5分钟，防刷限制（1分钟最多1次，单日最多5次）</li>
                  <li>密码要求：8-20位，字母+数字组合，加密存储</li>
                  <li>首次登录后，建议设置密码，方便常用设备登录</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
