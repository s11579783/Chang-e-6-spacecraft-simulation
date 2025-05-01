class MoonAssistant {
    constructor() {
        // Default configuration
        this.config = {
            DEFAULT_LANGUAGE: 'en',
            DEBUG_MODE: false,
            FALLBACK_TO_LOCAL: true,
            DEEPSEEK_API_KEY: null
        };

        // Try to load configuration from window.env if available
        if (window.env) {
            this.config = { ...this.config, ...window.env };
            console.log('Configuration loaded:', this.config);
        }

        this.currentLanguage = this.config.DEFAULT_LANGUAGE;
        this.apiKey = this.config.DEEPSEEK_API_KEY;
        this.isApiEnabled = Boolean(this.apiKey);
        this.debugMode = this.config.DEBUG_MODE;
        this.fallbackToLocal = this.config.FALLBACK_TO_LOCAL;
        
        console.log('AI Assistant initialized:', {
            language: this.currentLanguage,
            apiEnabled: this.isApiEnabled,
            debugMode: this.debugMode,
            fallbackToLocal: this.fallbackToLocal
        });

        // Initialize API if key is available
        if (this.apiKey) {
            this.initializeApi(this.apiKey);
        }

        this.responses = {
            en: {
                welcome: "Hello! I'm Xiao Chang, your Moon Exploration Assistant. How can I help you today?",
                defaultResponse: "I'm here to help you learn about space exploration and the Chang'e-6 mission. You can ask me about:\n1. Chang'e-6 mission details\n2. Moon exploration history\n3. Lunar science\n4. Learning resources",
                resources: {
                    intro: "Here are some recommended learning resources:",
                    list: [
                        "China National Space Administration",
                        "China Manned Space Engineering",
                        "NASA's Moon Exploration Guide",
                        "Space.com's Lunar Exploration Articles",
                        "MIT OpenCourseWare - Space Systems Engineering"
                    ],
                    details: {
                        "China National Space Administration": {
                            description: "Official website of China's space agency, providing comprehensive information about China's space programs including the Chang'e lunar missions.",
                            url: "https://www.cnsa.gov.cn/"
                        },
                        "China Manned Space Engineering": {
                            description: "Official portal for China's manned spaceflight program, featuring mission updates, scientific research, and space station operations.",
                            url: "https://www.cmse.gov.cn/"
                        },
                        "NASA's Moon Exploration Guide": {
                            description: "NASA's comprehensive guide about Moon exploration, including mission history, scientific discoveries, and future plans.",
                            url: "https://moon.nasa.gov/exploration/overview/"
                        },
                        "Space.com's Lunar Exploration Articles": {
                            description: "Latest news and in-depth articles about lunar exploration from Space.com, covering international missions and discoveries.",
                            url: "https://www.space.com/topics/moon"
                        },
                        "MIT OpenCourseWare - Space Systems Engineering": {
                            description: "Free online course materials covering spacecraft design, mission planning, and space technology fundamentals.",
                            url: "https://ocw.mit.edu/courses/16-851-satellite-engineering-fall-2003/"
                        }
                    }
                },
                knowledgeBase: {
                    "change6": {
                        keywords: ["chang'e-6", "change 6", "change-6", "mission", "spacecraft"],
                        response: "Chang'e-6 is China's historic lunar mission that successfully launched on March 5, 2024. Key points:\n- First-ever attempt to return samples from the far side of the Moon\n- Launched from the Wenchang Space Launch Site\n- Aims to collect about 2kg of lunar samples\n- Will help us understand the Moon's far side composition\n- Uses relay satellite Queqiao-2 for communication\n- Carries international payloads from France, Italy, and ESA"
                    },
                    "farside": {
                        keywords: ["far side", "dark side", "moon side"],
                        response: "The far side of the Moon is the hemisphere that always faces away from Earth. Important facts:\n- It's not actually dark, it receives the same amount of sunlight as the near side\n- Has more craters and fewer maria (dark spots) than the near side\n- Radio quiet zone perfect for astronomical observations\n- Chang'e-4 was the first to land there in 2019"
                    },
                    "samples": {
                        keywords: ["samples", "rocks", "materials", "collection"],
                        response: "Lunar sample collection is crucial for understanding the Moon's history. The Chang'e-6 mission will:\n- Use advanced drilling and scooping techniques\n- Collect about 2kg of lunar material\n- Store samples in a special container\n- Return them to Earth for analysis\nThese samples will help us understand the Moon's evolution and composition."
                    },
                    "technology": {
                        keywords: ["technology", "instruments", "equipment", "tools"],
                        response: "Chang'e-6 uses cutting-edge space technology including:\n- Precision landing systems\n- Sample collection tools\n- Advanced communication systems\n- Temperature control systems\n- Relay satellite for far side communication"
                    },
                    "moonHistory": {
                        keywords: ["history", "exploration history", "moon history", "lunar history", "past missions"],
                        response: "Moon exploration history spans several decades:\n\n1. Early Era (1950s-1960s):\n- 1959: Soviet Luna 2 first reaches the Moon\n- 1969: Apollo 11, first human landing\n- 1972: Last Apollo mission\n\n2. Modern Era (1990s-Present):\n- 2007: China's first lunar orbiter Chang'e-1\n- 2013: Chang'e-3, first Chinese lunar landing\n- 2019: Chang'e-4, first far side landing\n- 2020: Chang'e-5, sample return mission\n\n3. Future:\n- Chang'e-6: First far side sample return\n- Planned international lunar stations\n- Commercial lunar missions"
                    },
                    "spaceTech": {
                        keywords: ["space technology", "aerospace", "space science", "engineering", "space tech", "space", "太空"],
                        response: "Modern space technology encompasses several key areas:\n\n1. Propulsion Systems:\n- Chemical rockets\n- Ion engines\n- Solar sails\n\n2. Navigation & Communication:\n- Deep space networks\n- Quantum communication\n- Satellite positioning\n\n3. Life Support Systems:\n- Air and water recycling\n- Radiation protection\n- Temperature control\n\n4. Scientific Instruments:\n- Spectrometers\n- Cameras and sensors\n- Sample analysis tools\n\n5. Materials Science:\n- Heat-resistant materials\n- Lightweight composites\n- Smart materials"
                    },
                    "lunarScience": {
                        keywords: ["lunar science", "moon science", "geology", "moon formation", "moon composition"],
                        response: "Lunar Science Overview:\n\n1. Moon Formation:\n- Giant Impact Theory\n- Age: ~4.51 billion years\n- Composition similar to Earth's mantle\n\n2. Lunar Geology:\n- Maria (dark basaltic plains)\n- Highlands (light, cratered terrain)\n- Impact craters and basins\n\n3. Moon's Interior:\n- Crust (50-150 km thick)\n- Mantle (partially molten)\n- Small iron-rich core\n\n4. Current Research:\n- Water ice in polar craters\n- Helium-3 resources\n- Moonquakes study\n- Impact monitoring"
                    },
                    "spaceMissions": {
                        keywords: ["space missions", "space programs", "space agencies", "future missions"],
                        response: "Current and Future Space Missions:\n\n1. Lunar Missions:\n- NASA's Artemis Program\n- China's Chang'e Series\n- India's Chandrayaan Series\n- Private lunar initiatives\n\n2. Mars Missions:\n- NASA's Mars Sample Return\n- China's Tianwen Series\n- UAE's Hope Mission\n\n3. Deep Space:\n- JWST Observations\n- ESA's PLATO Mission\n- NASA's Dragonfly to Titan\n\n4. Space Stations:\n- ISS Operations\n- Tiangong Space Station\n- Gateway Lunar Station"
                    },
                    "astronomicalEvents": {
                        keywords: ["astronomy", "astronomical", "events", "sky", "observation", "stars", "planets"],
                        response: "Astronomical Events and Observation:\n\n1. Regular Events:\n- Lunar phases and eclipses\n- Meteor showers\n- Planet alignments\n- Seasonal constellations\n\n2. Observation Tips:\n- Best viewing conditions\n- Equipment recommendations\n- Photography techniques\n\n3. Notable Phenomena:\n- Solar activity\n- Comets and asteroids\n- Space weather\n\n4. Amateur Astronomy:\n- Starting tips\n- Equipment selection\n- Online communities"
                    },
                    "spaceCareers": {
                        keywords: ["career", "job", "work", "study", "education", "training"],
                        response: "Space Industry Careers:\n\n1. Technical Roles:\n- Aerospace Engineering\n- Astronautical Engineering\n- Space Systems Design\n- Mission Control Operations\n\n2. Scientific Roles:\n- Astrophysics\n- Planetary Science\n- Space Medicine\n- Astrochemistry\n\n3. Support Roles:\n- Project Management\n- Space Law\n- Space Economics\n- Public Outreach\n\n4. Education Path:\n- Recommended degrees\n- Internship opportunities\n- Research programs\n- Space agencies recruitment"
                    },
                    "moonExploration": {
                        keywords: ["exploration", "moon base", "lunar base", "colony", "settlement"],
                        response: "Moon Exploration and Settlement:\n\n1. Current Plans:\n- Artemis Base Camp\n- International Lunar Research Station\n- Commercial lunar activities\n\n2. Key Technologies:\n- Habitat construction\n- Resource utilization\n- Power systems\n- Life support\n\n3. Scientific Goals:\n- Long-term observation\n- Resource mapping\n- Biological experiments\n- Technology testing\n\n4. Challenges:\n- Radiation protection\n- Dust mitigation\n- Resource management\n- Psychological factors"
                    }
                },
                interactiveFeatures: {
                    calculator: {
                        description: "I can help with space-related calculations. Just ask about:\n- Orbital periods\n- Escape velocities\n- Mission durations\n- Distance calculations",
                        examples: [
                            "Calculate Earth-Moon distance",
                            "How long to orbit the Moon?",
                            "What's the escape velocity from Moon?"
                        ]
                    },
                    quiz: {
                        description: "Test your knowledge with space quizzes! Topics include:\n- Lunar exploration\n- Space technology\n- Astronomy basics\n- Mission history",
                        examples: [
                            "Start a moon quiz",
                            "Test my space knowledge",
                            "Lunar exploration quiz"
                        ]
                    }
                }
            },
            zh: {
                welcome: "你好！我是探月助手小嫦。今天有什麼可以幫到你的嗎？",
                defaultResponse: "我可以在太空探索和嫦娥六號任務方面幫助你。你可以問我：\n1. 嫦娥六號任務詳情\n2. 月球探索歷史\n3. 月球科學\n4. 學習資源",
                resources: {
                    intro: "以下是一些推薦的學習資源：",
                    list: [
                        "中國國家航天局",
                        "中國載人航天工程",
                        "NASA月球探索指南",
                        "Space.com月球探索文章",
                        "MIT開放課程 - 太空系統工程"
                    ],
                    details: {
                        "中國國家航天局": {
                            description: "中國航天事業的官方網站，提供包括嫦娥探月工程在內的中國航天項目綜合信息。",
                            url: "https://www.cnsa.gov.cn/"
                        },
                        "中國載人航天工程": {
                            description: "中國載人航天工程的官方門戶網站，提供載人航天任務、科學研究和空間站運營等最新資訊。",
                            url: "https://www.cmse.gov.cn/"
                        },
                        "NASA月球探索指南": {
                            description: "NASA提供的全面月球探索指南，包括任務歷史、科學發現和未來計劃。",
                            url: "https://moon.nasa.gov/exploration/overview/"
                        },
                        "Space.com月球探索文章": {
                            description: "Space.com提供的最新月球探索新聞和深度文章，涵蓋國際任務和發現。",
                            url: "https://www.space.com/topics/moon"
                        },
                        "MIT開放課程 - 太空系統工程": {
                            description: "免費在線課程資料，涵蓋航天器設計、任務規劃和太空技術基礎。",
                            url: "https://ocw.mit.edu/courses/16-851-satellite-engineering-fall-2003/"
                        }
                    }
                },
                knowledgeBase: {
                    "change6": {
                        keywords: ["嫦娥六號", "嫦娥6號", "嫦娥6", "任務", "太空船"],
                        response: "嫦娥六號是中國具有歷史意義的月球任務，已於2024年3月5日成功發射。主要特點：\n- 首次嘗試從月球背面採集並帶回樣本\n- 從文昌航天發射場發射\n- 計劃收集約2公斤月球樣本\n- 將幫助我們了解月球背面的成分\n- 使用鵲橋二號中繼衛星進行通信\n- 搭載來自法國、意大利和歐空局的國際載荷"
                    },
                    "farside": {
                        keywords: ["背面", "暗面", "月球背面"],
                        response: "月球背面是永遠背對地球的半球。重要知識：\n- 它並不是真的黑暗，接收到的陽光與正面相同\n- 比正面有更多隕石坑，較少月海（深色區域）\n- 是理想的射電天文觀測區域\n- 嫦娥四號在2019年首次在那裡著陸"
                    },
                    "samples": {
                        keywords: ["樣本", "岩石", "物質", "採集"],
                        response: "月球樣本採集對理解月球歷史至關重要。嫦娥六號任務將：\n- 使用先進的鑽探和採樣技術\n- 收集約2公斤月球物質\n- 將樣本存放在特製容器中\n- 將其帶回地球進行分析\n這些樣本將幫助我們理解月球的演化和成分。"
                    },
                    "technology": {
                        keywords: ["技術", "儀器", "設備", "工具"],
                        response: "嫦娥六號使用最先進的太空技術，包括：\n- 精確著陸系統\n- 樣本採集工具\n- 先進的通信系統\n- 溫度控制系統\n- 用於背面通信的中繼衛星"
                    },
                    "moonHistory": {
                        keywords: ["歷史", "探索歷史", "月球歷史", "探月歷史", "過去任務"],
                        response: "月球探索歷史跨越數十年：\n\n1. 早期時代（1950-1960年代）：\n- 1959年：蘇聯月球2號首次到達月球\n- 1969年：阿波羅11號，人類首次登月\n- 1972年：最後一次阿波羅任務\n\n2. 現代時代（1990年代至今）：\n- 2007年：中國首個月球探測器嫦娥一號\n- 2013年：嫦娥三號，中國首次月面著陸\n- 2019年：嫦娥四號，首次月球背面著陸\n- 2020年：嫦娥五號，月球採樣返回\n\n3. 未來展望：\n- 嫦娥六號：首次月球背面採樣返回\n- 規劃中的國際月球站\n- 商業月球任務"
                    },
                    "spaceTech": {
                        keywords: ["太空技術", "航天", "太空科學", "工程", "太空科技", "航天科技", "科技"],
                        response: "現代太空技術包括幾個重要領域：\n\n1. 推進系統：\n- 化學火箭\n- 離子發動機\n- 太陽帆\n\n2. 導航與通信：\n- 深空通信網絡\n- 量子通信\n- 衛星定位\n\n3. 生命支持系統：\n- 空氣和水循環\n- 輻射防護\n- 溫度控制\n\n4. 科學儀器：\n- 光譜儀\n- 相機和感測器\n- 樣本分析工具\n\n5. 材料科學：\n- 耐高溫材料\n- 輕質複合材料\n- 智能材料"
                    },
                    "lunarScience": {
                        keywords: ["月球科學", "月球地質", "月球形成", "月球成分"],
                        response: "月球科學概述：\n\n1. 月球形成：\n- 巨大碰撞理論\n- 年齡：約45.1億年\n- 成分與地球地幔相似\n\n2. 月球地質：\n- 月海（暗色玄武岩平原）\n- 月球高地（明亮的隕石坑地形）\n- 撞擊坑和盆地\n\n3. 月球內部：\n- 月殼（50-150公里厚）\n- 月幔（部分熔融）\n- 小型鐵質核心\n\n4. 當前研究：\n- 極地隕石坑中的水冰\n- 氦-3資源\n- 月震研究\n- 撞擊監測"
                    },
                    "spaceMissions": {
                        keywords: ["太空任務", "太空計劃", "航天機構", "未來任務"],
                        response: "當前和未來太空任務：\n\n1. 月球任務：\n- NASA阿爾忒彌斯計劃\n- 中國嫦娥系列\n- 印度月船系列\n- 私人月球計劃\n\n2. 火星任務：\n- NASA火星樣本返回\n- 中國天問系列\n- 阿聯酋希望號\n\n3. 深空探測：\n- 韋伯望遠鏡觀測\n- ESA柏拉圖任務\n- NASA蜻蜓號探測土衛六\n\n4. 空間站：\n- 國際空間站運營\n- 天宮空間站\n- 月球門戶空間站"
                    },
                    "astronomicalEvents": {
                        keywords: ["天文", "天象", "觀測", "星空", "觀星", "行星"],
                        response: "天文現象與觀測：\n\n1. 常見天象：\n- 月相和月食\n- 流星雨\n- 行星連珠\n- 季節星座\n\n2. 觀測技巧：\n- 最佳觀測條件\n- 設備推薦\n- 攝影技術\n\n3. 特殊現象：\n- 太陽活動\n- 彗星和小行星\n- 太空天氣\n\n4. 業餘天文：\n- 入門指南\n- 設備選擇\n- 線上社群"
                    },
                    "spaceCareers": {
                        keywords: ["職業", "工作", "學習", "教育", "培訓"],
                        response: "太空行業職業：\n\n1. 技術崗位：\n- 航空航天工程\n- 宇航工程\n- 太空系統設計\n- 任務控制操作\n\n2. 科研崗位：\n- 天體物理學\n- 行星科學\n- 太空醫學\n- 太空化學\n\n3. 支持崗位：\n- 項目管理\n- 太空法律\n- 太空經濟\n- 公共教育\n\n4. 教育路徑：\n- 推薦學位\n- 實習機會\n- 研究項目\n- 航天機構招聘"
                    },
                    "moonExploration": {
                        keywords: ["探索", "月球基地", "月球殖民", "月球定居"],
                        response: "月球探索與定居：\n\n1. 當前計劃：\n- 阿爾忒彌斯月球基地\n- 國際月球科研站\n- 商業月球活動\n\n2. 關鍵技術：\n- 棲息地建設\n- 資源利用\n- 能源系統\n- 生命保障\n\n3. 科學目標：\n- 長期觀測\n- 資源勘測\n- 生物實驗\n- 技術測試\n\n4. 挑戰：\n- 輻射防護\n- 月塵防治\n- 資源管理\n- 心理因素"
                    }
                },
                interactiveFeatures: {
                    calculator: {
                        description: "我可以幫助進行太空相關計算。你可以詢問：\n- 軌道週期\n- 逃逸速度\n- 任務時長\n- 距離計算",
                        examples: [
                            "計算地月距離",
                            "環繞月球需要多久？",
                            "月球的逃逸速度是多少？"
                        ]
                    },
                    quiz: {
                        description: "來測試你的太空知識！主題包括：\n- 月球探索\n- 太空技術\n- 天文基礎\n- 任務歷史",
                        examples: [
                            "開始月球測驗",
                            "測試太空知識",
                            "月球探索測驗"
                        ]
                    }
                }
            }
        };
        this.quizzes = {
            en: [
                {
                    question: "What is the approximate distance between Earth and Moon?",
                    options: [
                        "384,400 km",
                        "400,000 km",
                        "500,000 km",
                        "300,000 km"
                    ],
                    correct: 0
                },
                // Add more quiz questions...
            ],
            zh: [
                {
                    question: "地球和月球之間的大約距離是多少？",
                    options: [
                        "384,400公里",
                        "400,000公里",
                        "500,000公里",
                        "300,000公里"
                    ],
                    correct: 0
                },
                // Add more quiz questions...
            ]
        };
        this.currentQuiz = null;
    }

    async initializeApi(apiKey) {
        this.log('Initializing API with key:', 'info', apiKey ? 'Key provided' : 'No key provided');
        if (!apiKey) {
            this.log('No API key provided, API will be disabled', 'warn');
            this.isApiEnabled = false;
            return;
        }

        this.apiKey = apiKey;
        
        try {
            this.log('Testing API connection...');
            const response = await this.makeApiRequest("Test connection");
            if (response) {
                this.isApiEnabled = true;
                this.log('API connection successful and enabled');
            } else {
                this.log('API test failed - no response received', 'error');
                this.isApiEnabled = false;
            }
        } catch (error) {
            this.log('API initialization failed:', 'error', error);
            this.isApiEnabled = false;
        }
    }

    async makeApiRequest(message) {
        if (!this.apiKey) {
            this.log('No API key available', 'warn');
            return null;
        }

        try {
            this.log(`Making API request for message: ${message}`);
            const requestBody = {
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: `You are Xiao Chang, a knowledgeable moon exploration assistant. You specialize in:
                                1. Chang'e-6 mission and Chinese space program
                                2. Lunar science and exploration
                                3. Space technology and rockets
                                4. Space missions and history
                                Always respond in the same language as the user's question.
                                Current language: ${this.currentLanguage}`
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000,
                stream: false
            };

            this.log('API request body:', 'info', requestBody);

            // 使用 base_url: https://api.deepseek.com
            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            this.log(`API response status: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                this.log(`API error response: ${errorText}`, 'error');
                throw new Error(`API request failed with status ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            this.log('API response data:', 'info', data);
            
            if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
                this.log('Invalid API response format', 'error', data);
                throw new Error('Invalid API response format');
            }

            const content = data.choices[0].message.content;
            this.log('API response content:', 'info', content);
            return content;
        } catch (error) {
            this.log(`API request failed: ${error.message}`, 'error');
            if (this.debugMode) {
                console.error('Full error:', error);
            }
            return null;
        }
    }

    async getResponse(message) {
        this.log(`Processing message: ${message}`);
        
        // Try API first if enabled
        if (this.isApiEnabled) {
            try {
                this.log('API is enabled, attempting API request...');
                const apiResponse = await this.makeApiRequest(message);
                if (apiResponse) {
                    this.log('Successfully received API response');
                    return apiResponse;
                } else {
                    this.log('API response was empty, falling back to local response', 'warn');
                }
            } catch (error) {
                this.log(`API request failed: ${error.message}`, 'error');
                this.log('Falling back to local responses', 'warn');
            }
        } else {
            this.log('API is not enabled, using local response');
        }

        // Fall back to local responses if API fails or is disabled
        if (this.fallbackToLocal) {
            this.log('Using local response system');
            return this.getLocalResponse(message);
        } else {
            const errorMessage = this.currentLanguage === 'en' 
                ? "I'm sorry, but I'm currently unable to process your request. Please try again later."
                : "抱歉，我目前無法處理您的請求。請稍後再試。";
            this.log('No fallback available, returning error message');
            return errorMessage;
        }
    }

    getLocalResponse(message) {
        const langResponses = this.responses[this.currentLanguage];
        const knowledgeBase = langResponses.knowledgeBase;
        const lowerMessage = message.toLowerCase();

        // Check for interactive features
        if (this.isCalculatorRequest(lowerMessage)) {
            return this.handleCalculation(lowerMessage);
        }

        if (this.isQuizRequest(lowerMessage)) {
            return this.startQuiz();
        }

        // Check for quiz answer if quiz is active
        if (this.currentQuiz !== null) {
            return this.handleQuizAnswer(message);
        }

        // Check for resource request
        if (lowerMessage.includes('resource') || 
            lowerMessage.includes('學習') || 
            lowerMessage.includes('資源')) {
            return this.formatResources(langResponses.resources);
        }

        // Check for specific resource details
        const resources = langResponses.resources;
        for (const resource of resources.list) {
            if (lowerMessage.includes(resource.toLowerCase())) {
                const details = resources.details[resource];
                const linkText = this.currentLanguage === 'en' ? 'Click here to visit' : '點擊這裡訪問';
                return `${resource}:\n${details.description}\n\n${linkText}: ${details.url}`;
            }
        }

        // Search in knowledge base
        for (const topic in knowledgeBase) {
            const entry = knowledgeBase[topic];
            if (entry.keywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()))) {
                return entry.response;
            }
        }

        // If no specific match is found, try to detect general topics
        if (this.isGeneralQuestion(lowerMessage)) {
            return this.getGeneralResponse(lowerMessage);
        }

        return langResponses.defaultResponse;
    }

    isCalculatorRequest(message) {
        const calculatorKeywords = {
            en: ['calculate', 'compute', 'what is', 'how long', 'distance', 'velocity', 'speed', 'time'],
            zh: ['計算', '算出', '是多少', '要多久', '距離', '速度', '時間']
        };
        return calculatorKeywords[this.currentLanguage].some(keyword => message.toLowerCase().includes(keyword));
    }

    handleCalculation(message) {
        // Simple space calculations
        const calculations = {
            'earth-moon distance': '384,400 km',
            'moon orbit period': '27.3 days',
            'moon escape velocity': '2.38 km/s'
            // Add more calculations as needed
        };

        for (const [key, value] of Object.entries(calculations)) {
            if (message.toLowerCase().includes(key)) {
                return `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`;
            }
        }

        return this.currentLanguage === 'en' 
            ? "I can help with space calculations. Please specify what you'd like to calculate."
            : "我可以幫助進行太空計算。請說明你想計算什麼。";
    }

    isQuizRequest(message) {
        const quizKeywords = {
            en: ['quiz', 'test', 'question'],
            zh: ['測驗', '問題', '題目']
        };
        return quizKeywords[this.currentLanguage].some(keyword => message.toLowerCase().includes(keyword));
    }

    startQuiz() {
        this.currentQuiz = {
            questions: this.quizzes[this.currentLanguage],
            currentQuestion: 0,
            score: 0
        };
        return this.getQuizQuestion();
    }

    getQuizQuestion() {
        const quiz = this.currentQuiz;
        if (!quiz || quiz.currentQuestion >= quiz.questions.length) {
            const finalScore = quiz ? quiz.score : 0;
            this.currentQuiz = null;
            return this.currentLanguage === 'en'
                ? `Quiz completed! Your score: ${finalScore}/${quiz.questions.length}`
                : `測驗完成！你的得分：${finalScore}/${quiz.questions.length}`;
        }

        const question = quiz.questions[quiz.currentQuestion];
        let response = `${question.question}\n\n`;
        question.options.forEach((option, index) => {
            response += `${index + 1}. ${option}\n`;
        });
        return response;
    }

    handleQuizAnswer(message) {
        const quiz = this.currentQuiz;
        const currentQuestion = quiz.questions[quiz.currentQuestion];
        const answer = parseInt(message) - 1;

        if (isNaN(answer) || answer < 0 || answer >= currentQuestion.options.length) {
            return this.currentLanguage === 'en'
                ? "Please enter a valid option number."
                : "請輸入有效的選項編號。";
        }

        if (answer === currentQuestion.correct) {
            quiz.score++;
        }

        quiz.currentQuestion++;
        return this.getQuizQuestion();
    }

    isGeneralQuestion(message) {
        const generalQuestions = {
            en: ['what', 'how', 'why', 'when', 'where', 'who', 'can', 'could'],
            zh: ['什麼', '如何', '為什麼', '何時', '哪裡', '誰', '能', '可以']
        };
        
        return generalQuestions[this.currentLanguage].some(q => message.toLowerCase().includes(q.toLowerCase()));
    }

    getGeneralResponse(message) {
        const responses = {
            en: "That's an interesting question about " + this.extractTopic(message) + ". Let me help you find relevant information. Could you be more specific about what aspect you'd like to know?",
            zh: "關於" + this.extractTopic(message) + "的問題很有趣。讓我幫你找相關信息。你能具體說說你想了解哪個方面嗎？"
        };
        return responses[this.currentLanguage];
    }

    extractTopic(message) {
        // Simple topic extraction based on keywords
        const topics = {
            en: {
                moon: ['moon', 'lunar', 'crater', 'surface'],
                mission: ['mission', 'spacecraft', 'launch', 'landing'],
                science: ['science', 'research', 'study', 'analysis']
            },
            zh: {
                moon: ['月球', '月面', '隕石坑', '表面'],
                mission: ['任務', '太空船', '發射', '著陸'],
                science: ['科學', '研究', '學習', '分析']
            }
        };

        const lowerMessage = message.toLowerCase();
        const currentTopics = topics[this.currentLanguage];

        for (const [topic, keywords] of Object.entries(currentTopics)) {
            if (keywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()))) {
                return topic;
            }
        }

        return this.currentLanguage === 'en' ? 'space exploration' : '太空探索';
    }

    formatResources(resources) {
        let response = resources.intro + '\n\n';
        resources.list.forEach((resource, index) => {
            const details = resources.details[resource];
            const linkText = this.currentLanguage === 'en' ? 'Visit Resource' : '訪問資源';
            response += `${index + 1}. ${resource}\n   ${details.description}\n   <a href="${details.url}" target="_blank">${linkText}</a>\n\n`;
        });
        return response;
    }

    getWelcomeMessage() {
        return this.responses[this.currentLanguage].welcome;
    }

    // Add debug logging
    log(message, type = 'info', data = null) {
        if (this.debugMode) {
            const timestamp = new Date().toISOString();
            const logMessage = data ? `${message} ${JSON.stringify(data)}` : message;
            
            switch (type) {
                case 'error':
                    console.error(`[${timestamp}] ERROR: ${logMessage}`);
                    break;
                case 'warn':
                    console.warn(`[${timestamp}] WARN: ${logMessage}`);
                    break;
                default:
                    console.log(`[${timestamp}] INFO: ${logMessage}`);
            }
        }
    }
}

// Export the class for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MoonAssistant;
} 