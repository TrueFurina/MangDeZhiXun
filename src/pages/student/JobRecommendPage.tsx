import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  Heart,
  Search,
  Filter,
  Building2,
  Clock,
  Eye
} from 'lucide-react';
import { jobRecommendations } from '@/data/jobRecommendations';
import { getUserFavoriteJobIds, addJobFavorite, removeJobFavorite } from '@/db/api';
import { getCurrentUserEmail } from '@/lib/supabase';
import { toast } from 'sonner';

export default function JobRecommendPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [salaryFilter, setSalaryFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [majorTypeFilter, setMajorTypeFilter] = useState('all'); // 文理科筛选
  const [genderFilter, setGenderFilter] = useState('all'); // 性别筛选
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false); // 高级筛选对话框状态
  const [interviewCount, setInterviewCount] = useState(0); // 测评邀约数量
  const [viewMode, setViewMode] = useState<'all' | 'new' | 'high-match' | 'favorites' | 'interviews'>('all'); // 查看模式

  // 加载用户收藏的标准和测评邀约数据
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const userEmail = await getCurrentUserEmail();
        if (userEmail) {
          const favoriteIds = await getUserFavoriteJobIds(userEmail);
          setFavorites(new Set(favoriteIds));
          
          // TODO: 从数据库读取真实的测评邀约数据
          // 目前设置为0，后续可以从interview_invitations表读取
          setInterviewCount(0);
        }
      } catch (error) {
        console.error('加载收藏失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  // 过滤和排序标准
  const filteredJobs = jobRecommendations
    .filter(job => {
      // 查看模式过滤
      if (viewMode === 'new') {
        // 本周新增：这里简单模拟，实际应该根据创建时间判断
        const newJobIds = jobRecommendations.slice(0, Math.floor(jobRecommendations.length * 0.15)).map(j => j.id);
        if (!newJobIds.includes(job.id)) return false;
      } else if (viewMode === 'high-match') {
        // 高达标率：达标率≥85%
        if (job.matchScore < 85) return false;
      } else if (viewMode === 'favorites') {
        // 已收藏
        if (!favorites.has(job.id)) return false;
      } else if (viewMode === 'interviews') {
        // 对标验证：这里简单返回空，实际应该从数据库读取
        return false;
      }
      
      // 搜索过滤
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 薪资过滤
      const matchesSalary = salaryFilter === 'all' || (() => {
        const salaryNum = parseInt(job.salary.split('-')[0]);
        if (salaryFilter === '20-30') return salaryNum >= 20 && salaryNum < 30;
        if (salaryFilter === '30-40') return salaryNum >= 30 && salaryNum < 40;
        if (salaryFilter === '40+') return salaryNum >= 40;
        return true;
      })();
      
      // 公司过滤
      const matchesCompany = companyFilter === 'all' || job.company === companyFilter;
      
      // 地点过滤
      const matchesLocation = locationFilter === 'all' || job.location === locationFilter;
      
      // 文理科过滤
      const matchesMajorType = majorTypeFilter === 'all' || (() => {
        // 理科相关标准
        const scienceJobs = ['前端工程师', '后端工程师', 'Java开发工程师', 'Python开发工程师', 
          '算法工程师', '数据分析师', '测试工程师', 'DevOps工程师', '安全工程师'];
        // 文科相关标准
        const artsJobs = ['产品经理', 'UI设计师', '运营专员', '市场营销', '人力资源', 
          '内容运营', '品牌策划', '商务拓展'];
        
        if (majorTypeFilter === 'science') {
          return scienceJobs.some(title => job.title.includes(title));
        }
        if (majorTypeFilter === 'arts') {
          return artsJobs.some(title => job.title.includes(title));
        }
        return true;
      })();
      
      // 性别过滤（基于标准特点推荐）
      const matchesGender = genderFilter === 'all' || (() => {
        // 适合女性的标准（偏向沟通、细致、创意）
        const femalePreferredJobs = ['UI设计师', '产品经理', '运营专员', '人力资源', 
          '内容运营', '品牌策划', '测试工程师', '数据分析师'];
        // 适合男性的标准（偏向技术、逻辑、开发）
        const malePreferredJobs = ['后端工程师', 'Java开发工程师', 'Python开发工程师', 
          '算法工程师', 'DevOps工程师', '安全工程师', '架构师'];
        
        if (genderFilter === 'female') {
          return femalePreferredJobs.some(title => job.title.includes(title));
        }
        if (genderFilter === 'male') {
          return malePreferredJobs.some(title => job.title.includes(title));
        }
        return true;
      })();
      
      return matchesSearch && matchesSalary && matchesCompany && matchesLocation && matchesMajorType && matchesGender;
    })
    .sort((a, b) => {
      // 已收藏的标准置顶
      const aFavorited = favorites.has(a.id);
      const bFavorited = favorites.has(b.id);
      
      if (aFavorited && !bFavorited) return -1;
      if (!aFavorited && bFavorited) return 1;
      
      // 按达标率从高到低排序
      return b.matchScore - a.matchScore;
    });

  // 获取所有唯一的公司名称
  const uniqueCompanies = Array.from(new Set(jobRecommendations.map(job => job.company))).sort();
  
  // 获取所有唯一的工作地点
  const uniqueLocations = Array.from(new Set(jobRecommendations.map(job => job.location))).sort();

  const getMatchScoreColor = (score: number) => {
    if (score >= 85) return 'text-success';
    if (score >= 75) return 'text-primary';
    return 'text-warning';
  };

  const toggleFavorite = async (job: typeof jobRecommendations[0]) => {
    try {
      const userEmail = await getCurrentUserEmail();
      if (!userEmail) {
        toast.error('请先登录后才能收藏标准');
        return;
      }

      const isFavorited = favorites.has(job.id);
      
      if (isFavorited) {
        // 取消收藏
        const success = await removeJobFavorite(userEmail, job.id);
        if (success) {
          setFavorites(prev => {
            const newFavorites = new Set(prev);
            newFavorites.delete(job.id);
            return newFavorites;
          });
          toast.success(`已取消收藏 ${job.title}`);
        }
      } else {
        // 添加收藏
        const success = await addJobFavorite(userEmail, job.id, job.title, job.company);
        if (success) {
          setFavorites(prev => new Set(prev).add(job.id));
          toast.success(`已收藏 ${job.title}`);
        }
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
      toast.error('操作失败，请稍后重试');
    }
  };

  const handleApply = (job: typeof jobRecommendations[0]) => {
    window.open(job.bossUrl, '_blank');
  };

  // 查看对标详情
  const handleViewDetail = (job: typeof jobRecommendations[0]) => {
    window.open(job.bossUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">标准推荐</h1>
          <p className="mt-1 text-muted-foreground">
            AI智能匹配，为你推荐最合适的标准
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowAdvancedFilter(true)}>
          <Filter className="mr-2 h-4 w-4" />
          高级筛选
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card 
          className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
          onClick={() => setViewMode(viewMode === 'all' ? 'new' : 'all')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              推荐标准
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobRecommendations.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+{Math.floor(jobRecommendations.length * 0.15)}</span> 本周新增
            </p>
            {viewMode === 'new' && (
              <Badge variant="default" className="mt-2">查看中</Badge>
            )}
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
          onClick={() => setViewMode(viewMode === 'high-match' ? 'all' : 'high-match')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              高达标率（≥85%）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {jobRecommendations.filter(j => j.matchScore >= 85).length}
            </div>
            <p className="text-xs text-muted-foreground">
              占比 {Math.round((jobRecommendations.filter(j => j.matchScore >= 85).length / jobRecommendations.length) * 100)}%
            </p>
            {viewMode === 'high-match' && (
              <Badge variant="default" className="mt-2">查看中</Badge>
            )}
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
          onClick={() => setViewMode(viewMode === 'favorites' ? 'all' : 'favorites')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              已收藏
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{favorites.size}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-warning">待验证 {favorites.size}</span>
            </p>
            {viewMode === 'favorites' && (
              <Badge variant="default" className="mt-2">查看中</Badge>
            )}
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
          onClick={() => {
            if (interviewCount > 0) {
              setViewMode(viewMode === 'interviews' ? 'all' : 'interviews');
            } else {
              toast.info('暂无测评邀约');
            }
          }}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              测评邀约
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{interviewCount}</div>
            <p className="text-xs text-muted-foreground">
              {interviewCount > 0 ? '待确认' : '暂无邀约'}
            </p>
            {viewMode === 'interviews' && (
              <Badge variant="default" className="mt-2">查看中</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <CardTitle>推荐标准列表</CardTitle>
              <CardDescription className="mt-1">
                {viewMode === 'all' && '按人岗达标率从高到低排序，已收藏标准置顶显示'}
                {viewMode === 'new' && '本周新增的标准'}
                {viewMode === 'high-match' && '高达标率标准（≥85%）'}
                {viewMode === 'favorites' && '你收藏的标准'}
                {viewMode === 'interviews' && '测评邀约标准'}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Select value={majorTypeFilter} onValueChange={setMajorTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="文理科" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部专业</SelectItem>
                  <SelectItem value="science">理科专业</SelectItem>
                  <SelectItem value="arts">文科专业</SelectItem>
                </SelectContent>
              </Select>
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="性别推荐" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">不限性别</SelectItem>
                  <SelectItem value="male">适合男生</SelectItem>
                  <SelectItem value="female">适合女生</SelectItem>
                </SelectContent>
              </Select>
              <Select value={salaryFilter} onValueChange={setSalaryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="薪资范围" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部薪资</SelectItem>
                  <SelectItem value="20-30">20-30K</SelectItem>
                  <SelectItem value="30-40">30-40K</SelectItem>
                  <SelectItem value="40+">40K以上</SelectItem>
                </SelectContent>
              </Select>
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="公司名称" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部公司</SelectItem>
                  {uniqueCompanies.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="工作地点" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部地点</SelectItem>
                  {uniqueLocations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索标准..."
                  className="w-64 pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <svg className="h-7 w-7 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg>
                </div>
                <p className="text-sm font-medium">暂无符合条件的岗位</p>
                <p className="mt-1 text-xs text-muted-foreground">请尝试调整筛选条件</p>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <Card 
                  key={job.id} 
                  className={`transition-shadow hover:shadow-md ${favorites.has(job.id) ? 'border-primary' : ''}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                              <Building2 className="h-7 w-7 text-primary" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-xl font-bold">{job.title}</h3>
                                <Badge variant="outline">{job.type}</Badge>
                                {favorites.has(job.id) && (
                                  <Badge variant="default">已收藏</Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Building2 className="h-4 w-4" />
                                  <span>{job.company}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{job.location}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <DollarSign className="h-4 w-4" />
                                  <span className="font-semibold text-warning">{job.salary}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{job.postedAt}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end space-y-2">
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${getMatchScoreColor(job.matchScore)}`}>
                                {job.matchScore}%
                              </div>
                              <div className="text-xs text-muted-foreground">达标率</div>
                            </div>
                            <Progress value={job.matchScore} className="h-2 w-24" />
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground">{job.description}</p>

                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              {job.tags.map((tag, idx) => (
                                <Badge key={idx} variant="secondary">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {job.benefits.slice(0, 4).map((benefit, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {benefit}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => toggleFavorite(job)}
                              className={favorites.has(job.id) ? 'text-destructive' : ''}
                            >
                              <Heart 
                                className={`h-5 w-5 ${favorites.has(job.id) ? 'fill-current' : ''}`} 
                              />
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => handleViewDetail(job)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              查看详情
                            </Button>
                            <Button onClick={() => handleApply(job)}>
                              <TrendingUp className="mr-2 h-4 w-4" />
                              立即验证
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 高级筛选对话框 */}
      <Dialog open={showAdvancedFilter} onOpenChange={setShowAdvancedFilter}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>高级筛选</DialogTitle>
            <DialogDescription>
              根据专业类型和个人特点筛选适合的标准
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">专业类型</label>
              <Select value={majorTypeFilter} onValueChange={setMajorTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="选择专业类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="science">理科（技术类标准）</SelectItem>
                  <SelectItem value="arts">文科（运营/市场类标准）</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">性别推荐</label>
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="选择性别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="male">男性（偏技术/业务拓展）</SelectItem>
                  <SelectItem value="female">女性（偏沟通/创意设计）</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setMajorTypeFilter('all');
                  setGenderFilter('all');
                }}
              >
                重置
              </Button>
              <Button onClick={() => setShowAdvancedFilter(false)}>
                确定
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
