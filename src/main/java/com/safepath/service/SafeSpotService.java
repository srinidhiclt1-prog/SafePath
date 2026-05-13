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
            double distance1 = calculateDistance(lat, lon, spot1.getLatitude(), spot1.getLongitude());
            double distance2 = calculateDistance(lat, lon, spot2.getLatitude(), spot2.getLongitude());

            return Double.compare(distance1, distance2);
        });

        return allSafeSpots.stream().limit(5).toList();
    }

    public List<SafeSpot> getSafeSpotsWithHighSafety(int score) {
        return safeSpotRepository.findBySafetyScoreGreaterThan(score);
    }

    //Helper Methods
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double latDifference = lat1 - lat2;
        double lonDifference = lon1 - lon2;

        return Math.sqrt(latDifference * latDifference + lonDifference * lonDifference);
    }


}
