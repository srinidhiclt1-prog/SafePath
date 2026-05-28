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
                "Bellevue Hospital Center",
                "Hospital",
                "462 1st Ave",
                "New York City",
                "NY",
                "USA",
                40.7392,
                -73.9763,
                "Major emergency hospital in Manhattan",
                95
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
                "Large hospital on Upper East Side",
                93
        ));

        safeSpotRepository.save(new SafeSpot(
                "NYPD Midtown South Precinct",
                "Police Station",
                "357 W 35th St",
                "New York City",
                "NY",
                "USA",
                40.7530,
                -73.9935,
                "Police station near Midtown",
                96
        ));

        safeSpotRepository.save(new SafeSpot(
                "NYPD 19th Precinct",
                "Police Station",
                "153 E 67th St",
                "New York City",
                "NY",
                "USA",
                40.7671,
                -73.9637,
                "Upper East Side police precinct",
                94
        ));

        safeSpotRepository.save(new SafeSpot(
                "Brooklyn Public Library",
                "Library",
                "10 Grand Army Plaza",
                "New York City",
                "NY",
                "USA",
                40.6725,
                -73.9682,
                "Main Brooklyn library branch",
                85
        ));

        safeSpotRepository.save(new SafeSpot(
                "Queens Public Library",
                "Library",
                "89-11 Merrick Blvd",
                "New York City",
                "NY",
                "USA",
                40.7073,
                -73.7949,
                "Large public library in Queens",
                84
        ));

        safeSpotRepository.save(new SafeSpot(
                "Safe Horizon Shelter",
                "Shelter",
                "Unknown Address",
                "New York City",
                "NY",
                "USA",
                40.7440,
                -73.9870,
                "Domestic violence and crisis support shelter",
                97
        ));

        safeSpotRepository.save(new SafeSpot(
                "Women In Need Shelter",
                "Shelter",
                "115 W 31st St",
                "New York City",
                "NY",
                "USA",
                40.7481,
                -73.9912,
                "Emergency shelter and support services",
                96
        ));

        safeSpotRepository.save(new SafeSpot(
                "Lenox Hill Hospital",
                "Hospital",
                "100 E 77th St",
                "New York City",
                "NY",
                "USA",
                40.7735,
                -73.9606,
                "Emergency and trauma care hospital",
                92
        ));

        safeSpotRepository.save(new SafeSpot(
                "Harlem Hospital Center",
                "Hospital",
                "506 Lenox Ave",
                "New York City",
                "NY",
                "USA",
                40.8143,
                -73.9402,
                "Major public hospital in Harlem",
                90
        ));

        safeSpotRepository.save(new SafeSpot(
                "NYPD 13th Precinct",
                "Police Station",
                "230 E 21st St",
                "New York City",
                "NY",
                "USA",
                40.7386,
                -73.9821,
                "Police precinct in Manhattan",
                95
        ));

        safeSpotRepository.save(new SafeSpot(
                "NYPD 5th Precinct",
                "Police Station",
                "19 Elizabeth St",
                "New York City",
                "NY",
                "USA",
                40.7162,
                -73.9970,
                "Downtown Manhattan police precinct",
                94
        ));

        safeSpotRepository.save(new SafeSpot(
                "Jefferson Market Library",
                "Library",
                "425 6th Ave",
                "New York City",
                "NY",
                "USA",
                40.7347,
                -73.9992,
                "Historic public library branch",
                83
        ));

        safeSpotRepository.save(new SafeSpot(
                "Stavros Niarchos Foundation Library",
                "Library",
                "455 5th Ave",
                "New York City",
                "NY",
                "USA",
                40.7528,
                -73.9819,
                "Large modern public library",
                87
        ));

        safeSpotRepository.save(new SafeSpot(
                "Bowery Mission Shelter",
                "Shelter",
                "227 Bowery",
                "New York City",
                "NY",
                "USA",
                40.7210,
                -73.9925,
                "Emergency shelter and meals",
                96
        ));

        safeSpotRepository.save(new SafeSpot(
                "Ali Forney Center",
                "Shelter",
                "321 W 125th St",
                "New York City",
                "NY",
                "USA",
                40.8110,
                -73.9512,
                "LGBTQ+ youth shelter and support",
                95
        ));

        safeSpotRepository.save(new SafeSpot(
                "Port Authority Bus Terminal",
                "Safe Transit Hub",
                "625 8th Ave",
                "New York City",
                "NY",
                "USA",
                40.7567,
                -73.9903,
                "Busy transit hub with security presence",
                82
        ));

        safeSpotRepository.save(new SafeSpot(
                "Grand Central Terminal",
                "Safe Transit Hub",
                "89 E 42nd St",
                "New York City",
                "NY",
                "USA",
                40.7527,
                -73.9772,
                "Major transit hub with high visibility",
                86
        ));
}}
