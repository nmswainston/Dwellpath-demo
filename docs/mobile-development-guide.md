# Snowbird Native Mobile Apps Development Guide

## Project Overview

This guide outlines the development of native iOS and Android companion apps for the Snowbird residency tracking application. The mobile apps will complement the web dashboard with location-aware features and on-the-go tracking capabilities.

## Architecture Strategy

### API-First Approach
- **Current Web API**: Your Express.js backend serves as the central API
- **Mobile Authentication**: Extend current authentication system for mobile token-based auth
- **Data Sync**: Real-time synchronization between web and mobile platforms
- **Offline Support**: Local SQLite storage with background sync

### Core Mobile Features

#### 1. Location-Based Tracking
- **GPS Integration**: Automatic state detection based on location
- **Geofencing**: Smart notifications when crossing state boundaries
- **Manual Override**: Allow users to correct automatic detections
- **Privacy Controls**: Full user control over location sharing

#### 2. Enhanced Day Logging
- **Quick Check-ins**: One-tap state logging with current location
- **Travel Mode**: Simplified interface for frequent travelers
- **Batch Entry**: Log multiple days at once during travel
- **Calendar Integration**: Visual calendar view with state overlays

#### 3. Smart Notifications
- **Threshold Alerts**: Proactive warnings before reaching 183 days
- **Travel Reminders**: Suggestions for optimal state distribution
- **Tax Deadlines**: Important compliance date reminders
- **Weekly Summaries**: Progress reports and insights

#### 4. Expense Management
- **Receipt Capture**: Camera integration for instant receipt scanning
- **OCR Processing**: Automatic text extraction from receipts
- **Location Tagging**: Auto-assign expenses to current state
- **Quick Categories**: Smart categorization suggestions

#### 5. AI Assistant Mobile
- **Voice Queries**: Ask questions about tax compliance via voice
- **Context Awareness**: Location and time-based assistance
- **Quick Actions**: Common queries as swipe shortcuts
- **Offline Insights**: Cached responses for frequent questions

## iOS Development (Swift/SwiftUI)

### Development Environment Setup
```bash
# Install Xcode (Mac required)
# Download from Mac App Store or Apple Developer

# Install CocoaPods for dependency management
sudo gem install cocoapods

# Create new iOS project
# File > New > Project > iOS > App
# Choose SwiftUI interface and Swift language
```

### Key iOS Frameworks
- **Core Location**: GPS and location services
- **UserNotifications**: Push and local notifications
- **AVFoundation**: Camera and receipt scanning
- **Core Data**: Local data persistence
- **Network**: API communication
- **MapKit**: Map visualizations
- **WidgetKit**: Home screen widgets for quick stats

### iOS Project Structure
```
SnowbirdMobile-iOS/
├── Models/
│   ├── ResidencyLog.swift
│   ├── Expense.swift
│   ├── User.swift
│   └── APIModels.swift
├── Services/
│   ├── LocationService.swift
│   ├── APIService.swift
│   ├── NotificationService.swift
│   └── DataSyncService.swift
├── Views/
│   ├── Dashboard/
│   ├── Tracking/
│   ├── Expenses/
│   └── Settings/
├── ViewModels/
│   ├── DashboardViewModel.swift
│   ├── TrackingViewModel.swift
│   └── ExpenseViewModel.swift
└── Utilities/
    ├── Extensions/
    ├── Constants.swift
    └── Helpers.swift
```

### Core iOS Components

#### 1. Location Service
```swift
import CoreLocation
import Combine

class LocationService: NSObject, ObservableObject, CLLocationManagerDelegate {
    @Published var currentState: String?
    @Published var authorizationStatus: CLAuthorizationStatus = .notDetermined
    
    private let locationManager = CLLocationManager()
    private let geocoder = CLGeocoder()
    
    override init() {
        super.init()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
    }
    
    func requestLocationPermission() {
        locationManager.requestWhenInUseAuthorization()
    }
    
    func startLocationTracking() {
        guard authorizationStatus == .authorizedWhenInUse || 
              authorizationStatus == .authorizedAlways else { return }
        locationManager.startUpdatingLocation()
    }
    
    // Implement delegate methods for location updates and state detection
}
```

#### 2. API Service
```swift
import Foundation
import Combine

class APIService: ObservableObject {
    private let baseURL = "https://your-api-domain.com/api"
    private var cancellables = Set<AnyCancellable>()
    
    func login(token: String) -> AnyPublisher<User, Error> {
        // Implement authentication with your backend
    }
    
    func logResidencyDays(_ log: ResidencyLog) -> AnyPublisher<ResidencyLog, Error> {
        // Sync with backend API
    }
    
    func syncOfflineData() -> AnyPublisher<Void, Error> {
        // Handle offline data synchronization
    }
}
```

#### 3. Main App View
```swift
import SwiftUI

struct ContentView: View {
    @StateObject private var locationService = LocationService()
    @StateObject private var apiService = APIService()
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            DashboardView()
                .tabItem {
                    Image(systemName: "chart.bar.fill")
                    Text("Dashboard")
                }
                .tag(0)
            
            TrackingView()
                .tabItem {
                    Image(systemName: "location.fill")
                    Text("Track")
                }
                .tag(1)
            
            ExpensesView()
                .tabItem {
                    Image(systemName: "receipt.fill")
                    Text("Expenses")
                }
                .tag(2)
            
            SettingsView()
                .tabItem {
                    Image(systemName: "gear")
                    Text("Settings")
                }
                .tag(3)
        }
        .environmentObject(locationService)
        .environmentObject(apiService)
    }
}
```

## Android Development (Kotlin)

### Development Environment Setup
```bash
# Install Android Studio
# Download from https://developer.android.com/studio

# Create new Android project
# Choose "Empty Compose Activity"
# Minimum SDK: API 24 (Android 7.0)
# Language: Kotlin
```

### Key Android Components
- **Jetpack Compose**: Modern UI toolkit
- **Room Database**: Local data persistence
- **WorkManager**: Background data sync
- **Location Services**: GPS and geofencing
- **CameraX**: Camera integration
- **Retrofit**: API communication
- **Dagger Hilt**: Dependency injection

### Android Project Structure
```
app/src/main/java/com/snowbird/tracker/
├── data/
│   ├── local/
│   │   ├── entities/
│   │   ├── dao/
│   │   └── database/
│   ├── remote/
│   │   ├── api/
│   │   └── dto/
│   └── repository/
├── domain/
│   ├── model/
│   ├── repository/
│   └── usecase/
├── presentation/
│   ├── dashboard/
│   ├── tracking/
│   ├── expenses/
│   └── settings/
├── di/
├── utils/
└── MainActivity.kt
```

### Core Android Components

#### 1. Location Service
```kotlin
@Singleton
class LocationService @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val fusedLocationClient = LocationServices.getFusedLocationProviderClient(context)
    private val geocoder = Geocoder(context, Locale.getDefault())
    
    @SuppressLint("MissingPermission")
    fun getCurrentLocation(): Flow<Location?> = callbackFlow {
        val callback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                trySend(result.lastLocation)
            }
        }
        
        val request = LocationRequest.Builder(
            Priority.PRIORITY_HIGH_ACCURACY, 
            30000L
        ).build()
        
        fusedLocationClient.requestLocationUpdates(request, callback, Looper.getMainLooper())
        
        awaitClose {
            fusedLocationClient.removeLocationUpdates(callback)
        }
    }
    
    suspend fun getStateFromLocation(location: Location): String? {
        return withContext(Dispatchers.IO) {
            try {
                val addresses = geocoder.getFromLocation(location.latitude, location.longitude, 1)
                addresses?.firstOrNull()?.adminArea
            } catch (e: Exception) {
                null
            }
        }
    }
}
```

#### 2. Main Activity (Compose)
```kotlin
@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SnowbirdTheme {
                SnowbirdApp()
            }
        }
    }
}

@Composable
fun SnowbirdApp() {
    val navController = rememberNavController()
    
    Scaffold(
        bottomBar = {
            BottomNavigation {
                BottomNavigationItem(
                    icon = { Icon(Icons.Default.Dashboard, contentDescription = null) },
                    label = { Text("Dashboard") },
                    selected = false,
                    onClick = { navController.navigate("dashboard") }
                )
                // Add other navigation items
            }
        }
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = "dashboard",
            modifier = Modifier.padding(paddingValues)
        ) {
            composable("dashboard") { DashboardScreen() }
            composable("tracking") { TrackingScreen() }
            composable("expenses") { ExpensesScreen() }
            composable("settings") { SettingsScreen() }
        }
    }
}
```

## Backend API Extensions

### Mobile Authentication Endpoints
```javascript
// Add to server/routes.ts

// Mobile token authentication
app.post('/api/mobile/auth/login', async (req, res) => {
  const { token } = req.body;
  // Validate mobile auth token
  // Return JWT for mobile sessions
});

// Device registration for push notifications
app.post('/api/mobile/devices', isAuthenticated, async (req, res) => {
  const { deviceToken, platform } = req.body;
  // Store device token for push notifications
});

// Location-based state detection
app.post('/api/mobile/detect-state', isAuthenticated, async (req, res) => {
  const { latitude, longitude } = req.body;
  // Reverse geocoding to determine state
  // Return state information
});
```

### Push Notification Service
```javascript
// server/notifications.js
import admin from 'firebase-admin';

class NotificationService {
  constructor() {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }

  async sendThresholdAlert(deviceToken, state, daysRemaining) {
    const message = {
      notification: {
        title: 'Tax Residency Alert',
        body: `${daysRemaining} days left before ${state} residency threshold`,
      },
      data: {
        type: 'threshold_warning',
        state: state,
        daysRemaining: daysRemaining.toString(),
      },
      token: deviceToken,
    };

    return admin.messaging().send(message);
  }
}

export const notificationService = new NotificationService();
```

## Development Timeline

### Phase 1: Foundation (2-3 weeks)
- Set up development environments
- Create basic app structure
- Implement authentication
- Basic API integration

### Phase 2: Core Features (3-4 weeks)
- Location services integration
- Day logging functionality
- Data synchronization
- Basic notifications

### Phase 3: Advanced Features (3-4 weeks)
- Receipt scanning and OCR
- AI assistant integration
- Advanced notifications
- Offline support

### Phase 4: Polish & Release (2-3 weeks)
- UI/UX refinements
- Performance optimization
- App store submission
- Beta testing

## App Store Requirements

### iOS App Store
- Apple Developer Account ($99/year)
- App Store guidelines compliance
- Privacy policy and data usage disclosure
- TestFlight beta testing

### Google Play Store
- Google Play Console account ($25 one-time)
- Play Store policies compliance
- Privacy policy and permissions
- Internal testing and staged rollout

## Next Steps

1. **Choose Development Approach**: Decide between hiring developers or building in-house
2. **Set Up Accounts**: Apple Developer and Google Play Console
3. **Backend Preparation**: Extend your current API for mobile features
4. **Design System**: Create mobile-specific UI/UX designs
5. **Development Environment**: Set up Xcode and Android Studio

Would you like me to help you start with any specific aspect of the mobile development, such as extending your current API for mobile authentication or creating detailed UI mockups for the mobile apps?