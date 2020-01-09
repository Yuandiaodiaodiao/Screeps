import requests
import json
import time
# x-token x-username去f12抓 token也是
header = {
    "accept": "application/json, text/plain, */*", "accept-language": "zh,zh-CN;q=0.9,en;q=0.8,zh-TW;q=0.7,en-US;q=0.6",
    "content-type": "application/json;charset=UTF-8", "sec-fetch-mode": "cors", "sec-fetch-site": "same-origin",
    "x-token": "0d6505f974584bcb9f6b2d16b3e1becbbf830172", "x-username": "0d6505f974584bcb9f6b2d16b3e1becbbf830172"}
data={"token":"98cb47cb"}

while True:
    time.sleep(3600)
    ret=requests.post(url='https://screeps.com/api/user/noratelimit',headers=header,json=data)
    print(ret.text) 