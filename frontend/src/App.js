import { useEffect, useState } from "react";
import "./App.css";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";

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

    const hospitalIcon = new L.Icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/4320/4320371.png",
        iconSize: [32, 32]
    });

    const policeIcon = new L.Icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/1995/1995574.png",
        iconSize: [36, 36]
    });

    const libraryIcon = new L.Icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/2232/2232688.png",
        iconSize: [32, 32]
    });

    const shelterIcon = new L.Icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/619/619153.png",
        iconSize: [32, 32]
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

    function useEnteredLocation() {
        const locations = {
            "times square": [40.7580, -73.9855],
            "grand central": [40.7527, -73.9772],
            "bryant park": [40.7536, -73.9832],
            "central park": [40.7812, -73.9665],
            "brooklyn bridge": [40.7061, -73.9969]
        };

        const coordinates = locations[manualLocation.toLowerCase()];

        if (!coordinates) {
            alert("Location not found yet. Try: Times Square, Grand Central, Bryant Park, Central Park, or Brooklyn Bridge.");
            return;
        }

        const lat = coordinates[0];
        const lon = coordinates[1];

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

        setRouteDistance((summary.distance / 1609.34).toFixed(2));
        setRouteDuration(Math.round(summary.duration / 60));

        const coordinates = data.features[0].geometry.coordinates.map((coord) => [
            coord[1],
            coord[0]
        ]);

        setRouteCoordinates(coordinates);
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
            </div>

            {selectedSafeSpot && (
                <div className="selected-route">
                    <h3>Routing to: {selectedSafeSpot.name}</h3>
                    <p>{selectedSafeSpot.type}</p>
                    <p>Safety Score: {selectedSafeSpot.safetyScore}</p>

                    {routeDistance && (
                        <p>Distance: {routeDistance} miles</p>
                    )}

                    {routeDuration && (
                        <p>Estimated Walk: {routeDuration} minutes</p>
                    )}

                    <button onClick={() => setSelectedSafeSpot(null)}>
                        Clear Route
                    </button>

                    <button onClick={openInGoogleMaps}>
                        Open in Google Maps
                    </button>
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