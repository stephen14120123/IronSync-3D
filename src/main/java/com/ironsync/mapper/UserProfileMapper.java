package com.ironsync.mapper;

import com.ironsync.entity.UserProfile;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserProfileMapper {

    int insert(UserProfile userProfile);

    UserProfile selectById(Long id);

    int update(UserProfile userProfile);

    int deleteById(Long id);
}
