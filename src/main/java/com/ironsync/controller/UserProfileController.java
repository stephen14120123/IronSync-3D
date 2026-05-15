package com.ironsync.controller;

import com.ironsync.common.result.Result;
import com.ironsync.entity.UserProfile;
import com.ironsync.service.UserProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "用户资料", description = "用户身高、目标等资料管理接口")
@RestController
@RequestMapping("/api/user-profile")
public class UserProfileController {

    private final UserProfileService userProfileService;

    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @Operation(summary = "获取用户资料", description = "返回当前用户的个人信息（身高、目标等）")
    @ApiResponse(responseCode = "200", description = "成功返回用户资料")
    @GetMapping
    public Result<UserProfile> getProfile() {
        return Result.success(userProfileService.getProfile());
    }

    @Operation(summary = "更新用户资料", description = "更新身高和训练目标，仅传需要修改的字段即可")
    @ApiResponse(responseCode = "200", description = "更新成功返回完整用户资料")
    @PutMapping
    public Result<UserProfile> updateProfile(@RequestBody UserProfile profile) {
        return Result.success(userProfileService.updateProfile(profile));
    }
}
