import { Home, FileText, TrendingUp, Building2, BarChart3, Target, Calendar, Briefcase, Flame, BookOpen, Globe, Swords, Sparkles, GitCompare, BarChart2, Users, Award, Radar, ClipboardList, CreditCard, ShieldCheck, ArrowLeftRight, LayoutDashboard, Search, MessageSquare, type LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  keywords?: string[];
}

// 各端导航注册表，供全局命令面板搜索使用
export const navRegistry: Record<string, NavItem[]> = {
  student: [
    { label: '首页', path: '/student/home', icon: Home },
    { label: '我的数据', path: '/student/my-data', icon: BarChart2, keywords: ['数据看板', '统计'] },
    { label: '综合测评中心', path: '/student/evaluation', icon: FileText, keywords: ['测评', '评估'] },
    { label: '学习路径规划', path: '/student/growth', icon: TrendingUp },
    { label: '目标企业情报局', path: '/student/enterprise-insight', icon: Building2, keywords: ['企业', '情报'] },
    { label: '多企业对比分析', path: '/student/company-compare', icon: BarChart3, keywords: ['对比'] },
    { label: '智能简历助手', path: '/student/resume-assistant', icon: FileText, keywords: ['简历'] },
    { label: '简历版本管理', path: '/student/resume-versions', icon: GitCompare, keywords: ['简历', '版本'] },
    { label: '能力匹配分析', path: '/student/ability-match', icon: Target, keywords: ['匹配'] },
    { label: '能力成长树', path: '/student/ability-tree', icon: Target, keywords: ['能力', '成长'] },
    { label: '智能学习计划', path: '/student/learning-plan', icon: Calendar, keywords: ['计划', '学习'] },
    { label: '求职进度看板', path: '/student/job-tracker', icon: Briefcase, keywords: ['求职', '看板'] },
    { label: '学习打卡', path: '/student/study-checkin', icon: Flame, keywords: ['打卡', '签到'] },
    { label: '薪资谈判助手', path: '/student/salary-negotiator', icon: TrendingUp, keywords: ['薪资', '谈判'] },
    { label: '深度研究中心', path: '/student/deep-research', icon: BookOpen, keywords: ['研究'] },
    { label: '网页内容总结', path: '/student/web-summary', icon: Globe, keywords: ['网页', '总结'] },
    { label: 'AI深度特训', path: '/student/ai-interview', icon: Swords, keywords: ['面试', '特训'] },
    { label: 'AI就业咨询', path: '/student/career-consulting', icon: Sparkles, keywords: ['咨询', '职业'] },
    { label: '能力对标验证', path: '/student/jobs', icon: Briefcase, keywords: ['岗位', '对标'] },
  ],
  company: [
    { label: '数据看板', path: '/company/dashboard', icon: LayoutDashboard },
    { label: '专属胜任力模型', path: '/company/enterprise-models', icon: Sparkles, keywords: ['模型'] },
    { label: '评估账号分发', path: '/company/candidate-accounts', icon: FileText, keywords: ['账号'] },
    { label: '候选人评估结果', path: '/company/candidates/results', icon: ClipboardList, keywords: ['评估'] },
    { label: '画像与面试表现', path: '/company/candidates/portrait', icon: Users, keywords: ['画像'] },
    { label: '候选人人才池', path: '/company/candidate-pool', icon: Users, keywords: ['人才池'] },
    { label: '人才洞察', path: '/company/talent-insight', icon: BarChart2, keywords: ['洞察'] },
    { label: '行业标准参考', path: '/company/positions', icon: TrendingUp, keywords: ['岗位'] },
    { label: '服务订阅', path: '/company/subscription', icon: CreditCard, keywords: ['订阅'] },
  ],
  university: [
    { label: '能力发展数据看板', path: '/university/dashboard', icon: LayoutDashboard },
    { label: '学员能力追踪', path: '/university/students', icon: Users, keywords: ['学员'] },
    { label: '企业标准合作', path: '/university/cooperation', icon: Building2, keywords: ['合作'] },
    { label: '班级模拟考核设置', path: '/university/assessment-config', icon: ArrowLeftRight, keywords: ['考核'] },
    { label: '班级考核成绩看板', path: '/university/assessment-report', icon: LayoutDashboard, keywords: ['成绩'] },
    { label: '教师辅用课程质检', path: '/university/course-quality', icon: ShieldCheck, keywords: ['课程'] },
    { label: '班级能力画像', path: '/university/class-portrait', icon: Radar, keywords: ['画像', '班级'] },
    { label: '就业质量看板', path: '/university/employment-quality', icon: BarChart2, keywords: ['就业'] },
    { label: '深度研究中心', path: '/university/deep-research', icon: BookOpen, keywords: ['研究'] },
    { label: '网页内容总结', path: '/university/web-summary', icon: Globe, keywords: ['网页'] },
    { label: '人才需求分析', path: '/university/hiring-data', icon: Building2, keywords: ['招聘'] },
  ],
  admin: [
    { label: '管理后台', path: '/admin', icon: LayoutDashboard },
    { label: '用户管理', path: '/admin/users', icon: Users, keywords: ['用户'] },
    { label: '课程管理', path: '/admin/courses', icon: BookOpen, keywords: ['课程'] },
    { label: '企业审核', path: '/admin/companies', icon: Building2, keywords: ['企业'] },
    { label: '院校管理', path: '/admin/universities', icon: Award, keywords: ['院校'] },
  ],
};

export const iconMap = { Home, FileText, TrendingUp, Building2, BarChart3, Target, Calendar, Briefcase, Flame, BookOpen, Globe, Swords, Sparkles, GitCompare, BarChart2, Users, Award, Radar, ClipboardList, CreditCard, ShieldCheck, ArrowLeftRight, LayoutDashboard, Search, MessageSquare };