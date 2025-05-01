from openai import OpenAI
import os
import json

# API配置
API_KEY = "sk-4bd30523b64d44d6bb390f62d861538b"

def test_api():
    try:
        print("1. 初始化客户端...")
        client = OpenAI(
            api_key=API_KEY,
            base_url="https://api.deepseek.com/v1"  # 使用DeepSeek的API端点
        )

        # 测试消息
        messages = [
            {
                "role": "system",
                "content": """You are Xiao Chang, a knowledgeable moon exploration assistant. You specialize in:
                            1. Chang'e-6 mission and Chinese space program
                            2. Lunar science and exploration
                            3. Space technology and rockets
                            4. Space missions and history
                            Always respond in Chinese."""
            },
            {
                "role": "user",
                "content": "你知道長征五號火箭嗎？"
            }
        ]

        print("2. 准备API请求数据...")
        request_data = {
            "model": "deepseek-chat",
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 1000,
            "stream": False
        }
        print(f"请求数据：\n{json.dumps(request_data, ensure_ascii=False, indent=2)}")

        print("\n3. 发送API请求...")
        try:
            response = client.chat.completions.create(**request_data)
            print("\n4. 收到API响应")
            print(f"响应类型：{type(response)}")
            print(f"响应内容：\n{response}")
            
            if hasattr(response, 'choices') and response.choices:
                print("\n回复内容：")
                print(response.choices[0].message.content)
            else:
                print("\n警告：响应中没有找到回复内容")
                print(f"完整响应：{response}")
            return True

        except Exception as api_error:
            print(f"\nAPI调用错误：{str(api_error)}")
            if hasattr(api_error, 'response'):
                print(f"错误响应：{api_error.response}")
            raise api_error

    except Exception as e:
        print(f"\n发生错误：{str(e)}")
        print(f"错误类型：{type(e)}")
        if hasattr(e, '__dict__'):
            print(f"错误详情：{e.__dict__}")
        return False

if __name__ == "__main__":
    print("开始测试DeepSeek API...")
    success = test_api()
    print("\n测试结果：", "成功" if success else "失败") 