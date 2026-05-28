package com.safepath.controller;

import com.safepath.entity.SafeSpot;
import com.safepath.service.SafeSpotService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/safespots")
@CrossOrigin(origins = "http://localhost:3000")
public class SafeSpotController {

    private final SafeSpotService safeSpotService;

    public SafeSpotController(SafeSpotService safeSpotService) {
        this.safeSpotService = safeSpotService;
    }

    @GetMapping
    public List<SafeSpot> getAllSafeSpots() {
        return safeSpotService.getAllSafeSpots();
    }

    @PostMapping
    public SafeSpot createSafeSpot(@RequestBody SafeSpot safeSpot) {
        return safeSpotService.createSafeSpot(safeSpot);
    }

    @GetMapping("/city/{city}")
    public List<SafeSpot> getSafeSpotsByCity(@PathVariable String city) {
        return safeSpotService.getSafeSpotsByCity(city);
    }

    @GetMapping("/type/{type}")
    public List<SafeSpot> getSafeSpotsByType(@PathVariable String type) {
        return safeSpotService.getSafeSpotsByType(type);
    }

    @GetMapping("/safety/{score}")
    public List<SafeSpot> getSafeSpotsWithHighSafety(@PathVariable int score) {
        return safeSpotService.getSafeSpotsWithHighSafety(score);
    }

    @GetMapping("/nearby")
    public List<SafeSpot> getNearbySafeSpots(@RequestParam double lat, @RequestParam double lon) {
        return safeSpotService.getNearbySafeSpots(lat, lon);
    }
}