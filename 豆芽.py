import requests

api_url = 'https://api.douyadaili.com/proxy/?service=AddWhite&authkey=mhxSKP840qdyOsd3N9UZ'

try:
    # 发送GET请求
    response = requests.get(api_url)
    
    # 抛出异常如果响应状态码不是200
    response.raise_for_status()
    
    # 获取响应体作为文本（如果API可能返回非JSON数据）
    body = response.text
    
    # 打印响应体
    print(body)
    
    # 打印成功消息
    print('已成功获取响应数据')

except requests.exceptions.HTTPError as errh:
    # 打印HTTP错误
    print("打印HTTP错误:", errh)

except requests.exceptions.ConnectionError as errc:
    # 打印连接错误
    print("打印连接错误:", errc)

except requests.exceptions.Timeout as errt:
    # 打印超时错误
    print("打印超时错误:", errt)

except requests.exceptions.RequestException as err:
    # 打印其他类型的请求异常
    print("打印其他类型的请求异常", err)