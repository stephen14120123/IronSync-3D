package com.ironsync;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.ironsync.mapper")
public class IronSyncApplication {

    public static void main(String[] args) {
        SpringApplication.run(IronSyncApplication.class, args);
    }
}
