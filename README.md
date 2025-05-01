# Chang'e 6 Spacecraft Simulation Assistant

这是一个基于 DeepSeek API 的智能助手系统，专门用于嫦娥六号探月工程的相关问答和信息查询。

## 功能特点

- 支持中英文双语交互
- 专业的探月知识库
- 实时API响应
- 友好的用户界面
- 详细的技术文档

## 技术栈

- 前端：HTML, CSS, JavaScript
- 后端：Python
- API：DeepSeek Chat API
- 开发工具：VS Code, Python 3.x

## 快速开始

1. 克隆仓库
```bash
git clone https://github.com/[您的用户名]/Chang-e-6-spacecraft-simulation.git
cd Chang-e-6-spacecraft-simulation
```

2. 安装依赖
```bash
pip install openai
```

3. 配置API密钥
- 在 `ai-assistant/test_api.py` 中设置您的 DeepSeek API 密钥
- 或者设置环境变量：`DEEPSEEK_API_KEY`

4. 运行测试
```bash
python ai-assistant/test_api.py
```

5. 启动Web界面
- 打开 `ai-assistant/index.html` 即可使用Web界面

## 项目结构

```
Chang-e-6-spacecraft-simulation/
├── ai-assistant/
│   ├── assistant.js      # 主要的助手逻辑
│   ├── index.html        # Web界面
│   └── test_api.py       # API测试脚本
├── .gitignore
└── README.md
```

## 注意事项

- 使用前请确保已有 DeepSeek API 密钥
- API 调用需要保证账户有足够的余额
- 建议在使用前先运行测试脚本确认 API 连接正常

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。

## 许可证

MIT License 