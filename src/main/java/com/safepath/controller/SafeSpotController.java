package com.safepath.controller;

import com.safepath.entity.SafeSpot;
import com.safepath.service.SafeSpotService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/safespots")
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
}