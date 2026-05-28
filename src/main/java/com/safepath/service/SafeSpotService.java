package com.safepath.service;

import com.safepath.entity.SafeSpot;
import com.safepath.repository.SafeSpotRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SafeSpotService {

    private final SafeSpotRepository safeSpotRepository;

    public SafeSpotService(SafeSpotRepository safeSpotRepository) {
        this.safeSpotRepository = safeSpotRepository;
    }

    public List<SafeSpot> getAllSafeSpots() {
        return safeSpotRepository.findAll();
    }

    public SafeSpot createSafeSpot(SafeSpot safeSpot) {
        return safeSpotRepository.save(safeSpot);
    }
    public List<SafeSpot> getSafeSpotsByCity(String city) {
        return safeSpotRepository.findByCity(city);
    }

    public List<SafeSpot> getSafeSpotsByType(String type) {
        return safeSpotRepository.findByType(type);
    }

    public List<SafeSpot> getNearbySafeSpots(double lat, double lon) {
        List<SafeSpot> allSafeSpots = this.getAllSafeSpots();

        allSafeSpots.sort((spot1, spot2) -> {
            double score1 = calculateRecommendationScore(spot1, lat, lon);
            double score2 = calculateRecommendationScore(spot2, lat, lon);

            return Double.compare(score2, score1);
        });

        return allSafeSpots.stream().limit(5).toList();
    }

    public List<SafeSpot> getSafeSpotsWithHighSafety(int score) {
        return safeSpotRepository.findBySafetyScoreGreaterThan(score);
    }

    private double calculateRecommendationScore(SafeSpot spot, double userLat, double userLon) {
        double distance = calculateDistance(userLat, userLon, spot.getLatitude(), spot.getLongitude());

        int categoryBonus = 0;

        if (spot.getType().equals("Shelter")) {
            categoryBonus = 18;
        }
        else if (spot.getType().equals("Police Station")) {
            categoryBonus = 15;
        }
        else if (spot.getType().equals("Hospital")) {
            categoryBonus = 12;
        }
        else if (spot.getType().equals("Library")) {
            categoryBonus = 10;
        }
        else if (spot.getType().equals("Safe Transit Hub")) {
            categoryBonus = 8;
        }

        return spot.getSafetyScore() + categoryBonus - (distance * 100);
    }

    //Helper Methods
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double latDifference = lat1 - lat2;
        double lonDifference = lon1 - lon2;

        return Math.sqrt(latDifference * latDifference + lonDifference * lonDifference);
    }


}
