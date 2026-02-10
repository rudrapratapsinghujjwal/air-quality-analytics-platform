// Air Quality Monitoring Platform - Core Application
class AirQualityPlatform {
    constructor() {
        // API Configuration
        this.API_TOKEN = '154370b561ded59c1c8fdcde292c5dcee9759d0f';
        this.API_BASE = 'https://api.waqi.info/feed/here/';
        this.CACHE_KEY = 'airQualityCache';
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
        
        // AQI Categories and Colors
        this.AQI_CATEGORIES = [
            { min: 0, max: 50, level: 'Good', color: '#00e400', health: 'Air quality is satisfactory' },
            { min: 51, max: 100, level: 'Moderate', color: '#ffff00', health: 'Acceptable air quality' },
            { min: 101, max: 150, level: 'Unhealthy for Sensitive Groups', color: '#ff7e00', health: 'Members of sensitive groups may experience effects' },
            { min: 151, max: 200, level: 'Unhealthy', color: '#ff0000', health: 'Everyone may begin to experience effects' },
            { min: 201, max: 300, level: 'Very Unhealthy', color: '#8f3f97', health: 'Health alert: serious risk' },
            { min: 301, max: 500, level: 'Hazardous', color: '#7e0023', health: 'Health warning of emergency conditions' }
        ];
        
        // Health insights based on AQI
        this.HEALTH_INSIGHTS = {
            0: [
                { icon: 'fas fa-running', title: 'Outdoor Activities', desc: 'Perfect for outdoor exercise and activities' },
                { icon: 'fas fa-lungs', title: 'Breathing Comfort', desc: 'Air quality is excellent for everyone' },
                { icon: 'fas fa-child', title: 'Children & Elderly', desc: 'Safe for all age groups to be outdoors' }
            ],
            1: [
                { icon: 'fas fa-walking', title: 'Moderate Activity', desc: 'Generally acceptable for outdoor activities' },
                { icon: 'fas fa-lungs', title: 'Minor Concern', desc: 'Unusually sensitive people should consider limiting activity' },
                { icon: 'fas fa-tree', title: 'Indoor Air', desc: 'Consider opening windows for ventilation' }
            ],
            2: [
                { icon: 'fas fa-mask', title: 'Sensitive Groups', desc: 'Children, elderly, and those with respiratory issues should limit outdoor exposure' },
                { icon: 'fas fa-heart', title: 'Heart & Lung', desc: 'People with heart or lung disease should avoid prolonged exertion' },
                { icon: 'fas fa-home', title: 'Indoor Precautions', desc: 'Use air purifiers and keep windows closed during high pollution hours' }
            ],
            3: [
                { icon: 'fas fa-exclamation-triangle', title: 'Health Alert', desc: 'Everyone may experience health effects' },
                { icon: 'fas fa-procedures', title: 'Medical Attention', desc: 'Seek medical help if experiencing breathing difficulties' },
                { icon: 'fas fa-house-user', title: 'Stay Indoors', desc: 'Limit outdoor activities, use air purifiers indoors' }
            ],
            4: [
                { icon: 'fas fa-skull-crossbones', title: 'Health Warning', desc: 'Serious health effects on everyone' },
                { icon: 'fas fa-ban', title: 'Avoid Outdoors', desc: 'Remain indoors and keep activity levels low' },
                { icon: 'fas fa-hospital', title: 'Emergency', desc: 'Contact healthcare provider if symptoms worsen' }
            ],
            5: [
                { icon: 'fas fa-radiation-alt', title: 'Emergency Conditions', desc: 'Health warning of emergency conditions' },
                { icon: 'fas fa-house-damage', title: 'Shelter in Place', desc: 'Stay indoors with windows and doors closed' },
                { icon: 'fas fa-ambulance', title: 'Medical Emergency', desc: 'Seek immediate medical attention for breathing issues' }
            ]
        };
        
        // Initialize state
        this.currentData = null;
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
            aqiCard: document.getElementById('aqiCard')
        };
        
        // Initialize the application
        this.init();
    }
    
    async init() {
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize theme
        this.initTheme();
        
        // Load cached data if available
        const cachedData = this.getCachedData();
        if (cachedData) {
            this.updateUI(cachedData);
            this.elements.cacheStatus.textContent = 'Using cached data (updating...)';
            this.elements.cacheStatus.classList.add('pulse');
        }
        
        // Fetch fresh data
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
        
        // Auto-refresh every 5 minutes
        setInterval(() => this.fetchData(), 5 * 60 * 1000);
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
    
    async fetchData() {
        try {
            const url = `${this.API_BASE}?token=${this.API_TOKEN}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.status !== 'ok') {
                throw new Error(`API returned error: ${result.data}`);
            }
            
            this.currentData = result.data;
            
            // Cache the data
            this.setCachedData(this.currentData);
            
            // Update UI
            this.updateUI(this.currentData);
            
            // Update historical data for trends
            this.updateHistoricalData();
            
            // Check for alerts
            this.checkAlerts();
            
            // Update cache status
            this.elements.cacheStatus.textContent = 'Live data loaded';
            this.elements.cacheStatus.classList.remove('pulse');
            
            console.log('Data fetched successfully:', this.currentData);
            
        } catch (error) {
            console.error('Error fetching data:', error);
            this.showError('Unable to fetch live data. Using cached data if available.');
            
            // Try to use cached data
            const cachedData = this.getCachedData();
            if (cachedData) {
                this.updateUI(cachedData);
            }
        }
    }
    
    updateUI(data) {
        // Update location
        this.elements.locationName.textContent = data.city?.name || 'Unknown Location';
        
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
        
        // Update map if available
        if (this.map && data.city?.geo) {
            this.updateMap(data.city.geo, aqi);
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
        
        // Highlight current AQI on scale
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
        if (!iaqi) return;
        
        this.elements.pollutantGrid.innerHTML = '';
        
        // Determine dominant pollutant
        let dominantPollutant = null;
        let highestValue = 0;
        
        Object.entries(this.POLLUTANT_LIMITS).forEach(([key, info]) => {
            if (iaqi[key]?.v) {
                const value = iaqi[key].v;
                if (value > highestValue) {
                    highestValue = value;
                    dominantPollutant = info.name;
                }
            }
        });
        
        // Update dominant pollutant display
        if (dominantPollutant) {
            this.elements.dominantPollutant.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <span>${dominantPollutant}</span>
            `;
        }
        
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
        // In a real application, this would compare with historical averages
        // and nearby stations. For now, we'll simulate this data.
        
        const aqi = data.aqi || 0;
        const category = this.getAQICategory(aqi);
        
        // Simulate comparison data
        const comparisons = [
            {
                type: 'average',
                title: 'City Average Comparison',
                icon: 'fas fa-city',
                comparison: this.getComparisonStatus(aqi, 75), // Simulated city average
                description: this.getComparisonDescription(aqi, 75, 'city average')
            },
            {
                type: 'nearby',
                title: 'Nearest Station',
                icon: 'fas fa-map-marker-alt',
                comparison: this.getComparisonStatus(aqi, aqi + Math.random() * 30 - 15),
                description: this.getComparisonDescription(aqi, aqi + Math.random() * 30 - 15, 'nearest station')
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
                <div class="driver-desc">${primaryDriver} is the main contributor to current air pollution levels.</div>
                <div class="driver-percentage">${highestPercentage.toFixed(0)}%</div>
            </div>
        `;
        
        // Update pie chart
        this.updateCompositionChart(percentages);
    }
    
    updateHistoricalData() {
        if (!this.currentData) return;
        
        const timestamp = new Date(this.currentData.time?.iso || Date.now());
        const aqi = this.currentData.aqi || 0;
        
        // Add current reading to historical data
        this.historicalData.push({
            timestamp,
            aqi,
            hour: timestamp.getHours()
        });
        
        // Keep only last 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        this.historicalData = this.historicalData.filter(
            entry => entry.timestamp > twentyFourHoursAgo
        );
        
        // Limit to max 24 entries
        if (this.historicalData.length > 24) {
            this.historicalData = this.historicalData.slice(-24);
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
        
        // Rapid AQI increase detection
        if (this.historicalData.length >= 2) {
            const recentChange = this.historicalData[this.historicalData.length - 1].aqi - 
                               this.historicalData[this.historicalData.length - 2].aqi;
            if (recentChange > 20) {
                alerts.push({
                    type: 'info',
                    icon: 'fas fa-arrow-up',
                    message: 'Air quality is deteriorating rapidly. Monitor conditions closely.'
                });
            }
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
    }
    
    updateCharts() {
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
        // Initialize map with default view
        this.map = L.map('map').setView([0, 0], 2);
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(this.map);
        
        // Add scale control
        L.control.scale().addTo(this.map);
    }
    
    updateMap(geo, aqi) {
        if (!this.map || !geo) return;
        
        const [lat, lng] = geo;
        
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
                <strong>Current AQI: ${aqi}</strong><br>
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
        errorAlert.className = 'alert alert-danger';
        errorAlert.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
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
    
    updateCompositionChart(percentages) {
        // This method is already implemented in updateCharts()
        // Keeping it here for completeness
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.airQualityApp = new AirQualityPlatform();
});

// Add custom CSS for map markers
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
    }
    
    .map-popup strong {
        color: #2563eb;
    }
    
    .leaflet-popup-content {
        margin: 12px 16px;
    }
    
    .leaflet-popup-content-wrapper {
        border-radius: 8px;
    }
`;
document.head.appendChild(style);
