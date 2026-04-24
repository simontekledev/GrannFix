package com.example.grannfix.moderation.persistence;

import com.example.grannfix.moderation.domain.UserBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Repository
public interface UserBlockRepository extends JpaRepository<UserBlock, UUID> {

    boolean existsByBlockerIdAndBlockedId(UUID blockerId, UUID blockedId);

    void deleteByBlockerIdAndBlockedId(UUID blockerId, UUID blockedId);

    List<UserBlock> findAllByBlockerId(UUID blockerId);

    @Query("select b.blockedId from UserBlock b where b.blockerId = :userId")
    Set<UUID> findBlockedIdsByBlocker(@Param("userId") UUID userId);

    @Query("select b.blockerId from UserBlock b where b.blockedId = :userId")
    Set<UUID> findBlockerIdsByBlocked(@Param("userId") UUID userId);

    @Query("""
            select case when count(b) > 0 then true else false end
            from UserBlock b
            where (b.blockerId = :a and b.blockedId = :b)
               or (b.blockerId = :b and b.blockedId = :a)
            """)
    boolean existsBlockBetween(@Param("a") UUID a, @Param("b") UUID b);
}
