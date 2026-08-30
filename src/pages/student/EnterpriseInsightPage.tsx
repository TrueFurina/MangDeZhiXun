import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, Building2, TrendingUp, BarChart3, Users, DollarSign, ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANIES } from '@/data/companies';

export default function EnterpriseInsightPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [insightData, setInsightData] = useState<any>(null);
  const [showSuggest, setShowSuggest] = useState(false);

  // 输入简称/全称时联想匹配企业
  const suggestions = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return [];
    return COMPANIES.filter(c =>
      c.name.toLowerCase().includes(q) || c.aliases.some(a => a.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [keyword]);

  const selectCompany = (name: string) => {
    setKeyword(name);
    setShowSuggest(false);
    handleSearch(name);
  };

  const handleSearch = async (override?: string) => {
    const kw = (override ?? keyword).trim();
    if (!kw) {
      toast.error('请输入企业名称');
      return;
    }

    setLoading(true);
    try {
      // 通过 Edge Function 封装 plugin 调用企业招聘数据统计
      const { data, error } = await supabase.functions.invoke('company-hiring-stats', {
        body: { keyword: kw }
      });
      
      if (error) {
        let msg = '获取企业数据失败';
        try {
          const errJson = JSON.parse(await error.context?.text?.() || '{}');
          msg = errJson.error || msg;
        } catch { /* 忽略解析 */ }
        throw new Error(msg);
      }
      
      // 上游返回结构为 { code, msg, data: {...} }，真实字段为 companyName/avgSalStr/educationList
      const payload = data?.data ?? data;
      if (payload && (payload.companyName || payload.avgSalStr || payload.educationList || payload.zpnumberList)) {
        setInsightData(payload);
      } else {
        toast.error('未查询到该企业的招聘数据，请尝试输入全称');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('获取企业数据失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">目标企业情报局</h1>
          <p className="text-muted-foreground text-sm mt-1">
            基于真实公开商业数据，透视企业招聘偏好与用人趋势
          </p>
        </div>
      </div>

      <Card className="mb-8 border-primary/20 shadow-md">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Input
                placeholder="请输入企业名称或简称，如：百度、宁德时代"
                className="text-lg py-6"
                value={keyword}
                onChange={(e) => { setKeyword(e.target.value); setShowSuggest(true); }}
                onFocus={() => setShowSuggest(true)}
                onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
                onKeyDown={(e) => { if (e.key === 'Enter') { setShowSuggest(false); handleSearch(); } }}
              />
              {showSuggest && suggestions.length > 0 && (
                <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-72 overflow-y-auto">
                  {suggestions.map(c => (
                    <button
                      key={c.name}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); selectCompany(c.name); }}
                      className="w-full text-left px-4 py-3 hover:bg-accent flex items-center gap-2"
                    >
                      <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate min-w-0">{c.name}</span>
                      <Badge variant="outline" className="ml-auto shrink-0 text-xs">{c.alias}</Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={() => handleSearch()} disabled={loading} size="lg" className="px-8">
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Search className="mr-2 h-5 w-5" />}
              一键洞察
            </Button>
          </div>
        </CardContent>
      </Card>

      {insightData && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          {(() => {
            // 将 {key, value} 列表转为带百分比的数据
            const toDist = (list: { key: string; value: number }[] = []) => {
              const total = list.reduce((s, it) => s + (it.value || 0), 0);
              return list.map(it => ({
                name: it.key,
                percent: total > 0 ? Math.round((it.value / total) * 100) : 0,
                value: it.value,
              }));
            };
            const salaryDist = toDist(insightData.salaryList || []);
            const eduDist = toDist(insightData.educationList || []);
            const yearsDist = toDist(insightData.yearsList || []);
            // 近期招聘规模（取最近 6 个月的月度数据）
            const recentTrend = (insightData.zpnumberList || []).slice(-6);
            const maxTrend = Math.max(1, ...recentTrend.map((t: any) => t.value || 0));
            // 主流学历/经验（占比最高项）
            const topEdu = eduDist.length ? eduDist.reduce((a: any, b: any) => (b.percent > a.percent ? b : a)).name : '本科';
            const topExp = yearsDist.length ? yearsDist.reduce((a: any, b: any) => (b.percent > a.percent ? b : a)).name : '1-3年';

            return (
              <>
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Building2 className="text-primary h-6 w-6" />
                      {insightData.companyName || keyword}
                    </h2>
                    <div className="flex gap-2 mt-2">
                      {insightData.priProvince && <Badge variant="secondary">{insightData.priProvince}</Badge>}
                      <Badge variant="outline" className="text-muted-foreground">全网招聘数据</Badge>
                    </div>
                  </div>
                  <Button onClick={() => navigate(`/student/jd-analysis?company=${encodeURIComponent(insightData.companyName || keyword)}`)} className="bg-orange-500 hover:bg-orange-600 text-white">
                    录入JD进行靶向对齐
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-primary/5 border-none shadow-none">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <DollarSign className="h-6 w-6 text-primary mb-2" />
                      <div className="text-2xl font-bold text-primary">{insightData.avgSalStr || insightData.avgSal || '-'}</div>
                      <div className="text-sm text-muted-foreground mt-1">全岗平均月薪</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-500/5 border-none shadow-none">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <Users className="h-6 w-6 text-green-600 mb-2" />
                      <div className="text-2xl font-bold text-green-600">{insightData.zpnumber || '-'}</div>
                      <div className="text-sm text-muted-foreground mt-1">在招职位数</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-500/5 border-none shadow-none">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <BarChart3 className="h-6 w-6 text-blue-600 mb-2" />
                      <div className="text-2xl font-bold text-blue-600">{topEdu}</div>
                      <div className="text-sm text-muted-foreground mt-1">主流学历要求</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-orange-500/5 border-none shadow-none">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <TrendingUp className="h-6 w-6 text-orange-600 mb-2" />
                      <div className="text-2xl font-bold text-orange-600">{topExp}</div>
                      <div className="text-sm text-muted-foreground mt-1">主流经验要求</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">薪资区间分布</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {salaryDist.map((item: any, i: number) => (
                          <div key={i} className="flex items-center gap-4">
                            <div className="w-24 text-sm shrink-0">{item.name}</div>
                            <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${item.percent}%` }} />
                            </div>
                            <div className="w-12 text-sm text-right font-medium shrink-0">{item.percent}%</div>
                          </div>
                        ))}
                        {salaryDist.length === 0 && <div className="text-muted-foreground text-sm">暂无数据</div>}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">学历要求分布</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {eduDist.map((item: any, i: number) => (
                          <div key={i} className="flex items-center gap-4">
                            <div className="w-24 text-sm shrink-0">{item.name}</div>
                            <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500" style={{ width: `${item.percent}%` }} />
                            </div>
                            <div className="w-12 text-sm text-right font-medium shrink-0">{item.percent}%</div>
                          </div>
                        ))}
                        {eduDist.length === 0 && <div className="text-muted-foreground text-sm">暂无数据</div>}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 招聘规模趋势 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">招聘规模趋势（近6个月）</CardTitle>
                    <CardDescription>各月在招岗位数量变化</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentTrend.length > 0 ? (
                      <div className="flex items-end gap-3 h-48">
                        {recentTrend.map((t: any, i: number) => (
                          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 min-w-0">
                            <span className="text-xs font-medium">{t.value}</span>
                            <div className="w-full bg-primary/80 rounded-t" style={{ height: `${(t.value / maxTrend) * 100}%`, minHeight: 4 }} />
                            <span className="text-xs text-muted-foreground truncate w-full text-center">{t.key}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-sm">暂无数据</div>
                    )}
                  </CardContent>
                </Card>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
