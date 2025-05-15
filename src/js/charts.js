/**
 * ChartRenderer Class - Renders charts for LINE chat analysis
 * Creates various visualizations for chat statistics
 */
class ChartRenderer {
    /**
     * Constructor for ChartRenderer
     * @param {Object} analysisResults - The results from ChatAnalyzer
     */
    constructor(analysisResults) {
        // Store analysis results
        this.results = analysisResults;
        
        // Chart color palette
        this.colors = {
            primary: '#ff6b6b',
            secondary: '#feca57',
            accent: '#48dbfb',
            neutral: '#54a0ff',
            highlight: '#ff9ff3',
            dark: '#2d3436',
            // Gradient for charts
            gradient: {
                primary: {
                    start: 'rgba(255,107,107,0.8)',
                    end: 'rgba(255,107,107,0.2)'
                },
                secondary: {
                    start: 'rgba(254,202,87,0.8)',
                    end: 'rgba(254,202,87,0.2)'
                }
            }
        };
        
        // Chart.js global configuration
        Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
        Chart.defaults.color = this.colors.dark;
        Chart.defaults.responsive = true;
        Chart.defaults.maintainAspectRatio = false;
    }
    
    /**
     * Create the daily messages line chart
     * @return {Chart} The Chart.js chart object
     */
    createDailyMessagesChart() {
        const ctx = document.getElementById('daily-messages-chart').getContext('2d');
        
        const dates = Object.keys(this.results.messagesByDate);
        const messageCounts = Object.values(this.results.messagesByDate);
        
        // Format dates for display (MM/DD or YYYY/MM/DD)
        const formattedDates = dates.map(date => {
            // Check if date is in MM/DD/YYYY or YYYY/MM/DD format
            const parts = date.split('/');
            if (parts.length === 3) {
                if (parts[0].length === 4) { // YYYY/MM/DD
                    return `${parts[1]}/${parts[2]}`;
                } else { // MM/DD/YYYY
                    return `${parts[0]}/${parts[1]}`;
                }
            }
            return date;
        });
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, this.colors.gradient.primary.start);
        gradient.addColorStop(1, this.colors.gradient.primary.end);
        
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: formattedDates,
                datasets: [{
                    label: '訊息數量',
                    data: messageCounts,
                    backgroundColor: gradient,
                    borderColor: this.colors.primary,
                    borderWidth: 2,
                    pointBackgroundColor: this.colors.primary,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(45, 52, 54, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 13
                        },
                        padding: 12,
                        displayColors: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
        
        return chart;
    }
    
    /**
     * Create the pie chart showing user message distribution
     * @return {Chart} The Chart.js chart object
     */
    createUserMessagesChart() {
        const ctx = document.getElementById('user-messages-chart').getContext('2d');
        
        // Extract user data
        const users = Object.keys(this.results.users);
        const messageCounts = users.map(user => this.results.users[user].totalMessages);
        
        // Generate colors for users
        const userColors = this.generateColorPalette(users.length);
        
        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: users,
                datasets: [{
                    data: messageCounts,
                    backgroundColor: userColors,
                    borderColor: '#ffffff',
                    borderWidth: 2,
                    hoverOffset: 10
                }]
            },
            options: {
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 15,
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(45, 52, 54, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const value = context.raw;
                                const percentage = Math.round((value / total) * 100);
                                return `${context.label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        return chart;
    }
    
    /**
     * Create the daily call duration line chart
     * @return {Chart} The Chart.js chart object
     */
    createDailyCallChart() {
        const ctx = document.getElementById('daily-call-chart').getContext('2d');
        
        const dates = Object.keys(this.results.callDurationByDate);
        // Convert seconds to minutes for better display
        const callDuration = Object.values(this.results.callDurationByDate).map(seconds => Math.round(seconds / 60));
        
        // Format dates for display (MM/DD or YYYY/MM/DD)
        const formattedDates = dates.map(date => {
            // Check if date is in MM/DD/YYYY or YYYY/MM/DD format
            const parts = date.split('/');
            if (parts.length === 3) {
                if (parts[0].length === 4) { // YYYY/MM/DD
                    return `${parts[1]}/${parts[2]}`;
                } else { // MM/DD/YYYY
                    return `${parts[0]}/${parts[1]}`;
                }
            }
            return date;
        });
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, this.colors.gradient.secondary.start);
        gradient.addColorStop(1, this.colors.gradient.secondary.end);
        
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: formattedDates,
                datasets: [{
                    label: '通話時間 (分鐘)',
                    data: callDuration,
                    backgroundColor: gradient,
                    borderColor: this.colors.secondary,
                    borderWidth: 2,
                    pointBackgroundColor: this.colors.secondary,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(45, 52, 54, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
        
        return chart;
    }
    
    /**
     * Create word cloud visualization using D3
     */
    createWordCloud() {
        // Get word frequency data
        const wordFrequency = this.results.wordFrequency;
        
        // Convert to array of objects for d3-cloud
        let words = Object.entries(wordFrequency)
            .map(([text, size]) => ({ text, size }))
            .filter(d => d.text.length > 1)  // Filter out single characters
            .sort((a, b) => b.size - a.size)
            .slice(0, 30);  // Take top 30 words
        
        // Adjust sizes for better visualization
        const maxSize = Math.max(...words.map(w => w.size));
        const minSize = Math.min(...words.map(w => w.size));
        const fontSizeScale = d3.scaleLog()
            .domain([minSize, maxSize])
            .range([15, 50]);
            
        words = words.map(w => ({
            text: w.text,
            size: fontSizeScale(w.size),
            originalSize: w.size
        }));
        
        // Set up word cloud layout
        const width = document.getElementById('word-cloud').offsetWidth;
        const height = document.getElementById('word-cloud').offsetHeight;
        
        // Generate colors for words
        const wordColors = this.generateColorPalette(words.length);
        
        // Create word cloud
        d3.layout.cloud()
            .size([width, height])
            .words(words)
            .padding(5)
            .rotate(() => ~~(Math.random() * 2) * 90)
            .font("'Segoe UI', Tahoma, Geneva, Verdana, sans-serif")
            .fontSize(d => d.size)
            .on("end", draw)
            .start();
            
        // Function to draw the word cloud
        function draw(words) {
            // Clear previous content
            d3.select("#word-cloud").html("");
            
            d3.select("#word-cloud")
                .append("svg")
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("viewBox", `0 0 ${width} ${height}`)
                .append("g")
                .attr("transform", `translate(${width/2},${height/2})`)
                .selectAll("text")
                .data(words)
                .enter()
                .append("text")
                .style("font-size", d => `${d.size}px`)
                .style("font-family", "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif")
                .style("fill", (d, i) => wordColors[i % wordColors.length])
                .attr("text-anchor", "middle")
                .attr("transform", d => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
                .text(d => d.text)
                .append("title")
                .text(d => `${d.text}: ${d.originalSize}`);
        }
    }
    
    /**
     * Generate a color palette for charts
     * @param {number} count - Number of colors needed
     * @return {Array} Array of hex color codes
     */
    generateColorPalette(count) {
        const baseColors = [
            '#ff6b6b', '#feca57', '#48dbfb', '#54a0ff', '#ff9ff3', 
            '#ff7979', '#eccc68', '#1dd1a1', '#2e86de', '#f368e0',
            '#ff9f43', '#ee5253', '#0abde3', '#10ac84', '#222f3e'
        ];
        
        // If we need more colors than in our base palette, generate them
        if (count <= baseColors.length) {
            return baseColors.slice(0, count);
        }
        
        const palette = [...baseColors];
        
        // Generate more colors as needed
        while (palette.length < count) {
            const r = Math.floor(Math.random() * 200 + 55);
            const g = Math.floor(Math.random() * 200 + 55);
            const b = Math.floor(Math.random() * 200 + 55);
            const color = `rgb(${r}, ${g}, ${b})`;
            
            // Ensure we don't have duplicates
            if (!palette.includes(color)) {
                palette.push(color);
            }
        }
        
        return palette;
    }
}
