/**
 * ChatAnalyzer Class - Analyzes parsed LINE chat data
 * Generates statistics and metrics from chat messages
 */
class ChatAnalyzer {
    // 通話類型常數
    static CALL_TYPES = {
        SUCCESSFUL: 'successful',
        MISSED: 'missed',
        MISSED_OUTGOING: 'missed_outgoing'
    };

    // 通話時長區間（秒）
    static CALL_DURATION_RANGES = [
        { min: 0, max: 60, label: '0-1分鐘' },
        { min: 60, max: 300, label: '1-5分鐘' },
        { min: 300, max: 600, label: '5-10分鐘' },
        { min: 600, max: 1800, label: '10-30分鐘' },
        { min: 1800, max: 3600, label: '30-60分鐘' },
        { min: 3600, max: Infinity, label: '60分鐘以上' }
    ];

    /**
     * Constructor for ChatAnalyzer
     * @param {Object} chatData - The parsed chat data from LineParser
     */
    constructor(chatData) {
        // Store the chat data
        this.chatData = chatData;
        
        // Store analysis results
        this.results = {};
        
        // Perform analysis
        this.analyze();
    }
    
    /**
     * Main analysis method - runs all analytics functions
     */
    analyze() {
        this.results = {
            // Basic metrics
            chatDays: this.calculateChatDays(),
            totalMessages: this.chatData.messages.length,
            messagesByDate: this.calculateMessagesByDate(),
            maxMessagesDay: this.findMaxMessagesDay(),
            
            // Call metrics
            totalCalls: this.calculateTotalCalls(),
            totalCallDuration: this.calculateTotalCallDuration(),
            callDurationByDate: this.calculateCallDurationByDate(),
            maxCallDay: this.findMaxCallDay(),
            
            // User metrics
            users: this.calculateUserStats(),
            
            // Content analysis
            wordFrequency: this.analyzeWordFrequency(),

            // 通話類型統計
            callTypeStats: this.analyzeCallTypes(),
            
            // 通話時長分布
            callDurationDistribution: this.analyzeCallDurationDistribution(),

            // 使用者通話行為
            userCallBehavior: this.analyzeUserCallBehavior()
        };
    }
    
    /**
     * Calculate the total number of chat days
     * @return {number} Number of days with chat activity
     */
    calculateChatDays() {
        return this.chatData.dates.length;
    }
    
    /**
     * Calculate the number of messages per date
     * @return {Object} Object with dates as keys and message counts as values
     */
    calculateMessagesByDate() {
        const messagesByDate = {};
        
        // Initialize all dates with zero
        this.chatData.dates.forEach(date => {
            messagesByDate[date] = 0;
        });
        
        // Count messages for each date
        this.chatData.messages.forEach(message => {
            if (messagesByDate[message.date] !== undefined) {
                messagesByDate[message.date]++;
            }
        });
        
        return messagesByDate;
    }
    
    /**
     * Find the day with the maximum number of messages
     * @return {Object} Object with date and count
     */
    findMaxMessagesDay() {
        const messagesByDate = this.calculateMessagesByDate();
        let maxDate = "";
        let maxCount = 0;
        
        for (const [date, count] of Object.entries(messagesByDate)) {
            if (count > maxCount) {
                maxCount = count;
                maxDate = date;
            }
        }
        
        return { date: maxDate, count: maxCount };
    }
    
    /**
     * Calculate the total number of calls
     * @return {number} Number of calls
     */
    calculateTotalCalls() {
        return this.chatData.messages.filter(msg => msg.type === "call").length;
    }
    
    /**
     * Calculate the total call duration in seconds
     * @return {number} Total call duration in seconds
     */
    calculateTotalCallDuration() {
        let totalSeconds = 0;
        
        this.chatData.messages.forEach(message => {
            if (message.type === "call") {
                totalSeconds += (message.callMinutes * 60) + message.callSeconds;
            }
        });
        
        return totalSeconds;
    }
    
    /**
     * Calculate call duration by date in seconds
     * @return {Object} Object with dates as keys and call durations as values
     */
    calculateCallDurationByDate() {
        const callDurationByDate = {};
        
        // Initialize all dates with zero
        this.chatData.dates.forEach(date => {
            callDurationByDate[date] = 0;
        });
        
        // Sum call durations for each date
        this.chatData.messages.forEach(message => {
            if (message.type === "call" && callDurationByDate[message.date] !== undefined) {
                const callSeconds = (message.callMinutes * 60) + message.callSeconds;
                callDurationByDate[message.date] += callSeconds;
            }
        });
        
        return callDurationByDate;
    }
    
    /**
     * Find the day with the maximum call duration
     * @return {Object} Object with date and duration in seconds
     */
    findMaxCallDay() {
        const callDurationByDate = this.calculateCallDurationByDate();
        let maxDate = "";
        let maxDuration = 0;
        
        for (const [date, duration] of Object.entries(callDurationByDate)) {
            if (duration > maxDuration) {
                maxDuration = duration;
                maxDate = date;
            }
        }
        
        return { date: maxDate, duration: maxDuration };
    }
    
    /**
     * Calculate statistics for each user
     * @return {Object} Object with user stats
     */
    calculateUserStats() {
        const users = {};
        
        // Process all messages to gather user stats
        this.chatData.messages.forEach(message => {
            const sender = message.sender;
            
            // Create user object if it doesn't exist
            if (!users[sender]) {
                users[sender] = {
                    totalMessages: 0,
                    textMessages: 0,
                    stickers: 0,
                    photos: 0,
                    calls: 0,
                    callDuration: 0  // in seconds
                };
            }
            
            // Increment message count
            users[sender].totalMessages++;
            
            // Increment specific type counts
            switch (message.type) {
                case "text":
                    users[sender].textMessages++;
                    break;
                case "sticker":
                    users[sender].stickers++;
                    break;
                case "photo":
                    users[sender].photos++;
                    break;
                case "call":
                    users[sender].calls++;
                    users[sender].callDuration += (message.callMinutes * 60) + message.callSeconds;
                    break;
            }
        });
        
        return users;
    }
    
    /**
     * Check if a message is a system message
     * @private
     * @param {Object} message - The message object to check
     * @return {boolean} True if the message is a system message
     */    _isSystemMessage(message) {
        // 通話相關的系統訊息
        const callSystemPatterns = [
            // 成功通話相關
            /通話時間/,
            /Call time/,
            /call ended/,
            /通話已結束/,
            /已結束通話/,
            /結束通話/,
            
            // 未接來電相關
            /未接通話/,
            /missed a voice call/,
            /Missed voice call/,
            /未接來電/,
            
            // 撥出未接相關
            /對方未接通話/,
            /The recipient did not answer/,
            /call was not answered/,
            /對方未接聽/,
            
            // 其他通話相關
            /☎/,
            /您已/,
            /通話/,
            /Started a voice call/,
            /發起通話/
        ];

        return message.type === "call" || 
               (message.type === "text" && 
                callSystemPatterns.some(pattern => pattern.test(message.content)));
    }

    /**
     * Analyze word frequency in text messages
     * @return {Object} Object with words as keys and frequencies as values
     */
    analyzeWordFrequency() {
        const wordCounts = {};
        const stopWords = this.getStopWords();
        
        // Process all text messages
        this.chatData.messages.forEach(message => {
            // 只處理文字訊息，且排除系統訊息
            if (message.type === "text" && !this._isSystemMessage(message)) {
                // For Chinese text, we need special handling for characters
                let words = [];
                
                // Check if the text has Chinese characters
                const hasChinese = /[\u3400-\u9FBF]/.test(message.content);
                
                if (hasChinese) {
                    // For Chinese text, treat each character as a word
                    // and also include word segments (2-3 characters together)
                    const chars = message.content.split('');
                    
                    // Add individual characters
                    words = [...chars];
                    
                    // Add character bigrams (pairs)
                    for (let i = 0; i < chars.length - 1; i++) {
                        words.push(chars[i] + chars[i+1]);
                    }
                    
                    // Add character trigrams (triplets)
                    for (let i = 0; i < chars.length - 2; i++) {
                        words.push(chars[i] + chars[i+1] + chars[i+2]);
                    }
                } else {
                    // For non-Chinese text, use standard word tokenization
                    words = message.content
                        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")  // Remove punctuation
                        .split(/\s+/);                                 // Split by whitespace
                }
                
                // Filter words
                words = words
                    .filter(word => word.length > 1)             // Filter out single characters
                    .filter(word => !stopWords.includes(word.toLowerCase())) // Filter out stop words
                    .filter(word => !/^\d+$/.test(word));        // Filter out pure numbers
                
                // Count word occurrences
                words.forEach(word => {
                    if (!wordCounts[word]) {
                        wordCounts[word] = 0;
                    }
                    wordCounts[word]++;
                });
            }
        });
        
        return wordCounts;
    }
    
    /**
     * Get a list of common stop words to exclude from word frequency analysis
     * Includes both English and Chinese stop words
     * @return {Array} Array of stop words
     */
    getStopWords() {
        // Common English stop words
        const englishStopWords = [
            'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any',
            'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between',
            'both', 'but', 'by', 'can', 'did', 'do', 'does', 'doing', 'down', 'during', 'each',
            'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here',
            'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it',
            'its', 'itself', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off',
            'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over',
            'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their',
            'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those',
            'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what',
            'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'would',
            'you', 'your', 'yours', 'yourself', 'yourselves'
        ];
        
        // Common Chinese stop words
        const chineseStopWords = [
            '的', '了', '和', '是', '就', '都', '而', '及', '與', '著', '或', '一個', '沒有',
            '我們', '你們', '他們', '她們', '它們', '這個', '那個', '這些', '那些', '什麼',
            '誰', '哪裡', '哪個', '如何', '為什麼', '可以', '因為', '所以', '但是', '如果',
            '雖然', '只是', '不過', '還是', '也許', '吧', '啊', '呢', '了', '喔', '哦', '嗯',
            '這', '那', '你', '我', '他', '她', '它', '有', '在', '好', '來'
        ];
        
        return [...englishStopWords, ...chineseStopWords];
    }
    
    /**
     * Format seconds into human-readable time string (HH:MM:SS)
     * @param {number} totalSeconds - Total time in seconds
     * @return {string} Formatted time string
     */
    formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    /**
     * Get analysis results
     * @return {Object} The complete analysis results
     */
    getResults() {
        return this.results;
    }

    /**
     * 分析通話類型
     * @private
     * @param {Object} message - 訊息物件
     * @return {string} 通話類型
     */
    _getCallType(message) {
        if (message.type !== 'text' && message.type !== 'call') return null;

        const content = message.content || '';
        if (this._isSystemMessage(message)) {
            if (/未接通話|missed a voice call|Missed voice call/.test(content)) {
                return ChatAnalyzer.CALL_TYPES.MISSED;
            } else if (/對方未接通話|The recipient did not answer|call was not answered/.test(content)) {
                return ChatAnalyzer.CALL_TYPES.MISSED_OUTGOING;
            } else if (/通話時間|Call time|call ended/.test(content)) {
                return ChatAnalyzer.CALL_TYPES.SUCCESSFUL;
            }
        }
        return null;
    }

    /**
     * 分析通話類型統計
     * @return {Object} 各類型通話的統計數據
     */
    analyzeCallTypes() {
        const stats = {
            [ChatAnalyzer.CALL_TYPES.SUCCESSFUL]: 0,
            [ChatAnalyzer.CALL_TYPES.MISSED]: 0,
            [ChatAnalyzer.CALL_TYPES.MISSED_OUTGOING]: 0
        };

        this.chatData.messages.forEach(message => {
            const callType = this._getCallType(message);
            if (callType) {
                stats[callType]++;
            }
        });

        return stats;
    }

    /**
     * 分析通話時長分布
     * @return {Object} 通話時長分布統計
     */
    analyzeCallDurationDistribution() {
        const distribution = ChatAnalyzer.CALL_DURATION_RANGES.map(range => ({
            ...range,
            count: 0,
            totalDuration: 0
        }));

        this.chatData.messages.forEach(message => {
            if (message.type === 'call' && this._getCallType(message) === ChatAnalyzer.CALL_TYPES.SUCCESSFUL) {
                const duration = (message.callMinutes * 60) + message.callSeconds;
                const range = distribution.find(r => duration >= r.min && duration < r.max);
                if (range) {
                    range.count++;
                    range.totalDuration += duration;
                }
            }
        });

        return distribution;
    }

    /**
     * 分析使用者通話行為
     * @return {Object} 使用者通話行為統計
     */
    analyzeUserCallBehavior() {
        const userCallStats = {};

        this.chatData.messages.forEach(message => {
            const callType = this._getCallType(message);
            if (!callType) return;

            const sender = message.sender;
            if (!userCallStats[sender]) {
                userCallStats[sender] = {
                    totalCalls: 0,
                    successfulCalls: 0,
                    missedCalls: 0,
                    missedOutgoingCalls: 0,
                    totalCallDuration: 0,
                    averageCallDuration: 0,
                    callSuccessRate: 0
                };
            }

            userCallStats[sender].totalCalls++;
            switch (callType) {
                case ChatAnalyzer.CALL_TYPES.SUCCESSFUL:
                    userCallStats[sender].successfulCalls++;
                    if (message.type === 'call') {
                        const duration = (message.callMinutes * 60) + message.callSeconds;
                        userCallStats[sender].totalCallDuration += duration;
                    }
                    break;
                case ChatAnalyzer.CALL_TYPES.MISSED:
                    userCallStats[sender].missedCalls++;
                    break;
                case ChatAnalyzer.CALL_TYPES.MISSED_OUTGOING:
                    userCallStats[sender].missedOutgoingCalls++;
                    break;
            }
        });

        // 計算平均通話時長和成功率
        Object.values(userCallStats).forEach(stats => {
            stats.averageCallDuration = stats.successfulCalls > 0 
                ? stats.totalCallDuration / stats.successfulCalls 
                : 0;
            stats.callSuccessRate = stats.totalCalls > 0 
                ? (stats.successfulCalls / stats.totalCalls) * 100 
                : 0;
        });

        return userCallStats;
    }
}
