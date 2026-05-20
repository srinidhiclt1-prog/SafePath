package com.safepath;

import com.safepath.entity.SafeSpot;
import com.safepath.repository.SafeSpotRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    private final SafeSpotRepository safeSpotRepository;

    public DataLoader(SafeSpotRepository safeSpotRepository) {
        this.safeSpotRepository = safeSpotRepository;
    }

    @Override
    public void run(String... args) {
        safeSpotRepository.save(new SafeSpot(
                "New York Public Library",
                "Library",
                "476 5th Ave",
                "New York City",
                "NY",
                "USA",
                40.7532,
                -73.9822,
                "Main branch near Bryant Park",
                92
        ));

        safeSpotRepository.save(new SafeSpot(
                "Mount Sinai Hospital",
                "Hospital",
                "1468 Madison Ave",
                "New York City",
                "NY",
                "USA",
                40.7901,
                -73.9533,
                "Major NYC hospital",
                95
        ));
    }
}
