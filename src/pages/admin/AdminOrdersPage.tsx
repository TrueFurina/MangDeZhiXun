import { useEffect, useState, useCallback } from 'react';
import { Loader2, RotateCcw, Receipt, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { getAllOrders, executeRefundDirectly } from '@/lib/membership-api';
import type { PaymentOrder } from '@/types/membership';

const STATUS_LABELS: Record<string, string> = {
  pending: '待支付',
  paid: '已支付',
  cancelled: '已取消',
  refunded: '已退款',
  partial_refunded: '部分退款',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  refunded: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  partial_refunded: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refunding, setRefunding] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (err: any) {
      toast.error(err?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRefund = async (orderNo: string) => {
    setRefunding(orderNo);
    try {
      await executeRefundDirectly(orderNo);
      toast.success('退款请求已提交');
      load();
    } catch (err: any) {
      toast.error(err?.message || '退款失败');
    } finally {
      setRefunding(null);
    }
  };

  const stats = {
    total: orders.length,
    paid: orders.filter(o => o.status === 'paid').length,
    pending: orders.filter(o => o.status === 'pending').length,
    refunded: orders.filter(o => o.status === 'refunded').length,
    revenue: orders.filter(o => o.status === 'paid').reduce((s, o) => s + Number(o.total_amount), 0),
  };

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">订单管理</h1>
          <p className="text-muted-foreground text-sm mt-1">管理所有会员订阅订单与退款</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />刷新
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">总订单</p>
            <p className="text-xl font-bold mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">已支付</p>
            <p className="text-xl font-bold mt-1 text-green-600">{stats.paid}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">待支付</p>
            <p className="text-xl font-bold mt-1 text-yellow-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">已退款</p>
            <p className="text-xl font-bold mt-1 text-blue-600">{stats.refunded}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">已收金额</p>
            <p className="text-xl font-bold mt-1">¥{stats.revenue.toFixed(0)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />订单列表
          </CardTitle>
          <CardDescription>共 {orders.length} 条订单</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" /></div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">暂无订单数据</div>
          ) : (
            <div className="w-full max-w-full overflow-x-auto bg-card">
              <Table className="[&>div]:max-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">订单号</TableHead>
                    <TableHead className="whitespace-nowrap">套餐</TableHead>
                    <TableHead className="whitespace-nowrap">购买者</TableHead>
                    <TableHead className="whitespace-nowrap">金额</TableHead>
                    <TableHead className="whitespace-nowrap">状态</TableHead>
                    <TableHead className="whitespace-nowrap">创建时间</TableHead>
                    <TableHead className="whitespace-nowrap">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="whitespace-nowrap font-mono text-xs">{order.order_no}</TableCell>
                      <TableCell className="whitespace-nowrap">{order.plan_snapshot?.name || '-'}</TableCell>
                      <TableCell className="whitespace-nowrap">{order.purchaser_email}</TableCell>
                      <TableCell className="whitespace-nowrap">¥{Number(order.total_amount).toFixed(2)}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge className={STATUS_COLORS[order.status] || STATUS_COLORS.pending}>
                          {STATUS_LABELS[order.status] || order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleString('zh-CN')}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {order.status === 'paid' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" disabled={refunding === order.order_no}>
                                {refunding === order.order_no ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5 mr-1" />}
                                退款
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
                              <AlertDialogHeader>
                                <AlertDialogTitle>确认退款？</AlertDialogTitle>
                                <AlertDialogDescription>
                                  将对订单 {order.order_no}（{order.plan_snapshot?.name}，¥{Number(order.total_amount).toFixed(2)}）执行全额退款。此操作不可撤销。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRefund(order.order_no)}>确认退款</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}