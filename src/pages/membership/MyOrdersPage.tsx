import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2, Receipt, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getUserOrders } from '@/lib/membership-api';
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

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const email = user?.email || localStorage.getItem('student_email') || '';
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!email) { setLoading(false); return; }
    try {
      const data = await getUserOrders(email);
      setOrders(data);
    } catch (err: any) {
      toast.error(err?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="container py-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">我的订单</h1>
          <p className="text-muted-foreground text-sm mt-1">查看你的会员订阅订单记录</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" /></div>
      ) : orders.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Receipt className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">暂无订单</h3>
            <p className="text-muted-foreground text-sm mb-6">你还没有任何会员订阅订单</p>
            <Button onClick={() => navigate('/membership?role=student')}>去开通会员</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/membership/order/${order.order_no}`)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{order.plan_snapshot?.name || '会员套餐'}</p>
                      <Badge className={STATUS_COLORS[order.status] || STATUS_COLORS.pending}>
                        {STATUS_LABELS[order.status] || order.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {order.order_no} · {new Date(order.created_at).toLocaleString('zh-CN')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold">¥{Number(order.total_amount).toFixed(2)}</p>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-auto mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}