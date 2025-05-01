# 小嫦助手设置指南 / Xiao Chang Assistant Setup Guide

## 环境变量配置 / Environment Variables Setup

1. 在项目根目录创建 `.env` 文件 / Create a `.env` file in the project root:
```bash
touch .env
```

2. 将以下内容复制到 `.env` 文件 / Copy the following content to your `.env` file:
```env
# DeepSeek API Configuration
# Replace 'your_api_key_here' with your actual DeepSeek API key
# Example: DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DEEPSEEK_API_KEY=your_api_key_here

# Application Settings
# Set to 'true' to enable debug logging
DEBUG_MODE=false

# Set to 'true' to use local responses when API is unavailable
FALLBACK_TO_LOCAL=true

# Language Settings
# Default language for the assistant (en/zh)
DEFAULT_LANGUAGE=en
```

3. 替换API密钥 / Replace the API key:
   - 获取你的 DeepSeek API 密钥 / Get your DeepSeek API key
   - 将 `your_api_key_here` 替换为实际的 API 密钥 / Replace `your_api_key_here` with your actual API key

## 安全提示 / Security Notes

1. 永远不要提交 `.env` 文件到版本控制系统 / Never commit the `.env` file to version control
2. 确保 `.env` 已经添加到 `.gitignore` / Make sure `.env` is added to `.gitignore`
3. 定期轮换 API 密钥 / Rotate your API keys periodically
4. 不要在公共场合分享你的 API 密钥 / Don't share your API key in public

## 本地开发 / Local Development

1. 复制环境变量模板 / Copy the environment template:
```bash
cp setup-guide.md .env
```

2. 编辑 `.env` 文件配置你的设置 / Edit the `.env` file with your settings

3. 启动应用程序 / Start the application

## 故障排除 / Troubleshooting

如果遇到 API 相关问题 / If you encounter API-related issues:

1. 确认 API 密钥格式正确 / Verify API key format
2. 检查环境变量是否正确加载 / Check if environment variables are properly loaded
3. 确认网络连接 / Verify network connectivity
4. 查看控制台错误信息 / Check console for error messages

## 配置选项 / Configuration Options

- `DEBUG_MODE`: 启用详细日志记录 / Enable detailed logging
- `FALLBACK_TO_LOCAL`: 在 API 不可用时使用本地响应 / Use local responses when API is unavailable
- `DEFAULT_LANGUAGE`: 设置默认语言（en/zh） / Set default language (en/zh) 