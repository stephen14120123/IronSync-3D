package com.ironsync.service.impl;

import com.ironsync.entity.UserProfile;
import com.ironsync.mapper.UserProfileMapper;
import com.ironsync.service.UserProfileService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserProfileServiceImpl implements UserProfileService {

    private final UserProfileMapper userProfileMapper;

    public UserProfileServiceImpl(UserProfileMapper userProfileMapper) {
        this.userProfileMapper = userProfileMapper;
    }

    @Override
    public UserProfile getProfile() {
        UserProfile profile = userProfileMapper.selectById(1L);
        if (profile == null) {
            // Auto-create if not exists
            profile = UserProfile.builder()
                    .id(1L)
                    .heightCm(null)
                    .goal(null)
                    .build();
            userProfileMapper.insert(profile);
        }
        return profile;
    }

    @Override
    @Transactional
    public UserProfile updateProfile(UserProfile profile) {
        profile.setId(1L);
        userProfileMapper.update(profile);
        return userProfileMapper.selectById(1L);
    }
}
