import DeepSeekAPI from './deepseek-api.js';

class SpaceKnowledgeBase {
    constructor(apiKey) {
        this.knowledgeBase = null;
        this.currentLang = 'en';
        this.supportedLanguages = ['en', 'zh', 'zh-tw'];
        this.deepseek = new DeepSeekAPI(apiKey);
        this.conversationHistory = [];
    }

    async loadData() {
        try {
            const response = await fetch('./space-knowledge-base.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.knowledgeBase = await response.json();
            return true;
        } catch (error) {
            console.error('Error loading knowledge base:', error);
            return false;
        }
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
            zh-tw: `你是一個專門研究嫦娥六號月球任務的AI助手。
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
            
            if (this.isExactMatch(localResults)) {
                return this.formatLocalResponse(localResults);
            }

            const prompt = this.generateContextPrompt(query);
            const response = await this.deepseek.generateResponseWithRetry(prompt, {
                temperature: 0.7,
                maxTokens: 2000
            });

            this.updateConversationHistory(query, response);
            return response;
        } catch (error) {
            console.error('Error generating response:', error);
            return this.getErrorMessage();
        }
    }

    searchByKeyword(keyword) {
        const results = [];
        const lowerKeyword = keyword.toLowerCase();

        // 搜索常见问题
        if (this.knowledgeBase.categories.common_questions) {
            const questions = this.knowledgeBase.categories.common_questions.lunar_exploration;
            for (const qa of questions) {
                if (this.matchesKeyword(qa, lowerKeyword)) {
                    results.push({
                        type: 'qa',
                        content: qa,
                        weight: this.calculateRelevance(qa, lowerKeyword)
                    });
                }
            }
        }

        // 搜索任务信息
        if (this.knowledgeBase.categories.lunar_exploration) {
            const missions = this.knowledgeBase.categories.lunar_exploration.phases;
            for (const phase of Object.values(missions)) {
                for (const mission of Object.values(phase.missions)) {
                    if (this.matchesKeyword(mission, lowerKeyword)) {
                        results.push({
                            type: 'mission',
                            content: mission,
                            weight: this.calculateRelevance(mission, lowerKeyword)
                        });
                    }
                }
            }
        }

        results.sort((a, b) => b.weight - a.weight);
        return results;
    }

    matchesKeyword(item, keyword) {
        const text = JSON.stringify(item).toLowerCase();
        return text.includes(keyword);
    }

    calculateRelevance(item, keyword) {
        const text = JSON.stringify(item).toLowerCase();
        return (text.match(new RegExp(keyword, 'g')) || []).length;
    }

    isExactMatch(results) {
        return results.length > 0 && results[0].weight > 2;
    }

    formatLocalResponse(results) {
        if (results.length === 0) return this.getNoResultsMessage();

        const result = results[0];
        if (result.type === 'qa') {
            return result.content.answer[this.currentLang];
        } else if (result.type === 'mission') {
            return this.formatMissionInfo(result.content);
        }

        return this.getNoResultsMessage();
    }

    updateConversationHistory(query, response) {
        this.conversationHistory.push(
            { role: 'user', content: query },
            { role: 'assistant', content: response }
        );

        if (this.conversationHistory.length > 10) {
            this.conversationHistory = this.conversationHistory.slice(-10);
        }
    }

    getErrorMessage() {
        const messages = {
            en: "I apologize, but I encountered an error. Please try asking your question again.",
            zh: "抱歉，遇到了一个错误。请重新提问。",
            zh-tw: "抱歉，遇到了一個錯誤。請重新提問。"
        };
        return messages[this.currentLang];
    }

    getNoResultsMessage() {
        const messages = {
            en: "I couldn't find specific information about that. Please try asking something else about the Chang'e-6 mission.",
            zh: "抱歉，我没有找到相关信息。请尝试询问其他关于嫦娥六号任务的问题。",
            zh-tw: "抱歉，我沒有找到相關信息。請嘗試詢問其他關於嫦娥六號任務的問題。"
        };
        return messages[this.currentLang];
    }

    formatMissionInfo(mission) {
        const info = [];
        if (mission.name) info.push(mission.name);
        if (mission.launch_date) info.push(`Launch Date: ${mission.launch_date}`);
        if (mission.planned_launch) info.push(`Planned Launch: ${mission.planned_launch}`);
        if (mission.achievements) {
            info.push(`Achievements: ${mission.achievements[this.currentLang].join(', ')}`);
        }
        return info.join('\n');
    }
}

export default SpaceKnowledgeBase;
