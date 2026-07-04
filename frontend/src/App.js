import { useEffect, useState } from "react";
import "./App.css";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";import L from "leaflet";
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

function App() {

    const [safeSpots, setSafeSpots] = useState([]);
    const [city, setCity] = useState("");
    const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]);
    const [userLocation, setUserLocation] = useState(null);
    const [selectedSafeSpot, setSelectedSafeSpot] = useState(null);
    const [manualLocation, setManualLocation] = useState("");
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    const [routeDistance, setRouteDistance] = useState(null);
    const [routeDuration, setRouteDuration] = useState(null);
    const [destinationInput, setDestinationInput] = useState("");
    const [safeRouteScore, setSafeRouteScore] = useState(null);
    const [nearbyRouteSpots, setNearbyRouteSpots] = useState([]);
    const [scoreExplanation, setScoreExplanation] = useState(null);
    const [routeOptions, setRouteOptions] = useState([]);
    const [selectedRouteId, setSelectedRouteId] = useState(null);

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
                console.log(data);
                setSafeSpots(Array.isArray(data) ? data : []);
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

    function useMyLocation() {
        navigator.geolocation.getCurrentPosition((position) => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;

            setMapCenter([userLat, userLon]);
            setUserLocation([userLat, userLon]);

            fetch(`http://localhost:8080/safespots/nearby?lat=${userLat}&lon=${userLon}`)
                .then(response => response.json())
                .then(data => setSafeSpots(Array.isArray(data) ? data : []));
        });
    }

    function safeExit() {
        window.location.href = "https://www.google.com";
    }

    async function geocodeLocation(locationName) {
        const apiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImMwZDRmYTM3NDQyNzRjODc4NTBkY2M5ZTIwNjZhZDM0IiwiaCI6Im11cm11cjY0In0=";

        const response = await fetch(
            `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(locationName)}`
        );

        const data = await response.json();

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
        return safeSpots.filter((spot) =>
            routeCoordinates.some((coord) => {
                const routeLat = coord[0];
                const routeLon = coord[1];

                const latDiff = Math.abs(routeLat - spot.latitude);
                const lonDiff = Math.abs(routeLon - spot.longitude);

                return latDiff < 0.005 && lonDiff < 0.005;
            })
        );
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

        const response = await fetch("https://api.openrouteservice.org/v2/directions/foot-walking/geojson", {
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
                }
            })
        });

        const data = await response.json();

        const routeChoices = data.features.map((feature, index) => {
            const summary = feature.properties.summary;

            const coordinates = feature.geometry.coordinates.map((coord) => [
                coord[1],
                coord[0]
            ]);

            const distanceMiles = summary.distance / 1609.34;
            const durationMinutes = Math.round(summary.duration / 60);

            const nearbySpots = getSafeSpotsNearRoute(coordinates).sort(
                (a, b) => b.safetyScore - a.safetyScore
            );

            const typeWeights = {
                "Police": 20,
                "Police Station": 20,
                "Hospital": 18,
                "Shelter": 15,
                "Library": 8
            };

            const typeBonus = nearbySpots.reduce((total, spot) => {
                return total + (typeWeights[spot.type] || 5);
            }, 0);

            const qualityBonus = nearbySpots.reduce((total, spot) => {
                return total + ((spot.safetyScore || 0) / 100) * 5;
            }, 0);

            const uniqueTypes = new Set(nearbySpots.map((spot) => spot.type));
            const diversityBonus = uniqueTypes.size * 5;

            const distancePenalty = distanceMiles * 15;

            const score = Math.max(
                0,
                Math.min(
                    100,
                    30 + typeBonus + qualityBonus + diversityBonus - distancePenalty
                )
            );

            return {
                id: index,
                label: `Route ${index + 1}`,
                coordinates,
                distanceMiles: distanceMiles.toFixed(2),
                durationMinutes,
                nearbySpots,
                safetyScore: Math.round(score)
            };
        });

        const bestRoute = routeChoices.sort(
            (a, b) => b.safetyScore - a.safetyScore
        )[0];

        setRouteOptions(routeChoices);
        setSelectedRouteId(bestRoute.id);
        setRouteDistance(bestRoute.distanceMiles);
        setRouteDuration(bestRoute.durationMinutes);
        setSafeRouteScore(bestRoute.safetyScore);
        setNearbyRouteSpots(bestRoute.nearbySpots);

        const bestUniqueTypes = new Set(bestRoute.nearbySpots.map((spot) => spot.type));

        setScoreExplanation({
            hasPolice: bestRoute.nearbySpots.some(
                spot => spot.type === "Police" || spot.type === "Police Station"
            ),
            hasHospital: bestRoute.nearbySpots.some(
                spot => spot.type === "Hospital"
            ),
            hasShelter: bestRoute.nearbySpots.some(
                spot => spot.type === "Shelter"
            ),
            hasLibrary: bestRoute.nearbySpots.some(
                spot => spot.type === "Library"
            ),
            diverseResources: bestUniqueTypes.size >= 3,
            shortWalk: Number(bestRoute.distanceMiles) <= 1
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

        const selectedUniqueTypes = new Set(
            route.nearbySpots.map((spot) => spot.type)
        );

        setScoreExplanation({
            hasPolice: route.nearbySpots.some(
                (spot) =>
                    spot.type === "Police" ||
                    spot.type === "Police Station"
            ),
            hasHospital: route.nearbySpots.some(
                (spot) => spot.type === "Hospital"
            ),
            hasShelter: route.nearbySpots.some(
                (spot) => spot.type === "Shelter"
            ),
            hasLibrary: route.nearbySpots.some(
                (spot) => spot.type === "Library"
            ),
            diverseResources: selectedUniqueTypes.size >= 3,
            shortWalk: Number(route.distanceMiles) <= 1
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

        const destination = await geocodeDestination(destinationInput);

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
            <h1>SafePath</h1>
            <p>NYC Safety Navigation Platform</p>

                <button className="safe-exit" onClick={safeExit}>
                    Quick Exit
                </button>

            <div className="controls">

            <div className="control-section">
                    <span className="control-label">Filters:</span>

                    <button onClick={loadAllSafeSpots}>All</button>
                    <button onClick={loadHospitals}>Hospitals</button>
                    <button onClick={loadLibraries}>Libraries</button>
                    <button onClick={loadPoliceStations}>Police</button>
                    <button onClick={loadShelters}>Shelters</button>
                    <button onClick={loadHighSafetySpots}>High Safety</button>
                </div>

                <div className="control-section">
                    <span className="control-label">Location:</span>

                    <button onClick={loadNearbySafeSpots}>
                        Nearby Safe Spots
                    </button>

                    <button onClick={useMyLocation}>
                        Use My Location
                    </button>
                </div>

                <div className="control-section">
                    <span className="control-label">Search:</span>

                    <input
                        type="text"
                        placeholder="Enter city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />

                    <button onClick={searchByCity}>
                        Search City
                    </button>
                </div>


                <div className="control-section">
                    <span className="control-label">Manual:</span>

                    <input
                        type="text"
                        placeholder="Enter your location"
                        value={manualLocation}
                        onChange={(e) => setManualLocation(e.target.value)}
                    />

                    <button onClick={useEnteredLocation}>
                        Use Entered Location
                    </button>
                </div>

                <div className="control-section">
                    <span className="control-label">SafeRoute:</span>

                    <input
                        type="text"
                        placeholder="Enter destination"
                        value={destinationInput}
                        onChange={(e) => setDestinationInput(e.target.value)}
                    />

                    <button onClick={findSafeRoute}>
                        Find SafeRoute
                    </button>
                </div>
            </div>

            {selectedSafeSpot && (
                <div className="selected-route">
                    <h2>Route Details</h2>

                    <h3>{selectedSafeSpot.name}</h3>

                    <p><strong>Type:</strong> {selectedSafeSpot.type}</p>
                    <p><strong>Address:</strong> {selectedSafeSpot.address}</p>
                    <p><strong>City:</strong> {selectedSafeSpot.city}</p>
                    <p><strong>Safety Score:</strong> {selectedSafeSpot.safetyScore}</p>

                    {routeDistance && (
                        <p><strong>Distance:</strong> {routeDistance} miles</p>
                    )}

                    {routeDuration && (
                        <p><strong>Estimated Walk:</strong> {routeDuration} minutes</p>
                    )}

                    {safeRouteScore !== null && (
                        <p>
                            <strong>SafeRoute Score:</strong> {safeRouteScore}/100
                        </p>
                    )}

                    {routeOptions.length > 0 && (
                        <div className="route-options">
                            <h3>Available Routes</h3>

                            {routeOptions.map((route) => (
                                <div
                                    key={route.id}
                                    className={`route-option ${selectedRouteId === route.id ? "selected-route-option" : ""}`}
                                    onClick={() => selectRouteOption(route)}
                                >
                                    <strong>
                                        {route.label}
                                        {route.id === selectedRouteId && " ⭐ Recommended"}
                                    </strong>

                                    <p>Safety Score: {route.safetyScore}/100</p>
                                    <p>Distance: {route.distanceMiles} miles</p>
                                    <p>Walk Time: {route.durationMinutes} min</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {scoreExplanation && (
                        <div className="score-breakdown">
                            <h4>Why this score?</h4>

                            <p>🚔 Police Protection: {scoreExplanation.hasPolice ? "✓" : "✗"}</p>
                            <p>🏥 Medical Access: {scoreExplanation.hasHospital ? "✓" : "✗"}</p>
                            <p>🏠 Shelter Nearby: {scoreExplanation.hasShelter ? "✓" : "✗"}</p>
                            <p>📚 Public Safe Spaces: {scoreExplanation.hasLibrary ? "✓" : "✗"}</p>
                            <p>🌟 Diverse Resources: {scoreExplanation.diverseResources ? "✓" : "✗"}</p>
                            <p>🚶 Short Walking Distance: {scoreExplanation.shortWalk ? "✓" : "✗"}</p>
                        </div>
                    )}

                    <p>
                        <strong>SafeSpots Near Route:</strong> {nearbyRouteSpots.length}
                    </p>

                    {nearbyRouteSpots.length > 0 && (
                        <div className="nearbyF-route-spots">
                            <h4>SafeSpots Along This Route</h4>

                            {nearbyRouteSpots.map((spot) => (
                                <div className="nearby-route-spot" key={spot.id}>
                                    <strong>{spot.name}</strong>
                                    <p>{spot.type} • Safety Score: {spot.safetyScore}</p>
                                    <p className="safety-badge">{getSafetyBadge(spot.safetyScore)}</p>

                                    <button onClick={() => loadRoute(spot)}>
                                        Route Here
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="route-buttons">
                        <button onClick={openInGoogleMaps}>
                            Open in Google Maps
                        </button>

                        <button onClick={() => setSelectedSafeSpot(null)}>
                            Clear Route
                        </button>
                    </div>
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

                <FitMapToRoute routeCoordinates={routeCoordinates} />

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
                                    [selectedSafeSpot.latitude, selectedSafeSpot.longitude]
                                ]
                        }
                        pathOptions={{
                            color: "blue",
                            weight: 6
                        }}
                    />
                )}

                {safeSpots
                    .slice(0, 5).map((spot) => (
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

            <div className="crisis-connect">
                <h2>CrisisConnect</h2>

                <p>National Human Trafficking Hotline:</p>
                <p>1-888-373-7888</p>

                <p>Emergency:</p>
                <p>911</p>

                <p>NYC Domestic Violence Hotline:</p>
                <p>1-800-621-HOPE</p>
            </div>

            <h2>Top Recommended Safe Spots</h2>
            {safeSpots
                .slice(0, 20).map((spot) => (
                <div className="card" key={spot.id}>
                    <h2>{spot.name}</h2>
                    <p>{spot.type}</p>
                    <p>{spot.city}</p>
                    <p>Safety Score: {spot.safetyScore}</p>

                    <button onClick={() => loadRoute(spot)}>
                        Route Me Here
                    </button>
                </div>
            ))}
        </div>
    );
}

export default App;