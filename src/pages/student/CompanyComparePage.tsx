import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ChevronLeft, Plus, X, Loader2, Building2, Download, FileText, Users, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { fetchHireOverview, fetchHireStatistics, type HireOverviewData } from '@/db/hiringData';
import jsPDF from 'jspdf';

interface CompanyResult {
  keyword: string;
  overview: HireOverviewData | null;
  error?: string;
}

const CHART_COLORS = ['hsl(217, 91%, 60%)', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(280, 65%, 55%)', 'hsl(0, 72%, 55%)'];

// 解析薪资字符串为数值（如 "15.2K" -> 15200, "15000" -> 15000）
function parseSalary(str: string | number | undefined): number {
  if (!str) return 0;
  if (typeof str === 'number') return str;
  const match = str.match(/([\d.]+)\s*([KkMm万]*)/);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  if (unit.includes('万')) return num * 10000;
  if (unit.includes('k')) return num * 1000;
  if (unit.includes('m')) return num * 1000000;
  return num;
}

export default function CompanyComparePage() {
  const navigate = useNavigate();
  const [inputVal, setInputVal] = useState('');
  const [companies, setCompanies] = useState<string[]>([]);
  const [results, setResults] = useState<CompanyResult[]>([]);
  const [loading, setLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const addCompany = useCallback(() => {
    const v = inputVal.trim();
    if (!v) return;
    if (companies.includes(v)) { toast.error('该企业已添加'); return; }
    if (companies.length >= 5) { toast.error('最多支持对比 5 家企业'); return; }
    setCompanies(prev => [...prev, v]);
    setInputVal('');
  }, [inputVal, companies]);

  const removeCompany = useCallback((kw: string) => {
    setCompanies(prev => prev.filter(c => c !== kw));
    setResults(prev => prev.filter(r => r.keyword !== kw));
  }, []);

  const handleCompare = useCallback(async () => {
    if (companies.length < 2) { toast.error('请至少添加 2 家企业进行对比'); return; }
    setLoading(true);
    setResults([]);
    const data: CompanyResult[] = await Promise.all(
      companies.map(async (kw) => {
        try {
          let overview = await fetchHireOverview(kw).catch(() => null);
          // 概况查询失败时，回退到招聘统计接口（兼容简称/部分匹配）
          if (!overview) {
            const stats = await fetchHireStatistics(kw).catch(() => null);
            if (stats) {
              overview = {
                titleKw: kw, titleType: '', city: stats.priProvince || '', src: '',
                titleLevel: '', avgSal: stats.avgSalStr || String(stats.avgSal || ''),
                titleCnt: stats.zpnumber || 0, titleModifyDate: '', cityCnt: 0,
              } as HireOverviewData;
            }
          }
          if (!overview) return { keyword: kw, overview: null, error: '未查询到该企业的招聘数据，请尝试输入企业全称' };
          return { keyword: kw, overview };
        } catch (e: any) {
          return { keyword: kw, overview: null, error: e?.message || '查询失败' };
        }
      }),
    );
    setResults(data);
    setLoading(false);
    if (data.every(r => r.error)) {
      toast.error('未能获取任何企业的招聘数据，请检查企业名称是否准确');
    }
  }, [companies]);

  const validResults = results.filter(r => r.overview);

  // 自动结论：招聘规模最大 & 薪资最高
  const getConclusion = () => {
    if (validResults.length === 0) return null;
    const byScale = [...validResults].sort((a, b) => (b.overview!.titleCnt || 0) - (a.overview!.titleCnt || 0));
    const bySalary = [...validResults].sort((a, b) => parseSalary(b.overview!.avgSal) - parseSalary(a.overview!.avgSal));
    const maxScale = byScale[0];
    const maxSalary = bySalary[0];
    const parts: string[] = [];
    if (maxScale.overview!.titleCnt) {
      parts.push(`在招聘规模方面，${maxScale.keyword} 以 ${maxScale.overview!.titleCnt} 个在招岗位位居第一，展现出当前最旺盛的用人需求。`);
    }
    if (parseSalary(maxSalary.overview!.avgSal) > 0) {
      parts.push(`在薪资水平方面，${maxSalary.keyword} 的平均月薪约 ${maxSalary.overview!.avgSal}，为本次对比中薪资最高的企业。`);
    }
    if (maxScale.keyword === maxSalary.keyword) {
      parts.push(`综合来看，${maxScale.keyword} 在招聘规模与薪资水平上均处于领先位置，是本次对比中最具吸引力的目标企业。`);
    }
    return parts.join('');
  };

  const conclusion = getConclusion();

  const chartData = validResults.map(r => ({
    name: r.keyword.length > 6 ? `${r.keyword.slice(0, 6)}…` : r.keyword,
    招聘规模: r.overview!.titleCnt || 0,
    平均薪资: Math.round(parseSalary(r.overview!.avgSal) / 1000),
  }));

  const handleExportPDF = () => {
    if (validResults.length === 0) { toast.error('暂无可导出的对比数据'); return; }
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 20;

    doc.setFontSize(16);
    doc.text('Multi-Company Hiring Comparison Report', margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString('en-US')}`, margin, y);
    y += 12;

    // 表格数据
    doc.setFontSize(11);
    doc.text('Comparison Summary', margin, y);
    y += 8;
    const colW = (pageWidth - margin * 2) / 3;
    doc.setFontSize(9);
    doc.setFillColor(230, 235, 245);
    doc.rect(margin, y - 5, pageWidth - margin * 2, 8, 'F');
    doc.text('Company', margin + 2, y);
    doc.text('Job Count', margin + colW + 2, y);
    doc.text('Avg Salary', margin + colW * 2 + 2, y);
    y += 8;

    validResults.forEach((r, i) => {
      if (y > 270) { doc.addPage(); y = 20; }
      const fillColor: [number, number, number] = i % 2 === 0 ? [248, 250, 252] : [255, 255, 255];
      doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
      doc.rect(margin, y - 5, pageWidth - margin * 2, 8, 'F');
      doc.text(r.keyword.slice(0, 18), margin + 2, y);
      doc.text(String(r.overview!.titleCnt || '-'), margin + colW + 2, y);
      doc.text(r.overview!.avgSal || '-', margin + colW * 2 + 2, y);
      y += 8;
    });

    y += 8;
    // 招聘规模柱状图
    if (y > 200) { doc.addPage(); y = 20; }
    doc.setFontSize(11);
    doc.text('Hiring Scale Comparison', margin, y);
    y += 6;
    const maxScale = Math.max(...validResults.map(r => r.overview!.titleCnt || 0), 1);
    const barW = (pageWidth - margin * 2 - validResults.length * 4) / validResults.length;
    validResults.forEach((r, i) => {
      const h = ((r.overview!.titleCnt || 0) / maxScale) * 50;
      const x = margin + i * (barW + 4);
      doc.setFillColor(80, 130, 220);
      doc.rect(x, y + 50 - h, barW, h, 'F');
      doc.setFontSize(7);
      doc.text(String(r.overview!.titleCnt || 0), x + barW / 2 - 4, y + 50 - h - 2);
      doc.text(r.keyword.slice(0, 8), x, y + 56);
    });
    y += 70;

    // 结论
    if (y > 230) { doc.addPage(); y = 20; }
    doc.setFontSize(11);
    doc.text('Conclusion', margin, y);
    y += 8;
    doc.setFontSize(9);
    const conclusionText = conclusion || 'No conclusion available.';
    const lines = doc.splitTextToSize(conclusionText, pageWidth - margin * 2);
    doc.text(lines, margin, y);

    doc.save('multi-company-comparison-report.pdf');
    toast.success('PDF 报告已导出');
  };

  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">多企业对比分析</h1>
          <p className="text-muted-foreground text-sm mt-1">
            横向对比多家目标企业的招聘规模与薪资水平，自动生成结论并支持导出 PDF 报告
          </p>
        </div>
      </div>

      {/* 企业输入 */}
      <Card className="mb-6 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex gap-3 items-center">
            <Input
              placeholder="输入企业名称，如：宁德时代、比亚迪"
              className="flex-1"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCompany()}
            />
            <Button onClick={addCompany} variant="secondary">
              <Plus className="h-4 w-4 mr-1" /> 添加
            </Button>
            <Button onClick={handleCompare} disabled={loading || companies.length < 2}>
              {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <FileText className="h-4 w-4 mr-1" />}
              生成对比报告
            </Button>
          </div>
          {companies.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {companies.map(c => (
                <Badge key={c} variant="secondary" className="px-3 py-1 text-sm gap-1">
                  <Building2 className="h-3 w-3" />
                  {c}
                  <button onClick={() => removeCompany(c)} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-3">提示：建议添加 2-5 家同行业企业进行横向对比，数据更准确。</p>
        </CardContent>
      </Card>

      {/* 对比结果 */}
      {results.length > 0 && (
        <div ref={reportRef} className="space-y-6">
          {/* 概览卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((r, i) => (
              <Card key={r.keyword} className="h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <CardTitle className="text-base truncate">{r.keyword}</CardTitle>
                  </div>
                  {r.error && <CardDescription className="text-destructive">{r.error}</CardDescription>}
                </CardHeader>
                {r.overview && (
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary shrink-0" />
                        <div>
                          <div className="text-xs text-muted-foreground">在招岗位</div>
                          <div className="font-bold">{r.overview.titleCnt || '-'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary shrink-0" />
                        <div>
                          <div className="text-xs text-muted-foreground">平均月薪</div>
                          <div className="font-bold">{r.overview.avgSal || '-'}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* 图表 */}
          {validResults.length > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">招聘规模对比</CardTitle>
                  <CardDescription>各企业在招岗位数量（单位：个）</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full min-w-0 overflow-hidden h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="招聘规模" radius={[4, 4, 0, 0]}>
                          {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">平均薪资对比</CardTitle>
                  <CardDescription>各企业平均月薪（单位：千元）</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full min-w-0 overflow-hidden h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="平均薪资" radius={[4, 4, 0, 0]} fill="hsl(38, 92%, 50%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* 自动结论 */}
          {conclusion && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  智能对比结论
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-foreground text-pretty">{conclusion}</p>
              </CardContent>
            </Card>
          )}

          {/* 导出按钮 */}
          {validResults.length > 0 && (
            <div className="flex justify-end">
              <Button onClick={handleExportPDF} variant="default">
                <Download className="h-4 w-4 mr-2" />
                导出 PDF 报告
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}