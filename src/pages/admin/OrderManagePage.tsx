import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Download, Filter, Eye, RefreshCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function OrderManagePage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // 详情弹窗状态
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [refunding, setRefunding] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data: ordersData, error } = await supabase
      .from('orders')
      .select('*')
      .order('create_time', { ascending: false });
    
    if (ordersData) {
      // 提取所有的用户ID
      const userIds = [...new Set(ordersData.map(o => o.user_id))];
      // 获取用户信息
      const { data: usersData } = await supabase
        .from('user_profiles')
        .select('id, nickname, phone')
        .in('id', userIds);
        
      const userMap = (usersData || []).reduce((acc: any, user: any) => {
        acc[user.id] = user;
        return acc;
      }, {});

      const finalOrders = ordersData.map(order => ({
        ...order,
        user: userMap[order.user_id]
      }));
      setOrders(finalOrders);
      setFilteredOrders(finalOrders);
    }
    setLoading(false);
  };

  // 前端过滤
  useEffect(() => {
    let result = [...orders];
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.id.toLowerCase().includes(q) || 
        o.order_no?.toLowerCase().includes(q) ||
        (o.user?.nickname || '').toLowerCase().includes(q) ||
        (o.user?.phone || '').includes(q)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(o => o.payment_status.toString() === statusFilter);
    }

    setFilteredOrders(result);
  }, [searchQuery, statusFilter, orders]);

  // 导出 CSV
  const handleExport = () => {
    if (filteredOrders.length === 0) {
      toast.error('没有可导出的数据');
      return;
    }
    const headers = ['订单号', '支付单号', '用户', '手机号', '套餐', '价格', '状态', '创建时间'];
    const rows = filteredOrders.map(o => [
      o.id,
      o.order_no || '-',
      o.user?.nickname || '未知',
      o.user?.phone || '-',
      `${o.package_type}(${o.package_duration})`,
      o.actual_price,
      o.payment_status === 0 ? '待支付' : o.payment_status === 1 ? '已支付' : o.payment_status === 2 ? '已取消' : '已退款',
      format(new Date(o.create_time), 'yyyy-MM-dd HH:mm:ss')
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orders_export_${format(new Date(), 'yyyyMMdd')}.csv`;
    link.click();
    toast.success('导出成功');
  };

  // 手动退款操作
  const handleRefund = async () => {
    if (!selectedOrder) return;
    if (selectedOrder.payment_status !== 1) {
      toast.error('仅已支付订单可退款');
      return;
    }
    
    if (!confirm('确定要退款该订单吗？退款后将取消用户的VIP权益。')) return;

    setRefunding(true);
    try {
      // 1. 更新订单状态为已退款(3)
      const { error: orderError } = await supabase
        .from('orders')
        .update({ payment_status: 3, pay_time: new Date().toISOString() }) // 借用 pay_time 或其他字段记录退款时间
        .eq('id', selectedOrder.id);
      
      if (orderError) throw orderError;

      // 2. 取消用户的会员权益 (降级为 free)
      const { error: userError } = await supabase
        .from('user_profiles')
        .update({ vip_level: 'free' })
        .eq('id', selectedOrder.user_id);

      if (userError) throw userError;

      toast.success('订单已成功退款');
      setDetailOpen(false);
      fetchOrders(); // 刷新列表
    } catch (err: any) {
      console.error(err);
      toast.error('退款操作失败: ' + err.message);
    } finally {
      setRefunding(false);
    }
  };

  const openDetail = (order: any) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0: return <Badge variant="outline" className="text-yellow-600">待支付</Badge>;
      case 1: return <Badge className="bg-green-500">已支付</Badge>;
      case 2: return <Badge variant="secondary">已取消</Badge>;
      case 3: return <Badge variant="destructive">已退款</Badge>;
      default: return <Badge variant="outline">未知</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">订单管理</h1>
        <p className="text-muted-foreground mt-1">查看和管理全平台交易订单，支持手动退款操作。</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="搜索订单号 / 用户名..." 
                className="w-64 pl-8" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="支付状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="0">待支付</SelectItem>
                <SelectItem value="1">已支付</SelectItem>
                <SelectItem value="2">已取消</SelectItem>
                <SelectItem value="3">已退款</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={fetchOrders} title="刷新列表">
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" onClick={handleExport}><Download className="mr-2 h-4 w-4" />导出数据</Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">订单号</TableHead>
                  <TableHead className="whitespace-nowrap">用户信息</TableHead>
                  <TableHead className="whitespace-nowrap">套餐类型</TableHead>
                  <TableHead className="whitespace-nowrap">实付金额</TableHead>
                  <TableHead className="whitespace-nowrap">支付状态</TableHead>
                  <TableHead className="whitespace-nowrap">创建时间</TableHead>
                  <TableHead className="text-right whitespace-nowrap">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">加载中...</TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">暂无匹配数据</TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs" title={order.id}>{order.id.split('-')[0]}...</TableCell>
                      <TableCell>
                        <div>{order.user?.nickname || '未知用户'}</div>
                        <div className="text-xs text-muted-foreground">{order.user?.phone}</div>
                      </TableCell>
                      <TableCell>{order.package_type} ({order.package_duration})</TableCell>
                      <TableCell className="font-medium">¥{order.actual_price}</TableCell>
                      <TableCell>{getStatusBadge(order.payment_status)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(order.create_time), 'yyyy-MM-dd HH:mm')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => openDetail(order)}><Eye className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 订单详情弹窗 */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader>
            <DialogTitle>订单详情</DialogTitle>
            <DialogDescription>
              内部订单号: {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">支付流水号(微信)</div>
                  <div className="font-mono break-all">{selectedOrder.order_no || '-'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">当前状态</div>
                  <div>{getStatusBadge(selectedOrder.payment_status)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">套餐信息</div>
                  <div className="font-medium">{selectedOrder.package_type} / {selectedOrder.package_duration}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">实付金额</div>
                  <div className="font-bold text-lg text-primary">¥{selectedOrder.actual_price}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">用户信息</div>
                  <div>{selectedOrder.user?.nickname} ({selectedOrder.user?.phone})</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">创建时间</div>
                  <div>{format(new Date(selectedOrder.create_time), 'yyyy-MM-dd HH:mm:ss')}</div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-between sm:justify-between">
            {selectedOrder?.payment_status === 1 ? (
              <Button variant="destructive" onClick={handleRefund} disabled={refunding}>
                {refunding ? '退款处理中...' : '操作退款'}
              </Button>
            ) : (
              <div />
            )}
            <Button variant="outline" onClick={() => setDetailOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
