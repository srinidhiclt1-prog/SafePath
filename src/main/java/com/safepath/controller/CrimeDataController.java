package com.safepath.controller;

import com.safepath.service.CrimeDataService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;


@CrossOrigin(origins = "http://localhost:3000")
@RestController
public class CrimeDataController {

    private final CrimeDataService crimeDataService;

    public CrimeDataController(CrimeDataService crimeDataService) {
        this.crimeDataService = crimeDataService;
    }
    @GetMapping("/crime-test")
    public String crimeTest() {
        return "Crime controller is working!";
    }
    @GetMapping("/crimes/nearby")
    public int getCrimeCountNearby(
            @RequestParam double lat,
            @RequestParam double lon
    ) {
        return crimeDataService.getCrimeCountNear(lat, lon);
    }

    @GetMapping("/crimes/penalty")
    public int getCrimePenalty(
            @RequestParam double lat,
            @RequestParam double lon
    ) {
        return crimeDataService.getCrimePenalty(lat, lon);
    }
}