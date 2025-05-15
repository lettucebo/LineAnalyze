/**
 * LineParser Class - Parses LINE chat export files
 * Handles both English and Traditional Chinese format
 */
class LineParser {    /**
     * Constructor for LineParser
     */
    constructor() {
        // Pattern to detect the export format (English or Chinese)
        this.patternEN = /Chat history with/;
        this.patternTW = /\[LINE\] 與.+的聊天記錄/;
        
        // Regular expressions for parsing different formats
        this.datePatternEN = /^([A-Za-z]+), (\d{1,2}\/\d{1,2}\/\d{4})$/;
        this.datePatternTW = /^(\d{4}\/\d{1,2}\/\d{1,2})（[週|星期][一|二|三|四|五|六|日|天]）$/;
        
        // Regular expressions for message format
        this.messagePatternEN = /^(\d{2}:\d{2})\t(.+?)\t(.+)$/;
        this.messagePatternTW = /^(\d{2}:\d{2})\t(.+?)\t(.+)$/;        // Regular expressions for call time (support both mm:ss and hh:mm:ss formats)
        this.callPatternEN = /Call time ((\d+):)?(\d+):(\d+)/;
        this.callPatternTW = /通話時間 ((\d+):)?(\d+):(\d+)/;
        
        // Regular expressions for stickers and photos
        this.stickerPatternEN = /\[(Sticker|Animation)\]/;
        this.stickerPatternTW = /\[(貼圖|動態貼圖)\]/;
        this.photoPatternEN = /\[(Photo|Video|File)\]/;
        this.photoPatternTW = /\[(照片|影片|檔案)\]/;
        
        // Regular expressions for system messages and notes
        this.systemMessageEN = /^(.+) (has joined|has left|changed the group name to|changed the group image)/;
        this.systemMessageTW = /^(.+) (加入聊天|退出了聊天|將群組名稱改為|更改了群組圖片)/;
        
        // Additional patterns
        this.locationPatternEN = /\[Location\]/;
        this.locationPatternTW = /\[位置\]/;
        this.audioPatternEN = /\[Voice message\]/;
        this.audioPatternTW = /\[語音訊息\]/;
    }
    
    /**
     * Parses the chat file content
     * @param {string} content - The content of the chat file
     * @return {Object} Parsed chat data
     */
    parse(content) {
        // Determine the format (EN or TW)
        const isEN = this.patternEN.test(content);
        const isTW = this.patternTW.test(content);
        
        if (!isEN && !isTW) {
            throw new Error("Unsupported LINE chat format");
        }
        
        const format = isEN ? "EN" : "TW";
        console.log(`Detected format: ${format}`);
        
        // Split content into lines
        const lines = content.split("\n");
        
        // Chat metadata
        const chatData = {
            format: format,
            chatName: "",
            saveDate: "",
            messages: [],
            dates: [],
            currentDate: ""
        };
        
        // Extract chat name and save date
        if (format === "EN") {
            // Extract from first two lines
            if (lines.length >= 2) {
                chatData.chatName = lines[0].replace("Chat history with ", "").trim();
                chatData.saveDate = lines[1].replace("Saved on: ", "").trim();
            }
        } else {
            // TW format
            if (lines.length >= 2) {
                chatData.chatName = lines[0].replace("[LINE] 與", "").replace("的聊天記錄", "").trim();
                chatData.saveDate = lines[1].replace("儲存日期：", "").trim();
            }
        }
        
        // Process lines
        for (let i = 2; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Skip empty lines
            if (!line) continue;
            
            // Check if it's a date line
            const dateMatch = format === "EN" ? 
                line.match(this.datePatternEN) :
                line.match(this.datePatternTW);
                
            if (dateMatch) {
                // Parse date
                let dateStr;
                if (format === "EN") {
                    dateStr = dateMatch[2]; // Format: MM/DD/YYYY
                } else {
                    dateStr = dateMatch[1]; // Format: YYYY/MM/DD
                }
                
                chatData.currentDate = dateStr;
                
                // Add to dates array if new
                if (!chatData.dates.includes(dateStr)) {
                    chatData.dates.push(dateStr);
                }
                
                continue;
            }
            
            // Check if it's a message line
            const messageMatch = format === "EN" ?
                line.match(this.messagePatternEN) :
                line.match(this.messagePatternTW);
                
            if (messageMatch && chatData.currentDate) {                const time = messageMatch[1];
                const sender = messageMatch[2];
                const content = messageMatch[3];
                
                // Determine message type (text, sticker, photo, call)
                let type = "text";
                let callMinutes = 0;
                let callSeconds = 0;
                
                // Check for sticker
                if ((format === "EN" && this.stickerPatternEN.test(content)) ||
                    (format === "TW" && this.stickerPatternTW.test(content))) {
                    type = "sticker";
                }
                // Check for photo
                else if ((format === "EN" && this.photoPatternEN.test(content)) ||
                         (format === "TW" && this.photoPatternTW.test(content))) {
                    type = "photo";
                }
                // Check for call
                else {                    const callMatch = format === "EN" ?
                        content.match(this.callPatternEN) :
                        content.match(this.callPatternTW);
                          if (callMatch) {
                        type = "call";
                        
                        // Handle both hh:mm:ss and mm:ss formats
                        if (callMatch[1] !== undefined) {
                            // If format is hh:mm:ss (e.g., "1:04:16")
                            const hours = parseInt(callMatch[2], 10);
                            callMinutes = parseInt(callMatch[3], 10) + (hours * 60);
                            callSeconds = parseInt(callMatch[4], 10);
                        } else {
                            // If format is just mm:ss (e.g., "5:21")
                            callMinutes = parseInt(callMatch[3], 10);
                            callSeconds = parseInt(callMatch[4], 10);
                        }
                    }
                }
                
                // Add message to the array
                chatData.messages.push({
                    date: chatData.currentDate,
                    time: time,
                    sender: sender,
                    content: content,
                    type: type,
                    callMinutes: callMinutes,
                    callSeconds: callSeconds
                });
            }
        }
        
        return chatData;
    }
}
