# LINE聊天分析器

LINE聊天分析器是一個前端網站，幫助使用者分析匯出的 LINE 聊天紀錄。透過這個工具，用戶可以獲取各種統計數據和視覺化圖表，深入了解他們的聊天習慣和互動模式。

![LINE聊天分析器截圖](./images/Screenshot_16-5-2025_14517_127.0.0.1.jpeg)

## 功能特點

- **檔案上傳**：支援上傳 LINE 聊天紀錄匯出檔案 (.txt 格式)
- **語言支援**：同時支援中文版本與英文版本的 LINE 聊天記錄
- **基本統計**：
  - 聊天天數
  - 訊息總數
  - 通話總數
  - 總通話時間
  - 最多單日訊息數量與發生日期
  - 最多單日通話時間與發生日期
- **使用者分析**：
  - 每位使用者的訊息數量
  - 每位使用者的貼圖數量
  - 每位使用者的照片數量
  - 每位使用者的通話次數與時間
- **視覺化圖表**：
  - 每日訊息數量趨勢圖
  - 使用者訊息比例圓餅圖
  - 每日通話時間趨勢圖
  - 文字雲顯示最常出現的30個字詞

## 技術使用

- **前端框架**：HTML5, CSS3, JavaScript (ES6+)
- **UI 框架**：Bootstrap 5
- **圖表庫**：Chart.js
- **文字雲**：D3.js 與 d3-cloud
- **圖標庫**：Font Awesome
- **CDN 服務**：Cloudflare CDN

## 如何使用

### 本機啟動方法

1. 將專案克隆或下載到您的本機電腦

2. 開啟終端機，進入專案目錄

3. 使用任何 HTTP 伺服器啟動專案，例如：

   **使用 Python 3 內建的 HTTP 伺服器**：
   ```
   cd src
   python -m http.server 8080
   ```

   **使用 Node.js 的 http-server**（需先安裝 `http-server`）：
   ```
   npm install -g http-server
   cd src
   http-server -p 8080
   ```

4. 在瀏覽器中訪問 `http://localhost:8080` 即可使用本應用

### 直接使用 HTML 檔案

1. 將專案檔案下載到本地電腦
2. 開啟 `src` 資料夾
3. 雙擊 `index.html` 檔案
4. 網站將在您的預設瀏覽器中開啟

## 使用說明

1. 點擊「選擇檔案」按鈕，選擇您從 LINE 匯出的聊天記錄文件（.txt 格式）
2. 點擊「分析」按鈕
3. 等待系統處理您的檔案（檔案不會上傳到任何伺服器，所有處理均在本地瀏覽器中完成）
4. 查看分析結果和圖表

## 注意事項

- 本工具僅在本地瀏覽器中處理資料，不會將您的聊天記錄上傳到任何伺服器
- 支援中文和英文兩種版本的 LINE 聊天記錄格式
- 建議使用較新版本的現代瀏覽器（如 Chrome、Firefox、Edge、Safari 等）以獲得最佳使用體驗
- 對於較大的聊天記錄檔案，分析可能需要一些時間

## 專案結構

```
LineAnalyze/
│
├── src/                   # 源碼目錄
│   ├── index.html         # 主要 HTML 頁面
│   ├── css/               # CSS 樣式表
│   │   └── style.css      # 自訂樣式
│   ├── js/                # JavaScript 文件
│   │   ├── parser.js      # 聊天記錄解析器
│   │   ├── analyzer.js    # 數據分析器
│   │   ├── charts.js      # 圖表生成器
│   │   └── main.js        # 主要程式邏輯
│   └── assets/            # 靜態資源（圖片等）
│
├── data/                  # 示例聊天記錄
│   ├── chat-en.txt        # 英文聊天記錄範例
│   └── chat-tw.txt        # 中文聊天記錄範例
│
├── images/                # 圖片資源
│   └── Screenshot...jpeg  # 網站截圖
│
└── README.md              # 專案說明文件
```

## 開發者資訊

此項目是使用 HTML、JavaScript 和 CSS 建立的前端網站，專門用於分析 LINE 聊天記錄。

## 授權資訊

本專案供個人學習和研究使用。
