// Enhanced Air Quality Platform with Location Selection
class AirQualityPlatform {
    constructor() {
        // API Configuration
        this.API_TOKEN = '154370b561ded59c1c8fdcde292c5dcee9759d0f';
        this.API_BASE = 'https://api.waqi.info';
        this.CACHE_KEY = 'airQualityCache';
        this.LOCATION_CACHE_KEY = 'selectedLocation';
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
        
        // Pollutant safe limits (WHO 2021 guidelines)
        this.POLLUTANT_LIMITS = {
            'pm25': { safe: 15, unit: 'µg/m³', name: 'PM2.5' },
            'pm10': { safe: 45, unit: 'µg/m³', name: 'PM10' },
            'no2': { safe: 25, unit: 'µg/m³', name: 'NO₂' },
            'so2': { safe: 40, unit: 'µg/m³', name: 'SO₂' },
            'o3': { safe: 100, unit: 'µg/m³', name: 'O₃' },
            'co': { safe: 4, unit: 'mg/m³', name: 'CO' }
        };
        
        // AQI Categories
        this.AQI_CATEGORIES = [
            { min: 0, max: 50, level: 'Good', color: '#00e400' },
            { min: 51, max: 100, level: 'Moderate', color: '#ffff00' },
            { min: 101, max: 150, level: 'Unhealthy for Sensitive Groups', color: '#ff7e00' },
            { min: 151, max: 200, level: 'Unhealthy', color: '#ff0000' },
            { min: 201, max: 300, level: 'Very Unhealthy', color: '#8f3f97' },
            { min: 301, max: 500, level: 'Hazardous', color: '#7e0023' }
        ];
        
        // Health insights
        this.HEALTH_INSIGHTS = {
            0: [
                { icon: 'fas fa-running', title: 'Outdoor Activities', desc: 'Perfect for outdoor exercise and activities' },
                { icon: 'fas fa-lungs', title: 'Breathing Comfort', desc: 'Air quality is excellent for everyone' }
            ],
            1: [
                { icon: 'fas fa-walking', title: 'Moderate Activity', desc: 'Generally acceptable for outdoor activities' },
                { icon: 'fas fa-lungs', title: 'Minor Concern', desc: 'Unusually sensitive people should consider limiting activity' }
            ],
            2: [
                { icon: 'fas fa-mask', title: 'Sensitive Groups', desc: 'Children, elderly, and those with respiratory issues should limit outdoor exposure' },
                { icon: 'fas fa-heart', title: 'Heart & Lung', desc: 'People with heart or lung disease should avoid prolonged exertion' }
            ],
            3: [
                { icon: 'fas fa-exclamation-triangle', title: 'Health Alert', desc: 'Everyone may experience health effects' },
                { icon: 'fas fa-house-user', title: 'Stay Indoors', desc: 'Limit outdoor activities, use air purifiers indoors' }
            ],
            4: [
                { icon: 'fas fa-skull-crossbones', title: 'Health Warning', desc: 'Serious health effects on everyone' },
                { icon: 'fas fa-ban', title: 'Avoid Outdoors', desc: 'Remain indoors and keep activity levels low' }
            ],
            5: [
                { icon: 'fas fa-radiation-alt', title: 'Emergency Conditions', desc: 'Health warning of emergency conditions' },
                { icon: 'fas fa-house-damage', title: 'Shelter in Place', desc: 'Stay indoors with windows and doors closed' }
            ]
        };
        
        // Major cities for presets
        this.MAJOR_CITIES = [
            { name: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 },
            { name: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
            { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
            { name: 'Beijing', country: 'China', lat: 39.9042, lng: 116.4074 },
            { name: 'Delhi', country: 'India', lat: 28.6139, lng: 77.2090 },
            { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
            { name: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050 },
            { name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 },
            { name: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333 },
            { name: 'Moscow', country: 'Russia', lat: 55.7558, lng: 37.6173 },
            { name: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357 },
            { name: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332 }
        ];
        
        // Countries with flags
        this.COUNTRIES = [
            { code: 'US', name: 'United States', flag: '🇺🇸' },
            { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
            { code: 'CN', name: 'China', flag: '🇨🇳' },
            { code: 'IN', name: 'India', flag: '🇮🇳' },
            { code: 'JP', name: 'Japan', flag: '🇯🇵' },
            { code: 'DE', name: 'Germany', flag: '🇩🇪' },
            { code: 'FR', name: 'France', flag: '🇫🇷' },
            { code: 'IT', name: 'Italy', flag: '🇮🇹' },
            { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
            { code: 'CA', name: 'Canada', flag: '🇨🇦' },
            { code: 'AU', name: 'Australia', flag: '🇦🇺' },
            { code: 'RU', name: 'Russia', flag: '🇷🇺' },
            { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
            { code: 'ES', name: 'Spain', flag: '🇪🇸' },
            { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
            { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
            { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
            { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
            { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
            { code: 'EG', name: 'Egypt', flag: '🇪🇬' }
        ];
        
        // Initialize state
        this.currentData = null;
        this.currentLocation = this.getSavedLocation() || { 
            type: 'current', 
            name: 'Your Location',
            lat: 40.7128,
            lng: -74.0060
        };
        this.historicalData = [];
        this.map = null;
        this.charts = {};
        
        // DOM Elements
        this.elements = {
            loadingOverlay: document.getElementById('loadingOverlay'),
            themeToggle: document.getElementById('themeToggle'),
            locationName: document.getElementById('locationName'),
            aqiValue: document.getElementById('aqiValue'),
            aqiCategory: document.getElementById('aqiCategory'),
            healthImpact: document.getElementById('healthImpact'),
            dominantPollutant: document.getElementById('dominantPollutant'),
            lastUpdated: document.getElementById('lastUpdated'),
            pollutantGrid: document.getElementById('pollutantGrid'),
            insightsContainer: document.getElementById('insightsContainer'),
            trendInsights: document.getElementById('trendInsights'),
            comparisonContainer: document.getElementById('comparisonContainer'),
            compositionDetails: document.getElementById('compositionDetails'),
            alertsContainer: document.getElementById('alertsContainer'),
            refreshData: document.getElementById('refreshData'),
            cacheStatus: document.getElementById('cacheStatus'),
            aqiCard: document.getElementById('aqiCard'),
            
            // Location Selection Elements
            currentLocationName: document.getElementById('currentLocationName'),
            locationDetails: document.getElementById('locationDetails'),
            clearLocation: document.getElementById('clearLocation'),
            
            // Tab Elements
            tabButtons: document.querySelectorAll('.tab-button'),
            tabContents: document.querySelectorAll('.tab-content'),
            
            // City Tab
            citySearch: document.getElementById('citySearch'),
            cityLoading: document.getElementById('cityLoading'),
            cityResults: document.getElementById('cityResults'),
            cityPresets: document.getElementById('cityPresets'),
            
            // Country Tab
            countrySearch: document.getElementById('countrySearch'),
            countryGrid: document.getElementById('countryGrid'),
            
            // Coordinates Tab
            latitudeInput: document.getElementById('latitudeInput'),
            longitudeInput: document.getElementById('longitudeInput'),
            useCoordinates: document.getElementById('useCoordinates'),
            
            // Current Tab
            detectLocation: document.getElementById('detectLocation'),
            permissionStatus: document.getElementById('permissionStatus')
        };
        
        // Initialize
        this.init();
    }
    
    async init() {
        console.log('Initializing Air Quality Platform...');
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize theme
        this.initTheme();
        
        // Initialize location selector
        this.initLocationSelector();
        
        // Initialize charts
        this.initCharts();
        
        // Initialize map
        this.initMap();
        
        // Load cached data if available
        const cachedData = this.getCachedData();
        if (cachedData) {
            console.log('Using cached data');
            this.updateUI(cachedData);
            this.elements.cacheStatus.textContent = 'Using cached data';
            this.elements.cacheStatus.classList.add('pulse');
        } else {
            console.log('No cached data available');
        }
        
        // Show demo data immediately
        this.showDemoData();
        
        // Try to fetch real data
        setTimeout(() => {
            this.fetchData().then(() => {
                console.log('Data fetched successfully');
                this.elements.loadingOverlay.classList.add('hidden');
            }).catch(error => {
                console.log('Using demo data due to API error');
                this.elements.loadingOverlay.classList.add('hidden');
            });
        }, 1000);
        
        // Auto-refresh every 5 minutes
        setInterval(() => this.fetchData(), 5 * 60 * 1000);
    }
    
    setupEventListeners() {
        // Theme toggle
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Refresh data
        this.elements.refreshData.addEventListener('click', () => this.fetchData());
        
        // Clear location
        this.elements.clearLocation.addEventListener('click', () => this.clearSelectedLocation());
    }
    
    showDemoData() {
        console.log('Showing demo data...');
        
        // Generate realistic demo data
        const demoData = this.generateDemoData();
        this.currentData = demoData;
        this.updateUI(demoData);
        
        // Update cache status
        this.elements.cacheStatus.textContent = 'Demo data (API offline)';
        this.elements.cacheStatus.style.color = 'var(--warning-color)';
    }
    
    generateDemoData() {
        const aqi = Math.floor(Math.random() * 150) + 30; // Random AQI between 30-180
        const now = new Date();
        
        return {
            aqi: aqi,
            city: {
                name: this.currentLocation.name || 'Demo City',
                geo: [this.currentLocation.lat || 40.7128, this.currentLocation.lng || -74.0060]
            },
            time: {
                iso: now.toISOString(),
                s: Math.floor(now.getTime() / 1000)
            },
            iaqi: {
                pm25: { v: (aqi / 5) + Math.random() * 10 },
                pm10: { v: (aqi / 4) + Math.random() * 15 },
                no2: { v: (aqi / 6) + Math.random() * 8 },
                so2: { v: (aqi / 8) + Math.random() * 5 },
                o3: { v: (aqi / 7) + Math.random() * 12 },
                co: { v: (aqi / 20) + Math.random() * 2 }
            },
            attributions: [
                { url: 'https://waqi.info', name: 'World Air Quality Index' }
            ]
        };
    }
    
    initLocationSelector() {
        console.log('Initializing location selector...');
        
        // Tab switching
        this.elements.tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });
        
        // Initialize city presets
        this.initCityPresets();
        
        // Initialize country grid
        this.initCountryGrid();
        
        // Setup search functionality
        this.setupSearch();
        
        // Setup coordinate input
        this.setupCoordinateInput();
        
        // Setup current location detection
        this.setupCurrentLocation();
        
        // Update selected location display
        this.updateSelectedLocationDisplay();
    }
    
    switchTab(tabName) {
        console.log('Switching to tab:', tabName);
        
        // Update tab buttons
        this.elements.tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabName);
        });
        
        // Update tab contents
        this.elements.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}Tab`);
        });
    }
    
    initCityPresets() {
        console.log('Initializing city presets...');
        
        this.elements.cityPresets.innerHTML = this.MAJOR_CITIES.map(city => `
            <button class="preset-btn" data-lat="${city.lat}" data-lng="${city.lng}" 
                    data-name="${city.name}, ${city.country}">
                <i class="fas fa-city"></i>
                <span class="preset-name">${city.name}</span>
                <span class="preset-country">${city.country}</span>
            </button>
        `).join('');
        
        // Add event listeners to preset buttons
        this.elements.cityPresets.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lat = parseFloat(e.currentTarget.dataset.lat);
                const lng = parseFloat(e.currentTarget.dataset.lng);
                const name = e.currentTarget.dataset.name;
                
                console.log('Selected city:', name, lat, lng);
                
                this.selectLocation({
                    type: 'coordinates',
                    lat,
                    lng,
                    name,
                    details: `Major city in ${name.split(', ')[1]}`
                });
            });
        });
    }
    
    initCountryGrid() {
        console.log('Initializing country grid...');
        
        this.elements.countryGrid.innerHTML = this.COUNTRIES.map(country => `
            <button class="country-btn" data-code="${country.code}" data-name="${country.name}">
                <span class="country-flag">${country.flag}</span>
                <span class="country-name">${country.name}</span>
            </button>
        `).join('');
        
        // Add event listeners to country buttons
        this.elements.countryGrid.querySelectorAll('.country-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const code = e.currentTarget.dataset.code;
                const name = e.currentTarget.dataset.name;
                
                console.log('Selected country:', name, code);
                
                // Get capital coordinates for the country
                const capitalCoords = this.getCapitalCoordinates(code);
                if (capitalCoords) {
                    this.selectLocation({
                        type: 'coordinates',
                        lat: capitalCoords.lat,
                        lng: capitalCoords.lng,
                        name: name,
                        details: `Country-wide air quality data`
                    });
                }
            });
        });
        
        // Setup country search
        this.elements.countrySearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const buttons = this.elements.countryGrid.querySelectorAll('.country-btn');
            
            buttons.forEach(btn => {
                const countryName = btn.dataset.name.toLowerCase();
                btn.style.display = countryName.includes(searchTerm) ? 'flex' : 'none';
            });
        });
    }
    
    setupSearch() {
        console.log('Setting up search...');
        
        this.elements.citySearch.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                this.elements.cityResults.classList.remove('active');
                return;
            }
            
            // Show loading
            this.elements.cityLoading.classList.add('active');
            
            // Simulate search results
            setTimeout(() => {
                this.displaySearchResults(this.generateSearchResults(query));
                this.elements.cityLoading.classList.remove('active');
            }, 500);
        });
        
        // Close results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.location-search')) {
                this.elements.cityResults.classList.remove('active');
            }
        });
    }
    
    generateSearchResults(query) {
        // Generate demo search results
        return this.MAJOR_CITIES
            .filter(city => 
                city.name.toLowerCase().includes(query.toLowerCase()) ||
                city.country.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, 5)
            .map(city => ({
                uid: Math.random().toString(36).substr(2, 9),
                lat: city.lat,
                lon: city.lng,
                station: {
                    name: `${city.name} Air Quality Station`,
                    city: city.name,
                    country: city.country
                }
            }));
    }
    
    displaySearchResults(results) {
        if (results.length === 0) {
            this.elements.cityResults.innerHTML = '<div class="no-results">No locations found. Try a different search.</div>';
            this.elements.cityResults.classList.add('active');
            return;
        }
        
        this.elements.cityResults.innerHTML = results.map(result => `
            <div class="search-result" data-lat="${result.lat}" data-lng="${result.lon}"
                 data-name="${result.station.city}, ${result.station.country}">
                <div class="result-icon">
                    <i class="fas fa-map-marker-alt"></i>
                </div>
                <div class="result-content">
                    <div class="result-name">${result.station.city}</div>
                    <div class="result-details">
                        <span><i class="fas fa-city"></i> ${result.station.city}</span>
                        <span><i class="fas fa-flag"></i> ${result.station.country}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add click listeners
        this.elements.cityResults.querySelectorAll('.search-result').forEach(result => {
            result.addEventListener('click', (e) => {
                const lat = parseFloat(e.currentTarget.dataset.lat);
                const lng = parseFloat(e.currentTarget.dataset.lng);
                const name = e.currentTarget.dataset.name;
                
                this.selectLocation({
                    type: 'coordinates',
                    lat: lat,
                    lng: lng,
                    name: name,
                    details: 'Monitoring station'
                });
                
                this.elements.cityResults.classList.remove('active');
                this.elements.citySearch.value = '';
            });
        });
        
        this.elements.cityResults.classList.add('active');
    }
    
    setupCoordinateInput() {
        console.log('Setting up coordinate input...');
        
        this.elements.useCoordinates.addEventListener('click', () => {
            const lat = parseFloat(this.elements.latitudeInput.value);
            const lng = parseFloat(this.elements.longitudeInput.value);
            
            if (isNaN(lat) || isNaN(lng)) {
                this.showError('Please enter valid coordinates');
                return;
            }
            
            if (lat < -90 || lat > 90) {
                this.showError('Latitude must be between -90 and 90');
                return;
            }
            
            if (lng < -180 || lng > 180) {
                this.showError('Longitude must be between -180 and 180');
                return;
            }
            
            this.selectLocation({
                type: 'coordinates',
                lat,
                lng,
                name: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
                details: 'Custom coordinates'
            });
        });
        
        // Set default coordinates (New York)
        this.elements.latitudeInput.value = '40.7128';
        this.elements.longitudeInput.value = '-74.0060';
    }
    
    setupCurrentLocation() {
        console.log('Setting up current location detection...');
        
        this.elements.detectLocation.addEventListener('click', () => {
            if (navigator.geolocation) {
                this.updatePermissionStatus('info', 'Detecting your location...');
                
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        this.selectLocation({
                            type: 'coordinates',
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                            name: 'Your Current Location',
                            details: 'Detected via GPS'
                        });
                        this.updatePermissionStatus('granted', 'Location detected successfully!');
                    },
                    (error) => {
                        console.error('Geolocation error:', error);
                        this.updatePermissionStatus('denied', 'Unable to detect location. Please enable location services.');
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
            } else {
                this.updatePermissionStatus('denied', 'Geolocation is not supported by your browser.');
            }
        });
    }
    
    selectLocation(location) {
        console.log('Selecting location:', location);
        
        this.currentLocation = location;
        this.saveLocation(location);
        this.updateSelectedLocationDisplay();
        
        // Show loading
        this.elements.loadingOverlay.classList.remove('hidden');
        
        // Fetch new data
        setTimeout(() => {
            this.fetchData().finally(() => {
                this.elements.loadingOverlay.classList.add('hidden');
            });
        }, 500);
    }
    
    clearSelectedLocation() {
        console.log('Clearing selected location');
        
        this.currentLocation = { 
            type: 'current', 
            name: 'Your Location',
            lat: 40.7128,
            lng: -74.0060
        };
        localStorage.removeItem(this.LOCATION_CACHE_KEY);
        this.updateSelectedLocationDisplay();
        
        // Show loading
        this.elements.loadingOverlay.classList.remove('hidden');
        
        // Fetch new data
        setTimeout(() => {
            this.fetchData().finally(() => {
                this.elements.loadingOverlay.classList.add('hidden');
            });
        }, 500);
    }
    
    updateSelectedLocationDisplay() {
        console.log('Updating location display:', this.currentLocation);
        
        this.elements.currentLocationName.textContent = this.currentLocation.name;
        
        let details = '';
        switch (this.currentLocation.type) {
            case 'current':
                details = 'Using your current location';
                break;
            case 'coordinates':
                details = `Coordinates: ${this.currentLocation.lat?.toFixed(4)}, ${this.currentLocation.lng?.toFixed(4)}`;
                break;
            default:
                details = 'Air quality monitoring';
        }
        
        this.elements.locationDetails.textContent = details;
        this.elements.locationName.textContent = this.currentLocation.name;
    }
    
    saveLocation(location) {
        localStorage.setItem(this.LOCATION_CACHE_KEY, JSON.stringify(location));
    }
    
    getSavedLocation() {
        const saved = localStorage.getItem(this.LOCATION_CACHE_KEY);
        return saved ? JSON.parse(saved) : null;
    }
    
    async fetchData() {
        console.log('Fetching data for location:', this.currentLocation);
        
        try {
            let apiUrl;
            
            // Construct API URL based on location type
            switch (this.currentLocation.type) {
                case 'current':
                    apiUrl = `${this.API_BASE}/feed/here/?token=${this.API_TOKEN}`;
                    break;
                case 'coordinates':
                    apiUrl = `${this.API_BASE}/feed/geo:${this.currentLocation.lat};${this.currentLocation.lng}/?token=${this.API_TOKEN}`;
                    break;
                default:
                    apiUrl = `${this.API_BASE}/feed/here/?token=${this.API_TOKEN}`;
            }
            
            console.log('API URL:', apiUrl);
            
            // Add timeout to prevent hanging
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const response = await fetch(apiUrl, { 
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('API Response:', result);
            
            if (result.status !== 'ok') {
                throw new Error(`API error: ${result.data || 'Unknown error'}`);
            }
            
            this.currentData = result.data;
            
            // Update location name from API if available
            if (this.currentData.city?.name && this.currentLocation.type !== 'coordinates') {
                this.currentLocation.name = this.currentData.city.name;
                this.updateSelectedLocationDisplay();
            }
            
            // Cache the data
            this.setCachedData(this.currentData);
            
            // Update UI
            this.updateUI(this.currentData);
            
            // Update historical data
            this.updateHistoricalData();
            
            // Check alerts
            this.checkAlerts();
            
            // Update cache status
            this.elements.cacheStatus.textContent = 'Live data loaded';
            this.elements.cacheStatus.style.color = '';
            this.elements.cacheStatus.classList.remove('pulse');
            
            console.log('Data fetched and updated successfully');
            
        } catch (error) {
            console.error('Error fetching data:', error);
            
            // Use demo data as fallback
            this.showDemoData();
            this.showError('Using demo data. Real-time updates unavailable.');
            
            // Try cached data
            const cachedData = this.getCachedData();
            if (cachedData) {
                console.log('Using cached data as fallback');
                this.updateUI(cachedData);
            }
        }
    }
    
    updateUI(data) {
        console.log('Updating UI with data:', data);
        
        // Update location
        if (data.city?.name) {
            this.elements.locationName.textContent = data.city.name;
        }
        
        // Update AQI display
        const aqi = data.aqi || 0;
        this.updateAQIDisplay(aqi);
        
        // Update pollutant breakdown
        this.updatePollutantBreakdown(data.iaqi);
        
        // Update health insights
        this.updateHealthInsights(aqi);
        
        // Update comparative analysis
        this.updateComparativeAnalysis(data);
        
        // Update pollution composition
        this.updatePollutionComposition(data.iaqi);
        
        // Update timestamp
        this.elements.lastUpdated.textContent = this.formatTimestamp(data.time?.iso || new Date().toISOString());
        
        // Update map
        if (this.map) {
            const coords = data.city?.geo || [this.currentLocation.lat, this.currentLocation.lng];
            this.updateMap(coords, aqi);
        }
        
        // Update charts
        this.updateCharts();
    }
    
    updateAQIDisplay(aqi) {
        // Animate AQI value
        const targetValue = Math.round(aqi);
        const currentValue = parseInt(this.elements.aqiValue.textContent) || 0;
        
        this.animateValue(this.elements.aqiValue, currentValue, targetValue, 1000);
        
        // Get AQI category
        const category = this.getAQICategory(aqi);
        
        // Update category text
        this.elements.aqiCategory.textContent = category.level;
        this.elements.aqiCategory.style.borderColor = category.color;
        
        // Update health impact
        this.elements.healthImpact.textContent = this.getHealthImpactText(aqi);
        this.elements.healthImpact.style.color = category.color;
        
        // Update AQI card background
        this.elements.aqiCard.style.borderLeftColor = category.color;
        this.elements.aqiCard.style.borderLeftWidth = '8px';
        
        // Update scale indicators
        document.querySelectorAll('.scale-item').forEach(item => {
            item.classList.remove('active');
            const level = parseInt(item.dataset.level);
            if (aqi >= this.AQI_CATEGORIES[level].min && aqi <= this.AQI_CATEGORIES[level].max) {
                item.classList.add('active');
                item.style.color = category.color;
                item.style.fontWeight = '600';
            }
        });
    }
    
    updatePollutantBreakdown(iaqi) {
        if (!iaqi) {
            // Generate demo IAQI data
            iaqi = {};
            Object.keys(this.POLLUTANT_LIMITS).forEach(key => {
                iaqi[key] = { v: Math.random() * 50 + 10 };
            });
        }
        
        this.elements.pollutantGrid.innerHTML = '';
        
        // Find dominant pollutant
        let dominantPollutant = 'PM2.5';
        let highestValue = 0;
        
        Object.entries(this.POLLUTANT_LIMITS).forEach(([key, info]) => {
            const value = iaqi[key]?.v || 0;
            if (value > highestValue) {
                highestValue = value;
                dominantPollutant = info.name;
            }
        });
        
        // Update dominant pollutant
        this.elements.dominantPollutant.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${dominantPollutant}</span>
        `;
        
        // Create pollutant cards
        Object.entries(this.POLLUTANT_LIMITS).forEach(([key, info]) => {
            const value = iaqi[key]?.v || 0;
            const severity = this.getPollutantSeverity(key, value);
            const percentage = Math.min((value / info.safe) * 100, 200);
            
            const card = document.createElement('div');
            card.className = 'pollutant-card fade-in';
            card.innerHTML = `
                <div class="pollutant-header">
                    <div class="pollutant-name">${info.name}</div>
                    <div class="pollutant-icon">${this.getPollutantIcon(key)}</div>
                </div>
                <div class="pollutant-value">
                    ${value.toFixed(1)}<span class="pollutant-unit">${info.unit}</span>
                </div>
                <div class="pollutant-limit">Safe limit: ${info.safe} ${info.unit}</div>
                <div class="severity-indicator severity-${severity.level}">${severity.text}</div>
                <div class="limit-bar">
                    <div class="limit-fill" style="width: ${Math.min(percentage, 100)}%; background-color: ${severity.color};"></div>
                </div>
                <div class="limit-percentage">${percentage.toFixed(0)}% of safe limit</div>
            `;
            
            this.elements.pollutantGrid.appendChild(card);
        });
    }
    
    updateHealthInsights(aqi) {
        const categoryIndex = this.getAQICategoryIndex(aqi);
        const insights = this.HEALTH_INSIGHTS[categoryIndex] || this.HEALTH_INSIGHTS[0];
        
        this.elements.insightsContainer.innerHTML = '';
        
        insights.forEach(insight => {
            const item = document.createElement('div');
            item.className = 'insight-item fade-in';
            item.innerHTML = `
                <div class="insight-icon">
                    <i class="${insight.icon}"></i>
                </div>
                <div class="insight-text">
                    <div class="insight-title">${insight.title}</div>
                    <div class="insight-desc">${insight.desc}</div>
                </div>
            `;
            
            this.elements.insightsContainer.appendChild(item);
        });
    }
    
    updateComparativeAnalysis(data) {
        const aqi = data.aqi || 0;
        
        // Generate comparison data
        const comparisons = [
            {
                type: 'average',
                title: 'City Average Comparison',
                icon: 'fas fa-city',
                comparison: this.getComparisonStatus(aqi, 75),
                description: this.getComparisonDescription(aqi, 75, 'city average')
            },
            {
                type: 'trend',
                title: '24-Hour Trend',
                icon: 'fas fa-chart-line',
                comparison: this.getTrendStatus(),
                description: this.getTrendDescription()
            }
        ];
        
        this.elements.comparisonContainer.innerHTML = '';
        
        comparisons.forEach(comp => {
            const item = document.createElement('div');
            item.className = 'comparison-item fade-in';
            item.innerHTML = `
                <div class="comparison-icon comparison-${comp.comparison.status}">
                    <i class="${comp.icon}"></i>
                </div>
                <div class="comparison-content">
                    <div class="comparison-title">${comp.title}</div>
                    <div class="comparison-desc">${comp.description}</div>
                </div>
            `;
            
            this.elements.comparisonContainer.appendChild(item);
        });
    }
    
    updatePollutionComposition(iaqi) {
        if (!iaqi) return;
        
        // Calculate total pollution "score"
        let totalScore = 0;
        const scores = {};
        
        Object.entries(this.POLLUTANT_LIMITS).forEach(([key, info]) => {
            if (iaqi[key]?.v) {
                const score = iaqi[key].v / info.safe;
                scores[key] = score;
                totalScore += score;
            }
        });
        
        // Calculate percentages
        const percentages = {};
        Object.keys(scores).forEach(key => {
            percentages[key] = totalScore > 0 ? (scores[key] / totalScore) * 100 : 0;
        });
        
        // Find primary driver
        let primaryDriver = null;
        let highestPercentage = 0;
        
        Object.entries(percentages).forEach(([key, percentage]) => {
            if (percentage > highestPercentage) {
                highestPercentage = percentage;
                primaryDriver = this.POLLUTANT_LIMITS[key].name;
            }
        });
        
        // Update composition details
        this.elements.compositionDetails.innerHTML = `
            <div class="composition-driver">
                <div class="driver-title">Primary Pollution Driver</div>
                <div class="driver-desc">${primaryDriver || 'PM2.5'} is the main contributor to current air pollution levels.</div>
                <div class="driver-percentage">${highestPercentage.toFixed(0)}%</div>
            </div>
        `;
        
        // Update pie chart
        this.updateCompositionChart(percentages);
    }
    
    updateHistoricalData() {
        if (!this.currentData) return;
        
        const timestamp = new Date();
        const aqi = this.currentData.aqi || 0;
        
        // Add current reading to historical data
        this.historicalData.push({
            timestamp,
            aqi,
            hour: timestamp.getHours()
        });
        
        // Keep only last 24 hours (simulated)
        if (this.historicalData.length > 24) {
            this.historicalData = this.historicalData.slice(-24);
        }
        
        // Ensure we have at least some data
        if (this.historicalData.length < 6) {
            // Generate some historical data points
            for (let i = 6; i > 0; i--) {
                const pastTime = new Date(timestamp.getTime() - i * 4 * 60 * 60 * 1000);
                this.historicalData.unshift({
                    timestamp: pastTime,
                    aqi: aqi + (Math.random() * 30 - 15),
                    hour: pastTime.getHours()
                });
            }
        }
    }
    
    checkAlerts() {
        if (!this.currentData) return;
        
        const aqi = this.currentData.aqi || 0;
        const iaqi = this.currentData.iaqi || {};
        const alerts = [];
        
        // AQI-based alerts
        if (aqi > 200) {
            alerts.push({
                type: 'danger',
                icon: 'fas fa-exclamation-triangle',
                message: 'HEALTH WARNING: Air quality is very unhealthy. Limit outdoor exposure.'
            });
        } else if (aqi > 150) {
            alerts.push({
                type: 'warning',
                icon: 'fas fa-exclamation-circle',
                message: 'Air quality is unhealthy. Sensitive groups should avoid prolonged outdoor activity.'
            });
        }
        
        // PM2.5 specific alerts
        if (iaqi.pm25?.v > 35) {
            alerts.push({
                type: 'warning',
                icon: 'fas fa-mask',
                message: 'High PM2.5 levels detected. Consider wearing a mask outdoors.'
            });
        }
        
        // Display alerts
        this.displayAlerts(alerts);
    }
    
    displayAlerts(alerts) {
        this.elements.alertsContainer.innerHTML = '';
        
        alerts.forEach(alert => {
            const alertElement = document.createElement('div');
            alertElement.className = `alert alert-${alert.type}`;
            alertElement.innerHTML = `
                <i class="${alert.icon}"></i>
                <span>${alert.message}</span>
            `;
            
            this.elements.alertsContainer.appendChild(alertElement);
        });
    }
    
    initCharts() {
        console.log('Initializing charts...');
        
        // Trend chart (24-hour AQI)
        const trendCtx = document.getElementById('trendChart').getContext('2d');
        this.charts.trend = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'AQI',
                    data: [],
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#2563eb',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: (context) => `AQI: ${context.parsed.y}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(0,0,0,0.05)' },
                        ticks: { color: 'var(--text-secondary)' }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0,0,0,0.05)' },
                        ticks: { color: 'var(--text-secondary)' }
                    }
                }
            }
        });
        
        // Composition chart (pollutant contribution)
        const compositionCtx = document.getElementById('compositionChart').getContext('2d');
        this.charts.composition = new Chart(compositionCtx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#00e400',
                        '#ffff00',
                        '#ff7e00',
                        '#ff0000',
                        '#8f3f97',
                        '#7e0023'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.label}: ${context.parsed.toFixed(1)}%`
                        }
                    }
                },
                cutout: '70%'
            }
        });
        
        console.log('Charts initialized');
    }
    
    updateCharts() {
        console.log('Updating charts...');
        
        // Update trend chart
        if (this.charts.trend && this.historicalData.length > 0) {
            const labels = this.historicalData.map(entry => 
                entry.timestamp.getHours().toString().padStart(2, '0') + ':00'
            );
            const data = this.historicalData.map(entry => entry.aqi);
            
            this.charts.trend.data.labels = labels;
            this.charts.trend.data.datasets[0].data = data;
            this.charts.trend.update();
            
            // Update trend insights
            this.updateTrendInsights();
        }
        
        // Update composition chart
        if (this.charts.composition && this.currentData?.iaqi) {
            const iaqi = this.currentData.iaqi;
            const labels = [];
            const data = [];
            
            Object.entries(this.POLLUTANT_LIMITS).forEach(([key, info]) => {
                if (iaqi[key]?.v) {
                    const value = iaqi[key].v;
                    const score = value / info.safe;
                    labels.push(info.name);
                    data.push(score * 100);
                }
            });
            
            // If no IAQI data, use demo data
            if (data.length === 0) {
                Object.entries(this.POLLUTANT_LIMITS).forEach(([key, info]) => {
                    labels.push(info.name);
                    data.push(Math.random() * 30 + 10);
                });
            }
            
            // Normalize data to sum to 100
            const total = data.reduce((sum, val) => sum + val, 0);
            const normalizedData = data.map(val => (val / total) * 100);
            
            this.charts.composition.data.labels = labels;
            this.charts.composition.data.datasets[0].data = normalizedData;
            this.charts.composition.update();
        }
    }
    
    updateTrendInsights() {
        if (this.historicalData.length === 0) return;
        
        const aqiValues = this.historicalData.map(entry => entry.aqi);
        const maxAqi = Math.max(...aqiValues);
        const minAqi = Math.min(...aqiValues);
        const avgAqi = aqiValues.reduce((sum, val) => sum + val, 0) / aqiValues.length;
        
        // Find peak hour
        const peakEntry = this.historicalData.find(entry => entry.aqi === maxAqi);
        const peakHour = peakEntry ? peakEntry.hour : 12;
        
        this.elements.trendInsights.innerHTML = `
            <div class="trend-stat">
                <h3>Peak Pollution Hour</h3>
                <p>Highest AQI recorded today</p>
                <div class="highlight">${peakHour}:00</div>
                <p>AQI: ${maxAqi.toFixed(0)}</p>
            </div>
            <div class="trend-stat">
                <h3>24-Hour Average</h3>
                <p>Mean air quality today</p>
                <div class="highlight">${avgAqi.toFixed(0)}</div>
                <p>${this.getAQICategory(avgAqi).level}</p>
            </div>
            <div class="trend-stat">
                <h3>Variability</h3>
                <p>AQI range today</p>
                <div class="highlight">${minAqi.toFixed(0)} - ${maxAqi.toFixed(0)}</div>
                <p>${(maxAqi - minAqi).toFixed(0)} point difference</p>
            </div>
        `;
    }
    
    initMap() {
        console.log('Initializing map...');
        
        try {
            // Initialize map with default view
            this.map = L.map('map').setView([40.7128, -74.0060], 10);
            
            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18
            }).addTo(this.map);
            
            // Add scale control
            L.control.scale().addTo(this.map);
            
            console.log('Map initialized successfully');
        } catch (error) {
            console.error('Error initializing map:', error);
            document.getElementById('map').innerHTML = `
                <div class="map-error">
                    <i class="fas fa-map-marked-alt"></i>
                    <p>Map unavailable. Location data is still being displayed.</p>
                </div>
            `;
        }
    }
    
    updateMap(coords, aqi) {
        if (!this.map) return;
        
        let lat, lng;
        
        if (Array.isArray(coords)) {
            [lat, lng] = coords;
        } else {
            lat = this.currentLocation.lat || 40.7128;
            lng = this.currentLocation.lng || -74.0060;
        }
        
        // Clear existing markers
        this.map.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                this.map.removeLayer(layer);
            }
        });
        
        // Set view to current location
        this.map.setView([lat, lng], 12);
        
        // Add marker for current location
        const category = this.getAQICategory(aqi);
        const marker = L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'aqi-marker',
                html: `<div style="background-color: ${category.color};" class="map-marker">${aqi}</div>`,
                iconSize: [40, 40],
                iconAnchor: [20, 40]
            })
        }).addTo(this.map);
        
        // Add popup with info
        marker.bindPopup(`
            <div class="map-popup">
                <strong>${this.currentLocation.name}</strong><br>
                Current AQI: ${aqi}<br>
                ${category.level}<br>
                Last updated: ${this.formatTimestamp(new Date().toISOString())}
            </div>
        `);
    }
    
    // Helper Methods
    getAQICategory(aqi) {
        return this.AQI_CATEGORIES.find(cat => aqi >= cat.min && aqi <= cat.max) || this.AQI_CATEGORIES[0];
    }
    
    getAQICategoryIndex(aqi) {
        return this.AQI_CATEGORIES.findIndex(cat => aqi >= cat.min && aqi <= cat.max);
    }
    
    getPollutantSeverity(key, value) {
        const limit = this.POLLUTANT_LIMITS[key].safe;
        const ratio = value / limit;
        
        if (ratio < 0.5) return { level: 'low', text: 'Low', color: '#10b981' };
        if (ratio < 1) return { level: 'elevated', text: 'Elevated', color: '#f59e0b' };
        if (ratio < 2) return { level: 'high', text: 'High', color: '#ef4444' };
        return { level: 'dangerous', text: 'Dangerous', color: '#7e0023' };
    }
    
    getPollutantIcon(key) {
        const icons = {
            'pm25': 'fas fa-smog',
            'pm10': 'fas fa-wind',
            'no2': 'fas fa-industry',
            'so2': 'fas fa-factory',
            'o3': 'fas fa-sun',
            'co': 'fas fa-car'
        };
        return icons[key] || 'fas fa-question';
    }
    
    getHealthImpactText(aqi) {
        const category = this.getAQICategory(aqi);
        if (aqi <= 50) return 'Minimal Impact';
        if (aqi <= 100) return 'Minor Concern';
        if (aqi <= 150) return 'Moderate Impact';
        if (aqi <= 200) return 'Unhealthy';
        if (aqi <= 300) return 'Very Unhealthy';
        return 'Hazardous';
    }
    
    getComparisonStatus(current, reference) {
        const difference = current - reference;
        const percentDiff = (difference / reference) * 100;
        
        if (Math.abs(percentDiff) < 10) {
            return { status: 'similar', text: 'Similar' };
        } else if (current < reference) {
            return { status: 'better', text: 'Better' };
        } else {
            return { status: 'worse', text: 'Worse' };
        }
    }
    
    getComparisonDescription(current, reference, comparison) {
        const difference = current - reference;
        const percentDiff = Math.abs((difference / reference) * 100).toFixed(0);
        
        if (Math.abs(percentDiff) < 10) {
            return `Similar to ${comparison} (±${percentDiff}%)`;
        } else if (current < reference) {
            return `${percentDiff}% better than ${comparison}`;
        } else {
            return `${percentDiff}% worse than ${comparison}`;
        }
    }
    
    getTrendStatus() {
        if (this.historicalData.length < 2) {
            return { status: 'similar', text: 'Stable' };
        }
        
        const recentChange = this.historicalData[this.historicalData.length - 1].aqi - 
                           this.historicalData[this.historicalData.length - 2].aqi;
        
        if (Math.abs(recentChange) < 5) {
            return { status: 'similar', text: 'Stable' };
        } else if (recentChange > 0) {
            return { status: 'worse', text: 'Worsening' };
        } else {
            return { status: 'better', text: 'Improving' };
        }
    }
    
    getTrendDescription() {
        if (this.historicalData.length < 2) {
            return 'Insufficient data for trend analysis';
        }
        
        const recentChange = this.historicalData[this.historicalData.length - 1].aqi - 
                           this.historicalData[this.historicalData.length - 2].aqi;
        
        if (Math.abs(recentChange) < 5) {
            return 'Air quality has remained stable recently';
        } else if (recentChange > 0) {
            return `Air quality has worsened by ${Math.abs(recentChange).toFixed(0)} points`;
        } else {
            return `Air quality has improved by ${Math.abs(recentChange).toFixed(0)} points`;
        }
    }
    
    getCapitalCoordinates(countryCode) {
        const capitals = {
            'US': { lat: 38.9072, lng: -77.0369 }, // Washington DC
            'GB': { lat: 51.5074, lng: -0.1278 },  // London
            'CN': { lat: 39.9042, lng: 116.4074 }, // Beijing
            'IN': { lat: 28.6139, lng: 77.2090 },  // New Delhi
            'JP': { lat: 35.6762, lng: 139.6503 }, // Tokyo
            'DE': { lat: 52.5200, lng: 13.4050 },  // Berlin
            'FR': { lat: 48.8566, lng: 2.3522 },   // Paris
            'IT': { lat: 41.9028, lng: 12.4964 },  // Rome
            'BR': { lat: -15.8267, lng: -47.9218 }, // Brasília
            'CA': { lat: 45.4215, lng: -75.6972 },  // Ottawa
            'AU': { lat: -35.2809, lng: 149.1300 }, // Canberra
            'RU': { lat: 55.7558, lng: 37.6173 },   // Moscow
            'KR': { lat: 37.5665, lng: 126.9780 },  // Seoul
            'ES': { lat: 40.4168, lng: -3.7038 },   // Madrid
            'MX': { lat: 19.4326, lng: -99.1332 },  // Mexico City
            'ID': { lat: -6.2088, lng: 106.8456 },  // Jakarta
            'TR': { lat: 39.9334, lng: 32.8597 },   // Ankara
            'SA': { lat: 24.7136, lng: 46.6753 },   // Riyadh
            'ZA': { lat: -25.7461, lng: 28.1881 },  // Pretoria
            'EG': { lat: 30.0444, lng: 31.2357 }    // Cairo
        };
        
        return capitals[countryCode] || { lat: 0, lng: 0 };
    }
    
    formatTimestamp(isoString) {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    animateValue(element, start, end, duration) {
        const startTime = performance.now();
        const updateValue = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(start + (end - start) * easeOutQuart);
            
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(updateValue);
            }
        };
        
        requestAnimationFrame(updateValue);
    }
    
    showError(message) {
        const errorAlert = document.createElement('div');
        errorAlert.className = 'alert alert-warning';
        errorAlert.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        `;
        
        this.elements.alertsContainer.appendChild(errorAlert);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (errorAlert.parentNode) {
                errorAlert.parentNode.removeChild(errorAlert);
            }
        }, 5000);
    }
    
    updatePermissionStatus(type, message) {
        this.elements.permissionStatus.textContent = message;
        this.elements.permissionStatus.className = `permission-status active ${type}`;
        
        setTimeout(() => {
            this.elements.permissionStatus.classList.remove('active');
        }, 5000);
    }
    
    getCachedData() {
        const cache = localStorage.getItem(this.CACHE_KEY);
        if (!cache) return null;
        
        const { timestamp, data } = JSON.parse(cache);
        const age = Date.now() - timestamp;
        
        return age < this.CACHE_DURATION ? data : null;
    }
    
    setCachedData(data) {
        const cache = {
            timestamp: Date.now(),
            data: data
        };
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
    }
    
    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
    }
    
    updateThemeIcon(theme) {
        const icon = this.elements.themeToggle.querySelector('i');
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
    
    updateCompositionChart(percentages) {
        // This method updates the composition chart
        if (this.charts.composition) {
            const labels = [];
            const data = [];
            
            Object.entries(this.POLLUTANT_LIMITS).forEach(([key, info]) => {
                if (percentages[key]) {
                    labels.push(info.name);
                    data.push(percentages[key]);
                }
            });
            
            this.charts.composition.data.labels = labels;
            this.charts.composition.data.datasets[0].data = data;
            this.charts.composition.update();
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    window.airQualityApp = new AirQualityPlatform();
});

// Add custom CSS for map markers and error states
const style = document.createElement('style');
style.textContent = `
    .aqi-marker .map-marker {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #2563eb;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        cursor: pointer;
    }
    
    .map-popup {
        font-family: 'Inter', sans-serif;
        padding: 12px;
        font-size: 14px;
        line-height: 1.5;
    }
    
    .map-popup strong {
        color: #2563eb;
        font-size: 16px;
    }
    
    .map-error {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: var(--bg-secondary);
        color: var(--text-muted);
        text-align: center;
        padding: 40px;
    }
    
    .map-error i {
        font-size: 48px;
        margin-bottom: 16px;
        color: var(--primary-color);
        opacity: 0.7;
    }
    
    .map-error p {
        font-size: 14px;
        max-width: 300px;
    }
    
    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: var(--bg-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        transition: opacity 0.5s ease;
    }
    
    .loading-overlay.hidden {
        opacity: 0;
        pointer-events: none;
    }
    
    .loading-content {
        text-align: center;
        max-width: 400px;
        padding: 40px;
    }
    
    .loading-spinner {
        width: 60px;
        height: 60px;
        border: 4px solid var(--border-color);
        border-top-color: var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
    }
    
    .loading-content p {
        font-size: 16px;
        color: var(--text-secondary);
        margin-top: 16px;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .fade-in {
        animation: fadeIn 0.5s ease forwards;
    }
`;
document.head.appendChild(style);
