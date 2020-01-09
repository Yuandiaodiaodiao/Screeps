import requests
import json
import time
#py3 requests库
# x-token x-username去f12抓 token也是
header = {
    "accept": "application/json, text/plain, */*", "accept-language": "zh,zh-CN;q=0.9,en;q=0.8,zh-TW;q=0.7,en-US;q=0.6",
    "content-type": "application/json;charset=UTF-8", "sec-fetch-mode": "cors", "sec-fetch-site": "same-origin",
    "x-token": "xxxx", "x-username": "xxxx"}

data={"token":"xxxx"}
ret=requests.post(url='https://screeps.com/api/user/noratelimit',headers=header,json=data)
print(ret.text)