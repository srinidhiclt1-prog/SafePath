import { useEffect, useState } from "react";
import "./App.css";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";

function App() {

    const [safeSpots, setSafeSpots] = useState([]);
    const [city, setCity] = useState("");
    const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]);
    const [userLocation, setUserLocation] = useState(null);
    const [selectedSafeSpot, setSelectedSafeSpot] = useState(null);

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

    return (
        <div className="app">
            <h1>SafePath</h1>
            <p>NYC Safety Navigation Platform</p>

            <button onClick={loadHighSafetySpots}>
                Show High Safety Spots
            </button>

            <button onClick={loadAllSafeSpots}>All</button>
            <button onClick={loadHospitals}>Hospitals</button>
            <button onClick={loadLibraries}>Libraries</button>
            <button onClick={loadHighSafetySpots}>High Safety</button>
            <button onClick={loadNearbySafeSpots}>
                Nearby Safe Spots
            </button>
            <button onClick={useMyLocation}>
                Use My Location
            </button>

            <input
                type="text"
                placeholder="Enter city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
            />

            <button onClick={searchByCity}>
                Search City
            </button>

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
                        positions={[
                            userLocation,
                            [selectedSafeSpot.latitude, selectedSafeSpot.longitude]
                        ]}
                    />
                )}

                {safeSpots.map((spot) => (
                    <Marker
                        key={spot.id}
                        position={[spot.latitude, spot.longitude]}
                    >
                        <Popup>
                            <h3>{spot.name}</h3>
                            <p>{spot.type}</p>
                            <p>Safety Score: {spot.safetyScore}</p>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {safeSpots.map((spot) => (
                <div className="card" key={spot.id}>
                    <h2>{spot.name}</h2>
                    <p>{spot.type}</p>
                    <p>{spot.city}</p>
                    <p>Safety Score: {spot.safetyScore}</p>

                    <button onClick={() => setSelectedSafeSpot(spot)}>
                        Route Me Here
                    </button>
                </div>
            ))}
        </div>
    );
}

export default App;