class SpaceKnowledgeBase {
    constructor() {
        this.knowledgeBase = null;
        this.currentLang = 'en';
        this.supportedLanguages = ['en', 'zh', 'zh-tw'];
    }

    // 加载知识库数据
    async loadData() {
        try {
            if (this.knowledgeBase) {
                return true; // 如果已经加载过，直接返回
            }

            const response = await fetch('./space-knowledge-base.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // 验证数据结构
            if (!this.validateKnowledgeBase(data)) {
                throw new Error('Invalid knowledge base structure');
            }

            this.knowledgeBase = data;
            return true;
        } catch (error) {
            console.error('Error loading knowledge base:', error);
            return false;
        }
    }

    // 验证知识库结构
    validateKnowledgeBase(data) {
        return data &&
            data.categories &&
            data.categories.lunar_exploration &&
            data.categories.common_questions;
    }

    // 设置语言
    setLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            console.warn(`Unsupported language: ${lang}, falling back to English`);
            this.currentLang = 'en';
            return;
        }
        this.currentLang = lang;
    }

    // 基础关键词搜索
    searchByKeyword(keyword) {
        const results = [];
        const lowerKeyword = keyword.toLowerCase();

        // 搜索常见问题
        const questions = this.knowledgeBase.categories.common_questions.lunar_exploration;
        for (const qa of questions) {
            const questionMatch = qa.question[this.currentLang].toLowerCase();
            const answerMatch = qa.answer[this.currentLang].toLowerCase();
            
            // 完全匹配
            if (questionMatch === lowerKeyword || answerMatch === lowerKeyword) {
                results.unshift({
                    type: 'qa',
                    content: {
                        question: qa.question[this.currentLang],
                        answer: qa.answer[this.currentLang]
                    },
                    weight: 3
                });
            } 
            // 部分匹配
            else if (questionMatch.includes(lowerKeyword) || answerMatch.includes(lowerKeyword)) {
                results.push({
                    type: 'qa',
                    content: {
                        question: qa.question[this.currentLang],
                        answer: qa.answer[this.currentLang]
                    },
                    weight: 1
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
                            content: missionInfo,
                            weight: mission.name.toLowerCase() === lowerKeyword ? 3 : 2
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
                        },
                        weight: tech.title[this.currentLang].toLowerCase() === lowerKeyword ? 3 : 1
                    });
                }
            }
        }

        // 按权重排序
        results.sort((a, b) => b.weight - a.weight);
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
                    if (mission.mission_details && mission.mission_details.objectives) {
                        missionInfo.objectives = mission.mission_details.objectives[this.currentLang];
                    }

                    // 添加详细任务信息
                    if (mission.mission_details) {
                        missionInfo.details = {
                            landing_site: mission.mission_details.landing_site[this.currentLang],
                            architecture: mission.mission_details.mission_architecture.description[this.currentLang],
                            components: mission.mission_details.mission_architecture.components[this.currentLang]
                        };

                        // 添加国际合作信息
                        if (mission.mission_details.international_cooperation) {
                            missionInfo.details.cooperation = mission.mission_details.international_cooperation;
                        }
                    }

                    // 添加技术创新
                    if (mission.technical_innovations) {
                        missionInfo.technical = mission.technical_innovations;
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
        const results = questions.filter(qa => 
            qa.question[this.currentLang].toLowerCase().includes(topic.toLowerCase())
        ).map(qa => ({
            question: qa.question[this.currentLang],
            answer: qa.answer[this.currentLang],
            weight: qa.question[this.currentLang].toLowerCase() === topic.toLowerCase() ? 2 : 1
        }));

        results.sort((a, b) => b.weight - a.weight);
        return results;
    }

    // 生成回答
    async generateResponse(query) {
        if (!this.knowledgeBase) {
            return this.currentLang === 'en' 
                ? 'Sorry, the knowledge base is not loaded.' 
                : '抱歉，知识库尚未加载。';
        }

        const lowerQuery = query.toLowerCase().trim();
        
        // 如果查询为空
        if (!lowerQuery) {
            return this.getDefaultResponse();
        }

        // 首先尝试搜索关键词
        const searchResults = this.searchByKeyword(lowerQuery);
        
        if (searchResults.length > 0) {
            const result = searchResults[0];
            return this.formatResponse(result);
        }

        // 如果没有直接匹配，检查是否是关于嫦娥六号的查询
        if (lowerQuery.includes('chang\'e-6') || lowerQuery.includes('嫦娥六号')) {
            const ce6Info = this.getMissionInfo('Chang\'e-6');
            if (ce6Info) {
                return this.formatMissionInfo(ce6Info);
            }
        }

        // 尝试模糊匹配
        const keywords = lowerQuery.split(/\s+/);
        for (const keyword of keywords) {
            if (keyword.length > 2) { // 忽略太短的词
                const fuzzyResults = this.searchByKeyword(keyword);
                if (fuzzyResults.length > 0) {
                    return this.formatResponse(fuzzyResults[0]);
                }
            }
        }

        // 尝试获取相关问题
        const relatedQuestions = this.getRelatedQuestions(lowerQuery);
        if (relatedQuestions.length > 0) {
            return relatedQuestions[0].answer;
        }

        return this.getDefaultResponse();
    }

    // 格式化响应
    formatResponse(result) {
        switch (result.type) {
            case 'qa':
                return result.content.answer;
            case 'mission':
                return this.formatMissionInfo(result.content);
            case 'technology':
                return this.formatTechnologyInfo(result.content);
            default:
                return this.getDefaultResponse();
        }
    }

    // 获取默认响应
    getDefaultResponse() {
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
                architecture: 'Mission Architecture',
                cooperation: 'International Cooperation',
                technical: 'Technical Innovations'
            },
            zh: {
                phase: '阶段',
                launch: '发射日期',
                planned: '计划发射',
                achievements: '成就',
                objectives: '目标',
                landingSite: '着陆点',
                components: '任务组成',
                architecture: '任务架构',
                cooperation: '国际合作',
                technical: '技术创新'
            }
        };

        const t = texts[lang];
        const sections = [];

        // 基本信息
        sections.push(`【${missionInfo.name}】`);
        sections.push(`${t.phase}: ${missionInfo.phase}`);

        // 日期信息
        if (missionInfo.date) {
            sections.push(`${t.launch}: ${missionInfo.date}`);
        } else if (missionInfo.planned_launch) {
            sections.push(`${t.planned}: ${missionInfo.planned_launch}`);
        }

        // 成就和目标
        if (missionInfo.achievements) {
            sections.push(`${t.achievements}:\n${missionInfo.achievements.map(a => `• ${a}`).join('\n')}`);
        }
        if (missionInfo.objectives) {
            sections.push(`${t.objectives}:\n${missionInfo.objectives.map(o => `• ${o}`).join('\n')}`);
        }

        // 详细信息
        if (missionInfo.details) {
            sections.push(`${t.landingSite}: ${missionInfo.details.landing_site}`);
            sections.push(`${t.components}: ${missionInfo.details.components.join('、')}`);
            sections.push(`${t.architecture}: ${missionInfo.details.architecture}`);

            // 国际合作信息
            if (missionInfo.details.cooperation) {
                const cooperation = missionInfo.details.cooperation.payloads.map(payload => 
                    `• ${payload.name} (${payload.country}): ${payload.purpose[this.currentLang]}`
                ).join('\n');
                sections.push(`${t.cooperation}:\n${cooperation}`);
            }
        }

        // 技术创新
        if (missionInfo.technical) {
            const innovations = Object.entries(missionInfo.technical).map(([key, value]) => {
                return `• ${value[this.currentLang].join('\n• ')}`;
            }).join('\n');
            sections.push(`${t.technical}:\n${innovations}`);
        }

        return sections.join('\n\n');
    }

    // 格式化技术信息
    formatTechnologyInfo(techInfo) {
        const sections = [];
        sections.push(`【${techInfo.title}】`);
        sections.push(techInfo.innovations.map(innovation => `• ${innovation}`).join('\n'));
        return sections.join('\n\n');
    }
}

export default SpaceKnowledgeBase;
