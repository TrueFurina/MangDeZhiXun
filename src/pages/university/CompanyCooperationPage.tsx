import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, FileText, Briefcase, FolderKanban, FileCheck, BarChart3 } from 'lucide-react';
import CompaniesTab from './cooperation/CompaniesTab';
import PlansTab from './cooperation/PlansTab';
import PositionsTab from './cooperation/PositionsTab';
import ProjectsTab from './cooperation/ProjectsTab';
import AgreementsTab from './cooperation/AgreementsTab';
import DashboardTab from './cooperation/DashboardTab';

// 校企合作主页面 - 使用Tab切换不同模块
export default function CompanyCooperationPage() {
  const [activeTab, setActiveTab] = useState('companies');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">校企合作管理</h1>
          <p className="text-muted-foreground mt-1">
            管理合作企业、方案、标准、项目和协议的全流程
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">合作企业</span>
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">合作方案</span>
          </TabsTrigger>
          <TabsTrigger value="positions" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">标准对接</span>
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4" />
            <span className="hidden sm:inline">合作项目</span>
          </TabsTrigger>
          <TabsTrigger value="agreements" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            <span className="hidden sm:inline">协议档案</span>
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">数据看板</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="space-y-4">
          <CompaniesTab />
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <PlansTab />
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <PositionsTab />
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <ProjectsTab />
        </TabsContent>

        <TabsContent value="agreements" className="space-y-4">
          <AgreementsTab />
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          <DashboardTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
