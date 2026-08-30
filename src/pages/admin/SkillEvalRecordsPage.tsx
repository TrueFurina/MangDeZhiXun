import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function SkillEvalRecordsPage() {
  const dummyData = [
    { id: 1, name: '简历优化助手 v2', type: '实训技能', score: 92, risk: '低风险', time: '2026-03-12 10:00' },
    { id: 2, name: '大一通用素养测评', type: '测评题库', score: 75, risk: '中风险', time: '2026-03-11 15:30' },
    { id: 3, name: '企业文化适应案例', type: '课程内容', score: 55, risk: '高风险', time: '2026-03-10 09:15' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">技能评估记录</h1>
        <p className="text-muted-foreground mt-2">查看全平台所有的质检历史档案</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>评估记录列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table className="min-w-max">
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">质检时间</TableHead>
                  <TableHead className="whitespace-nowrap">内容名称</TableHead>
                  <TableHead className="whitespace-nowrap">类型</TableHead>
                  <TableHead className="whitespace-nowrap">质量总分</TableHead>
                  <TableHead className="whitespace-nowrap">风险等级</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{record.time}</TableCell>
                    <TableCell className="whitespace-nowrap font-medium">{record.name}</TableCell>
                    <TableCell className="whitespace-nowrap">{record.type}</TableCell>
                    <TableCell className="whitespace-nowrap">{record.score}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant={record.risk === '低风险' ? 'outline' : record.risk === '中风险' ? 'secondary' : 'destructive'} 
                             className={record.risk === '低风险' ? 'text-green-600 border-green-200' : ''}>
                        {record.risk}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}