import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2, CheckCircle2, Clock, XCircle, RotateCcw, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { getOrderByNo, createRefundRequest } from '@/lib/membership-api';
import type { PaymentOrder } from '@/types/membership';
import { useAuth } from '@/contexts/AuthContext';

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: '待支付', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <Clock className="h-4 w-4" /> },
  paid: { label: '已支付', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle2 className="h-4 w-4" /> },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400', icon: <XCircle className="h-4 w-4" /> },
  refunded: { label: '已退款', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: <RotateCcw className="h-4 w-4" /> },
  partial_refunded: { label: '部分退款', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: <RotateCcw className="h-4 w-4" /> },
};

export default function OrderDetailPage() {
  const { orderNo } = useParams<{ orderNo: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const email = user?.email || localStorage.getItem('student_email') || '';
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [refundReason, setRefundReason] = useState('');
  const [refunding, setRefunding] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    if (!orderNo) return;
    try {
      const data = await getOrderByNo(orderNo);
      setOrder(data);
    } catch (err: any) {
      toast.error(err?.message || '加载订单失败');
    } finally {
      setLoading(false);
    }
  }, [orderNo]);

  useEffect(() => {
    load();
  }, [load]);

  // 轮询订单状态
  useEffect(() => {
    if (order?.status === 'pending') {
      pollRef.current = setInterval(async () => {
        try {
          const data = await getOrderByNo(orderNo!);
          if (data && data.status !== 'pending') {
            setOrder(data);
            if (data.status === 'paid') {
              toast.success('支付成功！会员已开通');
            }
          }
        } catch { /* 忽略轮询错误 */ }
      }, 2000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [order?.status, orderNo]);

  const handleRefund = async () => {
    if (!order || !email) return;
    setRefunding(true);
    try {
      await createRefundRequest(order.order_no, email, refundReason || '用户申请退款');
      toast.success('退款申请已提交，请等待管理员审核');
      setRefundReason('');
      load();
    } catch (err: any) {
      toast.error(err?.message || '退款申请失败');
    } finally {
      setRefunding(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground">订单不存在</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>返回</Button>
      </div>
    );
  }

  const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending;
  const snapshot = order.plan_snapshot || {};

  return (
    <div className="container py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">订单详情</h1>
          <p className="text-muted-foreground text-sm mt-1">订单号：{order.order_no}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">{snapshot.name || '会员套餐'}</CardTitle>
            </div>
            <Badge className={statusInfo.color}>
              {statusInfo.icon}
              <span className="ml-1">{statusInfo.label}</span>
            </Badge>
          </div>
          <CardDescription>
            {snapshot.period === 'year' ? '年付' : '月付'} · 创建于 {new Date(order.created_at).toLocaleString('zh-CN')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 待支付：显示二维码 */}
          {order.status === 'pending' && order.wechat_pay_url && (
            <div className="text-center py-4">
              <div className="inline-block p-4 bg-white rounded-xl border">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(order.wechat_pay_url)}`}
                  alt="微信支付二维码"
                  className="w-60 h-60"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-4">请使用微信扫码支付</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">等待支付确认...</span>
              </div>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">套餐价格</span>
            <span className="font-semibold">¥{Number(order.total_amount).toFixed(2)}</span>
          </div>

          <Separator />

          {/* 已支付：可退款 */}
          {order.status === 'paid' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-sm">
                <p className="font-medium text-green-800 dark:text-green-400">✅ 支付成功，会员权益已开通</p>
                <p className="text-xs text-green-700 dark:text-green-500 mt-1">
                  支付时间：{new Date(order.updated_at).toLocaleString('zh-CN')}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">申请退款</label>
                <textarea
                  value={refundReason}
                  onChange={e => setRefundReason(e.target.value)}
                  placeholder="请输入退款原因（选填）"
                  className="w-full p-2 text-sm rounded-md border bg-background min-h-[60px] resize-none"
                />
                <Button variant="outline" size="sm" onClick={handleRefund} disabled={refunding}>
                  {refunding ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <RotateCcw className="h-4 w-4 mr-1" />}
                  申请退款
                </Button>
              </div>
            </div>
          )}

          {order.status === 'refunded' && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-400">退款已完成</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}