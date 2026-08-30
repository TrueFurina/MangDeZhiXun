import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getStudentVerification, 
  createStudentVerification, 
  updateStudentVerification,
  uploadStudentCard,
  type StudentVerification 
} from '@/db/api';

interface StudentVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onVerificationComplete?: () => void;
}

export default function StudentVerificationDialog({
  open,
  onOpenChange,
  userId,
  onVerificationComplete
}: StudentVerificationDialogProps) {
  const [verification, setVerification] = useState<StudentVerification | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // 表单数据
  const [schoolName, setSchoolName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [realName, setRealName] = useState('');
  const [studentCardImageUrl, setStudentCardImageUrl] = useState('');

  // 加载认证信息
  useEffect(() => {
    if (open && userId) {
      loadVerification();
    }
  }, [open, userId]);

  const loadVerification = async () => {
    setIsLoading(true);
    try {
      const data = await getStudentVerification(userId);
      setVerification(data);
      
      if (data) {
        setSchoolName(data.school_name);
        setStudentId(data.student_id);
        setRealName(data.real_name);
        setStudentCardImageUrl(data.student_card_image_url || '');
      }
    } catch (error) {
      console.error('加载认证信息失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await uploadStudentCard(userId, file);
      
      if (result.success && result.url) {
        setStudentCardImageUrl(result.url);
        toast.success('学生证照片上传成功');
      } else {
        toast.error(result.error || '上传失败');
      }
    } catch (error) {
      console.error('上传学生证照片失败:', error);
      toast.error('上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    // 表单验证
    if (!schoolName.trim()) {
      toast.error('请输入学校名称');
      return;
    }
    if (!studentId.trim()) {
      toast.error('请输入学号');
      return;
    }
    if (!realName.trim()) {
      toast.error('请输入真实姓名');
      return;
    }
    if (!studentCardImageUrl) {
      toast.error('请上传学生证照片');
      return;
    }

    setIsLoading(true);
    try {
      let result;
      
      if (verification) {
        // 更新现有认证
        result = await updateStudentVerification(userId, {
          school_name: schoolName,
          student_id: studentId,
          real_name: realName,
          student_card_image_url: studentCardImageUrl
        });
      } else {
        // 创建新认证
        result = await createStudentVerification(
          userId,
          schoolName,
          studentId,
          realName,
          studentCardImageUrl
        );
      }

      if (result.success) {
        toast.success('认证申请提交成功，请等待审核');
        onOpenChange(false);
        onVerificationComplete?.();
      } else {
        toast.error(result.error || '提交失败');
      }
    } catch (error) {
      console.error('提交认证申请失败:', error);
      toast.error('提交失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            审核中
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="gap-1 bg-green-600">
            <CheckCircle className="h-3 w-3" />
            已认证
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            未通过
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>学生认证</DialogTitle>
            {verification && getStatusBadge(verification.verification_status)}
          </div>
          <DialogDescription>
            完成学生认证后，即可享受学生专属优惠价格
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 已认证状态 */}
          {verification?.verification_status === 'approved' && (
            <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 text-center border border-green-200 dark:border-green-800">
              <CheckCircle className="mx-auto h-12 w-12 text-green-600 dark:text-green-400 mb-2" />
              <p className="font-semibold text-green-900 dark:text-green-100">认证已通过</p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                您已享受学生专属优惠
              </p>
              <div className="mt-3 text-sm text-muted-foreground">
                <p>学校：{verification.school_name}</p>
                <p>学号：{verification.student_id}</p>
                <p>姓名：{verification.real_name}</p>
              </div>
            </div>
          )}

          {/* 审核中状态 */}
          {verification?.verification_status === 'pending' && (
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 text-center border border-blue-200 dark:border-blue-800">
              <Clock className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-400 mb-2" />
              <p className="font-semibold text-blue-900 dark:text-blue-100">认证审核中</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                我们将在1-3个工作日内完成审核
              </p>
            </div>
          )}

          {/* 未通过状态 */}
          {verification?.verification_status === 'rejected' && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950 p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-900 dark:text-red-100">认证未通过</p>
                  {verification.rejected_reason && (
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      原因：{verification.rejected_reason}
                    </p>
                  )}
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    请修改信息后重新提交
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 认证表单 */}
          {(!verification || verification.verification_status === 'rejected') && (
            <>
              <div className="space-y-2">
                <Label htmlFor="school">学校名称 *</Label>
                <Input
                  id="school"
                  placeholder="请输入学校全称，如：闽江大学"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentId">学号 *</Label>
                <Input
                  id="studentId"
                  placeholder="请输入学号"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="realName">真实姓名 *</Label>
                <Input
                  id="realName"
                  placeholder="请输入真实姓名"
                  value={realName}
                  onChange={(e) => setRealName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentCard">学生证照片 *</Label>
                <div className="flex flex-col gap-2">
                  {studentCardImageUrl ? (
                    <div className="relative">
                      <img
                        src={studentCardImageUrl}
                        alt="学生证"
                        className="w-full rounded-lg border"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => setStudentCardImageUrl('')}
                        disabled={isLoading}
                      >
                        重新上传
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        id="studentCard"
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={isLoading || isUploading}
                        className="hidden"
                      />
                      <label htmlFor="studentCard">
                        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer hover:border-primary transition-colors">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {isUploading ? '上传中...' : '点击上传学生证照片'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            支持JPG、PNG格式，最大5MB
                          </p>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-xs text-muted-foreground">
                    <p className="font-semibold mb-1">温馨提示：</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>请确保学生证照片清晰可见</li>
                      <li>照片需包含学校名称、学号、姓名等关键信息</li>
                      <li>认证信息仅用于身份验证，不会泄露给第三方</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={isLoading || isUploading}
              >
                {isLoading ? '提交中...' : '提交认证申请'}
              </Button>
            </>
          )}

          {/* 审核中或已通过时的关闭按钮 */}
          {verification && verification.verification_status !== 'rejected' && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              关闭
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
