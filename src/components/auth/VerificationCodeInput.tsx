import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { sendVerificationCode } from '@/db/api';

interface VerificationCodeInputProps {
  phone: string;
  onCodeChange: (code: string) => void;
  disabled?: boolean;
}

export default function VerificationCodeInput({
  phone,
  onCodeChange,
  disabled = false,
}: VerificationCodeInputProps) {
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    if (!phone || phone.length !== 11) {
      toast.error('请输入正确的手机号');
      return;
    }

    setIsSending(true);
    const result = await sendVerificationCode(phone);
    setIsSending(false);
    
    if (result.success) {
      toast.success(result.message);
      setCountdown(60);
    } else {
      toast.error(result.error || '发送验证码失败');
    }
  };

  const handleCodeChange = (value: string) => {
    // 只允许输入数字
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setCode(numericValue);
    onCodeChange(numericValue);
  };

  return (
    <div className="flex space-x-2">
      <Input
        type="text"
        placeholder="请输入6位验证码"
        value={code}
        onChange={(e) => handleCodeChange(e.target.value)}
        disabled={disabled}
        maxLength={6}
        className="flex-1"
      />
      <Button
        type="button"
        variant="outline"
        onClick={handleSendCode}
        disabled={countdown > 0 || isSending || disabled || !phone}
        className="w-32 shrink-0"
      >
        {countdown > 0
          ? `${countdown}秒后重试`
          : isSending
          ? '发送中...'
          : '获取验证码'}
      </Button>
    </div>
  );
}
