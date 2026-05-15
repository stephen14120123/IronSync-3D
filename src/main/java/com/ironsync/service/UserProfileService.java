package com.ironsync.service;

import com.ironsync.entity.UserProfile;

public interface UserProfileService {

    UserProfile getProfile();

    UserProfile updateProfile(UserProfile profile);
}
