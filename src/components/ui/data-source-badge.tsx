import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DataSourceBadgeProps {
  source: 'assessment' | 'learning' | 'job' | 'ai' | 'enterprise' | 'system';
  detail?: string;
}

export default function DataSourceBadge({ source, detail }: DataSourceBadgeProps) {
  const sourceConfig = {
    assessment: {
      label: '测评数据',
      color: 'bg-primary/10 text-primary border-primary/20',
      description: '来源于学生在测评中心完成的胜任力测评，包含专业技能、通用能力、行为特质、经验背景四个维度的得分'
    },
    learning: {
      label: '学习数据',
      color: 'bg-success/10 text-success border-success/20',
      description: '来源于学生在成长中心的学习行为，包含学习时长、完成课程、学习进度等实时统计数据'
    },
    job: {
      label: '实训数据',
      color: 'bg-warning/10 text-warning border-warning/20',
      description: '来源于学生在标准推荐模块的实训行为，包含提交档案、收藏标准、测评邀约、offer情况等'
    },
    ai: {
      label: 'AI分析',
      color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      description: '基于文心大模型的智能分析，综合测评数据、学习数据、实训数据，运用胜任力理论模型生成个性化分析和建议'
    },
    enterprise: {
      label: '企业反馈',
      color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      description: '来源于企业端的标准对标反馈，包含档案筛选、测评评价、实训后表现等真实数据'
    },
    system: {
      label: '系统统计',
      color: 'bg-muted text-muted-foreground border-border',
      description: '系统自动统计的数据，包含用户活跃度、功能使用情况等'
    }
  };

  const config = sourceConfig[source];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`${config.color} cursor-help`}>
            <Info className="mr-1 h-3 w-3" />
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{detail || config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
