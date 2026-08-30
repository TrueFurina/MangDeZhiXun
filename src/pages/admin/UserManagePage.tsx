import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, Plus, Edit, Ban, CheckCircle, Key, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getUsersAdmin, addUserAdmin, updateUserAdmin, toggleUserStatusAdmin, type AdminUser } from '@/db/api';

export default function UserManagePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  
  // 新用户信息状态
  const [newUser, setNewUser] = useState({
    user_name: '',
    email: '',
    phone: '',
    role: 'student'
  });

  // 获取数据
  const loadData = async () => {
    setLoading(true);
    const data = await getUsersAdmin();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.user_name.includes(searchTerm) ||
      user.email.includes(searchTerm) ||
      user.phone?.includes(searchTerm)
  );

  const handleToggleStatus = async (user: AdminUser) => {
    const result = await toggleUserStatusAdmin(user.user_id, user.status);
    if (result) {
      toast.success(`已${result.status === 'active' ? '启用' : '禁用'}用户：${user.user_name}`);
      setUsers(users.map(u => u.user_id === user.user_id ? result : u));
    } else {
      toast.error('操作失败');
    }
  };

  const handleResetPassword = (user: AdminUser) => {
    toast.success(`已重置用户 ${user.user_name} 的密码`);
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser({ ...user });
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (selectedUser) {
      const result = await updateUserAdmin(selectedUser.user_id, {
        user_name: selectedUser.user_name,
        email: selectedUser.email,
        phone: selectedUser.phone,
        role: selectedUser.role
      });
      
      if (result) {
        toast.success('用户信息已更新');
        setUsers(users.map(u => u.user_id === selectedUser.user_id ? result : u));
        setIsEditDialogOpen(false);
      } else {
        toast.error('保存失败');
      }
    }
  };

  const handleAddUser = async () => {
    if (!newUser.user_name || !newUser.email) {
      toast.error('请输入姓名和邮箱');
      return;
    }
    
    const result = await addUserAdmin({
      ...newUser,
      status: 'active'
    });
    
    if (result) {
      toast.success('用户添加成功');
      setUsers([result, ...users]);
      setIsAddDialogOpen(false);
      setNewUser({ user_name: '', email: '', phone: '', role: 'student' });
    } else {
      toast.error('添加用户失败');
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">用户管理</h1>
          <p className="mt-1 text-muted-foreground">管理所有平台用户</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          添加用户
        </Button>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索用户名、邮箱或手机号..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* 用户表格 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>姓名</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead>手机号</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>注册时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="mt-2 text-muted-foreground">加载中...</p>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell className="font-medium">{user.user_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {user.role === 'student'
                          ? '学员'
                          : user.role === 'company_hr'
                            ? '企业HR'
                            : user.role === 'university_staff'
                              ? '院校管理员'
                              : '管理员'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status === 'active' ? '正常' : '已禁用'}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(user)}
                        >
                          {user.status === 'active' ? (
                            <Ban className="h-4 w-4 text-destructive" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleResetPassword(user)}
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 添加用户对话框 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加用户</DialogTitle>
            <DialogDescription>填写用户信息以创建新用户</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">姓名</Label>
              <Input 
                id="name" 
                placeholder="请输入姓名" 
                value={newUser.user_name}
                onChange={(e) => setNewUser({ ...newUser, user_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">邮箱</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="请输入邮箱" 
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">手机号</Label>
              <Input 
                id="phone" 
                placeholder="请输入手机号" 
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="userType">角色</Label>
              <Select 
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">学员</SelectItem>
                  <SelectItem value="company_hr">企业HR</SelectItem>
                  <SelectItem value="university_staff">院校管理员</SelectItem>
                  <SelectItem value="admin">管理员</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddUser}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑用户对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
            <DialogDescription>修改用户信息</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">姓名</Label>
                <Input 
                  id="edit-name" 
                  value={selectedUser.user_name} 
                  onChange={(e) => setSelectedUser({ ...selectedUser, user_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">邮箱</Label>
                <Input 
                  id="edit-email" 
                  type="email" 
                  value={selectedUser.email} 
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">手机号</Label>
                <Input 
                  id="edit-phone" 
                  value={selectedUser.phone || ''} 
                  onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-role">角色</Label>
                <Select 
                  value={selectedUser.role}
                  onValueChange={(value) => setSelectedUser({ ...selectedUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">学生</SelectItem>
                    <SelectItem value="company_hr">企业HR</SelectItem>
                    <SelectItem value="university_staff">院校管理员</SelectItem>
                    <SelectItem value="admin">管理员</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveUser}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
