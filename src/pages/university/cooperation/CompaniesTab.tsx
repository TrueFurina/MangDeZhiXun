import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Building2, Phone, Mail, MapPin, CheckCircle, XCircle, Clock, Download, BarChart3 } from 'lucide-react';
import { getCooperationCompanies, createCooperationCompany, updateCooperationCompany, type CooperationCompany } from '@/db/cooperation-api';
import { toast } from 'sonner';
import RecruitmentDataDialog from './RecruitmentDataDialog';

// 合作企业信息管理Tab
export default function CompaniesTab() {
  const [companies, setCompanies] = useState<CooperationCompany[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CooperationCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CooperationCompany | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isRecruitmentDialogOpen, setIsRecruitmentDialogOpen] = useState(false);
  const [recruitmentCompany, setRecruitmentCompany] = useState<{ name: string; creditCode?: string } | null>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    company_name: '',
    credit_code: '',
    industry: '互联网',
    company_scale: '50-200人',
    cooperation_level: '普通合作单位',
    address: '',
    contact_person: '',
    contact_phone: '',
    contact_email: ''
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [companies, searchTerm, statusFilter]);

  const loadCompanies = async () => {
    setIsLoading(true);
    try {
      // 暂时不传university_id，获取所有企业
      const data = await getCooperationCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('加载企业列表失败:', error);
      toast.error('加载企业列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  const filterCompanies = () => {
    let filtered = companies;

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.credit_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 状态过滤
    if (statusFilter !== 'all') {
      filtered = filtered.filter(company => company.audit_status === statusFilter);
    }

    setFilteredCompanies(filtered);
  };

  const handleAddCompany = async () => {
    try {
      // 暂时使用固定的university_id = 1
      await createCooperationCompany({
        ...formData,
        university_id: 1
      });
      toast.success('企业添加成功');
      setIsAddDialogOpen(false);
      resetForm();
      loadCompanies();
    } catch (error) {
      console.error('添加企业失败:', error);
      toast.error('添加企业失败');
    }
  };

  const handleAudit = async (companyId: string, status: '审核通过' | '审核驳回', comment?: string) => {
    try {
      await updateCooperationCompany(companyId, {
        audit_status: status,
        audit_comment: comment,
        approved_at: status === '审核通过' ? new Date().toISOString() : undefined
      });
      toast.success(`企业${status}`);
      loadCompanies();
      setIsDetailDialogOpen(false);
    } catch (error) {
      console.error('审核失败:', error);
      toast.error('审核失败');
    }
  };

  const resetForm = () => {
    setFormData({
      company_name: '',
      credit_code: '',
      industry: '互联网',
      company_scale: '50-200人',
      cooperation_level: '普通合作单位',
      address: '',
      contact_person: '',
      contact_phone: '',
      contact_email: ''
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      '待审核': { label: '待审核', variant: 'outline' },
      '审核通过': { label: '审核通过', variant: 'default' },
      '审核驳回': { label: '审核驳回', variant: 'destructive' }
    };
    const config = statusConfig[status] || statusConfig['待审核'];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getLevelBadge = (level: string) => {
    const levelConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      '战略合作伙伴': { label: '战略合作伙伴', variant: 'default' },
      '核心合作单位': { label: '核心合作单位', variant: 'secondary' },
      '普通合作单位': { label: '普通合作单位', variant: 'outline' }
    };
    const config = levelConfig[level] || levelConfig['普通合作单位'];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // 统计数据
  const stats = {
    total: companies.length,
    approved: companies.filter(c => c.audit_status === '审核通过').length,
    pending: companies.filter(c => c.audit_status === '待审核').length,
    rejected: companies.filter(c => c.audit_status === '审核驳回').length
  };

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">合作企业总数</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已审核企业</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待审核企业</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">审核驳回</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索企业名称、信用代码、行业..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="审核状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="待审核">待审核</SelectItem>
                  <SelectItem value="审核通过">审核通过</SelectItem>
                  <SelectItem value="审核驳回">审核驳回</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    新增企业
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>新增合作企业</DialogTitle>
                    <DialogDescription>
                      填写企业基本信息，提交后等待审核
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company_name">企业名称 *</Label>
                        <Input
                          id="company_name"
                          value={formData.company_name}
                          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                          placeholder="请输入企业全称"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="credit_code">统一社会信用代码</Label>
                        <Input
                          id="credit_code"
                          value={formData.credit_code}
                          onChange={(e) => setFormData({ ...formData, credit_code: e.target.value })}
                          placeholder="请输入信用代码"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="industry">所属行业 *</Label>
                        <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="跨境电商">跨境电商</SelectItem>
                            <SelectItem value="互联网">互联网</SelectItem>
                            <SelectItem value="新能源">新能源</SelectItem>
                            <SelectItem value="智能制造">智能制造</SelectItem>
                            <SelectItem value="金融">金融</SelectItem>
                            <SelectItem value="教育">教育</SelectItem>
                            <SelectItem value="医疗">医疗</SelectItem>
                            <SelectItem value="其他">其他</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company_scale">企业规模</Label>
                        <Select value={formData.company_scale} onValueChange={(value) => setFormData({ ...formData, company_scale: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="50人以下">50人以下</SelectItem>
                            <SelectItem value="50-200人">50-200人</SelectItem>
                            <SelectItem value="200-500人">200-500人</SelectItem>
                            <SelectItem value="500人以上">500人以上</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">企业地址</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="请输入企业地址"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact_person">对接人姓名 *</Label>
                        <Input
                          id="contact_person"
                          value={formData.contact_person}
                          onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                          placeholder="请输入姓名"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact_phone">对接人电话 *</Label>
                        <Input
                          id="contact_phone"
                          value={formData.contact_phone}
                          onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                          placeholder="请输入电话"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact_email">对接人邮箱</Label>
                        <Input
                          id="contact_email"
                          type="email"
                          value={formData.contact_email}
                          onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                          placeholder="请输入邮箱"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={handleAddCompany}>
                      提交
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">加载中...</div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">暂无企业数据</div>
          ) : (
            <div className="space-y-4">
              {filteredCompanies.map((company) => (
                <Card key={company.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{company.company_name}</h3>
                          {getStatusBadge(company.audit_status)}
                          {getLevelBadge(company.cooperation_level)}
                          <Badge variant="outline">{company.industry}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          {company.credit_code && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">信用代码:</span>
                              <span>{company.credit_code}</span>
                            </div>
                          )}
                          {company.company_scale && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">企业规模:</span>
                              <span>{company.company_scale}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            <span>{company.contact_person}</span>
                            <span>{company.contact_phone}</span>
                          </div>
                          {company.contact_email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              <span>{company.contact_email}</span>
                            </div>
                          )}
                          {company.address && (
                            <div className="flex items-center gap-2 col-span-2">
                              <MapPin className="h-3 w-3" />
                              <span>{company.address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setRecruitmentCompany({
                              name: company.company_name,
                              creditCode: company.credit_code
                            });
                            setIsRecruitmentDialogOpen(true);
                          }}
                        >
                          <BarChart3 className="mr-2 h-4 w-4" />
                          标准应用数据
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCompany(company);
                            setIsDetailDialogOpen(true);
                          }}
                        >
                          查看详情
                        </Button>
                        {company.audit_status === '待审核' && (
                          <Button
                            size="sm"
                            onClick={() => handleAudit(company.id, '审核通过')}
                          >
                            审核通过
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 企业详情对话框 */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>企业详情</DialogTitle>
          </DialogHeader>
          {selectedCompany && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>企业名称</Label>
                  <p className="mt-1">{selectedCompany.company_name}</p>
                </div>
                <div>
                  <Label>审核状态</Label>
                  <div className="mt-1">{getStatusBadge(selectedCompany.audit_status)}</div>
                </div>
                <div>
                  <Label>所属行业</Label>
                  <p className="mt-1">{selectedCompany.industry}</p>
                </div>
                <div>
                  <Label>合作等级</Label>
                  <div className="mt-1">{getLevelBadge(selectedCompany.cooperation_level)}</div>
                </div>
                <div>
                  <Label>对接人</Label>
                  <p className="mt-1">{selectedCompany.contact_person}</p>
                </div>
                <div>
                  <Label>联系电话</Label>
                  <p className="mt-1">{selectedCompany.contact_phone}</p>
                </div>
              </div>
              {selectedCompany.audit_comment && (
                <div>
                  <Label>审核意见</Label>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedCompany.audit_comment}</p>
                </div>
              )}
              {selectedCompany.audit_status === '待审核' && (
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleAudit(selectedCompany.id, '审核驳回', '请补充完整资质材料')}
                  >
                    审核驳回
                  </Button>
                  <Button onClick={() => handleAudit(selectedCompany.id, '审核通过')}>
                    审核通过
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 标准应用数据对话框 */}
      {recruitmentCompany && (
        <RecruitmentDataDialog
          open={isRecruitmentDialogOpen}
          onOpenChange={setIsRecruitmentDialogOpen}
          companyName={recruitmentCompany.name}
          creditCode={recruitmentCompany.creditCode}
        />
      )}
    </div>
  );
}
