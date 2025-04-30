class SpaceKnowledgeBase {
    constructor() {
        this.knowledgeBase = null;
        this.currentLang = 'en';
    }

    // 加载知识库数据
    async loadData() {
        try {
            const response = await fetch('/repository-name/ai-assistant/space-knowledge-base.json');
            this.knowledgeBase = await response.json();
            return true;
        } catch (error) {
            console.error('Error loading knowledge base:', error);
            return false;
        }
    }

    // 设置语言
    setLanguage(lang) {
        this.currentLang = lang;
    }

    // 基础关键词搜索
    searchByKeyword(keyword) {
        const results = [];
        const lowerKeyword = keyword.toLowerCase();

        // 搜索常见问题
        const questions = this.knowledgeBase.categories.common_questions.lunar_exploration;
        for (const qa of questions) {
            if (qa.question[this.currentLang].toLowerCase().includes(lowerKeyword) ||
                qa.answer[this.currentLang].toLowerCase().includes(lowerKeyword)) {
                results.push({
                    type: 'qa',
                    content: {
                        question: qa.question[this.currentLang],
                        answer: qa.answer[this.currentLang]
                    }
                });
            }
        }

        // 搜索任务信息
        const phases = this.knowledgeBase.categories.lunar_exploration.phases;
        for (const phaseKey in phases) {
            const phase = phases[phaseKey];
            for (const missionKey in phase.missions) {
                const mission = phase.missions[missionKey];
                
                // 检查任务名称
                if (mission.name.toLowerCase().includes(lowerKeyword)) {
                    const missionInfo = this.getMissionInfo(mission.name);
                    if (missionInfo) {
                        results.push({
                            type: 'mission',
                            content: missionInfo
                        });
                    }
                }
            }
        }

        // 搜索技术成就
        const achievements = this.knowledgeBase.categories.lunar_exploration.technical_achievements;
        if (achievements) {
            for (const techKey in achievements) {
                const tech = achievements[techKey];
                if (tech.title[this.currentLang].toLowerCase().includes(lowerKeyword)) {
                    results.push({
                        type: 'technology',
                        content: {
                            title: tech.title[this.currentLang],
                            innovations: tech.innovations[this.currentLang]
                        }
                    });
                }
            }
        }

        return results;
    }

    // 获取特定任务信息
    getMissionInfo(missionName) {
        const phases = this.knowledgeBase.categories.lunar_exploration.phases;
        for (const phaseKey in phases) {
            const phase = phases[phaseKey];
            for (const missionKey in phase.missions) {
                const mission = phase.missions[missionKey];
                if (mission.name === missionName) {
                    const missionInfo = {
                        name: mission.name,
                        phase: phase.name[this.currentLang]
                    };

                    // 添加发射日期或计划发射日期
                    if (mission.launch_date) {
                        missionInfo.date = mission.launch_date;
                    } else if (mission.planned_launch) {
                        missionInfo.planned_launch = mission.planned_launch;
                    }

                    // 添加成就或目标
                    if (mission.achievements) {
                        missionInfo.achievements = mission.achievements[this.currentLang];
                    }
                    if (mission.objectives) {
                        missionInfo.objectives = mission.objectives[this.currentLang];
                    }

                    // 添加详细任务信息（如果有）
                    if (mission.mission_details) {
                        missionInfo.details = {
                            landing_site: mission.mission_details.landing_site[this.currentLang],
                            architecture: mission.mission_details.mission_architecture.description[this.currentLang],
                            components: mission.mission_details.mission_architecture.components[this.currentLang]
                        };
                    }

                    return missionInfo;
                }
            }
        }
        return null;
    }

    // 获取相关问题
    getRelatedQuestions(topic) {
        const questions = this.knowledgeBase.categories.common_questions.lunar_exploration;
        return questions.filter(qa => 
            qa.question[this.currentLang].toLowerCase().includes(topic.toLowerCase())
        ).map(qa => ({
            question: qa.question[this.currentLang],
            answer: qa.answer[this.currentLang]
        }));
    }

    // 生成回答
    async generateResponse(query) {
        if (!this.knowledgeBase) {
            return this.currentLang === 'en' 
                ? 'Sorry, the knowledge base is not loaded.' 
                : '抱歉，知识库尚未加载。';
        }

        // Convert query to lowercase for case-insensitive matching
        query = query.toLowerCase();
        
        // Get the appropriate language data
        const data = this.knowledgeBase[this.currentLang];
        
        // Search through the knowledge base
        for (const entry of data) {
            for (const keyword of entry.keywords) {
                if (query.includes(keyword.toLowerCase())) {
                    return entry.response;
                }
            }
        }

        // Default response if no match is found
        return this.currentLang === 'en'
            ? "I'm sorry, I don't have specific information about that. Please try asking about the Chang'e-6 mission, its objectives, or its landing site."
            : "抱歉，我没有相关的具体信息。请尝试询问有关嫦娥六号任务、其目标或着陆点的问题。";
    }
}

export default SpaceKnowledgeBase; 
