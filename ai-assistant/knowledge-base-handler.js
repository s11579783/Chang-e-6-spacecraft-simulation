import DeepSeekAPI from './deepseek-api.js';

class SpaceKnowledgeBase {
    constructor(apiKey) {
        this.knowledgeBase = null;
        this.currentLang = 'en';
        this.supportedLanguages = ['en', 'zh', 'zh-tw'];
        this.deepseek = apiKey ? new DeepSeekAPI(apiKey) : null;
        this.fallbackMode = !apiKey;
        this.conversationHistory = [];
        this.localizedStrings = {
            launchDate: {
                en: 'Launch Date',
                zh: '发射日期',
                'zh-tw': '發射日期'
            },
            plannedLaunch: {
                en: 'Planned Launch',
                zh: '计划发射日期',
                'zh-tw': '計劃發射日期'
            },
            achievements: {
                en: 'Achievements',
                zh: '成就',
                'zh-tw': '成就'
            },
            missionDetails: {
                en: 'Mission Details',
                zh: '任务详情',
                'zh-tw': '任務詳情'
            },
            relatedInfo: {
                en: 'Related Information',
                zh: '相关信息',
                'zh-tw': '相關信息'
            }
        };
    }

    async loadData() {
        try {
            const response = await fetch('./space-knowledge-base.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.knowledgeBase = await response.json();
            
            // 验证知识库结构
            if (!this.validateKnowledgeBase()) {
                throw new Error('Invalid knowledge base structure');
            }
            
            return true;
        } catch (error) {
            console.error('Error loading knowledge base:', error);
            this.logError('loadData', error);
            return false;
        }
    }

    validateKnowledgeBase() {
        const requiredStructure = [
            'categories.lunar_exploration',
            'categories.common_questions',
            'en',
            'zh',
            'zh-tw'
        ];

        return requiredStructure.every(path => {
            const keys = path.split('.');
            let current = this.knowledgeBase;
            return keys.every(key => {
                current = current[key];
                return current !== undefined;
            });
        });
    }

    setLanguage(lang) {
        if (this.supportedLanguages.includes(lang)) {
            this.currentLang = lang;
        } else {
            console.warn(`Unsupported language: ${lang}, falling back to English`);
            this.currentLang = 'en';
        }
    }

    getSystemPrompt() {
        const prompts = {
            en: `You are an AI assistant specializing in the Chang'e-6 lunar mission. 
                Use the provided knowledge base and your expertise to answer questions accurately.
                Always maintain scientific accuracy and cite sources when possible.`,
            zh: `你是一个专门研究嫦娥六号月球任务的AI助手。
                使用提供的知识库和你的专业知识准确回答问题。
                始终保持科学准确性，并在可能的情况下引用来源。`,
            'zh-tw': `你是一個專門研究嫦娥六號月球任務的AI助手。
                使用提供的知識庫和你的專業知識準確回答問題。
                始終保持科學準確性，並在可能的情況下引用來源。`
        };
        return prompts[this.currentLang];
    }

    generateContextPrompt(query) {
        const localResults = this.searchByKeyword(query);
        const contextData = JSON.stringify(localResults, null, 2);
        
        return `
            System: ${this.getSystemPrompt()}
            
            Knowledge Base Context:
            ${contextData}
            
            Conversation History:
            ${this.conversationHistory.map(msg => 
                `${msg.role}: ${msg.content}`).join('\n')
            }
            
            User Query: ${query}
            
            Please provide a detailed response based on the above context and your knowledge.
            If the information is not in the knowledge base, you can use your general knowledge about space exploration and lunar missions.
            Always prioritize accuracy over speculation.
        `;
    }

    async generateResponse(query) {
        try {
            const localResults = this.searchByKeyword(query);
            
            // 如果有精确匹配或者没有 DeepSeek API，使用本地响应
            if (this.isExactMatch(localResults) || this.fallbackMode) {
                return this.formatLocalResponse(localResults);
            }

            // 使用 DeepSeek API
            const prompt = this.generateContextPrompt(query);
            const response = await this.deepseek.generateResponseWithRetry(prompt, {
                temperature: 0.7,
                maxTokens: 2000,
                systemPrompt: this.getSystemPrompt()
            });

            this.updateConversationHistory(query, response);
            return response;
        } catch (error) {
            console.error('Error generating response:', error);
            // 如果 API 调用失败，回退到本地响应
            return this.formatLocalResponse(this.searchByKeyword(query));
        }
    }

    searchByKeyword(keyword) {
        const results = [];
        const lowerKeyword = keyword.toLowerCase();
        const keywords = lowerKeyword.split(/\s+/);  // 支持多关键词搜索

        // 搜索常见问题
        if (this.knowledgeBase.categories.common_questions) {
            const questions = this.knowledgeBase.categories.common_questions.lunar_exploration;
            for (const qa of questions) {
                if (this.matchesKeywords(qa, keywords)) {
                    results.push({
                        type: 'qa',
                        content: qa,
                        weight: this.calculateRelevance(qa, keywords)
                    });
                }
            }
        }

        // 搜索任务信息
        if (this.knowledgeBase.categories.lunar_exploration) {
            this.searchMissionInfo(keywords, results);
        }

        // 搜索技术成就
        if (this.knowledgeBase.categories.lunar_exploration.technical_achievements) {
            this.searchTechnicalAchievements(keywords, results);
        }

        results.sort((a, b) => b.weight - a.weight);
        return results;
    }

    searchMissionInfo(keywords, results) {
        const missions = this.knowledgeBase.categories.lunar_exploration.phases;
        for (const phase of Object.values(missions)) {
            for (const mission of Object.values(phase.missions)) {
                if (this.matchesKeywords(mission, keywords)) {
                    results.push({
                        type: 'mission',
                        content: mission,
                        weight: this.calculateRelevance(mission, keywords)
                    });
                }
            }
        }
    }

    searchTechnicalAchievements(keywords, results) {
        const achievements = this.knowledgeBase.categories.lunar_exploration.technical_achievements;
        for (const [key, achievement] of Object.entries(achievements)) {
            if (this.matchesKeywords(achievement, keywords)) {
                results.push({
                    type: 'technical',
                    content: achievement,
                    weight: this.calculateRelevance(achievement, keywords)
                });
            }
        }
    }

    matchesKeywords(item, keywords) {
        const text = JSON.stringify(item).toLowerCase();
        return keywords.some(keyword => text.includes(keyword));
    }

    calculateRelevance(item, keywords) {
        const text = JSON.stringify(item).toLowerCase();
        return keywords.reduce((weight, keyword) => {
            const matches = (text.match(new RegExp(keyword, 'g')) || []).length;
            return weight + matches;
        }, 0);
    }

    isExactMatch(results) {
        return results.length > 0 && results[0].weight > 2;
    }

    formatLocalResponse(results) {
        if (results.length === 0) return this.getNoResultsMessage();

        const result = results[0];
        let response = '';

        switch (result.type) {
            case 'qa':
                response = result.content.answer[this.currentLang];
                break;
            case 'mission':
                response = this.formatMissionInfo(result.content);
                break;
            case 'technical':
                response = this.formatTechnicalInfo(result.content);
                break;
            default:
                return this.getNoResultsMessage();
        }

        // 添加相关信息
        if (results.length > 1) {
            response += '\n\n' + this.getRelatedInfo(results.slice(1));
        }

        return response;
    }

    formatMissionInfo(mission) {
        const info = [];
        
        // 添加标题
        if (mission.name) {
            info.push(`【${mission.name}】`);
        }

        // 添加基本信息
        if (mission.launch_date) {
            const dateStr = this.formatDate(mission.launch_date, this.currentLang);
            info.push(this.getLocalizedString('launchDate', this.currentLang) + `: ${dateStr}`);
        }

        if (mission.planned_launch) {
            info.push(this.getLocalizedString('plannedLaunch', this.currentLang) + `: ${mission.planned_launch}`);
        }

        // 添加任务详情
        if (mission.mission_details) {
            info.push(this.formatMissionDetails(mission.mission_details));
        }

        // 添加成就
        if (mission.achievements) {
            const achievementsTitle = this.getLocalizedString('achievements', this.currentLang);
            info.push(`${achievementsTitle}:`);
            info.push(mission.achievements[this.currentLang].map(a => `- ${a}`).join('\n'));
        }

        return info.join('\n\n');
    }

    formatTechnicalInfo(technical) {
        const info = [];
        
        // 添加标题
        if (technical.title) {
            info.push(`【${technical.title[this.currentLang]}】`);
        }

        // 添加创新点
        if (technical.innovations) {
            info.push(technical.innovations[this.currentLang].map(i => `- ${i}`).join('\n'));
        }

        return info.join('\n\n');
    }

    getRelatedInfo(results) {
        const relatedTitle = this.getLocalizedString('relatedInfo', this.currentLang);
        const relatedItems = results.slice(0, 3).map(result => {
            switch (result.type) {
                case 'qa':
                    return result.content.question[this.currentLang];
                case 'mission':
                    return result.content.name;
                case 'technical':
                    return result.content.title[this.currentLang];
                default:
                    return '';
            }
        });

        return `${relatedTitle}:\n${relatedItems.map(item => `- ${item}`).join('\n')}`;
    }

    formatDate(dateString, lang) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    }

    getLocalizedString(key, lang) {
        return this.localizedStrings[key][lang] || this.localizedStrings[key]['en'];
    }

    updateConversationHistory(query, response) {
        this.conversationHistory.push(
            { role: 'user', content: query },
            { role: 'assistant', content: response }
        );

        // 保持历史记录在合理范围内
        if (this.conversationHistory.length > 10) {
            this.conversationHistory = this.conversationHistory.slice(-10);
        }
    }

    getErrorMessage() {
        const messages = {
            en: "I apologize, but I encountered an error. Please try asking your question again.",
            zh: "抱歉，遇到了一个错误。请重新提问。",
            'zh-tw': "抱歉，遇到了一個錯誤。請重新提問。"
        };
        return messages[this.currentLang];
    }

    getNoResultsMessage() {
        const messages = {
            en: "I couldn't find specific information about that. Please try asking something else about the Chang'e-6 mission.",
            zh: "抱歉，我没有找到相关信息。请尝试询问其他关于嫦娥六号任务的问题。",
            'zh-tw': "抱歉，我沒有找到相關信息。請嘗試詢問其他關於嫦娥六號任務的問題。"
        };
        return messages[this.currentLang];
    }

    logError(method, error) {
        const errorLog = {
            timestamp: new Date().toISOString(),
            method,
            error: error.message,
            stack: error.stack
        };
        console.error('Knowledge Base Error:', errorLog);
    }
}

export default SpaceKnowledgeBase;
