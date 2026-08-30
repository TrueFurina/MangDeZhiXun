-- 学生档案（脱敏）
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_no TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  gender TEXT,
  birth_date TEXT,
  political_status TEXT,
  hometown TEXT,
  province TEXT,
  city TEXT,
  id_masked TEXT,
  phone_masked TEXT,
  major TEXT,
  class_name TEXT,
  mentor_name TEXT,
  mentor_title TEXT,
  mentor_qq TEXT,
  dorm_building TEXT,
  dorm_room TEXT,
  dorm_seat TEXT,
  dorm_counselor TEXT,
  dorm_class_info TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 导师指导安排
CREATE TABLE IF NOT EXISTS mentor_arrangements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_name TEXT NOT NULL,
  title TEXT,
  target_class TEXT,
  student_count INT,
  student_names TEXT[],
  qq TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 宿舍床位
CREATE TABLE IF NOT EXISTS dorm_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building TEXT NOT NULL,
  room_no TEXT NOT NULL,
  seat_no TEXT,
  grade TEXT,
  class_info TEXT,
  years TEXT,
  member_name TEXT NOT NULL,
  is_leader BOOLEAN DEFAULT false,
  leader TEXT,
  counselor TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_arrangements ENABLE ROW LEVEL SECURITY;
ALTER TABLE dorm_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_profiles" ON student_profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_write_profiles" ON student_profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_read_mentors" ON mentor_arrangements FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_write_mentors" ON mentor_arrangements FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_read_dorms" ON dorm_members FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_write_dorms" ON dorm_members FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_profiles_name ON student_profiles(name);
CREATE INDEX IF NOT EXISTS idx_mentor_name ON mentor_arrangements(mentor_name);
CREATE INDEX IF NOT EXISTS idx_dorm_name ON dorm_members(member_name);