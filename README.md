# SafePath

SafePath is a safety focused navigation application designed to help users compare routes based on more than just speed and distance. The app generates multiple route options, assigns each route a safety score, and helps users identify nearby safety resources while traveling.

## Features

SafePath allows users to:

* Enter a starting point and destination
* View multiple route options
* Compare routes by safety score, distance, and estimated travel time
* View nearby SafeSpots such as hospitals, police stations, shelters, and libraries
* Use current location through browser geolocation
* Filter SafeSpots by category
* Sort and compare route options
* View routes and safety resources on an interactive map

## Tech Stack

Frontend

* React
* JavaScript
* Leaflet

Backend

* Java
* Spring Boot
* H2 Database

APIs and Services

* OpenRouteService for route generation and mapping data

## How It Works

The frontend collects the user’s starting location and destination and sends the request to the Spring Boot backend.

The backend communicates with OpenRouteService to retrieve multiple possible routes. SafePath then processes the route information and applies safety related logic to generate a safety score for each option.

The processed route data is returned to the React frontend, where users can compare routes based on safety score, distance, and travel time. Leaflet is used to display the routes and nearby SafeSpots on an interactive map.

## Project Structure

The project is divided into a Spring Boot backend and React frontend.

The backend is responsible for API communication, route processing, safety scoring, and application logic.

The frontend is responsible for user input, displaying route comparisons, handling map interactions, geolocation, and SafeSpot filtering.

## Running the Project

### Backend

Navigate to the backend directory and start the Spring Boot application.

```bash
./mvnw spring-boot:run
```

Or run the main Spring Boot application class through your IDE.

### Frontend

Navigate to the frontend directory.

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

Make sure the backend is running before requesting routes.

## Current Status

SafePath is currently in active development. Core routing, safety scoring, route comparison, SafeSpot visualization, filtering, and geolocation functionality have been implemented.

Future improvements may include expanded safety data sources, improved scoring logic, additional emergency resource features, and production deployment.

## Why I Built It

I built SafePath because traditional navigation applications usually optimize for speed and distance, but those are not always the only factors people consider when choosing how to travel.

The project gave me experience building a full stack application, integrating external APIs, debugging communication between frontend and backend systems, managing interactive map state, and designing features around a real user problem.
