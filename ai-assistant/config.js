import 'dotenv/config';

const config = {
    // API 配置
    api: {
        key: process.env.DEEPSEEK_API_KEY || '', // 从环境变量获取 API 密钥
        endpoint: process.env.API_ENDPOINT || 'https://api.deepseek.com/v1',
        options: {
            defaultModel: 'deepseek-chat',
            temperature: 0.7,
            maxTokens: 2000,
            maxRetries: 3
        }
    },

    // UI 配置
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
            languageSwitch: "切换语言 / 切換語言",
            copyButton: "Copy",
            clearButton: "Clear Chat",
            reconnectMessage: "Reconnecting...",
            networkError: "Network connection lost. Trying to reconnect..."
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
            languageSwitch: "Switch to English / 切換繁體",
            copyButton: "复制",
            clearButton: "清空对话",
            reconnectMessage: "正在重新连接...",
            networkError: "网络连接断开，正在尝试重新连接..."
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
            languageSwitch: "Switch to English / 切换简体",
            copyButton: "複製",
            clearButton: "清空對話",
            reconnectMessage: "正在重新連接...",
            networkError: "網絡連接斷開，正在嘗試重新連接..."
        }
    },

    // 样式配置
    style: {
        theme: {
            light: {
                primary: '#1a73e8',
                secondary: '#1557b0',
                background: '#ffffff',
                text: '#333333',
                border: '#e0e0e0'
            },
            dark: {
                primary: '#4285f4',
                secondary: '#1a73e8',
                background: '#1f1f1f',
                text: '#ffffff',
                border: '#333333'
            }
        },
        animation: {
            transition: '0.3s ease',
            loadingDots: '1.5s steps(5, end) infinite'
        }
    },

    // 系统配置
    system: {
        maxHistoryLength: 10,
        autoSave: true,
        debugMode: process.env.DEBUG_MODE === 'true',
        defaultLanguage: 'en',
        supportedLanguages: ['en', 'zh', 'zh-tw']
    }
};

// 验证必要的环境变量
if (!config.api.key) {
    console.error('Warning: DEEPSEEK_API_KEY is not set in environment variables');
}

export default config; 
