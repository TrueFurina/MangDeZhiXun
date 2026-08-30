import { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumber?: boolean;
  requireSpecialChar?: boolean;
}

export default function PasswordStrengthIndicator({
  password,
  minLength = 8,
  requireUppercase = true,
  requireLowercase = true,
  requireNumber = true,
  requireSpecialChar = false,
}: PasswordStrengthIndicatorProps) {
  const checks = useMemo(() => {
    const results = [];

    // 长度检查
    results.push({
      label: `至少${minLength}个字符`,
      passed: password.length >= minLength,
    });

    // 大写字母检查
    if (requireUppercase) {
      results.push({
        label: '包含大写字母',
        passed: /[A-Z]/.test(password),
      });
    }

    // 小写字母检查
    if (requireLowercase) {
      results.push({
        label: '包含小写字母',
        passed: /[a-z]/.test(password),
      });
    }

    // 数字检查
    if (requireNumber) {
      results.push({
        label: '包含数字',
        passed: /\d/.test(password),
      });
    }

    // 特殊字符检查
    if (requireSpecialChar) {
      results.push({
        label: '包含特殊字符',
        passed: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      });
    }

    return results;
  }, [password, minLength, requireUppercase, requireLowercase, requireNumber, requireSpecialChar]);

  const strength = useMemo(() => {
    const passedCount = checks.filter((c) => c.passed).length;
    const totalCount = checks.length;
    const percentage = (passedCount / totalCount) * 100;

    if (percentage === 100) return { label: '强', color: 'bg-green-500', textColor: 'text-green-500' };
    if (percentage >= 60) return { label: '中', color: 'bg-yellow-500', textColor: 'text-yellow-500' };
    if (percentage >= 30) return { label: '弱', color: 'bg-orange-500', textColor: 'text-orange-500' };
    return { label: '极弱', color: 'bg-red-500', textColor: 'text-red-500' };
  }, [checks]);

  if (!password) return null;

  return (
    <div className="space-y-3">
      {/* 强度指示条 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">密码强度</span>
          <span className={cn('font-medium', strength.textColor)}>{strength.label}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn('h-full transition-all duration-300', strength.color)}
            style={{
              width: `${(checks.filter((c) => c.passed).length / checks.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* 检查项列表 */}
      <div className="space-y-1">
        {checks.map((check, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center space-x-2 text-sm',
              check.passed ? 'text-green-600' : 'text-muted-foreground'
            )}
          >
            {check.passed ? (
              <Check className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
            <span>{check.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
