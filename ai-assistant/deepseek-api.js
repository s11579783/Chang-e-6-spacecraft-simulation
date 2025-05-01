class DeepSeekAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.apiEndpoint = 'https://api.deepseek.com/v1';
    }

    async generateResponse(prompt, options = {}) {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: options.model || 'deepseek-chat',
                    messages: [{
                        role: 'user',
                        content: prompt
                    }],
                    temperature: options.temperature || 0.7,
                    max_tokens: options.maxTokens || 2000
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('DeepSeek API Error:', error);
            throw error;
        }
    }

    async generateResponseWithRetry(prompt, options = {}, maxRetries = 3) {
        let retries = 0;
        while (retries < maxRetries) {
            try {
                return await this.generateResponse(prompt, options);
            } catch (error) {
                retries++;
                if (retries === maxRetries) throw error;
                await new Promise(resolve => 
                    setTimeout(resolve, Math.pow(2, retries) * 1000)
                );
            }
        }
    }
}

export default DeepSeekAPI;
