package com.devsnippet.repository;

import com.devsnippet.model.entity.User;
import com.devsnippet.model.entity.UserFollow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserFollowRepository extends JpaRepository<UserFollow, Long> {
    long countByFollowing(User following);
    long countByFollower(User follower);
    boolean existsByFollowerAndFollowing(User follower, User following);
    Optional<UserFollow> findByFollowerAndFollowing(User follower, User following);
}
