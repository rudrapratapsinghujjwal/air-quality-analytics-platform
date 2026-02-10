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
        
        // US States for demo
        this.US_STATES = [
            { code: 'CA', name: 'California' },
            { code: 'TX', name: 'Texas' },
            { code: 'NY', name: 'New York' },
            { code: 'FL', name: 'Florida' },
            { code: 'IL', name: 'Illinois' },
            { code: 'PA', name: 'Pennsylvania' },
            { code: 'OH', name: 'Ohio' },
            { code: 'GA', name: 'Georgia' },
            { code: 'NC', name: 'North Carolina' },
            { code: 'MI', name: 'Michigan' }
        ];
        
        // Initialize state
        this.currentData = null;
        this.currentLocation = this.getSavedLocation() || { type: 'current', name: 'Your Location' };
        this.historicalData = [];
        this.map = null;
        this.charts = {};
        this.searchTimeout = null;
        
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
            map: document.getElementById('map'),
            
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
            
            // State Tab
            countrySelect: document.getElementById('countrySelect'),
            stateSelect: document.getElementById('stateSelect'),
            stateStations: document.getElementById('stateStations'),
            
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
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize theme
        this.initTheme();
        
        // Initialize location selector
        this.initLocationSelector();
        
        // Load cached data if available
        const cachedData = this.getCachedData();
        if (cachedData) {
            this.updateUI(cachedData);
            this.elements.cacheStatus.textContent = 'Using cached data (updating...)';
            this.elements.cacheStatus.classList.add('pulse');
        }
        
        // Fetch initial data based on saved location
        await this.fetchData();
        
        // Initialize charts
        this.initCharts();
        
        // Initialize map
        this.initMap();
        
        // Hide loading overlay
        setTimeout(() => {
            this.elements.loadingOverlay.classList.add('hidden');
        }, 500);
    }
    
    setupEventListeners() {
        // Theme toggle
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Refresh data
        this.elements.refreshData.addEventListener('click', () => this.fetchData());
        
        // Clear location
        this.elements.clearLocation.addEventListener('click', () => this.clearSelectedLocation());
        
        // Auto-refresh every 5 minutes
        setInterval(() => this.fetchData(), 5 * 60 * 1000);
    }
    
    initLocationSelector() {
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
        
        // Initialize state/country selectors
        this.initStateSelectors();
        
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
        // Update tab buttons
        this.elements.tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabName);
        });
        
        // Update tab contents
        this.elements.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}Tab`);
        });
        
        // Special handling for each tab
        if (tabName === 'city') {
            this.elements.citySearch.focus();
        } else if (tabName === 'country') {
            this.elements.countrySearch.focus();
        }
    }
    
    initCityPresets() {
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
                
                this.selectLocation({
                    type: 'coordinates',
                    lat,
                    lng,
                    name,
                    details: `Major city in ${name.split(', ')[1]}`
                });
                
                // Switch to selected location display
                this.switchTab('current');
            });
        });
    }
    
    initCountryGrid() {
        this.elements.countryGrid.innerHTML = this.COUNTRIES.map(country => `
            <button class="country-btn" data-code="${country.code}" data-name="${country.name}">
                <span class="country-flag">${country.flag}</span>
                <span class="country-name">${country.name}</span>
            </button>
        `).join('');
        
        // Add event listeners to country buttons
        this.elements.countryGrid.querySelectorAll('.country-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const code = e.currentTarget.dataset.code;
                const name = e.currentTarget.dataset.name;
                
                // Show loading
                e.currentTarget.innerHTML = '<div class="spinner"></div>';
                
                try {
                    // Fetch stations for this country
                    const stations = await this.searchStations(`@country=${code}`);
                    
                    if (stations.length > 0) {
                        // Use the first station as representative
                        const station = stations[0];
                        this.selectLocation({
                            type: 'station',
                            stationId: station.uid,
                            name: `${station.station.name}, ${name}`,
                            details: `Monitoring station in ${name}`,
                            lat: station.lat,
                            lng: station.lon
                        });
                    } else {
                        // Fallback to capital city coordinates
                        const capitalCoords = this.getCapitalCoordinates(code);
                        if (capitalCoords) {
                            this.selectLocation({
                                type: 'coordinates',
                                lat: capitalCoords.lat,
                                lng: capitalCoords.lng,
                                name: `Capital of ${name}`,
                                details: `Capital city air quality`
                            });
                        }
                    }
                } catch (error) {
                    console.error('Error selecting country:', error);
                    this.showError(`Could not load data for ${name}`);
                }
                
                // Switch to selected location display
                this.switchTab('current');
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
    
    initStateSelectors() {
        // For demo, we'll use US states
        this.elements.countrySelect.innerHTML = `
            <option value="">-- Select a country --</option>
            <option value="US">United States</option>
            <option value="demo">Other Countries (Demo)</option>
        `;
        
        // Populate state select when country is selected
        this.elements.countrySelect.addEventListener('change', (e) => {
            const countryCode = e.target.value;
            
            if (countryCode === 'US') {
                this.elements.stateSelect.innerHTML = `
                    <option value="">-- Select a state --</option>
                    ${this.US_STATES.map(state => 
                        `<option value="${state.code}">${state.name}</option>`
                    ).join('')}
                `;
                this.elements.stateSelect.disabled = false;
            } else if (countryCode === 'demo') {
                this.elements.stateSelect.innerHTML = `
                    <option value="">-- Demo mode --</option>
                    <option value="demo1">Demo Region 1</option>
                    <option value="demo2">Demo Region 2</option>
                `;
                this.elements.stateSelect.disabled = false;
            } else {
                this.elements.stateSelect.innerHTML = '<option value="">-- First select a country --</option>';
                this.elements.stateSelect.disabled = true;
                this.elements.stateStations.classList.remove('active');
            }
        });
        
        // Load stations when state is selected
        this.elements.stateSelect.addEventListener('change', async (e) => {
            const stateCode = e.target.value;
            const countryCode = this.elements.countrySelect.value;
            
            if (!stateCode) {
                this.elements.stateStations.classList.remove('active');
                return;
            }
            
            // Show loading
            this.elements.stateStations.innerHTML = '<div class="loading-stations">Loading stations...</div>';
            this.elements.stateStations.classList.add('active');
            
            try {
                let stations = [];
                
                if (countryCode === 'US') {
                    // For US states, search by state code
                    stations = await this.searchStations(`@state=${stateCode}`);
                } else {
                    // Demo mode - generate fake stations
                    stations = this.generateDemoStations();
                }
                
                // Display stations
                if (stations.length > 0) {
                    this.elements.stateStations.innerHTML = `
                        <div class="station-list">
                            ${stations.map(station => `
                                <div class="station-item" data-uid="${station.uid}" 
                                     data-lat="${station.lat}" data-lng="${station.lon}"
                                     data-name="${station.station.name}">
                                    <div class="station-icon">
                                        <i class="fas fa-industry"></i>
                                    </div>
                                    <div class="station-info">
                                        <div class="station-name">${station.station.name}</div>
                                        <div class="station-location">
                                            ${station.station.city || ''} 
                                            ${station.station.country || ''}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                    
                    // Add click listeners to station items
                    this.elements.stateStations.querySelectorAll('.station-item').forEach(item => {
                        item.addEventListener('click', (e) => {
                            const uid = e.currentTarget.dataset.uid;
                            const lat = parseFloat(e.currentTarget.dataset.lat);
                            const lng = parseFloat(e.currentTarget.dataset.lng);
                            const name = e.currentTarget.dataset.name;
                            
                            this.selectLocation({
                                type: 'station',
                                stationId: uid,
                                name: name,
                                details: 'Monitoring station',
                                lat: lat,
                                lng: lng
                            });
                            
                            this.switchTab('current');
                        });
                    });
                } else {
                    this.elements.stateStations.innerHTML = '<div class="no-stations">No stations found for this region.</div>';
                }
            } catch (error) {
                console.error('Error loading stations:', error);
                this.elements.stateStations.innerHTML = '<div class="error-loading">Error loading stations. Please try again.</div>';
            }
        });
    }
    
    setupSearch() {
        let searchTimeout;
        
        this.elements.citySearch.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                this.elements.cityResults.classList.remove('active');
                return;
            }
            
            // Show loading
            this.elements.cityLoading.classList.add('active');
            
            searchTimeout = setTimeout(async () => {
                try {
                    const results = await this.searchStations(query);
                    this.displaySearchResults(results);
                } catch (error) {
                    console.error('Search error:', error);
                    this.elements.cityResults.innerHTML = '<div class="search-error">Search failed. Please try again.</div>';
                } finally {
                    this.elements.cityLoading.classList.remove('active');
                }
            }, 500);
        });
        
        // Close results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.location-search')) {
                this.elements.cityResults.classList.remove('active');
            }
        });
    }
    
    setupCoordinateInput() {
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
            
            this.switchTab('current');
        });
        
        // Auto-fill current location coordinates
        this.elements.detectLocation.addEventListener('click', () => {
            this.getCurrentPosition()
                .then(pos => {
                    this.elements.latitudeInput.value = pos.coords.latitude.toFixed(6);
                    this.elements.longitudeInput.value = pos.coords.longitude.toFixed(6);
                })
                .catch(() => {
                    // Use New York as fallback
                    this.elements.latitudeInput.value = '40.7128';
                    this.elements.longitudeInput.value = '-74.0060';
                });
        });
    }
    
    setupCurrentLocation() {
        this.elements.detectLocation.addEventListener('click', async () => {
            try {
                const position = await this.getCurrentPosition();
                
                this.selectLocation({
                    type: 'coordinates',
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    name: 'Your Current Location',
                    details: 'Detected via GPS'
                });
                
                this.updatePermissionStatus('granted', 'Location access granted');
            } catch (error) {
                console.error('Location error:', error);
                
                if (error.code === 1) {
                    this.updatePermissionStatus('denied', 'Location access denied. Please enable location services.');
                } else {
                    this.updatePermissionStatus('denied', 'Unable to detect location. Please try again or use manual selection.');
                }
            }
        });
    }
    
    async searchStations(query) {
        try {
            const response = await fetch(
                `${this.API_BASE}/search/?token=${this.API_TOKEN}&keyword=${encodeURIComponent(query)}`
            );
            
            if (!response.ok) {
                throw new Error(`Search failed: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status !== 'ok') {
                throw new Error(data.data || 'Search failed');
            }
            
            return data.data || [];
        } catch (error) {
            console.error('Search stations error:', error);
            
            // Fallback: return demo data for testing
            return this.generateDemoSearchResults(query);
        }
    }
    
    displaySearchResults(results) {
        if (results.length === 0) {
            this.elements.cityResults.innerHTML = '<div class="no-results">No locations found. Try a different search.</div>';
            this.elements.cityResults.classList.add('active');
            return;
        }
        
        this.elements.cityResults.innerHTML = results.map(result => `
            <div class="search-result" data-uid="${result.uid}" 
                 data-lat="${result.lat}" data-lng="${result.lon}"
                 data-name="${result.station.name}">
                <div class="result-icon">
                    <i class="fas fa-map-marker-alt"></i>
                </div>
                <div class="result-content">
                    <div class="result-name">${result.station.name}</div>
                    <div class="result-details">
                        <span><i class="fas fa-city"></i> ${result.station.city || 'Unknown city'}</span>
                        <span><i class="fas fa-flag"></i> ${result.station.country || 'Unknown country'}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add click listeners
        this.elements.cityResults.querySelectorAll('.search-result').forEach(result => {
            result.addEventListener('click', (e) => {
                const uid = e.currentTarget.dataset.uid;
                const lat = parseFloat(e.currentTarget.dataset.lat);
                const lng = parseFloat(e.currentTarget.dataset.lon);
                const name = e.currentTarget.dataset.name;
                
                this.selectLocation({
                    type: 'station',
                    stationId: uid,
                    name: name,
                    details: 'Monitoring station',
                    lat: lat,
                    lng: lng
                });
                
                this.elements.cityResults.classList.remove('active');
                this.elements.citySearch.value = '';
                this.switchTab('current');
            });
        });
        
        this.elements.cityResults.classList.add('active');
    }
    
    selectLocation(location) {
        this.currentLocation = location;
        this.saveLocation(location);
        this.updateSelectedLocationDisplay();
        
        // Clear existing data
        this.currentData = null;
        this.historicalData = [];
        
        // Show loading
        this.elements.loadingOverlay.classList.remove('hidden');
        
        // Fetch new data
        this.fetchData();
    }
    
    clearSelectedLocation() {
        this.currentLocation = { type: 'current', name: 'Your Location' };
        localStorage.removeItem(this.LOCATION_CACHE_KEY);
        this.updateSelectedLocationDisplay();
        this.fetchData();
    }
    
    updateSelectedLocationDisplay() {
        this.elements.currentLocationName.textContent = this.currentLocation.name;
        
        let details = '';
        switch (this.currentLocation.type) {
            case 'current':
                details = 'Using your current location';
                break;
            case 'station':
                details = 'Monitoring station data';
                break;
            case 'coordinates':
                details = `Coordinates: ${this.currentLocation.lat?.toFixed(4)}, ${this.currentLocation.lng?.toFixed(4)}`;
                break;
            default:
                details = 'Air quality monitoring';
        }
        
        this.elements.locationDetails.textContent = details;
        
        // Update main header location
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
        try {
            let apiUrl;
            
            // Construct API URL based on location type
            switch (this.currentLocation.type) {
                case 'current':
                    apiUrl = `${this.API_BASE}/feed/here/?token=${this.API_TOKEN}`;
                    break;
                case 'station':
                    apiUrl = `${this.API_BASE}/feed/@${this.currentLocation.stationId}/?token=${this.API_TOKEN}`;
                    break;
                case 'coordinates':
                    apiUrl = `${this.API_BASE}/feed/geo:${this.currentLocation.lat};${this.currentLocation.lng}/?token=${this.API_TOKEN}`;
                    break;
                default:
                    apiUrl = `${this.API_BASE}/feed/here/?token=${this.API_TOKEN}`;
            }
            
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.status !== 'ok') {
                throw new Error(`API error: ${result.data}`);
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
            this.elements.cacheStatus.classList.remove('pulse');
            
            // Hide loading
            this.elements.loadingOverlay.classList.add('hidden');
            
        } catch (error) {
            console.error('Error fetching data:', error);
            this.showError('Unable to fetch data. Using cached data if available.');
            
            // Try cached data
            const cachedData = this.getCachedData();
            if (cachedData) {
                this.updateUI(cachedData);
            }
            
            this.elements.loadingOverlay.classList.add('hidden');
        }
    }
    
    // Rest of the existing methods remain the same (getCurrentPosition, updateUI, etc.)
    // ... [All the existing UI update methods remain unchanged] ...
    
    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }
            
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });
        });
    }
    
    updatePermissionStatus(type, message) {
        this.elements.permissionStatus.textContent = message;
        this.elements.permissionStatus.className = `permission-status active ${type}`;
        
        setTimeout(() => {
            this.elements.permissionStatus.classList.remove('active');
        }, 5000);
    }
    
    generateDemoSearchResults(query) {
        // Generate demo results for testing
        return [
            {
                uid: 1234,
                lat: 40.7128,
                lon: -74.0060,
                station: {
                    name: `Demo Station for ${query}`,
                    city: 'Demo City',
                    country: 'Demo Country'
                }
            },
            {
                uid: 1235,
                lat: 34.0522,
                lon: -118.2437,
                station: {
                    name: `Another Station for ${query}`,
                    city: 'Los Angeles',
                    country: 'USA'
                }
            }
        ];
    }
    
    generateDemoStations() {
        return [
            {
                uid: 1001,
                lat: 40.7128,
                lon: -74.0060,
                station: {
                    name: 'Central Monitoring Station',
                    city: 'New York',
                    country: 'USA'
                }
            },
            {
                uid: 1002,
                lat: 40.7589,
                lon: -73.9851,
                station: {
                    name: 'Times Square Station',
                    city: 'New York',
                    country: 'USA'
                }
            }
        ];
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
            'CA': { lat: 45.4215, lng: -75.6972 }  // Ottawa
        };
        
        return capitals[countryCode] || null;
    }
    
    // ... [All other existing methods remain unchanged] ...
    // Update UI, charts, map, etc. methods from the previous implementation
    // I'll include the key methods but shortened for brevity
    
    updateUI(data) {
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
            const coords = data.city?.geo || [data.lat || 0, data.lng || 0];
            this.updateMap(coords, aqi);
        }
        
        // Update charts
        this.updateCharts();
    }
    
    updateAQIDisplay(aqi) {
        // Animate AQI value
        const targetValue = aqi;
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
        
        // Update card background animation
        this.elements.aqiCard.style.setProperty('--aqi-color', category.color);
    }
    
    updatePollutantBreakdown(iaqi) {
        if (!iaqi) return;
        
        this.elements.pollutantGrid.innerHTML = '';
        
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
    
    // ... [All other UI update methods from the previous implementation] ...
    
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
    
    initCharts() {
        // Initialize Chart.js charts (same as before)
        const trendCtx = document.getElementById('trendChart').getContext('2d');
        this.charts.trend = new Chart(trendCtx, {
            type: 'line',
            data: { labels: [], datasets: [{
                label: 'AQI', data: [], borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)', borderWidth: 3,
                fill: true, tension: 0.4
            }]},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
        
        const compositionCtx = document.getElementById('compositionChart').getContext('2d');
        this.charts.composition = new Chart(compositionCtx, {
            type: 'doughnut',
            data: { labels: [], datasets: [{
                data: [], backgroundColor: [
                    '#00e400', '#ffff00', '#ff7e00',
                    '#ff0000', '#8f3f97', '#7e0023'
                ]
            }]},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                cutout: '70%'
            }
        });
    }
    
    initMap() {
        this.map = L.map('map').setView([0, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(this.map);
        L.control.scale().addTo(this.map);
    }
    
    updateMap(coords, aqi) {
        if (!this.map || !coords) return;
        
        const [lat, lng] = Array.isArray(coords) ? coords : [coords.lat || 0, coords.lng || 0];
        
        // Clear existing markers
        this.map.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                this.map.removeLayer(layer);
            }
        });
        
        // Set view
        this.map.setView([lat, lng], 12);
        
        // Add marker
        const category = this.getAQICategory(aqi);
        const marker = L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'aqi-marker',
                html: `<div style="background-color: ${category.color};" class="map-marker">${aqi}</div>`,
                iconSize: [40, 40],
                iconAnchor: [20, 40]
            })
        }).addTo(this.map);
        
        marker.bindPopup(`
            <div class="map-popup">
                <strong>${this.currentLocation.name}</strong><br>
                AQI: ${aqi} (${category.level})<br>
                Last updated: ${this.formatTimestamp(new Date().toISOString())}
            </div>
        `);
    }
    
    // Helper methods (same as before)
    getAQICategory(aqi) {
        return this.AQI_CATEGORIES.find(cat => aqi >= cat.min && aqi <= cat.max) || this.AQI_CATEGORIES[0];
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
            'pm25': 'fas fa-smog', 'pm10': 'fas fa-wind',
            'no2': 'fas fa-industry', 'so2': 'fas fa-factory',
            'o3': 'fas fa-sun', 'co': 'fas fa-car'
        };
        return icons[key] || 'fas fa-question';
    }
    
    showError(message) {
        const errorAlert = document.createElement('div');
        errorAlert.className = 'alert alert-danger';
        errorAlert.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        
        this.elements.alertsContainer.appendChild(errorAlert);
        
        setTimeout(() => {
            if (errorAlert.parentNode) {
                errorAlert.parentNode.removeChild(errorAlert);
            }
        }, 5000);
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
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(start + (end - start) * easeOutQuart);
            
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(updateValue);
            }
        };
        
        requestAnimationFrame(updateValue);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.airQualityApp = new AirQualityPlatform();
});

// Add map marker styles
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
        padding: 8px;
        font-size: 14px;
    }
    
    .loading-stations, .no-stations, .error-loading, .no-results, .search-error {
        padding: 40px;
        text-align: center;
        color: var(--text-muted);
        font-size: 16px;
    }
    
    .spinner {
        width: 24px;
        height: 24px;
        border: 3px solid var(--border-color);
        border-top-color: var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto;
    }
`;
document.head.appendChild(style);
