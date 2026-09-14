# SafePath

SafePath is a full stack safety focused navigation application that helps users compare routes based on safety, distance, and travel time instead of optimizing only for the fastest route.

Users can generate multiple route options, view a safety score for each route, locate nearby SafeSpots such as hospitals, police stations, shelters, and libraries, and explore everything through an interactive map.

## Key Features

* Generates and compares multiple route alternatives
* Calculates a safety score for each route
* Displays distance and estimated travel time
* Finds nearby SafeSpots including hospitals, police stations, shelters, and libraries
* Supports browser based geolocation
* Allows users to filter SafeSpots by category
* Sorts routes based on safety, distance, and travel time
* Displays routes and resources through an interactive Leaflet map

## Tech Stack

### Frontend
React  
JavaScript  
Leaflet

### Backend
Java  
Spring Boot  
H2 Database

### APIs
OpenRouteService

## Architecture

SafePath uses a React frontend connected to a Spring Boot REST backend.

When a user enters an origin and destination, the frontend sends the request to the backend. The backend communicates with OpenRouteService to retrieve multiple possible routes and processes the returned geographic data.

SafePath then applies safety related logic to evaluate the routes and returns the processed results to the frontend. The React application displays each route's safety score, distance, and estimated travel time while Leaflet renders the routes and nearby SafeSpots on an interactive map.

## What I Built

I designed and implemented SafePath as a full stack project.

My work included:

* Building REST endpoints with Spring Boot
* Integrating an external routing API
* Processing route and geographic data
* Developing the route safety scoring logic
* Building the React interface
* Integrating Leaflet for interactive mapping
* Implementing geolocation
* Building SafeSpot filtering and visualization
* Handling frontend and backend communication
* Debugging API, geocoding, state management, and integration issues

## Technical Challenges

One of the biggest challenges was coordinating data across an external routing service, the Spring Boot backend, and the React frontend.

Route responses had to be transformed into data that could be scored, compared, and correctly rendered on the map. I also worked through issues involving failed API responses, geocoding, frontend state, map rendering, and communication between different parts of the application.

Building SafePath gave me experience debugging problems across an entire full stack system rather than working on an isolated component.

## Running SafePath Locally

### Backend

From the project root:

```bash
./mvnw spring-boot:run