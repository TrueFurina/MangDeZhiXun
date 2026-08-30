import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Download, Eye, Filter, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getOperationLogsAdmin, type AdminOperationLog } from '@/db/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function OperationLogsPage() {
  const [logs, setLogs] = useState<AdminOperationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AdminOperationLog | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const loadLogs = async () => {
    setLoading(true);
    const data = await getOperationLogsAdmin();
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // 筛选日志
  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      searchTerm === '' ||
      log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof log.details === 'string' && log.details.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (typeof log.details === 'object' && JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase()));

    const matchModule = filterModule === 'all' || log.resource === filterModule;
    const matchStatus = filterStatus === 'all' || log.status === filterStatus;

    return matchSearch && matchModule && matchStatus;
  });

  // 查看详情
  const handleViewDetail = (log: AdminOperationLog) => {
    setSelectedLog(log);
    setDetailDialogOpen(true);
  };

  // 导出日志
  const handleExport = async () => {
    if (filteredLogs.length === 0) {
      toast.error('没有可导出的数据');
      return;
    }

    setExporting(true);
    toast.info('正在生成导出文件...');

    try {
      // 如果数据量较小，可以使用 html2canvas 截取表格
      // 如果数据量大，建议生成 CSV
      
      // 这里实现 CSV 导出作为主要方案（更实用），PDF 导出作为辅助
      const headers = ['时间', '用户', '模块', '动作', '状态', 'IP地址'];
      const csvData = filteredLogs.map(log => [
        new Date(log.created_at).toLocaleString(),
        log.user_name,
        log.resource,
        log.action,
        log.status === 'success' ? '成功' : '失败',
        log.ip_address
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `操作日志_${new Date().toLocaleDateString()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 同时演示 PDF 导出（针对当前视图）
      if (tableRef.current) {
        const canvas = await html2canvas(tableRef.current);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`操作日志_${new Date().toLocaleDateString()}.pdf`);
      }

      toast.success('日志导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      toast.error('导出失败，请重试');
    } finally {
      setExporting(false);
    }
  };

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    if (status === 'success' || status === 'active') {
      return <Badge className="bg-green-500">成功</Badge>;
    }
    return <Badge variant="destructive">失败</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold">操作日志</h1>
        <p className="mt-2 text-muted-foreground">
          查看系统所有操作记录，支持筛选和导出
        </p>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>筛选条件</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* 搜索 */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索用户、操作或详情..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* 模块筛选 */}
            <Select value={filterModule} onValueChange={setFilterModule}>
              <SelectTrigger>
                <SelectValue placeholder="选择模块" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部模块</SelectItem>
                <SelectItem value="用户管理">用户管理</SelectItem>
                <SelectItem value="角色管理">角色管理</SelectItem>
                <SelectItem value="标准管理">标准管理</SelectItem>
                <SelectItem value="测评管理">测评管理</SelectItem>
                <SelectItem value="题库管理">题库管理</SelectItem>
                <SelectItem value="学习资源">学习资源</SelectItem>
                <SelectItem value="系统配置">系统配置</SelectItem>
                <SelectItem value="数据统计">数据统计</SelectItem>
              </SelectContent>
            </Select>

            {/* 状态筛选 */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="操作状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="success">成功</SelectItem>
                <SelectItem value="failed">失败</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 日志列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>操作记录</CardTitle>
              <CardDescription>
                共 {filteredLogs.length} 条记录
              </CardDescription>
            </div>
            <Button onClick={handleExport} disabled={exporting}>
              {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              {exporting ? '正在导出...' : '导出日志'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border" ref={tableRef}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>时间</TableHead>
                  <TableHead>操作用户</TableHead>
                  <TableHead>模块</TableHead>
                  <TableHead>操作</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>IP地址</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.user_name}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[100px]">
                            {log.user_id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{log.resource}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.ip_address}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(log)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          详情
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 详情对话框 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>操作日志详情</DialogTitle>
            <DialogDescription>
              查看完整的操作记录信息
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    操作时间
                  </div>
                  <div className="mt-1 font-mono text-sm">{new Date(selectedLog.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    操作用户
                  </div>
                  <div className="mt-1">
                    {selectedLog.user_name} ({selectedLog.user_id})
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    所属模块
                  </div>
                  <div className="mt-1">{selectedLog.resource}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    操作动作
                  </div>
                  <div className="mt-1">{selectedLog.action}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    操作状态
                  </div>
                  <div className="mt-1">{getStatusBadge(selectedLog.status)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    IP地址
                  </div>
                  <div className="mt-1 font-mono text-sm">{selectedLog.ip_address}</div>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  操作详情
                </div>
                <div className="mt-2 rounded-lg bg-muted p-3 text-sm font-mono break-all whitespace-pre-wrap">
                  {typeof selectedLog.details === 'object' 
                    ? JSON.stringify(selectedLog.details, null, 2) 
                    : selectedLog.details}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
