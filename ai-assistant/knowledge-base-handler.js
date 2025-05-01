class SpaceKnowledgeBase {
    constructor() {
        this.knowledgeBase = null;
        this.currentLang = 'en';
    }

    // 加载知识库数据
    async loadData() {
        try {
            // 使用相对路径
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

        // 将查询转换为小写以进行不区分大小写的匹配
        const lowerQuery = query.toLowerCase();

        // 首先尝试搜索关键词
        const searchResults = this.searchByKeyword(lowerQuery);
        
        if (searchResults.length > 0) {
            // 根据结果类型生成回答
            const result = searchResults[0]; // 取第一个最相关的结果
            switch (result.type) {
                case 'qa':
                    return result.content.answer;
                case 'mission':
                    return this.formatMissionInfo(result.content);
                case 'technology':
                    return this.formatTechnologyInfo(result.content);
            }
        }

        // 如果没有直接匹配，检查是否是关于嫦娥六号的查询
        if (lowerQuery.includes('chang\'e-6') || lowerQuery.includes('嫦娥六号')) {
            const ce6Info = this.getMissionInfo('Chang\'e-6');
            if (ce6Info) {
                return this.formatMissionInfo(ce6Info);
            }
        }

        // 尝试获取相关问题
        const relatedQuestions = this.getRelatedQuestions(lowerQuery);
        if (relatedQuestions.length > 0) {
            return relatedQuestions[0].answer;
        }

        // 默认回答
        return this.currentLang === 'en'
            ? "I can help you with information about the Chang'e-6 mission and China's lunar exploration program. You can ask about mission objectives, landing sites, technical details, or previous Chang'e missions."
            : "我可以为您提供有关嫦娥六号任务和中国探月工程的信息。您可以询问任务目标、着陆点、技术细节或之前的嫦娥任务。";
    }

    // 格式化任务信息
    formatMissionInfo(missionInfo) {
        if (!missionInfo) return '';

        const lang = this.currentLang;
        const texts = {
            en: {
                phase: 'Phase',
                launch: 'Launch Date',
                planned: 'Planned Launch',
                achievements: 'Achievements',
                objectives: 'Objectives',
                landingSite: 'Landing Site',
                components: 'Mission Components',
                architecture: 'Mission Architecture'
            },
            zh: {
                phase: '阶段',
                launch: '发射日期',
                planned: '计划发射',
                achievements: '成就',
                objectives: '目标',
                landingSite: '着陆点',
                components: '任务组成',
                architecture: '任务架构'
            }
        };

        const t = texts[lang];
        let response = `${missionInfo.name}\n`;
        response += `${t.phase}: ${missionInfo.phase}\n`;
        
        if (missionInfo.date) {
            response += `${t.launch}: ${missionInfo.date}\n`;
        } else if (missionInfo.planned_launch) {
            response += `${t.planned}: ${missionInfo.planned_launch}\n`;
        }

        if (missionInfo.achievements) {
            response += `${t.achievements}:\n- ${missionInfo.achievements.join('\n- ')}\n`;
        }

        if (missionInfo.objectives) {
            response += `${t.objectives}:\n- ${missionInfo.objectives.join('\n- ')}\n`;
        }

        if (missionInfo.details) {
            response += `${t.landingSite}: ${missionInfo.details.landing_site}\n`;
            response += `${t.components}: ${missionInfo.details.components.join(', ')}\n`;
            response += `${t.architecture}: ${missionInfo.details.architecture}\n`;
        }

        return response;
    }

    // 格式化技术信息
    formatTechnologyInfo(techInfo) {
        const response = `${techInfo.title}\n\n`;
        return response + techInfo.innovations.map(innovation => `- ${innovation}`).join('\n');
    }
}

export default SpaceKnowledgeBase; 
