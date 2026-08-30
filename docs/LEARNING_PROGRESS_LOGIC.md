# 芒得很职 - 学习进度落库完整逻辑

## 一、学习进度三段式设计

### 1.1 进度状态定义

| 状态 | 进度值 | 说明 | 触发条件 |
|------|--------|------|----------|
| 未开始 | 0% | 课程初始状态 | 课程首次加载 |
| 学习中 | 50% | 已开始学习 | 点击"开始学习"按钮 |
| 已完成 | 100% | 学习完成 | 点击"确认完成"按钮 |

### 1.2 业务流程图

```
┌─────────────┐
│  课程列表   │
│  (0%)       │
└──────┬──────┘
       │
       │ 点击"开始学习"
       ▼
┌─────────────┐
│  学习中     │
│  (50%)      │
└──────┬──────┘
       │
       │ 点击"确认完成"
       ▼
┌─────────────┐
│  已完成     │
│  (100%)     │
└──────┬──────┘
       │
       │ 自动解锁成就
       ▼
┌─────────────┐
│  成长中心   │
│  更新统计   │
└─────────────┘
```

---

## 二、数据库表结构

### 2.1 course_progress表

```sql
CREATE TABLE course_progress (
  id BIGSERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  course_id BIGINT NOT NULL,
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent IN (0, 50, 100)),
  is_completed BOOLEAN DEFAULT false,
  exam_passed BOOLEAN DEFAULT false,
  last_studied_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_email, course_id)
);

-- 索引
CREATE INDEX idx_course_progress_user_email ON course_progress(user_email);
CREATE INDEX idx_course_progress_course_id ON course_progress(course_id);
CREATE INDEX idx_course_progress_is_completed ON course_progress(is_completed);
```

### 2.2 learning_records表（详细记录）

```sql
CREATE TABLE learning_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  course_id BIGINT NOT NULL,
  session_start TIMESTAMPTZ NOT NULL,
  session_end TIMESTAMPTZ,
  time_spent INTEGER DEFAULT 0, -- 学习时长（分钟）
  progress_before INTEGER,
  progress_after INTEGER,
  action_type TEXT CHECK (action_type IN ('start', 'continue', 'complete', 'pause')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_learning_records_user_id ON learning_records(user_id);
CREATE INDEX idx_learning_records_course_id ON learning_records(course_id);
CREATE INDEX idx_learning_records_session_start ON learning_records(session_start);
```

---

## 三、API函数实现

### 3.1 开始学习（0% → 50%）

```typescript
/**
 * 开始学习课程
 * @param courseId 课程ID
 * @param courseName 课程名称
 * @returns 学习进度记录
 */
export async function startLearning(courseId: number, courseName: string) {
  const userEmail = getCurrentUserEmail();
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  try {
    // 1. 更新或插入课程进度
    const { data: progressData, error: progressError } = await supabase
      .from('course_progress')
      .upsert({
        user_email: userEmail,
        course_id: courseId,
        progress_percent: 50,
        is_completed: false,
        last_studied_at: new Date().toISOString()
      }, {
        onConflict: 'user_email,course_id',
        ignoreDuplicates: false
      })
      .select()
      .single();
    
    if (progressError) throw progressError;
    
    // 2. 记录学习行为
    const { error: recordError } = await supabase
      .from('learning_records')
      .insert({
        user_id: userId,
        course_id: courseId,
        session_start: new Date().toISOString(),
        progress_before: 0,
        progress_after: 50,
        action_type: 'start'
      });
    
    if (recordError) throw recordError;
    
    // 3. 返回成功结果
    return {
      success: true,
      data: progressData,
      message: '开始学习成功'
    };
  } catch (error) {
    console.error('开始学习失败:', error);
    return {
      success: false,
      error: error,
      message: '开始学习失败，请重试'
    };
  }
}
```

### 3.2 确认完成（50% → 100%）

```typescript
/**
 * 确认完成课程
 * @param courseId 课程ID
 * @returns 完成结果
 */
export async function completeLearning(courseId: number) {
  const userEmail = getCurrentUserEmail();
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  try {
    // 1. 更新课程进度为100%
    const { data: progressData, error: progressError } = await supabase
      .from('course_progress')
      .update({
        progress_percent: 100,
        is_completed: true,
        completed_at: new Date().toISOString(),
        last_studied_at: new Date().toISOString()
      })
      .eq('user_email', userEmail)
      .eq('course_id', courseId)
      .select()
      .single();
    
    if (progressError) throw progressError;
    
    // 2. 记录完成行为
    const { error: recordError } = await supabase
      .from('learning_records')
      .insert({
        user_id: userId,
        course_id: courseId,
        session_start: new Date().toISOString(),
        session_end: new Date().toISOString(),
        progress_before: 50,
        progress_after: 100,
        action_type: 'complete'
      });
    
    if (recordError) throw recordError;
    
    // 3. 检查并解锁成就
    await checkAndUnlockAchievements(userEmail);
    
    // 4. 返回成功结果
    return {
      success: true,
      data: progressData,
      message: '恭喜完成课程！'
    };
  } catch (error) {
    console.error('完成课程失败:', error);
    return {
      success: false,
      error: error,
      message: '完成课程失败，请重试'
    };
  }
}
```

### 3.3 获取学习进度

```typescript
/**
 * 获取用户的所有课程进度
 * @returns 课程进度列表
 */
export async function getLearningProgress() {
  const userEmail = getCurrentUserEmail();
  
  try {
    const { data, error } = await supabase
      .from('course_progress')
      .select('*')
      .eq('user_email', userEmail)
      .order('last_studied_at', { ascending: false });
    
    if (error) throw error;
    
    return {
      success: true,
      data: data || [],
      message: '获取学习进度成功'
    };
  } catch (error) {
    console.error('获取学习进度失败:', error);
    return {
      success: false,
      error: error,
      data: [],
      message: '获取学习进度失败'
    };
  }
}
```

### 3.4 获取单个课程进度

```typescript
/**
 * 获取指定课程的学习进度
 * @param courseId 课程ID
 * @returns 课程进度
 */
export async function getCourseProgress(courseId: number) {
  const userEmail = getCurrentUserEmail();
  
  try {
    const { data, error } = await supabase
      .from('course_progress')
      .select('*')
      .eq('user_email', userEmail)
      .eq('course_id', courseId)
      .maybeSingle();
    
    if (error) throw error;
    
    return {
      success: true,
      data: data || {
        progress_percent: 0,
        is_completed: false
      },
      message: '获取课程进度成功'
    };
  } catch (error) {
    console.error('获取课程进度失败:', error);
    return {
      success: false,
      error: error,
      data: {
        progress_percent: 0,
        is_completed: false
      },
      message: '获取课程进度失败'
    };
  }
}
```

---

## 四、前端组件实现

### 4.1 课程卡片组件

```typescript
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PlayCircle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { getCourseProgress, startLearning, completeLearning } from '@/db/api';

interface CourseCardProps {
  courseId: number;
  courseName: string;
  courseDescription: string;
  courseDuration: string;
}

export function CourseCard({ courseId, courseName, courseDescription, courseDuration }: CourseCardProps) {
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // 加载课程进度
  useEffect(() => {
    loadProgress();
  }, [courseId]);
  
  const loadProgress = async () => {
    const result = await getCourseProgress(courseId);
    if (result.success && result.data) {
      setProgress(result.data.progress_percent || 0);
      setIsCompleted(result.data.is_completed || false);
    }
  };
  
  // 开始学习
  const handleStartLearning = async () => {
    setLoading(true);
    const result = await startLearning(courseId, courseName);
    setLoading(false);
    
    if (result.success) {
      setProgress(50);
      toast.success('开始学习成功！');
    } else {
      toast.error(result.message);
    }
  };
  
  // 确认完成
  const handleCompleteLearning = async () => {
    setLoading(true);
    const result = await completeLearning(courseId);
    setLoading(false);
    
    if (result.success) {
      setProgress(100);
      setIsCompleted(true);
      toast.success('恭喜完成课程！🎉');
    } else {
      toast.error(result.message);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{courseName}</span>
          {isCompleted && <CheckCircle className="h-5 w-5 text-success" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{courseDescription}</p>
        
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{courseDuration}</span>
        </div>
        
        {/* 进度条 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>学习进度</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        {/* 操作按钮 */}
        <div className="flex space-x-2">
          {progress === 0 && (
            <Button 
              className="flex-1" 
              onClick={handleStartLearning}
              disabled={loading}
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              开始学习
            </Button>
          )}
          
          {progress === 50 && (
            <>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => window.location.href = `/student/learning/${courseId}`}
              >
                继续学习
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleCompleteLearning}
                disabled={loading}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                确认完成
              </Button>
            </>
          )}
          
          {progress === 100 && (
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => window.location.href = `/student/learning/${courseId}`}
            >
              复习课程
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 4.2 学习统计组件

```typescript
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { getLearningProgress } from '@/db/api';

export function LearningStats() {
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    completionRate: 0
  });
  
  useEffect(() => {
    loadStats();
  }, []);
  
  const loadStats = async () => {
    const result = await getLearningProgress();
    if (result.success && result.data) {
      const total = result.data.length;
      const completed = result.data.filter(p => p.is_completed).length;
      const inProgress = result.data.filter(p => p.progress_percent === 50).length;
      const rate = total > 0 ? (completed / total * 100).toFixed(1) : 0;
      
      setStats({
        totalCourses: total,
        completedCourses: completed,
        inProgressCourses: inProgress,
        completionRate: Number(rate)
      });
    }
  };
  
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">总课程数</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCourses}</div>
          <p className="text-xs text-muted-foreground">已注册课程</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">已完成</CardTitle>
          <CheckCircle className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{stats.completedCourses}</div>
          <p className="text-xs text-muted-foreground">完成课程数</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">学习中</CardTitle>
          <Clock className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning">{stats.inProgressCourses}</div>
          <p className="text-xs text-muted-foreground">进行中课程</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">完成率</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{stats.completionRate}%</div>
          <p className="text-xs text-muted-foreground">学习完成率</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 五、成就系统实现

### 5.1 成就定义

```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: any) => boolean;
}

const achievements: Achievement[] = [
  {
    id: 'first_course',
    name: '初学者',
    description: '完成第一门课程',
    icon: '🎓',
    condition: (stats) => stats.completedCourses >= 1
  },
  {
    id: 'five_courses',
    name: '学习达人',
    description: '完成5门课程',
    icon: '📚',
    condition: (stats) => stats.completedCourses >= 5
  },
  {
    id: 'ten_courses',
    name: '知识大师',
    description: '完成10门课程',
    icon: '🏆',
    condition: (stats) => stats.completedCourses >= 10
  },
  {
    id: 'high_completion',
    name: '完美主义者',
    description: '完成率达到80%',
    icon: '⭐',
    condition: (stats) => stats.completionRate >= 80
  },
  {
    id: 'continuous_learning',
    name: '坚持不懈',
    description: '连续7天学习',
    icon: '🔥',
    condition: (stats) => stats.continuousDays >= 7
  }
];
```

### 5.2 成就检查函数

```typescript
/**
 * 检查并解锁成就
 * @param userEmail 用户邮箱
 * @returns 新解锁的成就列表
 */
export async function checkAndUnlockAchievements(userEmail: string) {
  try {
    // 1. 获取学习统计
    const result = await getLearningProgress();
    if (!result.success) return [];
    
    const total = result.data.length;
    const completed = result.data.filter(p => p.is_completed).length;
    const rate = total > 0 ? (completed / total * 100) : 0;
    
    const stats = {
      totalCourses: total,
      completedCourses: completed,
      completionRate: rate,
      continuousDays: 0 // TODO: 计算连续学习天数
    };
    
    // 2. 检查哪些成就已解锁
    const unlockedAchievements = achievements.filter(achievement => 
      achievement.condition(stats)
    );
    
    // 3. 获取用户已有的成就
    const { data: existingAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_email', userEmail);
    
    const existingIds = existingAchievements?.map(a => a.achievement_id) || [];
    
    // 4. 找出新解锁的成就
    const newAchievements = unlockedAchievements.filter(
      achievement => !existingIds.includes(achievement.id)
    );
    
    // 5. 保存新成就到数据库
    if (newAchievements.length > 0) {
      const { error } = await supabase
        .from('user_achievements')
        .insert(
          newAchievements.map(achievement => ({
            user_email: userEmail,
            achievement_id: achievement.id,
            achievement_name: achievement.name,
            achievement_description: achievement.description,
            achievement_icon: achievement.icon,
            unlocked_at: new Date().toISOString()
          }))
        );
      
      if (error) throw error;
      
      // 6. 显示成就解锁提示
      newAchievements.forEach(achievement => {
        toast.success(`🎉 解锁成就：${achievement.icon} ${achievement.name}`, {
          description: achievement.description,
          duration: 5000
        });
      });
    }
    
    return newAchievements;
  } catch (error) {
    console.error('检查成就失败:', error);
    return [];
  }
}
```

---

## 六、数据统计与分析

### 6.1 学习时长统计

```typescript
/**
 * 获取学习时长统计
 * @returns 学习时长数据
 */
export async function getLearningTimeStats() {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  try {
    const { data, error } = await supabase
      .from('learning_records')
      .select('time_spent, session_start')
      .eq('user_id', userId)
      .order('session_start', { ascending: false });
    
    if (error) throw error;
    
    // 计算总学习时长
    const totalMinutes = data?.reduce((sum, record) => sum + (record.time_spent || 0), 0) || 0;
    const totalHours = (totalMinutes / 60).toFixed(1);
    
    // 计算最近7天学习时长
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentData = data?.filter(record => 
      new Date(record.session_start) >= sevenDaysAgo
    ) || [];
    
    const recentMinutes = recentData.reduce((sum, record) => sum + (record.time_spent || 0), 0);
    const recentHours = (recentMinutes / 60).toFixed(1);
    
    return {
      success: true,
      data: {
        totalHours,
        recentHours,
        totalSessions: data?.length || 0,
        recentSessions: recentData.length
      }
    };
  } catch (error) {
    console.error('获取学习时长统计失败:', error);
    return {
      success: false,
      error: error,
      data: {
        totalHours: '0',
        recentHours: '0',
        totalSessions: 0,
        recentSessions: 0
      }
    };
  }
}
```

### 6.2 学习趋势分析

```typescript
/**
 * 获取学习趋势数据（最近30天）
 * @returns 学习趋势数据
 */
export async function getLearningTrend() {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data, error } = await supabase
      .from('learning_records')
      .select('session_start, time_spent')
      .eq('user_id', userId)
      .gte('session_start', thirtyDaysAgo.toISOString())
      .order('session_start', { ascending: true });
    
    if (error) throw error;
    
    // 按日期分组统计
    const trendData = {};
    data?.forEach(record => {
      const date = new Date(record.session_start).toLocaleDateString();
      if (!trendData[date]) {
        trendData[date] = {
          date,
          sessions: 0,
          minutes: 0
        };
      }
      trendData[date].sessions += 1;
      trendData[date].minutes += record.time_spent || 0;
    });
    
    return {
      success: true,
      data: Object.values(trendData)
    };
  } catch (error) {
    console.error('获取学习趋势失败:', error);
    return {
      success: false,
      error: error,
      data: []
    };
  }
}
```

---

## 七、错误处理与重试机制

### 7.1 网络错误处理

```typescript
/**
 * 带重试的API调用
 * @param fn API函数
 * @param maxRetries 最大重试次数
 * @returns API结果
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`API调用失败，第${i + 1}次重试...`, error);
      
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  
  throw lastError;
}

// 使用示例
export async function startLearningWithRetry(courseId: number, courseName: string) {
  return withRetry(() => startLearning(courseId, courseName));
}
```

### 7.2 离线数据缓存

```typescript
/**
 * 离线学习进度缓存
 */
class OfflineProgressCache {
  private cacheKey = 'offline_learning_progress';
  
  // 保存进度到本地
  saveProgress(courseId: number, progress: number) {
    const cache = this.getCache();
    cache[courseId] = {
      progress,
      timestamp: Date.now()
    };
    localStorage.setItem(this.cacheKey, JSON.stringify(cache));
  }
  
  // 获取缓存
  getCache(): Record<number, any> {
    const data = localStorage.getItem(this.cacheKey);
    return data ? JSON.parse(data) : {};
  }
  
  // 同步缓存到服务器
  async syncToServer() {
    const cache = this.getCache();
    const courseIds = Object.keys(cache);
    
    for (const courseId of courseIds) {
      const { progress } = cache[courseId];
      
      try {
        if (progress === 50) {
          await startLearning(Number(courseId), '');
        } else if (progress === 100) {
          await completeLearning(Number(courseId));
        }
        
        // 同步成功，删除缓存
        delete cache[courseId];
      } catch (error) {
        console.error(`同步课程${courseId}进度失败:`, error);
      }
    }
    
    localStorage.setItem(this.cacheKey, JSON.stringify(cache));
  }
}

export const offlineCache = new OfflineProgressCache();

// 在应用启动时同步离线数据
window.addEventListener('online', () => {
  offlineCache.syncToServer();
});
```

---

## 八、测试用例

### 8.1 单元测试

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { startLearning, completeLearning, getCourseProgress } from '@/db/api';

describe('学习进度功能测试', () => {
  beforeEach(async () => {
    // 清理测试数据
    await cleanupTestData();
  });
  
  it('应该能够开始学习课程', async () => {
    const result = await startLearning(1, '测试课程');
    
    expect(result.success).toBe(true);
    expect(result.data.progress_percent).toBe(50);
    expect(result.data.is_completed).toBe(false);
  });
  
  it('应该能够完成课程', async () => {
    // 先开始学习
    await startLearning(1, '测试课程');
    
    // 再完成课程
    const result = await completeLearning(1);
    
    expect(result.success).toBe(true);
    expect(result.data.progress_percent).toBe(100);
    expect(result.data.is_completed).toBe(true);
  });
  
  it('应该能够获取课程进度', async () => {
    await startLearning(1, '测试课程');
    
    const result = await getCourseProgress(1);
    
    expect(result.success).toBe(true);
    expect(result.data.progress_percent).toBe(50);
  });
  
  it('未开始的课程进度应该为0', async () => {
    const result = await getCourseProgress(999);
    
    expect(result.success).toBe(true);
    expect(result.data.progress_percent).toBe(0);
  });
});
```

### 8.2 集成测试

```typescript
describe('学习进度完整流程测试', () => {
  it('应该能够完成完整的学习流程', async () => {
    // 1. 开始学习
    const startResult = await startLearning(1, '测试课程');
    expect(startResult.success).toBe(true);
    
    // 2. 检查进度
    const progressResult = await getCourseProgress(1);
    expect(progressResult.data.progress_percent).toBe(50);
    
    // 3. 完成学习
    const completeResult = await completeLearning(1);
    expect(completeResult.success).toBe(true);
    
    // 4. 验证最终进度
    const finalResult = await getCourseProgress(1);
    expect(finalResult.data.progress_percent).toBe(100);
    expect(finalResult.data.is_completed).toBe(true);
  });
});
```

---

## 九、性能优化

### 9.1 批量加载进度

```typescript
/**
 * 批量获取多个课程的进度
 * @param courseIds 课程ID列表
 * @returns 课程进度映射
 */
export async function getBatchCourseProgress(courseIds: number[]) {
  const userEmail = getCurrentUserEmail();
  
  try {
    const { data, error } = await supabase
      .from('course_progress')
      .select('*')
      .eq('user_email', userEmail)
      .in('course_id', courseIds);
    
    if (error) throw error;
    
    // 转换为映射格式
    const progressMap = {};
    data?.forEach(progress => {
      progressMap[progress.course_id] = progress;
    });
    
    // 补充未开始的课程
    courseIds.forEach(courseId => {
      if (!progressMap[courseId]) {
        progressMap[courseId] = {
          progress_percent: 0,
          is_completed: false
        };
      }
    });
    
    return {
      success: true,
      data: progressMap
    };
  } catch (error) {
    console.error('批量获取课程进度失败:', error);
    return {
      success: false,
      error: error,
      data: {}
    };
  }
}
```

### 9.2 进度缓存

```typescript
/**
 * 进度缓存管理
 */
class ProgressCache {
  private cache: Map<number, any> = new Map();
  private cacheTime: Map<number, number> = new Map();
  private cacheDuration = 5 * 60 * 1000; // 5分钟
  
  get(courseId: number) {
    const time = this.cacheTime.get(courseId);
    if (time && Date.now() - time < this.cacheDuration) {
      return this.cache.get(courseId);
    }
    return null;
  }
  
  set(courseId: number, progress: any) {
    this.cache.set(courseId, progress);
    this.cacheTime.set(courseId, Date.now());
  }
  
  clear(courseId?: number) {
    if (courseId) {
      this.cache.delete(courseId);
      this.cacheTime.delete(courseId);
    } else {
      this.cache.clear();
      this.cacheTime.clear();
    }
  }
}

export const progressCache = new ProgressCache();

// 使用缓存的获取函数
export async function getCourseProgressWithCache(courseId: number) {
  // 先检查缓存
  const cached = progressCache.get(courseId);
  if (cached) {
    return {
      success: true,
      data: cached,
      fromCache: true
    };
  }
  
  // 缓存未命中，从数据库获取
  const result = await getCourseProgress(courseId);
  if (result.success) {
    progressCache.set(courseId, result.data);
  }
  
  return result;
}
```

---

## 十、总结

### 10.1 核心功能
- ✅ 三段式学习进度（0% → 50% → 100%）
- ✅ 学习行为记录
- ✅ 成就系统
- ✅ 学习统计
- ✅ 离线缓存
- ✅ 错误重试

### 10.2 技术特点
- 数据真实落库，永久保存
- 行级安全策略，数据隔离
- 性能优化，批量加载
- 离线支持，自动同步
- 完善的错误处理

### 10.3 业务价值
- 学习进度可追溯
- 成就系统激励学习
- 数据统计支持决策
- 用户体验流畅

---

**文档版本**：v1.0  
**更新日期**：2026-03-12  
**维护人员**：技术团队
