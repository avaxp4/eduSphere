-- إدراج بيانات تجريبية للمواد الدراسية
INSERT INTO subjects (name, description, color, order_index) VALUES
('الرياضيات', 'دراسة الأعداد والأشكال والمعادلات', '#3b82f6', 1),
('العلوم', 'استكشاف الطبيعة والكون والحياة', '#10b981', 2),
('اللغة العربية', 'دراسة اللغة والنحو والبلاغة', '#f59e0b', 3),
('التاريخ', 'دراسة الأحداث والحضارات عبر الزمن', '#8b5cf6', 4),
('الجغرافيا', 'دراسة الأرض والبيئة والسكان', '#14b8a6', 5);

-- إدراج وحدات تجريبية للرياضيات
INSERT INTO modules (subject_id, name, description, order_index)
SELECT id, 'الأعداد والعمليات', 'دراسة الأعداد الطبيعية والعمليات الحسابية', 1
FROM subjects WHERE name = 'الرياضيات';

INSERT INTO modules (subject_id, name, description, order_index)
SELECT id, 'الهندسة والأشكال', 'دراسة الأشكال الهندسية وخصائصها', 2
FROM subjects WHERE name = 'الرياضيات';

-- إدراج وحدات تجريبية للعلوم
INSERT INTO modules (subject_id, name, description, order_index)
SELECT id, 'الكائنات الحية', 'دراسة النباتات والحيوانات', 1
FROM subjects WHERE name = 'العلوم';

INSERT INTO modules (subject_id, name, description, order_index)
SELECT id, 'الطاقة والحركة', 'دراسة أنواع الطاقة والقوى', 2
FROM subjects WHERE name = 'العلوم';