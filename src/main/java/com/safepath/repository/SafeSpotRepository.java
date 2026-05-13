package com.safepath.repository;

import com.safepath.entity.SafeSpot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SafeSpotRepository extends JpaRepository<SafeSpot, Long> {
    List<SafeSpot> findByCity(String city);
    List<SafeSpot> findByType(String type);
    List<SafeSpot> findBySafetyScoreGreaterThan(int score);

}