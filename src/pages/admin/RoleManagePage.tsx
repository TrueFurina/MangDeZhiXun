import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Shield, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getRolesAdmin, 
  getAllPermissionsAdmin, 
  addRoleAdmin, 
  updateRoleAdmin, 
  updateRolePermissionsAdmin, 
  deleteRoleAdmin,
  type AdminRole,
  type Permission
} from '@/db/api';

export default function RoleManagePage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AdminRole | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 新角色信息
  const [newRole, setNewRole] = useState({
    name: '',
    display_name: '',
    description: ''
  });

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    const [rolesData, permsData] = await Promise.all([
      getRolesAdmin(),
      getAllPermissionsAdmin()
    ]);
    setRoles(rolesData);
    setAllPermissions(permsData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEditRole = (role: AdminRole) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions || []);
    setIsEditDialogOpen(true);
  };

  const handleDeleteRole = (role: AdminRole) => {
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteRole = async () => {
    if (selectedRole) {
      const success = await deleteRoleAdmin(selectedRole.id);
      if (success) {
        toast.success(`已删除角色：${selectedRole.display_name}`);
        setRoles(prev => prev.filter(r => r.id !== selectedRole.id));
        setIsDeleteDialogOpen(false);
        setSelectedRole(null);
      } else {
        toast.error('删除失败');
      }
    }
  };

  const handleSaveRole = async () => {
    if (selectedRole) {
      const success = await updateRolePermissionsAdmin(selectedRole.id, selectedPermissions);
      if (success) {
        toast.success('角色权限已更新');
        // 更新本地状态
        setRoles(prev => prev.map(r => 
          r.id === selectedRole.id ? { ...r, permissions: selectedPermissions } : r
        ));
        setIsEditDialogOpen(false);
      } else {
        toast.error('保存失败');
      }
    }
  };

  const handleAddRole = async () => {
    if (!newRole.name || !newRole.display_name) {
      toast.error('请填写完整角色信息');
      return;
    }

    const createdRole = await addRoleAdmin(newRole);
    if (createdRole) {
      // 同时也为新角色配置选中的初始权限
      if (selectedPermissions.length > 0) {
        await updateRolePermissionsAdmin(createdRole.id, selectedPermissions);
      }
      
      toast.success('角色创建成功');
      // 重新加载以获取完整信息（包括权限和用户数统计）
      loadData();
      setIsAddDialogOpen(false);
      setNewRole({ name: '', display_name: '', description: '' });
      setSelectedPermissions([]);
    } else {
      toast.error('角色创建失败');
    }
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const groupedPermissions = allPermissions.reduce(
    (acc, permission) => {
      const categoryMap: Record<string, string> = {
        'user': '用户管理',
        'role': '角色管理',
        'permission': '权限管理',
        'content': '内容管理',
        'data': '数据统计',
        'config': '系统配置',
        'log': '操作日志'
      };
      const category = categoryMap[permission.resource] || '其他';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(permission);
      return acc;
    },
    {} as Record<string, Permission[]>
  );

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">角色权限管理</h1>
          <p className="mt-1 text-muted-foreground">管理系统角色和权限配置</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          添加角色
        </Button>
      </div>

      {/* 角色列表 */}
      <Card>
        <CardHeader>
          <CardTitle>角色列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>角色名称</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>用户数</TableHead>
                <TableHead>权限数量</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 text-muted-foreground">加载中...</p>
                  </TableCell>
                </TableRow>
              ) : roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    暂无角色数据
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="font-medium">{role.display_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{role.description}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{role.user_count} 人</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge>{role.permissions?.length || 0} 项权限</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditRole(role)}>
                          <Edit className="mr-2 h-4 w-4" />
                          编辑权限
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteRole(role)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          删除
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

      {/* 添加角色对话框 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>添加角色</DialogTitle>
            <DialogDescription>创建新角色并配置权限</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="role-key">角色键名 (English)</Label>
              <Input 
                id="role-key" 
                placeholder="例如: editor" 
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="role-name">角色名称 (中文)</Label>
              <Input 
                id="role-name" 
                placeholder="例如: 内容编辑" 
                value={newRole.display_name}
                onChange={(e) => setNewRole({ ...newRole, display_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="role-desc">角色描述</Label>
              <Input 
                id="role-desc" 
                placeholder="请输入角色描述" 
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
              />
            </div>
            <div>
              <Label>初始权限配置</Label>
              <div className="mt-2 max-h-60 space-y-4 overflow-y-auto rounded-md border p-4">
                {Object.entries(groupedPermissions).map(([category, permissions]) => (
                  <div key={category}>
                    <h4 className="mb-2 font-semibold">{category}</h4>
                    <div className="space-y-2">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission.id}
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={() => togglePermission(permission.id)}
                          />
                          <Label htmlFor={permission.id} className="cursor-pointer">
                            {permission.display_name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddRole}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑角色对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑角色权限</DialogTitle>
            <DialogDescription>
              {selectedRole && `配置 ${selectedRole.display_name} 的权限`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="max-h-96 space-y-4 overflow-y-auto rounded-md border p-4">
              {Object.entries(groupedPermissions).map(([category, permissions]) => (
                <div key={category}>
                  <h4 className="mb-2 font-semibold">{category}</h4>
                  <div className="space-y-2">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-${permission.id}`}
                          checked={selectedPermissions.includes(permission.id)}
                          onCheckedChange={() => togglePermission(permission.id)}
                        />
                        <Label htmlFor={`edit-${permission.id}`} className="cursor-pointer">
                          {permission.display_name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveRole}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除角色确认对话框 */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除角色</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除角色 <span className="font-semibold text-foreground">"{selectedRole?.display_name}"</span> 吗？
              <br />
              <br />
              此操作将影响 <span className="font-semibold text-destructive">{selectedRole?.user_count}</span> 个用户，删除后无法恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteRole} className="bg-destructive hover:bg-destructive/90">
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
