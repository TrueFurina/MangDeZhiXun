-- 课程表
CREATE TABLE IF NOT EXISTS courses (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('video', 'document', 'course')),
  duration TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('初级', '中级', '高级')),
  instructor TEXT NOT NULL,
  rating DECIMAL(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
  description TEXT NOT NULL,
  link TEXT NOT NULL,
  dimension TEXT NOT NULL CHECK (dimension IN ('专业技能提升', '通用能力培养', '行为特质塑造', '项目实战经验', '推荐资源')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_courses_dimension ON courses(dimension);

-- RLS策略
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- 课程表：所有人可读
CREATE POLICY "courses_select_all" ON courses FOR SELECT USING (true);