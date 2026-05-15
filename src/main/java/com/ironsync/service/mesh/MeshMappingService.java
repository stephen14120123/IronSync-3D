package com.ironsync.service.mesh;

import java.util.List;

public interface MeshMappingService {

    /**
     * 根据训练动作名列表查询对应的 3D Mesh 节点名称列表（去重）。
     * 未匹配的动作将被静默跳过。
     */
    List<String> getMeshNames(List<String> actionNames);
}
