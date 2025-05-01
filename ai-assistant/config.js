const config = {
    apiKey: 'aaaaaaa', // 替换为实际的 API 密钥
    apiEndpoint: 'https://api.deepseek.com/v1',
    ui: {
        en: {
            title: "Chang'e-6 Mission Assistant",
            placeholder: "Ask me about the Chang'e-6 mission...",
            welcomeMessage: "Hello! I'm your Chang'e-6 mission assistant. How can I help you today?",
            minimizeButton: "Minimize",
            maximizeButton: "Open Assistant",
            searchButton: "Send",
            loadingMessage: "Thinking...",
            noResultsFound: "I couldn't find specific information about that. Please try asking something else about the Chang'e-6 mission.",
            errorMessage: "Sorry, I encountered an error. Please try again.",
            languageSwitch: "切换语言 / 切換語言"
        },
        zh: {
            title: "嫦娥六号任务助手",
            placeholder: "询问关于嫦娥六号任务的问题...",
            welcomeMessage: "你好！我是嫦娥六号任务助手。今天我能为您做些什么？",
            minimizeButton: "最小化",
            maximizeButton: "打开助手",
            searchButton: "发送",
            loadingMessage: "思考中...",
            noResultsFound: "抱歉，我没有找到相关信息。请尝试询问其他关于嫦娥六号任务的问题。",
            errorMessage: "抱歉，出现了错误。请重试。",
            languageSwitch: "Switch to English / 切換繁體"
        },
        "zh-tw": {
            title: "嫦娥六號任務助手",
            placeholder: "詢問關於嫦娥六號任務的問題...",
            welcomeMessage: "你好！我是嫦娥六號任務助手。今天我能為您做些什麼？",
            minimizeButton: "最小化",
            maximizeButton: "開啟助手",
            searchButton: "發送",
            loadingMessage: "思考中...",
            noResultsFound: "抱歉，我沒有找到相關信息。請嘗試詢問其他關於嫦娥六號任務的問題。",
            errorMessage: "抱歉，出現了錯誤。請重試。",
            languageSwitch: "Switch to English / 切换简体"
        }
    }
};

export default config;
