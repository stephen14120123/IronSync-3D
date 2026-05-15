-- IronSync-3D E2E Test Seed Data
-- Used by TestDataController (/api/test/db-reset) in dev profile.
-- This file serves as documentation of the test dataset.

-- Default user
INSERT INTO user_profile (id, height_cm, goal, created_at)
VALUES (1, 178.0, '备考与增肌', NOW());

-- Pre-set supplements
INSERT INTO supplement (user_id, name, current_stock_g, daily_consumption_g, status)
VALUES (1, '酵母蛋白',    300.00, 25.00, '充足'),
       (1, '分离乳清蛋白', 500.00, 30.00, '充足'),
       (1, '肌酸',        250.00,  5.00, '充足');

-- Today's training record for 3D dashboard highlight test
INSERT INTO training_record (user_id, action_name, weight_kg, sets, reps, rpe, record_date)
VALUES (1, '杠铃深蹲', 80.0, 5, 10, 7.5, CURDATE());
