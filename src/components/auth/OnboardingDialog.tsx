import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getCurrentUserEmail } from '@/lib/supabase';
import { updateUserProfile } from '@/db/api';

// 常见求职方向，用于快速选择
const JOB_INTENTS = [
  '前端开发',
  '后端开发',
  '算法/数据',
  '产品经理',
  'UI/UX设计',
  '运营/市场',
  '测试/质量',
  '数据分析',
  '其他',
];

const GRADUATION_YEARS = ['2026', '2027', '2028', '已毕业'];

interface OnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // 初始值（用于回填已有资料）
  initial?: {
    nickname?: string;
    university_name?: string;
    job_intent?: string;
    graduation_year?: string;
  };
}

// 新用户引导：补全基础资料，用于激活与个性化推荐
export function OnboardingDialog({ open, onOpenChange, initial }: OnboardingDialogProps) {
  const [nickname, setNickname] = useState('');
  const [universityName, setUniversityName] = useState('');
  const [jobIntent, setJobIntent] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setNickname(initial?.nickname || '');
      setUniversityName(initial?.university_name || '');
      setJobIntent(initial?.job_intent || '');
      setGraduationYear(initial?.graduation_year || '');
    }
  }, [open, initial]);

  const handleSave = async () => {
    if (!nickname.trim()) {
      toast.error('请填写昵称');
      return;
    }
    if (!jobIntent) {
      toast.error('请选择求职方向');
      return;
    }
    setSaving(true);
    try {
      const email = getCurrentUserEmail();
      if (!email) throw new Error('登录状态异常');
      await updateUserProfile(email, {
        nickname: nickname.trim(),
        university_name: universityName.trim(),
        job_intent: jobIntent,
        graduation_year: graduationYear,
      });
      localStorage.setItem('user_nickname', nickname.trim());
      localStorage.setItem('user_job_intent', jobIntent);
      window.dispatchEvent(new Event('app-auth-change'));
      toast.success('资料已保存，开始你的职业之旅吧！');
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || '保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
        <DialogHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">完善资料，解锁个性化推荐</DialogTitle>
          <DialogDescription className="text-pretty">
            花一分钟补全基础信息，我们将为你匹配更精准的岗位、测评与成长路径。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="onb-nickname">昵称</Label>
            <Input
              id="onb-nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="你希望被怎样称呼？"
              className="px-3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="onb-university">就读/毕业院校（选填）</Label>
            <Input
              id="onb-university"
              value={universityName}
              onChange={(e) => setUniversityName(e.target.value)}
              placeholder="如：北京大学"
              className="px-3"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>求职方向</Label>
              <Select value={jobIntent} onValueChange={setJobIntent}>
                <SelectTrigger>
                  <SelectValue placeholder="选择方向" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_INTENTS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>毕业年份</Label>
              <Select value={graduationYear} onValueChange={setGraduationYear}>
                <SelectTrigger>
                  <SelectValue placeholder="选择年份" />
                </SelectTrigger>
                <SelectContent>
                  {GRADUATION_YEARS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            稍后再说
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            完成并开始
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default OnboardingDialog;