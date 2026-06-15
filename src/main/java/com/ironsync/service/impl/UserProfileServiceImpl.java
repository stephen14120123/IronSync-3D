package com.ironsync.service.impl;

import com.ironsync.common.auth.CurrentUser;

import com.ironsync.entity.UserProfile;
import com.ironsync.mapper.UserProfileMapper;
import com.ironsync.service.UserProfileService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class UserProfileServiceImpl implements UserProfileService {

    private final UserProfileMapper userProfileMapper;

    public UserProfileServiceImpl(UserProfileMapper userProfileMapper) {
        this.userProfileMapper = userProfileMapper;
    }

    @Override
    public UserProfile getProfile() {
        UserProfile profile = userProfileMapper.selectById(CurrentUser.getUserId());
        if (profile == null) {
            // Auto-create if not exists
            profile = UserProfile.builder()
                    .id(CurrentUser.getUserId())
                    .heightCm(null)
                    .goal(null)
                    .createdAt(LocalDateTime.now())
                    .build();
            userProfileMapper.insert(profile);
        }
        return profile;
    }

    @Override
    @Transactional
    public UserProfile updateProfile(UserProfile profile) {
        profile.setId(CurrentUser.getUserId());
        userProfileMapper.update(profile);
        return userProfileMapper.selectById(CurrentUser.getUserId());
    }
}
