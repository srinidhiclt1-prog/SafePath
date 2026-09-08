import { useEffect, useState, useRef } from "react";
import "./App.css";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Circle, Popup, Polyline, useMap } from "react-leaflet";import L from "leaflet";
import hospitalIconImage from "./assets/hospital.png";
import policeIconImage from "./assets/police.png";
import libraryIconImage from "./assets/library.png";
import shelterIconImage from "./assets/shelter.png";

function FitMapToRoute({ routeCoordinates }) {
    const map = useMap();

    useEffect(() => {
        if (routeCoordinates.length > 0) {
            map.fitBounds(routeCoordinates, {
                padding: [40, 40]
            });
        }
    }, [routeCoordinates, map]);

    return null;
}

function RecenterMap({ center }) {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.setView(center, 14);
        }
    }, [center, map]);

    return null;
}

function App() {

    const [safeSpots, setSafeSpots] = useState([]);
    const [allSafeSpots, setAllSafeSpots] = useState([]);
    const [city, setCity] = useState("");
    const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]);
    const [userLocation, setUserLocation] = useState(null);
    const [locationStatus, setLocationStatus] = useState("");
    const [selectedSafeSpot, setSelectedSafeSpot] = useState(null);
    const [manualLocation, setManualLocation] = useState("");
    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    const [routeDistance, setRouteDistance] = useState(null);
    const [routeDuration, setRouteDuration] = useState(null);
    const [destinationInput, setDestinationInput] = useState("");
    const [destinationSuggestions, setDestinationSuggestions] = useState([]);
    const [travelTime, setTravelTime] = useState("18:00");
    const [safeRouteScore, setSafeRouteScore] = useState(null);
    const [nearbyRouteSpots, setNearbyRouteSpots] = useState([]);
    const [scoreExplanation, setScoreExplanation] = useState(null);
    const [routeOptions, setRouteOptions] = useState([]);
    const [selectedRouteId, setSelectedRouteId] = useState(null);
    const locationSearchTimer = useRef(null);
    const destinationSearchTimer = useRef(null);
    const [nightRiskPoints, setNightRiskPoints] = useState([]);
    const [selectedDestination, setSelectedDestination] = useState(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (!event.target.closest(".autocomplete-wrapper")) {
                setLocationSuggestions([]);
                setDestinationSuggestions([]);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const hospitalIcon = new L.Icon({
        iconUrl: hospitalIconImage,
        iconSize: [36, 36]
    });

    const policeIcon = new L.Icon({
        iconUrl: policeIconImage,
        iconSize: [36, 36]
    });

    const libraryIcon = new L.Icon({
        iconUrl: libraryIconImage,
        iconSize: [36, 36]
    });

    const shelterIcon = new L.Icon({
        iconUrl: shelterIconImage,
        iconSize: [36, 36]
    });



    function getIcon(type) {
        if (type === "Hospital") return hospitalIcon;
        if (type === "Police" || type === "Police Station") return policeIcon;
        if (type === "Shelter") return shelterIcon;
        if (type === "Library") return libraryIcon;
        return libraryIcon;
    }

    useEffect(() => {
        fetch("http://localhost:8080/safespots")
            .then(response => response.json())
            .then(data => {
                const spots = Array.isArray(data) ? data : [];

                console.log("All SafeSpots:", spots);
                console.log(
                    "SafeSpot types:",
                    [...new Set(spots.map((spot) => spot.type))]
                );

                setSafeSpots(spots);
                setAllSafeSpots(spots);
            });
    }, []);

    function loadHighSafetySpots() {
        fetch("http://localhost:8080/safespots/safety/90")
            .then(response => response.json())
            .then(data => setSafeSpots(Array.isArray(data) ? data : []));
    }

    function loadAllSafeSpots() {
        fetch("http://localhost:8080/safespots")
            .then(response => response.json())
            .then(data => setSafeSpots(Array.isArray(data) ? data : []));
    }

    function loadHospitals() {
        fetch("http://localhost:8080/safespots/type/Hospital")
            .then(response => response.json())
            .then(data => setSafeSpots(Array.isArray(data) ? data : []));
    }

    function loadLibraries() {
        fetch("http://localhost:8080/safespots/type/Library")
            .then(response => response.json())
            .then(data => setSafeSpots(Array.isArray(data) ? data : []));
    }

    function loadPoliceStations() {
        fetch("http://localhost:8080/safespots/type/Police Station")
            .then(response => response.json())
            .then(data => setSafeSpots(Array.isArray(data) ? data : []));
    }

    function loadShelters() {
        fetch("http://localhost:8080/safespots/type/Shelter")
            .then(response => response.json())
            .then(data => setSafeSpots(Array.isArray(data) ? data : []));
    }

    function searchByCity() {
        fetch(`http://localhost:8080/safespots/city/${city}`)
            .then(response => response.json())
            .then(data => setSafeSpots(Array.isArray(data) ? data : []));
    }

    function loadNearbySafeSpots() {
        const timesSquare = [40.7580, -73.9855];

        setMapCenter(timesSquare);

        fetch("http://localhost:8080/safespots/nearby?lat=40.7580&lon=-73.9855")
            .then(response => response.json())
            .then(data => setSafeSpots(Array.isArray(data) ? data : []));
    }

    async function reverseGeocodeLocation(latitude, longitude) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
            );

            if (!response.ok) {
                throw new Error("Could not retrieve the address.");
            }

            const data = await response.json();

            return data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        } catch (error) {
            console.error("Reverse geocoding failed:", error);

            return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        }
    }

    async function fetchLocationSuggestions(query) {
        if (!query || query.trim().length < 3) {
            return [];
        }

        try {
            const apiKey =
                "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImMwZDRmYTM3NDQyNzRjODc4NTBkY2M5ZTIwNjZhZDM0IiwiaCI6Im11cm11cjY0In0=";

            const response = await fetch(
                `https://api.openrouteservice.org/geocode/autocomplete` +
                `?api_key=${apiKey}` +
                `&text=${encodeURIComponent(query)}` +
                `&boundary.country=US` +
                `&boundary.rect.min_lon=-74.2591` +
                `&boundary.rect.min_lat=40.4774` +
                `&boundary.rect.max_lon=-73.7004` +
                `&boundary.rect.max_lat=40.9176`
            );

            if (!response.ok) {
                throw new Error("Autocomplete request failed.");
            }

            const data = await response.json();

            if (!data.features || !Array.isArray(data.features)) {
                return [];
            }

            return data.features.slice(0, 10).map((feature) => ({
                label: feature.properties.label,
                latitude: feature.geometry.coordinates[1],
                longitude: feature.geometry.coordinates[0]
            }));
        } catch (error) {
            console.error("Autocomplete failed:", error);
            return [];
        }
    }

    function isInsideNYC(latitude, longitude) {
        return (
            latitude >= 40.4774 &&
            latitude <= 40.9176 &&
            longitude >= -74.2591 &&
            longitude <= -73.7004
        );
    }

    function handleUseMyLocation() {
        if (!navigator.geolocation) {
            alert("Location services are not supported by this browser.");
            return;
        }


        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const userLat = position.coords.latitude;
                const userLon = position.coords.longitude;

                const locationCoordinates = [userLat, userLon];

                setUserLocation(locationCoordinates);

                if (isInsideNYC(userLat, userLon)) {
                    setMapCenter(locationCoordinates);
                } else {
                    setMapCenter([40.7128, -74.0060]);
                }

                await reverseGeocodeLocation(
                    userLat,
                    userLon
                );

                if (isInsideNYC(userLat, userLon)) {
                    setLocationStatus("Using your current location.");
                    try {
                        const response = await fetch(
                            `http://localhost:8080/safespots/nearby?lat=${userLat}&lon=${userLon}`
                        );

                        if (!response.ok) {
                            throw new Error("Could not load nearby SafeSpots.");
                        }

                        const data = await response.json();

                        if (Array.isArray(data) && data.length > 0) {
                            setSafeSpots(data);
                        }
                    } catch (error) {
                        console.error("Nearby SafeSpot request failed:", error);
                    }
                } else {
                    setLocationStatus(
                        "Current location detected, but SafePath currently supports NYC only."
                    );

                    loadAllSafeSpots();
                }
            },
            (error) => {
                console.error("Location error:", error);
                setLocationStatus("Unable to detect your current location.");

                if (error.code === error.PERMISSION_DENIED) {
                    alert(
                        "Location permission was denied. You can still enter your location manually."
                    );
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    alert("Your current location could not be determined.");
                } else if (error.code === error.TIMEOUT) {
                    alert("The location request timed out. Please try again.");
                } else {
                    alert("Something went wrong while retrieving your location.");
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    }

    function safeExit() {
        window.location.href = "https://www.google.com";
    }

    async function geocodeLocation(locationName) {
        const apiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImMwZDRmYTM3NDQyNzRjODc4NTBkY2M5ZTIwNjZhZDM0IiwiaCI6Im11cm11cjY0In0=";

        const response = await fetch(
            `https://api.openrouteservice.org/geocode/search` +
            `?api_key=${apiKey}` +
            `&text=${encodeURIComponent(locationName)}` +
            `&boundary.country=US` +
            `&boundary.rect.min_lon=-74.2591` +
            `&boundary.rect.min_lat=40.4774` +
            `&boundary.rect.max_lon=-73.7004` +
            `&boundary.rect.max_lat=40.9176`
        );

        const data = await response.json();

        console.log("Route API response:", data);

        if (!data.features || !Array.isArray(data.features)) {
            console.error("No route features found:", data);
            alert("No route options found. Try a different location or destination.");
            return;
        }

        if (!data.features || data.features.length === 0) {
            return null;
        }
        const coordinates = data.features[0].geometry.coordinates;

        return {
            lat: coordinates[1],
            lon: coordinates[0]

        };
    }

    async function useEnteredLocation() {
        const result = await geocodeLocation(manualLocation);

        if (!result) {
            alert("Location not found.");
            return;
        }

        const lat = result.lat;
        const lon = result.lon;

        setMapCenter([lat, lon]);
        setUserLocation([lat, lon]);

        fetch(`http://localhost:8080/safespots/nearby?lat=${lat}&lon=${lon}`)
            .then(response => response.json())
            .then(data => setSafeSpots(Array.isArray(data) ? data : []));
    }

    function openInGoogleMaps() {
        if (!userLocation || !selectedSafeSpot) {
            alert("Please select a route first.");
            return;
        }

        const origin = `${userLocation[0]},${userLocation[1]}`;
        const destination = `${selectedSafeSpot.latitude},${selectedSafeSpot.longitude}`;

        window.open(
            `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`,
            "_blank"
        );
    }

    async function geocodeDestination(destination) {
        const apiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImMwZDRmYTM3NDQyNzRjODc4NTBkY2M5ZTIwNjZhZDM0IiwiaCI6Im11cm11cjY0In0=";

        const response = await fetch(
            `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(destination)}&boundary.country=US&boundary.rect.min_lon=-74.2591&boundary.rect.min_lat=40.4774&boundary.rect.max_lon=-73.7004&boundary.rect.max_lat=40.9176`
        );

        const data = await response.json();

        if (!data.features || data.features.length === 0) {
            alert("Destination not found in NYC.");
            return null;
        }

        const coordinates = data.features[0].geometry.coordinates;

        return {
            latitude: coordinates[1],
            longitude: coordinates[0]
        };
    }

    function getSafeSpotsNearRoute(routeCoordinates) {
        const resourceRadiusMeters = 500;

        return allSafeSpots.filter((spot) => {
            const spotCoordinates = [
                Number(spot.latitude),
                Number(spot.longitude)
            ];

            return routeCoordinates.some((routePoint) => {
                const distance = getDistanceMeters(
                    routePoint,
                    spotCoordinates
                );

                return distance <= resourceRadiusMeters;
            });
        });
    }

    function getDistanceMeters(pointA, pointB) {
        const [lat1, lon1] = pointA;
        const [lat2, lon2] = pointB;

        const earthRadius = 6371000;

        const toRadians = (degrees) =>
            degrees * Math.PI / 180;

        const latDifference = toRadians(lat2 - lat1);
        const lonDifference = toRadians(lon2 - lon1);

        const a =
            Math.sin(latDifference / 2) ** 2 +
            Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(lonDifference / 2) ** 2;

        const c =
            2 * Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );

        return earthRadius * c;
    }

    function getRouteSamplePoints(coordinates) {
        if (!coordinates || coordinates.length < 2) {
            return coordinates || [];
        }

        const segmentDistances = [];
        let totalDistance = 0;

        for (let i = 1; i < coordinates.length; i++) {
            const distance = getDistanceMeters(
                coordinates[i - 1],
                coordinates[i]
            );

            segmentDistances.push(distance);
            totalDistance += distance;
        }

        const sampleFractions = [
            0.10,
            0.30,
            0.50,
            0.70,
            0.90
        ];

        return sampleFractions.map((fraction) => {
            const targetDistance =
                totalDistance * fraction;

            let distanceTravelled = 0;

            for (let i = 1; i < coordinates.length; i++) {
                const segmentDistance =
                    segmentDistances[i - 1];

                if (
                    distanceTravelled + segmentDistance >=
                    targetDistance
                ) {
                    const remainingDistance =
                        targetDistance - distanceTravelled;

                    const ratio =
                        remainingDistance / segmentDistance;

                    const start = coordinates[i - 1];
                    const end = coordinates[i];

                    const latitude =
                        start[0] +
                        (end[0] - start[0]) * ratio;

                    const longitude =
                        start[1] +
                        (end[1] - start[1]) * ratio;

                    return [latitude, longitude];
                }

                distanceTravelled += segmentDistance;
            }

            return coordinates[coordinates.length - 1];
        });
    }


    function isNightTime(time) {
        const hour = Number(time.split(":")[0]);

        return hour >= 19 || hour < 6;
    }

    function getTimeSafetyScore(travelTime) {
        const hour = Number(travelTime.split(":")[0]);

        if (hour >= 6 && hour < 18) {
            return 100;
        }

        if (hour >= 18 && hour < 21) {
            return 85;
        }

        if (hour >= 21 && hour < 24) {
            return 60;
        }

        if (hour >= 0 && hour < 5) {
            return 35;
        }

        return 65;
    }

    function getRouteExposureScore(durationMinutes) {
        if (durationMinutes <= 10) {
            return 100;
        }

        if (durationMinutes <= 20) {
            return 90;
        }

        if (durationMinutes <= 30) {
            return 80;
        }

        if (durationMinutes <= 45) {
            return 65;
        }

        if (durationMinutes <= 60) {
            return 50;
        }

        return 35;
    }

    function getResourceSafetyScore(nearbySpots) {
        const resourceTypes = new Set(
            nearbySpots.map((spot) => spot.type)
        );

        let score = 0;

        if (
            resourceTypes.has("Police") ||
            resourceTypes.has("Police Station")
        ) {
            score += 35;
        }

        if (resourceTypes.has("Hospital")) {
            score += 30;
        }

        if (resourceTypes.has("Safe Transit Hub")) {
            score += 20;
        }

        if (resourceTypes.has("Shelter")) {
            score += 15;
        }

        if (resourceTypes.has("Library")) {
            score += 10;
        }

        return Math.min(100, score);
    }

    function getCrimeSafetyScore(weightedExposure) {
        const lowReference = 500;
        const highReference = 8000;

        if (weightedExposure <= lowReference) {
            return 95;
        }

        if (weightedExposure >= highReference) {
            return 10;
        }

        const logExposure = Math.log1p(weightedExposure);
        const logLow = Math.log1p(lowReference);
        const logHigh = Math.log1p(highReference);

        const normalizedRisk =
            (logExposure - logLow) /
            (logHigh - logLow);

        const score =
            95 - (normalizedRisk * 85);

        return Math.round(score);
    }


    function getSafetyBadge(score) {
        if (score >= 95) return "🟢 Very Safe";
        if (score >= 90) return "🟡 Safe";
        if (score >= 80) return "🟠 Use Caution";
        return "🔴 Higher Risk";
    }

    async function loadRoute(spot) {
        setSelectedSafeSpot(spot);

        setRouteDistance(null);
        setRouteDuration(null);

        if (!userLocation) {
            alert("Please select a location first.");
            return;
        }



        const apiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImMwZDRmYTM3NDQyNzRjODc4NTBkY2M5ZTIwNjZhZDM0IiwiaCI6Im11cm11cjY0In0=";

        console.log("ROUTE START:", userLocation);

        console.log("ROUTE DESTINATION:", {
            name: spot.name,
            latitude: spot.latitude,
            longitude: spot.longitude
        });

        const response = await fetch(
            "https://api.openrouteservice.org/v2/directions/foot-walking/geojson",
            {
                method: "POST",

                headers: {
                    "Authorization": apiKey,
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    coordinates: [
                        [userLocation[1], userLocation[0]],
                        [spot.longitude, spot.latitude]
                    ],

                    alternative_routes: {
                        target_count: 3,
                        weight_factor: 1.4,
                        share_factor: 0.6
                    },

                    options: {
                        avoid_features: ["ferries"]
                    }
                })
            }
        );

        const data = await response.json();

        console.log("Route API response:", data);

        if (!data.features || !Array.isArray(data.features)) {
            console.error("No route features found:", data);
            alert("No route options found. Try a different location or destination.");
            return;
        }

        const preliminaryRoutes = await Promise.all(
            data.features.map(async (feature, index) => {
                const summary = feature.properties.summary;

                console.log(
                    `Route ${index + 1} raw ORS summary:`,
                    summary
                );

                const coordinates = feature.geometry.coordinates.map((coord) => [
                    coord[1],
                    coord[0]
                ]);

                const distanceMiles = summary.distance / 1609.34;
                const durationMinutes = Math.round(summary.duration / 60);

                const nearbySpots = getSafeSpotsNearRoute(coordinates).sort(
                    (a, b) => b.safetyScore - a.safetyScore
                );

                console.log(
                    `Route ${index + 1} nearby SafeSpots:`,
                    nearbySpots
                );

                // Check crime exposure at 25%, 50%, and 75% of the route.
                const samplePoints =
                    getRouteSamplePoints(coordinates);

                const crimeCounts = await Promise.all(
                    samplePoints.map(async (point) => {
                        const crimeResponse = await fetch(
                            `http://localhost:8080/crimes/exposure?lat=${point[0]}&lon=${point[1]}`
                        );

                        if (!crimeResponse.ok) {
                            throw new Error("Crime-data request failed.");
                        }

                        return crimeResponse.json();
                    })
                );

                const riskPoints = samplePoints.map((point, index) => ({
                    latitude: point[0],
                    longitude: point[1],
                    crimeCount: crimeCounts[index]
                }));

                const averageCrimeCount =
                    crimeCounts.reduce((total, count) => total + count, 0) /
                    crimeCounts.length;

                console.log(
                    `Route ${index + 1} crime samples:`,
                    crimeCounts,
                    "average:",
                    averageCrimeCount
                );

                return {
                    id: index,
                    originalRouteNumber: index + 1,
                    label: `Route ${index + 1}`,
                    coordinates,
                    distanceMiles: distanceMiles.toFixed(2),
                    durationMinutes,
                    nearbySpots,
                    averageCrimeCount,
                    riskPoints
                };
            })
        );

        const routeChoices = preliminaryRoutes.map((route) => {
            const crimeSafetyScore =
                getCrimeSafetyScore(route.averageCrimeCount);

            const resourceSafetyScore =
                getResourceSafetyScore(route.nearbySpots);

            const exposureSafetyScore =
                getRouteExposureScore(route.durationMinutes);

            const timeSafetyScore =
                getTimeSafetyScore(travelTime);

            const finalScore =
                (crimeSafetyScore * 0.55) +
                (resourceSafetyScore * 0.25) +
                (exposureSafetyScore * 0.10) +
                (timeSafetyScore * 0.10);

            return {
                id: route.id,
                originalRouteNumber: route.originalRouteNumber,
                label: route.label,
                coordinates: route.coordinates,
                distanceMiles: route.distanceMiles,
                durationMinutes: route.durationMinutes,
                nearbySpots: route.nearbySpots,

                safetyScore: Math.round(finalScore),

                crimeSafetyScore,
                resourceSafetyScore,
                exposureSafetyScore,
                timeSafetyScore,

                averageCrimeCount: route.averageCrimeCount,
                riskPoints: route.riskPoints
            };
        });

        const sortedRoutes = [...routeChoices]
            .sort((a, b) => b.safetyScore - a.safetyScore)
            .map((route, index) => ({
                ...route,
                label: `Route ${index + 1}`
            }));

        sortedRoutes.forEach((route, index) => {
            console.log(
                `Displayed Route ${index + 1} came from ORS Route ${route.originalRouteNumber}`,
                {
                    safetyScore: route.safetyScore,
                    crimeSafetyScore: route.crimeSafetyScore,
                    resourceSafetyScore: route.resourceSafetyScore,
                    exposureSafetyScore: route.exposureSafetyScore,
                    timeSafetyScore: route.timeSafetyScore,
                    nearbySafeSpots: route.nearbySpots.length,
                    distanceMiles: route.distanceMiles,
                    durationMinutes: route.durationMinutes
                }
            );
        });

        const bestRoute = sortedRoutes[0];
        console.log("Night risk points:", bestRoute.riskPoints);

        setRouteOptions(sortedRoutes);
        setSelectedRouteId(bestRoute.id);
        setRouteDistance(bestRoute.distanceMiles);
        setRouteDuration(bestRoute.durationMinutes);
        setSafeRouteScore(bestRoute.safetyScore);
        setNearbyRouteSpots(bestRoute.nearbySpots);
        setNightRiskPoints(bestRoute.riskPoints);

        setScoreExplanation({
            crimeSafetyScore: bestRoute.crimeSafetyScore,
            resourceSafetyScore: bestRoute.resourceSafetyScore,
            exposureSafetyScore: bestRoute.exposureSafetyScore,
            timeSafetyScore: bestRoute.timeSafetyScore
        });

        setRouteCoordinates(bestRoute.coordinates);

    }

    function selectRouteOption(route) {
        setSelectedRouteId(route.id);
        setRouteCoordinates(route.coordinates);
        setRouteDistance(route.distanceMiles);
        setRouteDuration(route.durationMinutes);
        setSafeRouteScore(route.safetyScore);
        setNearbyRouteSpots(route.nearbySpots);
        setNightRiskPoints(route.riskPoints);

        setScoreExplanation({
            crimeSafetyScore: route.crimeSafetyScore,
            resourceSafetyScore: route.resourceSafetyScore,
            exposureSafetyScore: route.exposureSafetyScore,
            timeSafetyScore: route.timeSafetyScore
        });
    }

    async function findSafeRoute() {
        if (!userLocation) {
            alert("Please select your location first.");
            return;
        }

        if (!destinationInput) {
            alert("Please enter a destination.");
            return;
        }

        let destination;

        if (selectedDestination) {
            destination = selectedDestination;
        } else {
            destination = await geocodeDestination(destinationInput);
        }

        if (!destination) {
            return;
        }

        const destinationSpot = {
            name: destinationInput,
            type: "Destination",
            address: destinationInput,
            city: "New York City",
            latitude: destination.latitude,
            longitude: destination.longitude,
            safetyScore: "Calculating"
        };

        loadRoute(destinationSpot);
    }

    return (
        <div className="app">
            <header className="app-header">
                <div className="brand">
                    <div className="brand-icon">📍</div>

                    <div className="brand-text">
                        <h1>SafePath</h1>
                        <p>NYC Safety Navigation Platform</p>
                    </div>
                </div>

                <button className="safe-exit" onClick={safeExit}>
                    🏃 Quick Exit
                </button>
            </header>

            <div className="dashboard-grid">

                <aside className="dashboard-sidebar">
                    <section className="sidebar-section">
                        <h3>Filters</h3>

                        <div className="filter-buttons">
                            <button onClick={loadAllSafeSpots}>All</button>
                            <button onClick={loadHospitals}>Hospitals</button>
                            <button onClick={loadLibraries}>Libraries</button>
                            <button onClick={loadPoliceStations}>Police</button>
                            <button onClick={loadShelters}>Shelters</button>
                            <button onClick={loadHighSafetySpots}>High Safety</button>
                        </div>
                    </section>

                    <section className="sidebar-section">
                        <h3>Your Location</h3>

                        <div className="location-actions">
                            <button onClick={loadNearbySafeSpots}>
                                📍 Nearby SafeSpots
                            </button>

                            <button onClick={handleUseMyLocation}>
                                ◎ Use My Location
                            </button>
                        </div>

                        {locationStatus && (
                            <div className="location-message">
                                ✓ {locationStatus}
                            </div>
                        )}
                    </section>

                    <section className="sidebar-section">
                        <label htmlFor="city-search">Search City</label>

                        <div className="input-button-row">
                            <input
                                id="city-search"
                                type="text"
                                placeholder="Enter city"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            />

                            <button onClick={searchByCity}>
                                Search
                            </button>
                        </div>
                    </section>

                    <section className="sidebar-section">
                        <label htmlFor="manual-location">Manual Location</label>

                        <div className="autocomplete-wrapper">

                            <input
                                type="text"
                                value={manualLocation}
                                onChange={(e) => {
                                    const value = e.target.value;

                                    setManualLocation(value);

                                    clearTimeout(locationSearchTimer.current);

                                    if (value.trim().length < 3) {
                                        setLocationSuggestions([]);
                                        return;
                                    }

                                    locationSearchTimer.current = setTimeout(async () => {
                                        const suggestions = await fetchLocationSuggestions(value);
                                        setLocationSuggestions(suggestions);
                                    }, 300);
                                }}
                                placeholder="Enter your location"
                            />

                            {locationSuggestions.length > 0 && (
                                <div className="autocomplete-dropdown">
                                    {locationSuggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            className="autocomplete-option"
                                            onClick={() => {
                                                setManualLocation(suggestion.label);
                                                setUserLocation([
                                                    suggestion.latitude,
                                                    suggestion.longitude
                                                ]);
                                                setMapCenter([
                                                    suggestion.latitude,
                                                    suggestion.longitude
                                                ]);
                                                setLocationSuggestions([]);
                                                setLocationStatus(
                                                    `Using location: ${suggestion.label}`
                                                );
                                            }}
                                        >
                                            📍 {suggestion.label}
                                        </button>
                                    ))}
                                </div>
                            )}

                        </div>

                        <button
                            className="full-width-button secondary-button"
                            onClick={useEnteredLocation}
                        >
                            Use Entered Location
                        </button>
                    </section>

                    <section className="sidebar-section safe-route-section">
                        <h3>SafeRoute</h3>

                        <label htmlFor="destination">Destination</label>

                        <div className="autocomplete-wrapper">

                            <input
                                id="destination"
                                type="text"
                                placeholder="Enter destination"
                                value={destinationInput}
                                onChange={(e) => {
                                    const value = e.target.value;

                                    setDestinationInput(value);
                                    setSelectedDestination(null)

                                    clearTimeout(destinationSearchTimer.current);

                                    if (value.trim().length < 3) {
                                        setDestinationSuggestions([]);
                                        return;
                                    }

                                    destinationSearchTimer.current = setTimeout(async () => {
                                        const suggestions = await fetchLocationSuggestions(value);
                                        setDestinationSuggestions(suggestions);
                                    }, 300);
                                }}
                            />

                            {destinationSuggestions.length > 0 && (
                                <div className="autocomplete-dropdown">
                                    {destinationSuggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            className="autocomplete-option"
                                            onClick={() => {
                                                setDestinationInput(suggestion.label);

                                                setSelectedDestination({
                                                    latitude: suggestion.latitude,
                                                    longitude: suggestion.longitude
                                                });

                                                setDestinationSuggestions([]);
                                            }}
                                        >
                                            📍 {suggestion.label}
                                        </button>
                                    ))}
                                </div>
                            )}

                        </div>

                        <label htmlFor="travel-time">Travel Time</label>

                        <input
                            id="travel-time"
                            type="time"
                            value={travelTime}
                            onChange={(e) => setTravelTime(e.target.value)}
                        />
                        {isNightTime(travelTime) && (
                            <div className="night-commute-message">
                                🌙 NightCommute active — nighttime safety factors applied
                            </div>
                        )}

                        <button
                            className="full-width-button primary-button"
                            onClick={findSafeRoute}
                        >
                            🛡️ Find SafeRoute
                        </button>
                    </section>
                </aside>

                <main className="main-panel">
                    <div
                        className={
                            isNightTime(travelTime)
                                ? "map-wrapper night-map"
                                : "map-wrapper"
                        }
                    >
                        {isNightTime(travelTime) && (
                            <div className="night-map-badge">
                                🌙 NightCommute
                            </div>
                        )}

                    <MapContainer
                        center={mapCenter}
                        zoom={12}
                        style={{ height: "500px", width: "100%" }}
                    >
                        <TileLayer
                            attribution='&copy; OpenStreetMap contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <RecenterMap center={mapCenter} />

                        <FitMapToRoute routeCoordinates={routeCoordinates} />

                        {isNightTime(travelTime) &&
                            nightRiskPoints.map((point, index) => (
                                <Circle
                                    key={index}
                                    center={[point.latitude, point.longitude]}
                                    radius={500}
                                    pathOptions={{
                                        fillOpacity: 0.08,
                                        opacity: 0.35,
                                        weight: 1
                                    }}
                                >
                                    <Popup>
                                        <strong>NightCommute Risk Sample</strong>
                                        <br />
                                        Weighted crime exposure within 500 m: {point.crimeCount}
                                    </Popup>
                                </Circle>
                            ))}

                        {userLocation && (
                            <Marker position={userLocation}>
                                <Popup>
                                    <h3>Your Location</h3>
                                </Popup>
                            </Marker>
                        )}

                        {userLocation && selectedSafeSpot && (
                            <Polyline
                                positions={
                                    routeCoordinates.length > 0
                                        ? routeCoordinates
                                        : [
                                            userLocation,
                                            [
                                                selectedSafeSpot.latitude,
                                                selectedSafeSpot.longitude
                                            ]
                                        ]
                                }
                                pathOptions={{
                                    color: "blue",
                                    weight: 6
                                }}
                            />
                        )}

                        {safeSpots.slice(0, 5).map((spot) => (
                            <Marker
                                key={spot.id}
                                position={[spot.latitude, spot.longitude]}
                                icon={getIcon(spot.type)}
                            >
                                <Popup>
                                    <h3>{spot.name}</h3>
                                    <p>{spot.type}</p>
                                    <p>Safety Score: {spot.safetyScore}</p>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                    </div>


                    {selectedSafeSpot && (
                        <div className="selected-route">
                            <h2>Route Details</h2>

                            <h3>{selectedSafeSpot.name}</h3>

                            <p>
                                <strong>Type:</strong> {selectedSafeSpot.type}
                            </p>

                            <p>
                                <strong>Address:</strong> {selectedSafeSpot.address}
                            </p>

                            <p>
                                <strong>City:</strong> {selectedSafeSpot.city}
                            </p>

                            <p>
                                <strong>Safety Score:</strong>{" "}
                                {selectedSafeSpot.safetyScore}
                            </p>

                            {routeDistance && (
                                <p>
                                    <strong>Distance:</strong> {routeDistance} miles
                                </p>
                            )}

                            {routeDuration && (
                                <p>
                                    <strong>Estimated Walk:</strong>{" "}
                                    {routeDuration} minutes
                                </p>
                            )}

                            {safeRouteScore !== null && (
                                <p>
                                    <strong>SafeRoute Score:</strong>{" "}
                                    {safeRouteScore}/100
                                </p>
                            )}

                            {routeOptions.length > 0 && (
                                <div className="route-options">
                                    <div className="routes-heading">
                                        <h3>🛡️ Top 3 Safest Routes</h3>
                                        <p>Routes ordered by overall safety score (higher is better)</p>
                                    </div>

                                    {routeOptions.map((route, index) => (
                                        <div
                                            key={route.id}
                                            className={`route-option route-option-${index + 1} ${
                                                selectedRouteId === route.id
                                                    ? "selected-route-option"
                                                    : ""
                                            }`}
                                            onClick={() => selectRouteOption(route)}
                                        >
                                            <div className="route-card-top">
                                                <div className="route-title-group">
                                                    <span className="route-number">{index + 1}</span>

                                                    <div>
                                                        <h4>{route.label}</h4>

                                                        {index === 0 && (
                                                            <span className="recommended-badge">
                    Safest Route
                </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="route-score">
                                                    <strong>{route.safetyScore}</strong>
                                                    <span>/100</span>
                                                </div>
                                            </div>

                                            <div className="route-rating">
                                                {"★".repeat(
                                                    Math.max(1, Math.round(route.safetyScore / 20))
                                                )}
                                                <span>
        {"☆".repeat(
            5 - Math.max(1, Math.round(route.safetyScore / 20))
        )}
    </span>
                                            </div>

                                            <div className="route-metrics">
                                                <div>
                                                    <strong>{route.distanceMiles}</strong>
                                                    <span>miles</span>
                                                </div>

                                                <div>
                                                    <strong>{route.durationMinutes}</strong>
                                                    <span>minutes</span>
                                                </div>

                                                <div>
                                                    <strong>{route.crimeSafetyScore}</strong>
                                                    <span>crime safety</span>
                                                </div>
                                            </div>

                                            <div className="route-highlights">
    <span>
        {route.crimeSafetyScore >= 70
            ? "✓ Lower crime exposure"
            : route.crimeSafetyScore >= 40
                ? "• Moderate crime exposure"
                : "⚠ Higher crime exposure"}
    </span>

                                                <span>
        ✓ {route.nearbySpots.length} SafeSpots nearby
    </span>

                                                {selectedRouteId === route.id && (
                                                    <span className="selected-route-label">
            ✓ Currently selected
        </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {scoreExplanation && (
                                <div className="score-breakdown">
                                    <div className="score-breakdown-header">
                                        <h4>Why this score?</h4>
                                        <span>Route safety factors</span>
                                    </div>

                                    <div className="score-factor-grid">

                                        <div className="score-factor">
                                            <span>🛡️</span>
                                            <div>
                                                <strong>Crime Safety</strong>
                                                <small>
                                                    {scoreExplanation.crimeSafetyScore}/100 • 55% weight
                                                </small>
                                            </div>
                                        </div>

                                        <div className="score-factor">
                                            <span>📍</span>
                                            <div>
                                                <strong>Resource Access</strong>
                                                <small>
                                                    {scoreExplanation.resourceSafetyScore}/100 • 25% weight
                                                </small>
                                            </div>
                                        </div>

                                        <div className="score-factor">
                                            <span>🚶</span>
                                            <div>
                                                <strong>Route Exposure</strong>
                                                <small>
                                                    {scoreExplanation.exposureSafetyScore}/100 • 10% weight
                                                </small>
                                            </div>
                                        </div>

                                        <div className="score-factor">
                                            <span>🕒</span>
                                            <div>
                                                <strong>Time Safety</strong>
                                                <small>
                                                    {scoreExplanation.timeSafetyScore}/100 • 10% weight
                                                </small>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )}

                            <p>
                                <strong>SafeSpots Near Route:</strong>{" "}
                                {nearbyRouteSpots.length}
                            </p>

                            {nearbyRouteSpots.length > 0 && (
                                <div className="nearby-route-spots">
                                    <h4>🛡 SafeSpots Along This Route</h4>

                                    <div className="nearby-route-grid">
                                        {nearbyRouteSpots.map((spot) => (
                                            <article
                                                className="nearby-route-card"
                                                key={spot.id}
                                            >
                                                <div className="nearby-route-top">

                                                    <div>
                                                        <strong>{spot.name}</strong>

                                                        <p>
                                                            {spot.type}
                                                        </p>
                                                    </div>

                                                    <span className="route-score-mini">
                        {spot.safetyScore}
                    </span>

                                                </div>

                                                <div className="safety-badge">
                                                    {getSafetyBadge(spot.safetyScore)}
                                                </div>

                                                <button
                                                    onClick={() => loadRoute(spot)}
                                                >
                                                    Route Here
                                                </button>

                                            </article>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="route-buttons">
                                <button onClick={openInGoogleMaps}>
                                    Open in Google Maps
                                </button>

                                <button
                                    onClick={() => setSelectedSafeSpot(null)}
                                >
                                    Clear Route
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <section className="crisis-connect">
                <div className="crisis-header">
                    <div>
                        <h2>☎ CrisisConnect</h2>
                        <p>Immediate support and emergency resources</p>
                    </div>

                    <span>24/7</span>
                </div>

                <div className="crisis-resource-grid">
                    <article className="crisis-resource emergency-resource">
                        <span className="crisis-resource-icon">🚨</span>

                        <div>
                            <strong>Emergency</strong>
                            <p>911</p>
                        </div>

                        <a href="tel:911">Call</a>
                    </article>

                    <article className="crisis-resource">
                        <span className="crisis-resource-icon">🛡️</span>

                        <div>
                            <strong>Human Trafficking Hotline</strong>
                            <p>1-888-373-7888</p>
                        </div>

                        <a href="tel:18883737888">Call</a>
                    </article>

                    <article className="crisis-resource">
                        <span className="crisis-resource-icon">💜</span>

                        <div>
                            <strong>NYC Domestic Violence Hotline</strong>
                            <p>1-800-621-HOPE</p>
                        </div>

                        <a href="tel:18006214673">Call</a>
                    </article>
                </div>
            </section>

            <section className="recommended-spots">
                <div className="recommended-spots-header">
                    <div>
                        <h2>🛡️ Top Recommended Safe Spots</h2>
                        <p>High-safety locations currently shown on the map</p>
                    </div>

                    <span>{safeSpots.length} available</span>
                </div>

                <div className="recommended-spots-grid">
                    {safeSpots.slice(0, 6).map((spot) => (
                        <article className="safe-spot-card" key={spot.id}>
                            <div className="safe-spot-card-top">
                                <div className="safe-spot-icon">
                                    {spot.type === "Hospital"
                                        ? "🏥"
                                        : spot.type === "Police" ||
                                        spot.type === "Police Station"
                                            ? "🚔"
                                            : spot.type === "Shelter"
                                                ? "🏠"
                                                : "📚"}
                                </div>

                                <div className="safe-spot-score">
                                    <strong>{spot.safetyScore}</strong>
                                    <span>/100</span>
                                </div>
                            </div>

                            <h3>{spot.name}</h3>

                            <p className="safe-spot-type">
                                {spot.type} • {spot.city}
                            </p>

                            <p className="safe-spot-badge">
                                {getSafetyBadge(spot.safetyScore)}
                            </p>

                            <button onClick={() => loadRoute(spot)}>
                                Route Me Here
                            </button>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default App;