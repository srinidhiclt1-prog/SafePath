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

    public int getWeightedCrimeExposureNear(double lat, double lon) {

        String url = "https://data.cityofnewyork.us/resource/5uac-w243.json"
                + "?$select=law_cat_cd,count(*) as count"
                + "&$where=within_circle(lat_lon, " + lat + ", " + lon + ", 500)"
                + "&$group=law_cat_cd";

        Object[] result = restTemplate.getForObject(url, Object[].class);

        if (result == null || result.length == 0) {
            return 0;
        }

        int weightedExposure = 0;

        for (Object item : result) {
            java.util.Map row = (java.util.Map) item;

            String category = row.get("law_cat_cd").toString();
            int count = Integer.parseInt(row.get("count").toString());

            if (category.equalsIgnoreCase("FELONY")) {
                weightedExposure += count * 3;
            } else if (category.equalsIgnoreCase("MISDEMEANOR")) {
                weightedExposure += count * 2;
            } else {
                weightedExposure += count;
            }

            System.out.println(
                    "Crime category near " + lat + "," + lon +
                            ": " + category +
                            " count=" + count
            );
        }

        System.out.println(
                "Weighted exposure near " + lat + "," + lon +
                        " = " + weightedExposure
        );
        return weightedExposure;
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