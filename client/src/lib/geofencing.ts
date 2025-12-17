// State boundary data (simplified polygons for major US states)
// In production, you'd use more detailed boundary data from USGS or similar
export interface StateGeofence {
  state: string;
  name: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  // Simplified polygon points for more accurate detection
  polygon?: Array<{ lat: number; lng: number }>;
}

export const US_STATE_GEOFENCES: StateGeofence[] = [
  {
    state: 'FL',
    name: 'Florida',
    bounds: { north: 31.0, south: 24.5, east: -80.0, west: -87.6 }
  },
  {
    state: 'NY',
    name: 'New York',
    bounds: { north: 45.0, south: 40.5, east: -71.8, west: -79.8 }
  },
  {
    state: 'CA',
    name: 'California',
    bounds: { north: 42.0, south: 32.5, east: -114.1, west: -124.4 }
  },
  {
    state: 'TX',
    name: 'Texas',
    bounds: { north: 36.5, south: 25.8, east: -93.5, west: -106.6 }
  },
  {
    state: 'AZ',
    name: 'Arizona',
    bounds: { north: 37.0, south: 31.3, east: -109.0, west: -114.8 }
  },
  {
    state: 'NV',
    name: 'Nevada',
    bounds: { north: 42.0, south: 35.0, east: -114.0, west: -120.0 }
  },
  {
    state: 'CO',
    name: 'Colorado',
    bounds: { north: 41.0, south: 37.0, east: -102.0, west: -109.1 }
  },
  {
    state: 'MI',
    name: 'Michigan',
    bounds: { north: 48.3, south: 41.7, east: -82.1, west: -90.4 }
  },
  {
    state: 'IL',
    name: 'Illinois',
    bounds: { north: 42.5, south: 37.0, east: -87.0, west: -91.5 }
  },
  {
    state: 'PA',
    name: 'Pennsylvania',
    bounds: { north: 42.5, south: 39.7, east: -74.7, west: -80.5 }
  }
];

export function detectStateFromCoordinates(latitude: number, longitude: number): string | null {
  for (const geofence of US_STATE_GEOFENCES) {
    if (
      latitude >= geofence.bounds.south &&
      latitude <= geofence.bounds.north &&
      longitude >= geofence.bounds.west &&
      longitude <= geofence.bounds.east
    ) {
      return geofence.state;
    }
  }
  return null;
}

export function getStateName(stateCode: string): string {
  const state = US_STATE_GEOFENCES.find(s => s.state === stateCode);
  return state?.name || stateCode;
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export interface LocationEvent {
  type: 'enter' | 'exit';
  state: string;
  timestamp: number;
  latitude: number;
  longitude: number;
  accuracy: number;
}

export class GeofenceMonitor {
  private lastState: string | null = null;
  private lastPosition: { lat: number; lng: number } | null = null;
  private minDistance = 1; // Minimum distance in km to trigger state change
  private callbacks: Array<(event: LocationEvent) => void> = [];

  addCallback(callback: (event: LocationEvent) => void) {
    this.callbacks.push(callback);
  }

  removeCallback(callback: (event: LocationEvent) => void) {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }

  checkLocation(latitude: number, longitude: number, accuracy: number) {
    const currentState = detectStateFromCoordinates(latitude, longitude);
    const currentPosition = { lat: latitude, lng: longitude };

    // Only process if we have sufficient accuracy (less than 100m)
    if (accuracy > 100) {
      return;
    }

    // Check if we've moved far enough to warrant a state check
    if (this.lastPosition) {
      const distance = calculateDistance(
        this.lastPosition.lat,
        this.lastPosition.lng,
        latitude,
        longitude
      );

      if (distance < this.minDistance) {
        return; // Haven't moved far enough
      }
    }

    // State change detected
    if (currentState !== this.lastState) {
      const timestamp = Date.now();

      // Exit previous state
      if (this.lastState) {
        const exitEvent: LocationEvent = {
          type: 'exit',
          state: this.lastState,
          timestamp,
          latitude,
          longitude,
          accuracy
        };
        this.notifyCallbacks(exitEvent);
      }

      // Enter new state
      if (currentState) {
        const enterEvent: LocationEvent = {
          type: 'enter',
          state: currentState,
          timestamp,
          latitude,
          longitude,
          accuracy
        };
        this.notifyCallbacks(enterEvent);
      }

      this.lastState = currentState;
    }

    this.lastPosition = currentPosition;
  }

  private notifyCallbacks(event: LocationEvent) {
    this.callbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in geofence callback:', error);
      }
    });
  }

  getCurrentState(): string | null {
    return this.lastState;
  }

  reset() {
    this.lastState = null;
    this.lastPosition = null;
  }
}