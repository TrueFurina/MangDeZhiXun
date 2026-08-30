import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ReactECharts from 'echarts-for-react';
import { TrendingUp, Users, Briefcase, GraduationCap, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function EmploymentDashboardPage() {
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);

  // 导出能力发展数据报告
  const handleExportReport = async () => {
    setIsExporting(true);
    toast.info('正在生成能力发展数据报告...');

    try {
      const reportContent = document.createElement('div');
      reportContent.style.cssText = 'position: absolute; left: -9999px; width: 800px; padding: 40px; background: white; font-family: Arial, sans-serif;';
      
      reportContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 28px; color: #333; margin-bottom: 10px;">2026届毕业生能力发展数据报告</h1>
          <p style="color: #666; font-size: 14px;">生成日期：${new Date().toLocaleDateString('zh-CN')}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 20px; color: #333; margin-bottom: 15px; border-bottom: 2px solid #4F46E5; padding-bottom: 5px;">核心数据概览</h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 15px;">
            <div style="padding: 15px; background: #F3F4F6; border-radius: 8px;">
              <p style="color: #666; font-size: 14px; margin-bottom: 5px;">整体能力发展率</p>
              <p style="font-size: 24px; font-weight: bold; color: #4F46E5;">86.2%</p>
            </div>
            <div style="padding: 15px; background: #F3F4F6; border-radius: 8px;">
              <p style="color: #666; font-size: 14px; margin-bottom: 5px;">对口能力发展率</p>
              <p style="font-size: 24px; font-weight: bold; color: #10B981;">65.0%</p>
            </div>
            <div style="padding: 15px; background: #F3F4F6; border-radius: 8px;">
              <p style="color: #666; font-size: 14px; margin-bottom: 5px;">平均薪资</p>
              <p style="font-size: 24px; font-weight: bold; color: #F59E0B;">7.2K</p>
            </div>
            <div style="padding: 15px; background: #F3F4F6; border-radius: 8px;">
              <p style="color: #666; font-size: 14px; margin-bottom: 5px;">毕业生总数</p>
              <p style="font-size: 24px; font-weight: bold; color: #EF4444;">3,245人</p>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 20px; color: #333; margin-bottom: 15px; border-bottom: 2px solid #4F46E5; padding-bottom: 5px;">能力发展率趋势分析</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
              <tr style="background: #F3F4F6;">
                <th style="padding: 10px; text-align: left; border: 1px solid #E5E7EB;">届别</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #E5E7EB;">整体能力发展率</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #E5E7EB;">对口能力发展率</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style="padding: 10px; border: 1px solid #E5E7EB;">2021届</td><td style="padding: 10px; text-align: center; border: 1px solid #E5E7EB;">91.0%</td><td style="padding: 10px; text-align: center; border: 1px solid #E5E7EB;">72.0%</td></tr>
              <tr style="background: #F9FAFB;"><td style="padding: 10px; border: 1px solid #E5E7EB;">2022届</td><td style="padding: 10px; text-align: center; border: 1px solid #E5E7EB;">89.5%</td><td style="padding: 10px; text-align: center; border: 1px solid #E5E7EB;">70.0%</td></tr>
              <tr><td style="padding: 10px; border: 1px solid #E5E7EB;">2023届</td><td style="padding: 10px; text-align: center; border: 1px solid #E5E7EB;">88.2%</td><td style="padding: 10px; text-align: center; border: 1px solid #E5E7EB;">68.0%</td></tr>
              <tr style="background: #F9FAFB;"><td style="padding: 10px; border: 1px solid #E5E7EB;">2024届</td><td style="padding: 10px; text-align: center; border: 1px solid #E5E7EB;">87.0%</td><td style="padding: 10px; text-align: center; border: 1px solid #E5E7EB;">66.5%</td></tr>
              <tr><td style="padding: 10px; border: 1px solid #E5E7EB; font-weight: bold;">2025届</td><td style="padding: 10px; text-align: center; border: 1px solid #E5E7EB; font-weight: bold; color: #4F46E5;">86.2%</td><td style="padding: 10px; text-align: center; border: 1px solid #E5E7EB; font-weight: bold; color: #10B981;">65.0%</td></tr>
            </tbody>
          </table>
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center; color: #666; font-size: 12px;">
          <p>本报告由院校端能力发展能力评估与培养平台自动生成</p>
        </div>
      `;

      document.body.appendChild(reportContent);

      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const canvas = await html2canvas(reportContent, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`能力发展数据报告_2026届_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.pdf`);

      document.body.removeChild(reportContent);
      toast.success('能力发展数据报告已导出');
    } catch (error) {
      console.error('导出报告失败:', error);
      toast.error('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  // 能力发展率趋势图（真实数据：近五年从91%降至86.2%）
  const employmentTrendOption = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['整体能力发展率', '对口能力发展率', '研究生能力发展率', '本科能力发展率', '专科能力发展率']
    },
    xAxis: {
      type: 'category',
      data: ['2021届', '2022届', '2023届', '2024届', '2025届']
    },
    yAxis: {
      type: 'value',
      name: '百分比(%)',
      max: 100
    },
    series: [
      {
        name: '整体能力发展率',
        type: 'line',
        data: [91.0, 89.5, 88.2, 87.0, 86.2],
        smooth: true,
        itemStyle: { color: '#165DFF' }
      },
      {
        name: '对口能力发展率',
        type: 'line',
        data: [70.0, 68.5, 66.0, 64.5, 65.0],
        smooth: true,
        itemStyle: { color: '#00B42A' }
      },
      {
        name: '研究生能力发展率',
        type: 'line',
        data: [94.0, 93.5, 93.0, 92.5, 92.5],
        smooth: true,
        itemStyle: { color: '#FF7D00' }
      },
      {
        name: '本科能力发展率',
        type: 'line',
        data: [89.0, 88.5, 88.0, 87.5, 87.0],
        smooth: true,
        itemStyle: { color: '#F53F3F' }
      },
      {
        name: '专科能力发展率',
        type: 'line',
        data: [85.0, 84.5, 84.0, 83.0, 82.5],
        smooth: true,
        itemStyle: { color: '#722ED1' }
      }
    ]
  };

  // 行业分布图（真实数据：信息技术16.5%，新能源/高端制造24.8%，公共部门18.2%）
  const industryDistributionOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}人 ({d}%)'
    },
    series: [
      {
        name: '行业分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%'
        },
        data: [
          { value: 303, name: '新能源/高端制造', itemStyle: { color: '#00B42A' } },
          { value: 223, name: '公共部门', itemStyle: { color: '#165DFF' } },
          { value: 202, name: '信息技术服务', itemStyle: { color: '#722ED1' } },
          { value: 156, name: '互联网/IT', itemStyle: { color: '#FF7D00' } },
          { value: 134, name: '金融', itemStyle: { color: '#F53F3F' } },
          { value: 112, name: '教育', itemStyle: { color: '#14C9C9' } },
          { value: 92, name: '医疗健康', itemStyle: { color: '#F7BA1E' } },
          { value: 78, name: '其他', itemStyle: { color: '#9FDB1D' } }
        ]
      }
    ]
  };

  // 薪资分布图（真实数据：本科生6000元以下57.8%，6000-8000元23.2%，8000元以上19%）
  const salaryDistributionOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    xAxis: {
      type: 'category',
      data: ['<4K', '4-6K', '6-8K', '8-12K', '12-18K', '>18K']
    },
    yAxis: {
      type: 'value',
      name: '人数'
    },
    series: [
      {
        name: '人数',
        type: 'bar',
        data: [312, 395, 284, 156, 78, 45],
        itemStyle: {
          color: '#165DFF',
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  };

  // 胜任力水平分布（企业反馈：实操能力、团队协作较好，标准匹配度、解决复杂问题能力需提升）
  const competencyLevelOption = {
    tooltip: {},
    radar: {
      indicator: [
        { name: '实操能力', max: 100 },
        { name: '团队协作', max: 100 },
        { name: '标准匹配度', max: 100 },
        { name: '解决复杂问题', max: 100 },
        { name: '行业认知', max: 100 },
        { name: '职业规划', max: 100 }
      ],
      radius: '60%'
    },
    series: [
      {
        name: '胜任力水平',
        type: 'radar',
        data: [
          {
            value: [76, 78, 62, 58, 54, 60],
            name: '2025届平均水平',
            areaStyle: {
              color: 'rgba(22, 93, 255, 0.2)'
            },
            lineStyle: {
              color: '#165DFF'
            },
            itemStyle: {
              color: '#165DFF'
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">能力发展数据看板</h1>
          <p className="mt-1 text-muted-foreground">
            多维度能力发展数据分析，支持教育部课题研究
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleExportReport}
          disabled={isExporting}
        >
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? '导出中...' : '导出报告'}
        </Button>
      </div>

      {/* 能力发展形势分析 - 移到开头 */}
      <Card className="border-l-4 border-l-warning">
        <CardHeader>
          <CardTitle className="flex items-center text-warning">
            <TrendingUp className="mr-2 h-5 w-5" />
            2025届能力发展形势分析
          </CardTitle>
          <CardDescription>
            基于当前能力发展数据的深度分析与建议
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold text-success">能力发展形势良好的专业</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-success" />
                  <span>工科、新质生产力相关专业能力发展率超96%（AI、新能源、集成电路）</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-success" />
                  <span>专科生技能型标准需求旺盛，能力发展率反超普通本科生</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-success" />
                  <span>医学、师范类专业保持稳定，能力发展率在85%以上</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-destructive">能力发展压力较大的专业</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-destructive" />
                  <span>传统文科、基础文职类专业能力发展率不足70%</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-destructive" />
                  <span>艺术类、哲学类专业能力发展难度增加</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-destructive" />
                  <span>慢能力发展/缓能力发展比例18.3%，需加强职业规划</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-4 rounded-lg bg-primary/10 p-4">
            <h4 className="mb-2 font-semibold text-primary">改进建议</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• 加强实习实践，提升学员实际工作能力</li>
              <li>• 开展职业技能培训，特别是新媒体、数据分析等热门技能</li>
              <li>• 提前对接目标行业需求，建立校企合作机制</li>
              <li>• 加强能力发展心理辅导，帮助学员树立正确的能力发展观</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 核心数据卡片 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-warning">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">2025届整体能力发展率</CardTitle>
            <TrendingUp className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">86.2%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-destructive">-0.8%</span> 较去年（官方口径）
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              市场口径（仅签约）：55%-60%
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">对口能力发展率</CardTitle>
            <Briefcase className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">65.0%</div>
            <p className="text-xs text-muted-foreground">
              整体对口率62%-68%
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              工科/医学类最高（85%+）
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均薪资（本科）</CardTitle>
            <GraduationCap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7.2K</div>
            <p className="text-xs text-muted-foreground">
              中位数约5.8K
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              硕士12.3K | 博士18.5K
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">毕业生总数</CardTitle>
            <Users className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,222万</div>
            <p className="text-xs text-muted-foreground">
              2025届全国毕业生
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              较2024年增加43万人
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 图表区域 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 能力发展率趋势 */}
        <Card>
          <CardHeader>
            <CardTitle>能力发展率趋势分析（2021-2025届）</CardTitle>
            <CardDescription>近五年整体能力发展率从91%降至86.2%，降幅4.8个百分点</CardDescription>
          </CardHeader>
          <CardContent>
            <ReactECharts option={employmentTrendOption} style={{ height: '350px' }} />
          </CardContent>
        </Card>

        {/* 行业分布 */}
        <Card>
          <CardHeader>
            <CardTitle>能力发展行业分布（2025届）</CardTitle>
            <CardDescription>新能源/高端制造24.8%，公共部门18.2%，信息技术16.5%</CardDescription>
          </CardHeader>
          <CardContent>
            <ReactECharts option={industryDistributionOption} style={{ height: '350px' }} />
          </CardContent>
        </Card>

        {/* 薪资分布 */}
        <Card>
          <CardHeader>
            <CardTitle>薪资分布统计（本科生）</CardTitle>
            <CardDescription>6000元以下占57.8%，6000-8000元占23.2%，8000元以上占19%</CardDescription>
          </CardHeader>
          <CardContent>
            <ReactECharts option={salaryDistributionOption} style={{ height: '350px' }} />
            <div className="mt-4 flex items-center justify-between rounded-lg bg-primary/5 p-4">
              <span className="text-sm font-medium">本科平均薪资</span>
              <div className="text-2xl font-bold text-primary">7.2K</div>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              <div>专科：5.2K</div>
              <div>硕士：12.3K</div>
              <div>博士：18.5K</div>
            </div>
          </CardContent>
        </Card>

        {/* 胜任力水平 */}
        <Card>
          <CardHeader>
            <CardTitle>学生胜任力水平（2025届）</CardTitle>
            <CardDescription>实操能力、团队协作较好，标准匹配度、解决复杂问题能力需提升</CardDescription>
          </CardHeader>
          <CardContent>
            <ReactECharts option={competencyLevelOption} style={{ height: '350px' }} />
          </CardContent>
        </Card>
      </div>

      {/* 重点关注 */}
      <Card>
        <CardHeader>
          <CardTitle>重点关注：能力发展困难学生</CardTitle>
          <CardDescription>慢能力发展/缓能力发展比例18.3%，需加强职业规划和技能培训</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { id: '1', name: '张同学', major: '汉语言文学', status: '未能力发展', reason: '职业规划模糊，对口标准少' },
              { id: '2', name: '李同学', major: '行政管理', status: '慢能力发展', reason: '学习意向不明确，缺乏行业认知' },
              { id: '3', name: '王同学', major: '历史学', status: '待能力发展', reason: '专业对口率低（约45%），转行困难' },
              { id: '4', name: '刘同学', major: '哲学', status: '未能力发展', reason: '传统文科能力发展压力大，需技能培训' },
            ].map((student, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{student.name}</span>
                    <Badge variant="secondary">{student.major}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">原因：{student.reason}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="destructive">{student.status}</Badge>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(`/university/student/${student.id}`)}
                  >
                    查看详情
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
