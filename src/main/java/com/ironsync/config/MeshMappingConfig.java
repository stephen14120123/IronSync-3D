package com.ironsync.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Data
@Component
@ConfigurationProperties(prefix = "ironsync.mesh")
public class MeshMappingConfig {

    private List<MappingItem> mappings = new ArrayList<>();

    @Data
    public static class MappingItem {
        private String action;
        private List<String> meshes;
    }
}
