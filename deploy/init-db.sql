-- ============================================================
-- IronSync-3D 数据库初始化脚本
-- 基于 System_Design.md v2.0 数据字典编写
-- 执行: mysql -u root -p < deploy/init-db.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS ironsync_3d
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE ironsync_3d;

-- ============================================================
-- 1. user_profile 用户信息
-- ============================================================
DROP TABLE IF EXISTS user_profile;
CREATE TABLE user_profile
(
    id         BIGINT       NOT NULL AUTO_INCREMENT COMMENT '用户主键',
    height_cm  DECIMAL(5,1) NOT NULL COMMENT '身高(cm)，校验范围 50-250',
    goal       VARCHAR(100)          DEFAULT NULL COMMENT '训练目标，如「增肌」「减脂」「力量举」',
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户信息';

-- ============================================================
-- 2. training_record 训练记录
-- ============================================================
DROP TABLE IF EXISTS training_record;
CREATE TABLE training_record
(
    id          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '记录主键',
    user_id     BIGINT       NOT NULL COMMENT '所属用户，FK → user_profile.id',
    action_name VARCHAR(50)  NOT NULL COMMENT '动作名称（下拉枚举）',
    weight_kg   DECIMAL(5,1) NOT NULL COMMENT '使用重量(kg)，范围 1-999',
    reps        INT          NOT NULL COMMENT '每组次数，≥ 1',
    sets        INT          NOT NULL COMMENT '组数，范围 1-50',
    rpe         DECIMAL(2,1) NOT NULL COMMENT 'RPE 自感用力度(1.0-10.0)，步进 0.5',
    record_date DATE         NOT NULL COMMENT '训练日期，不可为未来日期',
    deleted     TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除标志(0=正常,1=已删除)',
    PRIMARY KEY (id),
    INDEX idx_training_date_action (record_date, action_name),
    CONSTRAINT fk_training_user FOREIGN KEY (user_id) REFERENCES user_profile (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='训练记录';

-- ============================================================
-- 3. supplement 补剂库存
-- ============================================================
DROP TABLE IF EXISTS supplement;
CREATE TABLE supplement
(
    id                   BIGINT       NOT NULL AUTO_INCREMENT COMMENT '补剂主键',
    user_id              BIGINT       NOT NULL COMMENT '所属用户，FK → user_profile.id',
    name                 VARCHAR(50)  NOT NULL COMMENT '补剂名称',
    current_stock_g      DECIMAL(8,2) NOT NULL COMMENT '当前库存总量(g)',
    daily_consumption_g  DECIMAL(6,2) NOT NULL COMMENT '每日消耗量(g)',
    status               VARCHAR(10)  NOT NULL DEFAULT '充足' COMMENT '预警状态（充足/偏低/告急）',
    created_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    CONSTRAINT fk_supplement_user FOREIGN KEY (user_id) REFERENCES user_profile (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='补剂库存';

-- ============================================================
-- 4. diet_mood 饮食情绪
-- ============================================================
DROP TABLE IF EXISTS diet_mood;
CREATE TABLE diet_mood
(
    id          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '记录主键',
    user_id     BIGINT       NOT NULL COMMENT '所属用户，FK → user_profile.id',
    record_date DATE         NOT NULL COMMENT '记录日期（每日一条），不可为未来日期',
    carbs_g     DECIMAL(6,1) NOT NULL COMMENT '碳水化合物摄入量(g)',
    protein_g   DECIMAL(6,1) NOT NULL COMMENT '蛋白质摄入量(g)',
    fat_g       DECIMAL(6,1) NOT NULL COMMENT '脂肪摄入量(g)',
    mood_score  INT          NOT NULL COMMENT '情绪评分(1-10)',
    note        VARCHAR(500)          DEFAULT NULL COMMENT '备注',
    PRIMARY KEY (id),
    UNIQUE INDEX idx_diet_mood_date (user_id, record_date),
    CONSTRAINT fk_diet_mood_user FOREIGN KEY (user_id) REFERENCES user_profile (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='饮食情绪';

-- ============================================================
-- 5. body_metrics 身体指标（时序）
-- ============================================================
DROP TABLE IF EXISTS body_metrics;
CREATE TABLE body_metrics
(
    id                    BIGINT       NOT NULL AUTO_INCREMENT COMMENT '记录主键',
    user_id               BIGINT       NOT NULL COMMENT '所属用户，FK → user_profile.id',
    record_date           DATE         NOT NULL COMMENT '记录日期（每日一条），不可为未来日期',
    weight_kg             DECIMAL(5,2) NOT NULL COMMENT '体重(kg)，范围 20-300',
    body_fat_percentage   DECIMAL(4,1)          DEFAULT NULL COMMENT '体脂率(%)，范围 3.0-60.0',
    note                  VARCHAR(500)          DEFAULT NULL COMMENT '备注',
    PRIMARY KEY (id),
    UNIQUE INDEX idx_body_metrics_date (user_id, record_date),
    CONSTRAINT fk_body_metrics_user FOREIGN KEY (user_id) REFERENCES user_profile (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='身体指标（时序）';

-- ============================================================
-- 基础种子数据
-- ============================================================

-- 默认用户 (id=1)
INSERT INTO user_profile (id, height_cm, goal, created_at)
VALUES (1, 178.0, '备考与增肌', NOW());

-- 预置补剂 (user_id=1)
INSERT INTO supplement (user_id, name, current_stock_g, daily_consumption_g, status)
VALUES (1, '酵母蛋白',    300.00, 25.00, '充足'),
       (1, '分离乳清蛋白', 500.00, 30.00, '充足'),
       (1, '肌酸',        250.00,  5.00, '充足');
