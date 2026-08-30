import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getPositions, type Position } from '@/db/api';
import { type Skill } from '@/types/platform';
import { Briefcase, TrendingUp, ExternalLink } from 'lucide-react';

const positionTypeMap: Record<number, string> = {
  1: '技术岗',
  2: '管理岗',
  3: '运营岗',
  4: '其他',
};

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    setLoading(true);
    const data = await getPositions();
    setPositions(data);
    setLoading(false);
  };

  const handleViewJob = (jobUrl?: string) => {
    if (jobUrl) {
      window.open(jobUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="w-full">
      {/* 页面头部 */}
      <section className="bg-gradient-to-b from-muted/30 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4">标准库</Badge>
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              AI时代<span className="gradient-text">热门标准</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              浏览AI相关标准，找到最适合你的学习方向
            </p>
          </div>
        </div>
      </section>

      {/* 标准列表 */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2 bg-muted" />
                    <Skeleton className="h-4 w-1/2 bg-muted" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {positions.map((position) => (
                <Card key={position.position_id} className="shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Briefcase className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant="secondary">
                        {positionTypeMap[position.position_type]}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{position.position_name}</CardTitle>
                    <CardDescription className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>{position.salary_range}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {position.position_desc && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {position.position_desc}
                      </p>
                    )}
                    
                    <div>
                      <h4 className="text-sm font-semibold mb-2">技能要求</h4>
                      <div className="flex flex-wrap gap-2">
                        {position.required_skills.slice(0, 3).map((skill: string | Skill, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {typeof skill === 'string' ? skill : skill.skill_name}
                          </Badge>
                        ))}
                        {position.required_skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{position.required_skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Button 
                      className="w-full group" 
                      variant="outline"
                      onClick={() => handleViewJob(position.job_url)}
                    >
                      查看标准详情
                      <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && positions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">暂无标准数据</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
