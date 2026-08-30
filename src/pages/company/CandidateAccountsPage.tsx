import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Users, Download, Upload, Copy, RefreshCw, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export default function CandidateAccountsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Single account generation
  const [singleDialogOpen, setSingleDialogOpen] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [generating, setGenerating] = useState(false);

  // Bulk account generation
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkModelId, setBulkModelId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user?.id) {
      setLoading(false);
      setAccounts([]);
      setModels([]);
      return;
    }
    setLoading(true);
    try {
      // 1. 加载所有账号
      const { data: accountsData, error: accountsError } = await supabase
        .from('candidate_assessment_account')
        .select(`
          *,
          model:enterprise_competency_model(model_name, job_name)
        `)
        .eq('enterprise_id', user.id)
        .order('create_time', { ascending: false });

      if (accountsError) throw accountsError;
      setAccounts(accountsData || []);

      // 2. 加载企业启用状态的胜任力模型
      const { data: modelsData, error: modelsError } = await supabase
        .from('enterprise_competency_model')
        .select('id, model_name, job_name')
        .eq('enterprise_id', user.id)
        .eq('status', 1);

      if (modelsError) throw modelsError;
      setModels(modelsData || []);
    } catch (err: any) {
      toast.error('数据加载失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateRandomString = (length: number) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleGenerateSingle = async () => {
    if (!candidateName || !candidatePhone || !selectedModelId) {
      toast.error('请填写完整信息');
      return;
    }

    setGenerating(true);
    try {
      const accountCode = `EXAM-${generateRandomString(8)}`;
      const password = generateRandomString(6);
      
      const expireTime = new Date();
      expireTime.setDate(expireTime.getDate() + 7);

      if (!user?.id) {
        toast.error('登录状态异常，请重新登录');
        return;
      }

      const { error } = await supabase
        .from('candidate_assessment_account')
        .insert({
          enterprise_id: user.id,
          model_id: selectedModelId,
          candidate_name: candidateName,
          candidate_phone: candidatePhone,
          account_code: accountCode,
          password: password,
          status: 0,
          expire_time: expireTime.toISOString()
        });

      if (error) throw error;
      toast.success('账号生成成功');
      setSingleDialogOpen(false);
      setCandidateName('');
      setCandidatePhone('');
      setSelectedModelId('');
      loadData();
    } catch (err: any) {
      toast.error('生成失败: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('已复制到剪贴板');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除该账号？')) return;
    try {
      const { error } = await supabase.from('candidate_assessment_account').delete().eq('id', id).eq('status', 0);
      if (error) throw error;
      toast.success('删除成功');
      loadData();
    } catch (err: any) {
      toast.error('只能删除未使用状态的账号');
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">评估账号分发</h1>
          <p className="text-muted-foreground mt-2">为候选人生成专属测评账号，基于自定义模型发起测试，账号7天内有效。</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setBulkDialogOpen(true)}>
            <Users className="mr-2 h-4 w-4" />
            批量导入分发
          </Button>
          <Button onClick={() => setSingleDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            单个生成账号
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>候选人姓名</TableHead>
                  <TableHead>手机号</TableHead>
                  <TableHead>关联模型 / 岗位</TableHead>
                  <TableHead>登录账号 (Code)</TableHead>
                  <TableHead>登录密码</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>生成/过期时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      数据加载中...
                    </TableCell>
                  </TableRow>
                ) : accounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      暂无评估账号，请点击右上角生成。
                    </TableCell>
                  </TableRow>
                ) : (
                  accounts.map((acc) => (
                    <TableRow key={acc.id}>
                      <TableCell className="font-medium">{acc.candidate_name}</TableCell>
                      <TableCell>{acc.candidate_phone}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{acc.model?.model_name}</span>
                          <span className="text-xs text-muted-foreground">{acc.model?.job_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{acc.account_code}</code>
                          <button onClick={() => copyToClipboard(acc.account_code)} className="text-muted-foreground hover:text-primary"><Copy className="h-3 w-3" /></button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{acc.password}</code>
                          <button onClick={() => copyToClipboard(acc.password)} className="text-muted-foreground hover:text-primary"><Copy className="h-3 w-3" /></button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {acc.status === 0 ? (
                          <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">未使用</Badge>
                        ) : acc.status === 1 ? (
                          <Badge className="bg-green-500">已使用</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-red-500">已过期</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div>创建: {format(new Date(acc.create_time), 'MM-dd HH:mm')}</div>
                        <div>过期: {format(new Date(acc.expire_time), 'MM-dd HH:mm')}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        {acc.status === 0 && (
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(acc.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 单个生成 Dialog */}
      <Dialog open={singleDialogOpen} onOpenChange={setSingleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>单个生成评估账号</DialogTitle>
            <DialogDescription>
              生成的账号有效期为7天，候选人仅能使用该账号完成一次测评。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="modelSelect">选择评估模型 <span className="text-red-500">*</span></Label>
              <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择已启用的胜任力模型" />
                </SelectTrigger>
                <SelectContent>
                  {models.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.model_name} ({m.job_name})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cName">候选人姓名 <span className="text-red-500">*</span></Label>
              <Input id="cName" value={candidateName} onChange={e => setCandidateName(e.target.value)} placeholder="如：张三" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cPhone">手机号 <span className="text-red-500">*</span></Label>
              <Input id="cPhone" value={candidatePhone} onChange={e => setCandidatePhone(e.target.value)} placeholder="用于下发通知（选填或必填）" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSingleDialogOpen(false)} disabled={generating}>取消</Button>
            <Button onClick={handleGenerateSingle} disabled={generating}>
              {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              生成账号
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量生成 Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>批量导入生成评估账号</DialogTitle>
            <DialogDescription>
              下载 Excel 模板，填入候选人名单后上传，系统将自动批量生成评估账号。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label>选择评估模型</Label>
              <Select value={bulkModelId} onValueChange={setBulkModelId}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择将要进行评估的胜任力模型" />
                </SelectTrigger>
                <SelectContent>
                  {models.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.model_name} ({m.job_name})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="bg-muted p-4 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">第一步：下载模板</p>
                <p className="text-xs text-muted-foreground mt-1">请使用标准 Excel 模板填写候选人信息</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast.info('演示环境：模板下载中')}>
                <Download className="mr-2 h-4 w-4" /> 模板下载
              </Button>
            </div>
            
            <div className="bg-muted p-4 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">第二步：上传数据</p>
                <p className="text-xs text-muted-foreground mt-1">仅支持 .xlsx, .xls 格式</p>
              </div>
              <div>
                <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls" onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    toast.info('演示环境：模拟上传并生成 5 个测试账号...');
                    setTimeout(() => {
                      toast.success('批量生成成功！');
                      setBulkDialogOpen(false);
                      loadData();
                    }, 1500);
                  }
                }} />
                <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={!bulkModelId}>
                  <Upload className="mr-2 h-4 w-4" /> 选择文件
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}