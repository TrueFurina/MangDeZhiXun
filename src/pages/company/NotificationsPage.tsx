import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Bell, CheckCheck, Trash2, Mail, MailOpen, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Notification {
  id: number;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: '新能力档案提交',
      content: '张三投递了"高级前端工程师"标准，请及时查看',
      type: 'info',
      isRead: false,
      createdAt: '2024-03-12 14:30',
    },
    {
      id: 2,
      title: '标准发布成功',
      content: '您发布的"产品经理"标准已通过审核并上线',
      type: 'success',
      isRead: false,
      createdAt: '2024-03-12 10:15',
    },
    {
      id: 3,
      title: '账号即将到期',
      content: '您的会员服务将于7天后到期，请及时续费',
      type: 'warning',
      isRead: true,
      createdAt: '2024-03-11 16:20',
    },
    {
      id: 4,
      title: '系统维护通知',
      content: '系统将于今晚22:00-24:00进行维护升级，期间可能无法访问',
      type: 'info',
      isRead: true,
      createdAt: '2024-03-10 09:00',
    },
    {
      id: 5,
      title: '测评邀请已发送',
      content: '您向李四发送的测评邀请已成功送达',
      type: 'success',
      isRead: true,
      createdAt: '2024-03-09 15:45',
    },
  ]);

  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  const handleMarkAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    toast.success('已标记为已读');
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success('已全部标记为已读');
  };

  const handleDelete = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success('通知已删除');
  };

  const handleDeleteAll = () => {
    setNotifications([]);
    toast.success('已清空所有通知');
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsDetailDialogOpen(true);
    // 自动标记为已读
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
  };

  const getTypeIcon = (type: string) => {
    const iconMap = {
      info: <Info className="h-5 w-5 text-primary" />,
      success: <CheckCircle className="h-5 w-5 text-success" />,
      warning: <AlertCircle className="h-5 w-5 text-warning" />,
      error: <AlertCircle className="h-5 w-5 text-destructive" />,
    };
    return iconMap[type as keyof typeof iconMap];
  };

  const getTypeBadge = (type: string) => {
    const typeMap = {
      info: { label: '通知', variant: 'default' as const },
      success: { label: '成功', variant: 'default' as const },
      warning: { label: '警告', variant: 'secondary' as const },
      error: { label: '错误', variant: 'destructive' as const },
    };
    const config = typeMap[type as keyof typeof typeMap];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const NotificationItem = ({ notification }: { notification: Notification }) => (
    <div
      className={cn(
        'flex items-start space-x-4 rounded-lg border p-4 transition-all hover:bg-muted/50 cursor-pointer hover:shadow-md',
        !notification.isRead && 'bg-muted/30'
      )}
      onClick={() => handleNotificationClick(notification)}
    >
      <div className="mt-1">{getTypeIcon(notification.type)}</div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h4 className="font-semibold">{notification.title}</h4>
            {!notification.isRead && (
              <Badge variant="destructive" className="h-2 w-2 rounded-full p-0" />
            )}
          </div>
          {getTypeBadge(notification.type)}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{notification.content}</p>
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">{notification.createdAt}</span>
          <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
            {!notification.isRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <MailOpen className="mr-1 h-3 w-3" />
                标记已读
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(notification.id)}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              删除
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">通知中心</h1>
          <p className="mt-2 text-muted-foreground">
            查看和管理您的所有通知消息
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
            <CheckCheck className="mr-2 h-4 w-4" />
            全部已读
          </Button>
          <Button variant="outline" onClick={handleDeleteAll} disabled={notifications.length === 0}>
            <Trash2 className="mr-2 h-4 w-4" />
            清空通知
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">全部通知</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">总通知数</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">未读通知</CardTitle>
            <Mail className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">待处理通知</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已读通知</CardTitle>
            <MailOpen className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readNotifications.length}</div>
            <p className="text-xs text-muted-foreground">已处理通知</p>
          </CardContent>
        </Card>
      </div>

      {/* 通知列表 */}
      <Card>
        <CardHeader>
          <CardTitle>消息列表</CardTitle>
          <CardDescription>查看所有通知消息</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">
                全部 ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">
                未读 ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="read">
                已读 ({readNotifications.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-4">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  暂无通知
                </div>
              ) : (
                notifications.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))
              )}
            </TabsContent>
            <TabsContent value="unread" className="space-y-4">
              {unreadNotifications.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  暂无未读通知
                </div>
              ) : (
                unreadNotifications.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))
              )}
            </TabsContent>
            <TabsContent value="read" className="space-y-4">
              {readNotifications.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  暂无已读通知
                </div>
              ) : (
                readNotifications.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 通知详情对话框 */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                {selectedNotification && getTypeIcon(selectedNotification.type)}
                {selectedNotification?.title}
              </DialogTitle>
              {selectedNotification && getTypeBadge(selectedNotification.type)}
            </div>
            <DialogDescription>
              {selectedNotification?.createdAt}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {selectedNotification?.content}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              {selectedNotification && !selectedNotification.isRead && (
                <Button
                  variant="outline"
                  onClick={() => {
                    handleMarkAsRead(selectedNotification.id);
                    setIsDetailDialogOpen(false);
                  }}
                >
                  <MailOpen className="mr-2 h-4 w-4" />
                  标记已读
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  if (selectedNotification) {
                    handleDelete(selectedNotification.id);
                    setIsDetailDialogOpen(false);
                  }
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除
              </Button>
              <Button onClick={() => setIsDetailDialogOpen(false)}>
                关闭
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
