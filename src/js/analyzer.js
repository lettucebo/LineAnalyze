/**
 * ChatAnalyzer Class - Analyzes parsed LINE chat data
 * Generates statistics and metrics from chat messages
 */
class ChatAnalyzer {
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
            wordFrequency: this.analyzeWordFrequency()
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
     * Analyze word frequency in text messages
     * @return {Object} Object with words as keys and frequencies as values
     */    analyzeWordFrequency() {
        const wordCounts = {};
        const stopWords = this.getStopWords();
        
        // Process all text messages
        this.chatData.messages.forEach(message => {
            if (message.type === "text") {
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
                        .split(/\s+/);                                // Split by whitespace
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
}
