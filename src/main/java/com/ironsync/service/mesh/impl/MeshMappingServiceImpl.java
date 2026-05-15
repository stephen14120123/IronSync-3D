package com.ironsync.service.mesh.impl;

import com.ironsync.config.MeshMappingConfig;
import com.ironsync.service.mesh.MeshMappingService;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MeshMappingServiceImpl implements MeshMappingService {

    private final MeshMappingConfig meshMappingConfig;

    private Map<String, List<String>> mappingMap = Collections.emptyMap();

    public MeshMappingServiceImpl(MeshMappingConfig meshMappingConfig) {
        this.meshMappingConfig = meshMappingConfig;
    }

    @PostConstruct
    public void init() {
        this.mappingMap = meshMappingConfig.getMappings().stream()
                .collect(Collectors.toMap(
                        MeshMappingConfig.MappingItem::getAction,
                        MeshMappingConfig.MappingItem::getMeshes
                ));
    }

    @Override
    public List<String> getMeshNames(List<String> actionNames) {
        if (actionNames == null || actionNames.isEmpty()) {
            return Collections.emptyList();
        }
        return actionNames.stream()
                .flatMap(action -> mappingMap.getOrDefault(action, Collections.emptyList()).stream())
                .distinct()
                .collect(Collectors.toList());
    }
}
