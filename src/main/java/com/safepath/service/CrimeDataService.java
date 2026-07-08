package com.safepath.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class CrimeDataService {

    private final RestTemplate restTemplate = new RestTemplate();

    public int getCrimeCountNear(double lat, double lon) {
        String url = "https://data.cityofnewyork.us/resource/5uac-w243.json"
                + "?$select=count(*)"
                + "&$where=within_circle(lat_lon, " + lat + ", " + lon + ", 500)";

        Object[] result = restTemplate.getForObject(url, Object[].class);

        if (result == null || result.length == 0) {
            return 0;
        }

        java.util.Map firstResult = (java.util.Map) result[0];

        return Integer.parseInt(firstResult.get("count").toString());
    }

    public int getCrimePenalty(double lat, double lon) {
        int crimeCount = getCrimeCountNear(lat, lon);

        if (crimeCount >= 1500) return 30;
        if (crimeCount >= 1000) return 25;
        if (crimeCount >= 500) return 18;
        if (crimeCount >= 200) return 10;
        if (crimeCount >= 50) return 5;

        return 0;
    }
}