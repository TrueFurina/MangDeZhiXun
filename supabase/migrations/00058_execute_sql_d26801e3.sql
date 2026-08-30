DROP POLICY IF EXISTS anon_read_class_students ON class_students; CREATE POLICY anon_read_class_students
  ON class_students
  AS PERMISSIVE
  FOR SELECT
  TO PUBLIC
  USING (
    true
  ); DROP POLICY IF EXISTS anon_read_submissions ON training_submissions; CREATE POLICY anon_read_submissions
  ON training_submissions
  AS PERMISSIVE
  FOR SELECT
  TO PUBLIC
  USING (
    true
  ); DROP POLICY IF EXISTS anon_write_submissions ON training_submissions; CREATE POLICY anon_write_submissions
  ON training_submissions
  AS PERMISSIVE
  FOR ALL
  TO PUBLIC
  USING (
    true
  )
  WITH CHECK (
    true
  );