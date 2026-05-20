package com.safepath.entity;

import jakarta.persistence.*;

@Entity
public class SafeSpot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String type;
    private String address;
    private String city;
    private String state;
    private String country;
    private double latitude;
    private double longitude;
    private String description;
    private int safetyScore;

    public SafeSpot() {
    }

    public SafeSpot(String name, String type, String address, String city, String state,
                    String country, double latitude, double longitude,
                    String description, int safetyScore) {
        this.name = name;
        this.type = type;
        this.address = address;
        this.city = city;
        this.state = state;
        this.country = country;
        this.latitude = latitude;
        this.longitude = longitude;
        this.description = description;
        this.safetyScore = safetyScore;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getType() {
        return type;
    }

    public String getAddress() {
        return address;
    }

    public String getCity() {
        return city;
    }

    public String getState() {
        return state;
    }

    public String getCountry() {
        return country;
    }

    public double getLatitude() {
        return latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public String getDescription() {
        return description;
    }

    public int getSafetyScore() {
        return safetyScore;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public void setState(String state) {
        this.state = state;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setSafetyScore(int safetyScore) {
        this.safetyScore = safetyScore;
    }
}