import { useEffect, useState } from "react";
import "./App.css";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import hospitalIconImage from "./assets/hospital.png";
import policeIconImage from "./assets/police.png";
import libraryIconImage from "./assets/library.png";
import shelterIconImage from "./assets/shelter.png";

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
                ]
            })
        });

        const data = await response.json();

        const summary = data.features[0].properties.summary;

        const distanceMiles = summary.distance / 1609.34;
        const durationMinutes = Math.round(summary.duration / 60);

        setRouteDistance(distanceMiles.toFixed(2));
        setRouteDuration(durationMinutes);

        const distanceScore = Math.max(0, 40 - distanceMiles * 10);
        const safeSpotBonus = Math.min(safeSpots.length * 3, 30);
        const baseScore = 30;

        const score = Math.max(
            0,
            Math.min(100, baseScore + distanceScore + safeSpotBonus)
        );

        setSafeRouteScore(Math.round(score));

        setRouteDistance((summary.distance / 1609.34).toFixed(2));
        setRouteDuration(Math.round(summary.duration / 60));

        const coordinates = data.features[0].geometry.coordinates.map((coord) => [
            coord[1],
            coord[0]
        ]);

        setRouteCoordinates(coordinates);
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