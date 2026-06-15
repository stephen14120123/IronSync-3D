-- 将已录入的引体向上数据重量设为 0（自重）
UPDATE training_record
SET weight_kg = 0
WHERE action_name = '引体向上'
  AND (weight_kg IS NULL OR weight_kg > 0);
