import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Share2, Users, Coins, Gift, Copy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ReferralCenterPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [rewards, setRewards] = useState<any[]>([]);
  const [invitees, setInvitees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 获取用户带有 invite_code 的 profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (profileError) throw profileError;
      setProfile(profileData);

      // 获取受邀用户列表
      const { data: inviteesData, error: inviteesError } = await supabase
        .from('user_profiles')
        .select('id, nickname, phone, created_at, vip_level')
        .eq('invited_by', user?.id)
        .order('created_at', { ascending: false });

      if (inviteesError) throw inviteesError;
      setInvitees(inviteesData || []);

      // 获取返现收益记录
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('affiliate_rewards')
        .select('*, invitee:user_profiles!invitee_id(nickname, phone)')
        .eq('promoter_id', user?.id)
        .order('create_time', { ascending: false });

      if (rewardsError) throw rewardsError;
      setRewards(rewardsData || []);

    } catch (err: any) {
      console.error(err);
      toast.error('加载分销数据失败');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    if (!profile?.invite_code) return;
    const url = `${window.location.origin}/register?invite_code=${profile.invite_code}`;
    navigator.clipboard.writeText(url);
    toast.success('邀请链接已复制到剪贴板！');
  };

  const copyInviteCode = () => {
    if (!profile?.invite_code) return;
    navigator.clipboard.writeText(profile.invite_code);
    toast.success('邀请码已复制！');
  };

  const totalRewards = rewards.reduce((sum, r) => sum + Number(r.reward_amount), 0);
  const settledRewards = rewards.filter(r => r.status === 1).reduce((sum, r) => sum + Number(r.reward_amount), 0);
  const pendingRewards = rewards.filter(r => r.status === 0).reduce((sum, r) => sum + Number(r.reward_amount), 0);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="container mx-auto py-8 max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">邀请返佣中心</h1>
        <p className="text-muted-foreground mt-2">邀请好友注册并购买会员，享受丰厚现金返利，开启您的职场共赢之旅。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Users className="w-4 h-4 mr-2" /> 累计邀请人数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{invitees.length} <span className="text-lg font-normal text-muted-foreground">人</span></div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Coins className="w-4 h-4 mr-2" /> 累计获得佣金
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">¥{totalRewards.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">已结算: ¥{settledRewards.toFixed(2)} | 待结算: ¥{pendingRewards.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Share2 className="w-4 h-4 mr-2" /> 您的专属邀请码
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold tracking-wider">{profile?.invite_code || '获取中...'}</div>
          </CardContent>
          <CardFooter className="pt-0 pb-4 space-x-2">
            <Button size="sm" onClick={copyInviteCode} variant="outline" className="flex-1">复制邀请码</Button>
            <Button size="sm" onClick={copyInviteLink} className="flex-1">复制邀请链接</Button>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="invitees" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="invitees">我邀请的人 ({invitees.length})</TabsTrigger>
          <TabsTrigger value="rewards">佣金记录 ({rewards.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="invitees" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>邀请列表</CardTitle>
              <CardDescription>好友使用您的邀请码或专属链接注册后，将显示在此处。</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>用户昵称</TableHead>
                      <TableHead>手机号</TableHead>
                      <TableHead>当前会员等级</TableHead>
                      <TableHead>注册时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">暂无邀请记录</TableCell>
                      </TableRow>
                    ) : (
                      invitees.map(invitee => (
                        <TableRow key={invitee.id}>
                          <TableCell className="font-medium">{invitee.nickname || '未设置'}</TableCell>
                          <TableCell>{invitee.phone || '-'}</TableCell>
                          <TableCell>
                            {invitee.vip_level === 'free' ? <Badge variant="outline">免费用户</Badge> : <Badge className="bg-yellow-500">VIP会员</Badge>}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {format(new Date(invitee.created_at), 'yyyy-MM-dd HH:mm')}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>佣金明细</CardTitle>
              <CardDescription>好友购买VIP后，您的返利佣金将记录在此（默认按实际支付金额的15%提成）。</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>来源用户</TableHead>
                      <TableHead>返佣金额</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>产生时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rewards.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">暂无佣金记录</TableCell>
                      </TableRow>
                    ) : (
                      rewards.map(reward => (
                        <TableRow key={reward.id}>
                          <TableCell>
                            {reward.invitee?.nickname || reward.invitee?.phone || '未知用户'}
                          </TableCell>
                          <TableCell className="font-medium text-green-600">+¥{reward.reward_amount}</TableCell>
                          <TableCell>
                            {reward.status === 1 ? (
                              <Badge className="bg-green-500">已结算</Badge>
                            ) : (
                              <Badge variant="outline" className="text-yellow-600">待结算</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {format(new Date(reward.create_time), 'yyyy-MM-dd HH:mm')}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}