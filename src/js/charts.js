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
          // Chart.js global configuration (更新適用於Chart.js 3.x版本)
        Chart.defaults.font = {
            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        };
        Chart.defaults.color = this.colors.dark;
        Chart.defaults.responsive = true;
        Chart.defaults.maintainAspectRatio = false;
    }
    
    /**
     * Create the daily messages line chart
     * @return {Chart} The Chart.js chart object
     */    createDailyMessagesChart() {
        const canvas = document.getElementById('daily-messages-chart');
        if (!canvas) {
            console.error('無法找到每日訊息圖表的Canvas元素');
            return null;
        }
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('無法獲取2D上下文');
            return null;
        }
        
        // 檢查數據是否存在
        if (!this.results || !this.results.messagesByDate || 
            Object.keys(this.results.messagesByDate).length === 0) {
            console.warn('缺少每日訊息數據');
            const container = canvas.parentNode;
            container.innerHTML = '<div class="text-center text-muted my-5"><i class="fas fa-exclamation-triangle me-2"></i>沒有足夠的消息數據來生成圖表</div>';
            return null;
        }
        
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
                    },                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(45, 52, 54, 0.95)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: {
                            top: 10,
                            right: 15,
                            bottom: 10,
                            left: 15
                        },
                        displayColors: false,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            title: function(context) {
                                return '日期: ' + dates[context[0].dataIndex];
                            },
                            label: function(context) {
                                return `訊息數量: ${context.raw.toLocaleString()}`;
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
                    },                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: function(value) {
                                if (Math.floor(value) === value) {
                                    return value;
                                }
                            }
                        }
                    }
                },                // 修正在行動裝置上的顯示問題
                responsive: true,
                maintainAspectRatio: false,
                // 確保圖表有足夠的空間顯示
                layout: {
                    padding: {
                        left: 10,
                        right: 10,
                        top: 10,
                        bottom: 10
                    }
                }
            }
        });
        
        return chart;
    }
    
    /**
     * Create the pie chart showing user message distribution
     * @return {Chart} The Chart.js chart object
     */    createUserMessagesChart() {
        const ctx = document.getElementById('user-messages-chart').getContext('2d');
        
        // Extract user data
        const users = Object.keys(this.results.users);
        const messageCounts = users.map(user => this.results.users[user].totalMessages);
        
        // 檢查是否有資料
        if (users.length === 0 || messageCounts.every(count => count === 0)) {
            console.warn("沒有用戶訊息數據可用");
            const container = document.getElementById('user-messages-chart').parentNode;
            const warningMsg = document.createElement('div');
            warningMsg.className = 'text-center text-muted mt-5';
            warningMsg.innerHTML = '<i class="fas fa-exclamation-triangle"></i> 沒有足夠的數據來生成圖表';
            container.appendChild(warningMsg);
            return null;
        }

        // Generate colors for users
        const userColors = this.generateColorPalette(users.length);
        
        const chart = new Chart(ctx, {
            type: 'doughnut',            data: {
                labels: users,
                datasets: [{
                    data: messageCounts,
                    backgroundColor: userColors,
                    borderColor: '#ffffff',
                    borderWidth: 2,
                    hoverOffset: 20,
                    hoverBorderWidth: 3
                }]
            },            
            options: {
                cutout: '60%',
                radius: '90%',
                hover: {
                    mode: 'point'
                },
                onHover: (event, elements) => {
                    event.native.target.style.cursor = elements[0] ? 'pointer' : 'default';
                },
                interaction: {
                    mode: 'point',
                    intersect: true
                },
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                size: 12
                            }
                        }
                    },                    tooltip: {
                        enabled: true,
                        position: 'average',
                        backgroundColor: 'rgba(45, 52, 54, 0.95)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        titleMarginBottom: 10,
                        padding: {
                            top: 10,
                            right: 15,
                            bottom: 10,
                            left: 15
                        },
                        bodySpacing: 5,
                        displayColors: false,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            title: function(context) {
                                return `使用者: ${context[0].label}`;
                            },
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return [
                                    `訊息數量: ${value.toLocaleString()}`,
                                    `佔比: ${percentage}%`
                                ];
                            },
                            afterLabel: function(context) {
                                return '';  // 添加一個空行
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true
                },
                responsive: true,
                maintainAspectRatio: false
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
                    label: '通話時間',
                    data: callDuration,
                    backgroundColor: gradient,
                    borderColor: this.colors.secondary,
                    borderWidth: 2,
                    pointBackgroundColor: this.colors.secondary,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: this.colors.secondary,
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                onHover: (event, elements) => {
                    event.native.target.style.cursor = elements[0] ? 'pointer' : 'default';
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: false
                    },                    tooltip: {
                        enabled: true,
                        position: 'nearest',
                        backgroundColor: 'rgba(45, 52, 54, 0.95)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: {
                            top: 10,
                            right: 15,
                            bottom: 10,
                            left: 15
                        },
                        displayColors: false,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            title: function(context) {
                                return '日期: ' + dates[context[0].dataIndex];
                            },
                            label: function(context) {
                                const minutes = context.raw;
                                const hours = Math.floor(minutes / 60);
                                const remainingMinutes = minutes % 60;
                                if (hours > 0) {
                                    return `通話時間: ${hours}小時${remainingMinutes}分鐘`;
                                } else {
                                    return `通話時間: ${minutes}分鐘`;
                                }
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
                            callback: function(value) {
                                if (Math.floor(value) === value) {
                                    return value;
                                }
                            }
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
