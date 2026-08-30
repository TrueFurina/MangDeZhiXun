import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Lightbulb,
  Shield,
  Target
} from 'lucide-react';

interface AIEvaluationResultProps {
  type: 'resume' | 'interview' | 'match';
  result: {
    overallScore: number;
    dimensionScores: Record<string, number>;
    strengths: string[];
    weaknesses?: string[];
    recommendations?: string[];
    riskWarnings?: string[];
    summary: string;
    matchLevel?: 'excellent' | 'good' | 'fair' | 'poor';
    hiringRecommendation?: 'strong_hire' | 'hire' | 'maybe' | 'no_hire';
  };
}

const dimensionLabels: Record<string, string> = {
  skillMatch: '技能匹配',
  experienceMatch: '经验匹配',
  educationMatch: '学历匹配',
  stabilityScore: '稳定性',
  technicalAbility: '技术能力',
  communicationSkill: '沟通表达',
  problemSolving: '问题解决',
  teamwork: '团队协作',
  learningAbility: '学习能力',
  cultureMatch: '文化匹配',
  potentialMatch: '潜力匹配',
};

const matchLevelConfig = {
  excellent: { label: '优秀匹配', color: 'bg-success text-success-foreground' },
  good: { label: '良好匹配', color: 'bg-primary text-primary-foreground' },
  fair: { label: '一般匹配', color: 'bg-warning text-warning-foreground' },
  poor: { label: '不匹配', color: 'bg-destructive text-destructive-foreground' },
};

const hiringRecommendationConfig = {
  strong_hire: { label: '强烈推荐', color: 'bg-success text-success-foreground' },
  hire: { label: '推荐结业', color: 'bg-primary text-primary-foreground' },
  maybe: { label: '待定', color: 'bg-warning text-warning-foreground' },
  no_hire: { label: '不推荐', color: 'bg-destructive text-destructive-foreground' },
};

export default function AIEvaluationResult({ type, result }: AIEvaluationResultProps) {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-success';
    if (score >= 70) return 'text-primary';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return '优秀';
    if (score >= 70) return '良好';
    if (score >= 60) return '及格';
    return '待提升';
  };

  return (
    <div className="space-y-6">
      {/* 总体评分 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <span>AI智能评估结果</span>
              </CardTitle>
              <CardDescription className="mt-1">
                基于多维度数据分析的客观评估
              </CardDescription>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${getScoreColor(result.overallScore)}`}>
                {result.overallScore}
              </div>
              <div className="text-sm text-muted-foreground">
                {getScoreLabel(result.overallScore)}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 匹配等级或学习建议 */}
            {result.matchLevel && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">匹配等级：</span>
                <Badge className={matchLevelConfig[result.matchLevel].color}>
                  {matchLevelConfig[result.matchLevel].label}
                </Badge>
              </div>
            )}
            {result.hiringRecommendation && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">学习建议：</span>
                <Badge className={hiringRecommendationConfig[result.hiringRecommendation].color}>
                  {hiringRecommendationConfig[result.hiringRecommendation].label}
                </Badge>
              </div>
            )}

            {/* 综合评价 */}
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm leading-relaxed">{result.summary}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 维度评分 */}
      <Card>
        <CardHeader>
          <CardTitle>维度评分</CardTitle>
          <CardDescription>各项能力的详细评估</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(result.dimensionScores).map(([key, score]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {dimensionLabels[key] || key}
                  </span>
                  <span className={`text-sm font-semibold ${getScoreColor(score)}`}>
                    {score}分
                  </span>
                </div>
                <Progress value={score} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 优势亮点 */}
      {result.strengths && result.strengths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <span>优势亮点</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.strengths.map((strength, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* 待提升项 */}
      {result.weaknesses && result.weaknesses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              <span>待提升项</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  <span className="text-sm">{weakness}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* 建议 */}
      {result.recommendations && result.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <span>改进建议</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* 风险提示 */}
      {result.riskWarnings && result.riskWarnings.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-destructive">
              <Shield className="h-5 w-5" />
              <span>风险提示</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.riskWarnings.map((warning, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <span className="text-sm text-destructive">{warning}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* AI评估说明 */}
      <Card className="border-muted">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3 text-xs text-muted-foreground">
            <Shield className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="space-y-1">
              <p className="font-medium">关于AI智能评估</p>
              <p>
                本评估基于多源数据融合和智能算法建模，采用"LLM-as-a-Judge"范式，
                对候选人进行客观、全面的评估。评估结果仅供参考，最终决策请结合实际情况综合判断。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
