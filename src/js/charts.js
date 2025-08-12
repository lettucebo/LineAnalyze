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
        
        // Convert dates to day numbers (1, 2, 3, ...)
        const dayNumbers = dates.map((_, index) => (index + 1).toString());
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, this.colors.gradient.primary.start);
        gradient.addColorStop(1, this.colors.gradient.primary.end);
        
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dayNumbers,
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
                            maxRotation: 0,
                            minRotation: 0,
                            font: {
                                size: 12
                            }
                        },
                        title: {
                            display: true,
                            text: '天數',
                            font: {
                                size: 14
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            stepSize: 1,
                            font: {
                                size: 12
                            }
                        },
                        title: {
                            display: true,
                            text: '訊息數量',
                            font: {
                                size: 14
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
        const callDuration = Object.values(this.results.callDurationByDate).map(seconds => Math.round(seconds / 60));
        
        const dayNumbers = dates.map((_, index) => (index + 1).toString());
        
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, this.colors.gradient.secondary.start);
        gradient.addColorStop(1, this.colors.gradient.secondary.end);
        
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dayNumbers,
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
                            maxRotation: 0,
                            minRotation: 0,
                            font: {
                                size: 12
                            }
                        },
                        title: {
                            display: true,
                            text: '天數',
                            font: {
                                size: 14
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            stepSize: 5,
                            font: {
                                size: 12
                            }
                        },
                        title: {
                            display: true,
                            text: '通話時間 (分鐘)',
                            font: {
                                size: 14
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

    /**
     * 創建通話類型分布圓餅圖
     * @return {Chart} The Chart.js chart object
     */
    createCallTypesChart() {
        const ctx = document.getElementById('call-types-chart').getContext('2d');
        
        const callTypes = this.results.callTypes;
        const labels = {
            completed: '已接通話',
            missed: '未接來電',
            cancelled: '取消的通話'
        };
        
        // 準備數據
        const data = [
            callTypes.completed,
            callTypes.missed,
            callTypes.cancelled
        ];
        const chartLabels = [
            `${labels.completed} (${callTypes.completed}次)`,
            `${labels.missed} (${callTypes.missed}次)`,
            `${labels.cancelled} (${callTypes.cancelled}次)`
        ];
        
        // 生成顏色
        const colors = [
            '#4cd137',  // 綠色表示已接
            '#e84118',  // 紅色表示未接
            '#fbc531'   // 黃色表示取消
        ];
        
        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: chartLabels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderColor: '#ffffff',
                    borderWidth: 2,
                    hoverOffset: 20,
                    hoverBorderWidth: 3
                }]
            },
            options: {
                cutout: '60%',
                radius: '90%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
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
                        callbacks: {
                            title: function(context) {
                                return context[0].label.split(' (')[0];
                            },
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return [
                                    `次數: ${value}`,
                                    `佔比: ${percentage}%`
                                ];
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
     * 創建使用者通話分析堆疊條形圖
     * @return {Chart} The Chart.js chart object
     */
    createUserCallAnalysisChart() {
        const ctx = document.getElementById('user-call-analysis-chart').getContext('2d');
        const userCallTypes = this.results.userCallTypes;
        
        // 準備數據
        const users = Object.keys(userCallTypes);
        const completed = users.map(user => userCallTypes[user].completed);
        const missed = users.map(user => userCallTypes[user].missed);
        const cancelled = users.map(user => userCallTypes[user].cancelled);
        
        // 計算每位使用者的平均通話時長（分鐘）
        const avgDuration = users.map(user => {
            const totalCalls = userCallTypes[user].completed;
            return totalCalls > 0 
                ? Math.round(userCallTypes[user].totalDuration / (60 * totalCalls))
                : 0;
        });
        
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: users,
                datasets: [
                    {
                        label: '已接通話',
                        data: completed,
                        backgroundColor: '#4cd137',
                        borderColor: '#ffffff',
                        borderWidth: 1
                    },
                    {
                        label: '未接來電',
                        data: missed,
                        backgroundColor: '#e84118',
                        borderColor: '#ffffff',
                        borderWidth: 1
                    },
                    {
                        label: '取消的通話',
                        data: cancelled,
                        backgroundColor: '#fbc531',
                        borderColor: '#ffffff',
                        borderWidth: 1
                    },
                    {
                        label: '平均通話時長(分鐘)',
                        data: avgDuration,
                        type: 'line',
                        borderColor: '#00a8ff',
                        borderWidth: 2,
                        fill: false,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true,
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '通話次數',
                            font: {
                                size: 14
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    y1: {
                        position: 'right',
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '平均通話時長(分鐘)',
                            font: {
                                size: 14
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
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
                        callbacks: {
                            title: function(context) {
                                return `使用者: ${context[0].label}`;
                            },
                            label: function(context) {
                                const dataset = context.dataset;
                                if (dataset.type === 'line') {
                                    return `平均通話時長: ${context.raw}分鐘`;
                                }
                                const total = completed[context.dataIndex] + 
                                            missed[context.dataIndex] + 
                                            cancelled[context.dataIndex];
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return [
                                    `${dataset.label}: ${context.raw}次`,
                                    `佔比: ${percentage}%`
                                ];
                            }
                        }
                    }
                }
            }
        });
        
        return chart;
    }

    /**
     * 繪製通話類型比例圓餅圖
     * @param {string} containerId - 圖表容器的 ID
     */
    renderCallTypePieChart(containerId) {
        const stats = this.results.callTypeStats;
        const data = [
            { label: '成功通話', value: stats.successful },
            { label: '未接來電', value: stats.missed },
            { label: '對方未接', value: stats.missed_outgoing }
        ];

        const colors = ['#4CAF50', '#FFC107', '#F44336'];

        const pie = d3.pie()
            .value(d => d.value)
            .sort(null);

        const width = 400;
        const height = 400;
        const radius = Math.min(width, height) / 2;

        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius - 10);

        const svg = d3.select(`#${containerId}`)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width/2}, ${height/2})`);

        // 繪製扇形
        const paths = svg.selectAll('path')
            .data(pie(data))
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', (d, i) => colors[i])
            .attr('stroke', 'white')
            .style('stroke-width', '2px');

        // 添加標籤
        const labelArc = d3.arc()
            .innerRadius(radius * 0.6)
            .outerRadius(radius * 0.6);

        svg.selectAll('text')
            .data(pie(data))
            .enter()
            .append('text')
            .attr('transform', d => `translate(${labelArc.centroid(d)})`)
            .attr('dy', '0.35em')
            .style('text-anchor', 'middle')
            .text(d => `${d.data.label}\n${d.data.value}次 (${Math.round(d.value/d3.sum(data, d => d.value)*100)}%)`);
    }

    /**
     * 繪製通話時長分布柱狀圖
     * @param {string} containerId - 圖表容器的 ID
     */
    renderCallDurationBarChart(containerId) {
        const distribution = this.results.callDurationDistribution;
        
        const margin = {top: 20, right: 20, bottom: 30, left: 60};
        const width = 600 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select(`#${containerId}`)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .range([0, width])
            .padding(0.1);

        const y = d3.scaleLinear()
            .range([height, 0]);

        x.domain(distribution.map(d => d.label));
        y.domain([0, d3.max(distribution, d => d.count)]);

        // 添加 X 軸
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('transform', 'rotate(-45)');

        // 添加 Y 軸
        svg.append('g')
            .call(d3.axisLeft(y));

        // 繪製柱狀
        svg.selectAll('.bar')
            .data(distribution)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.label))
            .attr('width', x.bandwidth())
            .attr('y', d => y(d.count))
            .attr('height', d => height - y(d.count))
            .attr('fill', '#2196F3');

        // 添加數值標籤
        svg.selectAll('.label')
            .data(distribution)
            .enter().append('text')
            .attr('class', 'label')
            .attr('x', d => x(d.label) + x.bandwidth()/2)
            .attr('y', d => y(d.count) - 5)
            .attr('text-anchor', 'middle')
            .text(d => d.count);
    }

    /**
     * 繪製使用者通話成功率折線圖
     * @param {string} containerId - 圖表容器的 ID
     */
    renderCallSuccessRateLineChart(containerId) {
        const behavior = this.results.userCallBehavior;
        const data = Object.entries(behavior).map(([name, stats]) => ({
            name,
            successRate: stats.callSuccessRate
        }));

        const margin = {top: 20, right: 20, bottom: 30, left: 60};
        const width = 600 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select(`#${containerId}`)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // 設置 X 軸比例尺
        const x = d3.scaleBand()
            .range([0, width])
            .padding(0.1)
            .domain(data.map(d => d.name));

        // 設置 Y 軸比例尺
        const y = d3.scaleLinear()
            .range([height, 0])
            .domain([0, 100]); // 成功率範圍 0-100%

        // 添加 X 軸
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('transform', 'rotate(-45)');

        // 添加 Y 軸和標題
        svg.append('g')
            .call(d3.axisLeft(y))
            .append('text')
            .attr('fill', '#000')
            .attr('transform', 'rotate(-90)')
            .attr('y', 6)
            .attr('dy', '0.71em')
            .attr('text-anchor', 'end')
            .text('成功率 (%)');

        // 定義線條生成器
        const line = d3.line()
            .x(d => x(d.name) + x.bandwidth()/2)
            .y(d => y(d.successRate));

        // 繪製線條
        svg.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', '#2196F3')
            .attr('stroke-width', 2)
            .attr('d', line);

        // 添加資料點
        svg.selectAll('.dot')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('cx', d => x(d.name) + x.bandwidth()/2)
            .attr('cy', d => y(d.successRate))
            .attr('r', 4)
            .attr('fill', '#2196F3');

        // 添加數值標籤
        svg.selectAll('.label')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('x', d => x(d.name) + x.bandwidth()/2)
            .attr('y', d => y(d.successRate) - 10)
            .attr('text-anchor', 'middle')
            .text(d => `${Math.round(d.successRate)}%`);

        // 添加互動效果
        const tooltip = d3.select(`#${containerId}`)
            .append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background-color', 'rgba(0, 0, 0, 0.8)')
            .style('color', 'white')
            .style('padding', '8px')
            .style('border-radius', '4px');

        svg.selectAll('.dot')
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('r', 6);

                tooltip.transition()
                    .duration(200)
                    .style('opacity', .9);

                tooltip.html(`${d.name}<br/>成功率: ${Math.round(d.successRate)}%`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('r', 4);

                tooltip.transition()
                    .duration(500)
                    .style('opacity', 0);
            });
    }

    /**
     * 繪製使用者通話類型堆疊柱狀圖
     * @param {string} containerId - 圖表容器的 ID
     */
    renderUserCallTypeStackedBarChart(containerId) {
        const behavior = this.results.userCallBehavior;
        const users = Object.keys(behavior);
        const data = users.map(name => ({
            name,
            successful: behavior[name].successfulCalls,
            missed: behavior[name].missedCalls,
            missedOutgoing: behavior[name].missedOutgoingCalls
        }));

        const margin = {top: 20, right: 20, bottom: 30, left: 60};
        const width = 600 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select(`#${containerId}`)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .range([0, width])
            .padding(0.1)
            .domain(data.map(d => d.name));

        // 計算堆疊數據
        const stack = d3.stack()
            .keys(['successful', 'missed', 'missedOutgoing'])
            .value((d, key) => d[key]);

        const stackedData = stack(data);

        // 設定 Y 軸範圍
        const y = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(stackedData[stackedData.length - 1], d => d[1])]);

        // 顏色比例尺
        const color = d3.scaleOrdinal()
            .domain(['successful', 'missed', 'missedOutgoing'])
            .range(['#4CAF50', '#FFC107', '#F44336']);

        // 添加 X 軸
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('transform', 'rotate(-45)');

        // 添加 Y 軸
        svg.append('g')
            .call(d3.axisLeft(y));

        // 建立圖例
        const legend = svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${width - 100}, 0)`);

        const legendItems = [
            { label: '成功通話', color: '#4CAF50' },
            { label: '未接來電', color: '#FFC107' },
            { label: '對方未接', color: '#F44336' }
        ];

        legendItems.forEach((item, i) => {
            const g = legend.append('g')
                .attr('transform', `translate(0, ${i * 20})`);

            g.append('rect')
                .attr('width', 10)
                .attr('height', 10)
                .attr('fill', item.color);

            g.append('text')
                .attr('x', 15)
                .attr('y', 10)
                .attr('font-size', '12px')
                .text(item.label);
        });

        // 繪製堆疊條形圖
        const groups = svg.selectAll('g.series')
            .data(stackedData)
            .enter()
            .append('g')
            .attr('class', 'series')
            .style('fill', (d, i) => color(d.key));

        groups.selectAll('rect')
            .data(d => d)
            .enter()
            .append('rect')
            .attr('x', d => x(d.data.name))
            .attr('y', d => y(d[1]))
            .attr('height', d => y(d[0]) - y(d[1]))
            .attr('width', x.bandwidth());

        // 添加互動效果
        const tooltip = d3.select(`#${containerId}`)
            .append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background-color', 'rgba(0, 0, 0, 0.8)')
            .style('color', 'white')
            .style('padding', '8px')
            .style('border-radius', '4px');

        groups.selectAll('rect')
            .on('mouseover', function(event, d) {
                const seriesKey = d3.select(this.parentNode).datum().key;
                const value = d.data[seriesKey];
                const total = d.data.successful + d.data.missed + d.data.missedOutgoing;
                const percentage = ((value / total) * 100).toFixed(1);

                d3.select(this)
                    .style('opacity', 0.8);

                tooltip.transition()
                    .duration(200)
                    .style('opacity', .9);

                const typeLabels = {
                    successful: '成功通話',
                    missed: '未接來電',
                    missedOutgoing: '對方未接'
                };

                tooltip.html(`${d.data.name}<br/>${typeLabels[seriesKey]}: ${value}次<br/>佔比: ${percentage}%`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function() {
                d3.select(this)
                    .style('opacity', 1);

                tooltip.transition()
                    .duration(500)
                    .style('opacity', 0);
            });
    }

    /**
     * 渲染所有通話分析圖表
     * @param {Object} containers - 包含各圖表容器 ID 的物件
     */
    renderCallAnalysisCharts(containers) {
        this.renderCallTypePieChart(containers.pieChart);
        this.renderCallDurationBarChart(containers.barChart);
        this.renderCallSuccessRateLineChart(containers.lineChart);
        this.renderUserCallTypeStackedBarChart(containers.stackedBarChart);
    }
}
