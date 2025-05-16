/**
 * Main application script for LINE Chat Analyzer
 * Handles file upload, processing, and UI updates
 */

// Wait for DOM content to fully load
document.addEventListener('DOMContentLoaded', function() {
    // Get references to DOM elements
    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-input');
    const uploadButton = document.getElementById('upload-button');
    const loadingIndicator = document.getElementById('loading');
    const resultsSection = document.getElementById('results-section');
    const sampleDataSwitch = document.getElementById('sample-data-switch');
    
    // Initialize animations
    AnimationUtility.initAnimations();
    
    // Show welcome toast on first visit
    showWelcomeToast();
    
    // Handle sample data switch
    sampleDataSwitch.addEventListener('change', function() {
        if (this.checked) {
            loadSampleData();
        } else {
            // Reset file input
            fileInput.value = '';
        }
    });
    
    /**
     * Loads sample chat data for demonstration
     */
    function loadSampleData() {
        // Show loading indicator
        loadingIndicator.classList.remove('d-none');
        uploadButton.disabled = true;
        
        // Simulate network delay
        setTimeout(() => {
            // Fetch sample data
            const sampleDataURL = 'data/sample.txt';  // Changed from chat-tw.txt to sample.txt
            
            fetch(sampleDataURL)
                .then(response => response.text())
                .then(content => {
                    // Process the sample data
                    try {
                        // Parse the chat data
                        const parser = new LineParser();
                        const chatData = parser.parse(content);
                        
                        // Analyze the chat data
                        const analyzer = new ChatAnalyzer(chatData);
                        const results = analyzer.getResults();
                        
                        // Update UI with results
                        updateUI(results);
                        
                    } catch (error) {
                        console.error('Error processing sample data:', error);
                        alert('處理範例資料時發生錯誤: ' + error.message);
                    }
                })
                .catch(error => {
                    console.error('Error fetching sample data:', error);
                    alert('無法載入範例資料。請上傳您自己的聊天記錄。');
                })
                .finally(() => {
                    loadingIndicator.classList.add('d-none');
                    uploadButton.disabled = false;
                });
        }, 800);
    }
    
    // Chart instances
    let dailyMessagesChart = null;
    let userMessagesChart = null;
    let dailyCallChart = null;
    
    /**
     * Event handler for form submission
     * @param {Event} e - The submit event
     */
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Check if file is selected
        if (!fileInput.files || !fileInput.files[0]) {
            alert('請先選擇一個聊天記錄檔案！');
            return;
        }
        
        const file = fileInput.files[0];
        
        // Check if it's a text file
        if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
            alert('請上傳有效的 LINE 聊天記錄檔案 (.txt)！');
            return;
        }
        
        // Show loading indicator
        loadingIndicator.classList.remove('d-none');
        uploadButton.disabled = true;
        
        // Read the file
        const reader = new FileReader();
        reader.onload = onFileLoaded;
        reader.onerror = function() {
            alert('讀取檔案時發生錯誤！');
            loadingIndicator.classList.add('d-none');
            uploadButton.disabled = false;
        };
        
        reader.readAsText(file);
    });
    
    /**
     * Handler for when file content is loaded
     * @param {Event} e - The load event
     */
    function onFileLoaded(e) {
        try {
            const content = e.target.result;
            
            // Parse the chat data
            const parser = new LineParser();
            const chatData = parser.parse(content);
            
            // Analyze the chat data
            const analyzer = new ChatAnalyzer(chatData);
            const results = analyzer.getResults();
            
            // Update UI with results
            updateUI(results);
            
        } catch (error) {
            console.error('Error processing file:', error);
            alert('處理檔案時發生錯誤: ' + error.message);
        } finally {
            loadingIndicator.classList.add('d-none');
            uploadButton.disabled = false;
        }
    }
    
    /**
     * Updates the UI with analysis results
     * @param {Object} results - The analysis results
     */    function updateUI(results) {
        // Show results section
        resultsSection.classList.remove('d-none');
        
        // Add a small delay before scrolling for better UX
        setTimeout(() => {
            // Smooth scroll to results
            resultsSection.scrollIntoView({ behavior: 'smooth' });
            
            // Trigger celebration animation
            AnimationUtility.celebrateAnalysisComplete();
        }, 300);
        
        // Update basic stats with animation delay
        setTimeout(() => {
            document.getElementById('chat-days').textContent = results.chatDays;
            document.getElementById('total-messages').textContent = results.totalMessages;
            document.getElementById('total-calls').textContent = results.totalCalls;
        }, 500);
          // Format call time as hours, minutes and seconds
        const totalSeconds = results.totalCallDuration;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        let timeString = '';
        if (hours > 0) {
            timeString += `${hours}小時`;
        }
        if (minutes > 0 || hours > 0) {
            timeString += `${minutes}分鐘`;
        }
        if (seconds > 0 || (hours === 0 && minutes === 0)) {
            timeString += `${seconds}秒`;
        }
        
        document.getElementById('total-call-time').textContent = timeString;
        
        // Max messages per day
        document.getElementById('max-messages-day').textContent = results.maxMessagesDay.count;
        document.getElementById('max-messages-date').textContent = formatDate(results.maxMessagesDay.date);
          // Max call duration per day
        const maxCallSeconds = results.maxCallDay.duration;
        const maxCallHours = Math.floor(maxCallSeconds / 3600);
        const maxCallMinutes = Math.floor((maxCallSeconds % 3600) / 60);
        const maxCallRemainingSeconds = maxCallSeconds % 60;
        
        let maxCallTimeString = '';
        if (maxCallHours > 0) {
            maxCallTimeString += `${maxCallHours}小時`;
        }
        if (maxCallMinutes > 0 || maxCallHours > 0) {
            maxCallTimeString += `${maxCallMinutes}分鐘`;
        }
        if (maxCallRemainingSeconds > 0 || (maxCallHours === 0 && maxCallMinutes === 0)) {
            maxCallTimeString += `${maxCallRemainingSeconds}秒`;
        }
        
        document.getElementById('max-call-day').textContent = maxCallTimeString;
        document.getElementById('max-call-date').textContent = formatDate(results.maxCallDay.date);
        
        // Update user stats table
        updateUserStats(results.users);
        
        // Create charts
        createCharts(results);
    }
    
    /**
     * Updates the user statistics table
     * @param {Object} users - User statistics
     */
    function updateUserStats(users) {
        const tbody = document.getElementById('user-stats');
        tbody.innerHTML = '';
        
        for (const [username, stats] of Object.entries(users)) {
            const row = document.createElement('tr');
              // Format call time
            const callSeconds = stats.callDuration;
            const callHours = Math.floor(callSeconds / 3600);
            const callMinutes = Math.floor((callSeconds % 3600) / 60);
            const callRemainingSeconds = callSeconds % 60;
            
            let formattedCallTime = '';
            if (callHours > 0) {
                formattedCallTime += `${callHours}小時`;
            }
            if (callMinutes > 0 || callHours > 0) {
                formattedCallTime += `${callMinutes}分鐘`;
            }
            if (callRemainingSeconds > 0 || (callHours === 0 && callMinutes === 0)) {
                formattedCallTime += `${callRemainingSeconds}秒`;
            }
            
            row.innerHTML = `
                <td>${username}</td>
                <td>${stats.totalMessages}</td>
                <td>${stats.stickers}</td>
                <td>${stats.photos}</td>
                <td>${stats.calls}</td>
                <td>${formattedCallTime}</td>
            `;
            
            tbody.appendChild(row);
        }
    }
      /**
     * Creates charts for visualizing the data
     * @param {Object} results - Analysis results
     */
    function createCharts(results) {
        // Destroy existing charts to prevent duplicates
        if (dailyMessagesChart) dailyMessagesChart.destroy();
        if (userMessagesChart) userMessagesChart.destroy();
        if (dailyCallChart) dailyCallChart.destroy();
        
        // Create chart renderer
        const renderer = new ChartRenderer(results);
          // 先檢查每日訊息數據
        dailyMessagesChart = renderer.createDailyMessagesChart();
        if (!dailyMessagesChart) {
            console.warn("無法創建每日訊息圖表");
            const container = document.getElementById('daily-messages-chart').parentNode;
            container.innerHTML = '<div class="text-center text-muted my-5"><i class="fas fa-exclamation-triangle me-2"></i>沒有足夠的訊息數據來生成圖表</div>';
        }
        
        // 檢查用戶數據是否有效
        if (!results || !results.users || Object.keys(results.users).length === 0) {
            console.warn("分析結果中沒有用戶數據");
            // 顯示錯誤訊息
            const container = document.getElementById('user-messages-chart').parentNode;
            container.innerHTML = '<div class="text-center text-muted my-5"><i class="fas fa-exclamation-triangle me-2"></i>沒有足夠的用戶數據來生成圖表</div>';
        } else {
            // 創建用戶訊息圖表
            userMessagesChart = renderer.createUserMessagesChart();
        }
        
        // 創建每日通話圖表
        dailyCallChart = renderer.createDailyCallChart();
          // Create word cloud
        try {
            renderer.createWordCloud();
        } catch (error) {
            console.error('圖表生成錯誤:', error);
            // 如果文字雲生成失敗，顯示一個友好的錯誤訊息
            const container = document.getElementById('word-cloud');
            if (container) {
                container.innerHTML = '<div class="text-center text-muted my-5"><i class="fas fa-exclamation-triangle me-2"></i>無法生成文字雲</div>';
            }
        }
    }
    
    // 添加一個全局的錯誤處理，用於捕捉圖表渲染錯誤
    window.addEventListener('error', function(event) {
        if (event.error && event.error.message && 
            (event.error.message.includes('chart') || event.error.message.includes('Chart'))) {
            console.error('圖表錯誤:', event.error);
            alert('圖表渲染時發生錯誤，請刷新頁面或嘗試使用不同的數據。');
        }
    });
      /**
     * Format date string for better display
     * @param {string} dateStr - Date string in MM/DD/YYYY or YYYY/MM/DD format
     * @return {string} Formatted date
     */
    function formatDate(dateStr) {
        if (!dateStr) return '-';
        
        try {
            const parts = dateStr.split('/');
            if (parts.length !== 3) return dateStr;
            
            let year, month, day;
            
            if (parts[0].length === 4) {
                // Format: YYYY/MM/DD
                year = parts[0];
                month = parts[1];
                day = parts[2];
            } else {
                // Format: MM/DD/YYYY
                month = parts[0];
                day = parts[1];
                year = parts[2];
            }
            
            return `${year}/${month}/${day}`;
        } catch (e) {
            console.error('Error formatting date:', e);
            return dateStr;
        }
    }
    
    /**
     * Shows a welcome toast message 
     */
    function showWelcomeToast() {
        // Check if this is the first visit
        if (!localStorage.getItem('lineAnalyzerVisited')) {
            // Create toast element
            const toastContainer = document.createElement('div');
            toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
            toastContainer.style.zIndex = '11';
            
            toastContainer.innerHTML = `
                <div id="welcomeToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="toast-header bg-primary text-white">
                        <i class="fab fa-line me-2"></i>
                        <strong class="me-auto">歡迎使用</strong>
                        <small>剛才</small>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                    <div class="toast-body">
                        <p>歡迎使用 LINE 聊天分析器！</p>
                        <p class="mb-0">上傳您的聊天記錄或選擇使用範例數據，開始探索您的聊天統計吧。</p>
                        <div class="mt-2 pt-2 border-top">
                            <button type="button" class="btn btn-primary btn-sm" id="try-sample-btn">
                                試用範例數據
                            </button>
                            <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="toast">
                                關閉
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(toastContainer);
            
            // Initialize and show the toast
            const welcomeToast = new bootstrap.Toast(document.getElementById('welcomeToast'));
            welcomeToast.show();
            
            // Handle try sample button
            document.getElementById('try-sample-btn').addEventListener('click', function() {
                // Enable sample data switch
                document.getElementById('sample-data-switch').checked = true;
                
                // Trigger the change event
                const event = new Event('change');
                document.getElementById('sample-data-switch').dispatchEvent(event);
                
                // Hide toast
                welcomeToast.hide();
            });
            
            // Mark as visited
            localStorage.setItem('lineAnalyzerVisited', 'true');
        }
    }
});
