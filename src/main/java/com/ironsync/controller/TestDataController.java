package com.ironsync.controller;

import com.ironsync.common.result.Result;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@Profile("dev")
@RestController
@RequestMapping("/api/test")
public class TestDataController {

    private final JdbcTemplate jdbcTemplate;

    public TestDataController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostMapping("/db-reset")
    public Result<Void> resetDatabase() {
        jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");

        try {
            jdbcTemplate.execute("TRUNCATE TABLE body_metrics");
            jdbcTemplate.execute("TRUNCATE TABLE diet_mood");
            jdbcTemplate.execute("TRUNCATE TABLE supplement");
            jdbcTemplate.execute("TRUNCATE TABLE training_record");
            jdbcTemplate.execute("TRUNCATE TABLE user_profile");

            jdbcTemplate.update(
                    "INSERT INTO user_profile (id, height_cm, goal, created_at) VALUES (1, 178.0, '备考与增肌', NOW())");

            jdbcTemplate.update(
                    "INSERT INTO supplement (user_id, name, current_stock_g, daily_consumption_g, status) VALUES (1, '酵母蛋白', 300.00, 25.00, '充足')");
            jdbcTemplate.update(
                    "INSERT INTO supplement (user_id, name, current_stock_g, daily_consumption_g, status) VALUES (1, '分离乳清蛋白', 500.00, 30.00, '充足')");
            jdbcTemplate.update(
                    "INSERT INTO supplement (user_id, name, current_stock_g, daily_consumption_g, status) VALUES (1, '肌酸', 250.00, 5.00, '充足')");

            jdbcTemplate.update(
                    "INSERT INTO training_record (user_id, action_name, weight_kg, sets, reps, rpe, record_date) VALUES (1, '杠铃深蹲', 80.0, 5, 10, 7.5, ?)",
                    LocalDate.now());
        } finally {
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");
        }

        return Result.success();
    }
}
