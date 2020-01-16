import requests
import json
import time

# py3 requests库
# x-token x-username去f12抓 token也是
header = {"accept": "application/json,text/plain, */*",
          "accept-language": "zh,zh-CN;q=0.9,en;q=0.8,zh-TW;q=0.7,en-US;q=0.6",
          "content-type": "application/json;charset=UTF-8",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-token": "e51b059ab0de551756812f2f058654f982335374",
          "x-username": "e51b059ab0de551756812f2f058654f982335374",
        "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36"
          }

data = {"badge": {"type": 24, "color1": "#ff0000", "color2": "#00ff00", "color3": "#0000ff", "param": 0, "flip": False,
                  "_watching": True}}
ret = requests.post(url='https://screeps.com/api/user/badge', headers=header, json=data)
print(ret.text)
