/*
仙术!!!!
封号警告!!!! 使用者请考虑清楚是否违反游戏用户协议
step:
1 node运行环境
2. npm install node-fetch
3. 启动chrome 打开pc页面
4.f12开启调试模式 并切到network标签
5. 创建一个pc随便点一级技能  会发现有一个create 和一个upgrade的包发出去 点那个upgrade的包
找到cookie xtoken xusername id 分别对应代码中的cookie xtoken xusername 和pcid
自己把变量改好
在powers变量里填入你想升级的数据
然后node xxx.js启动脚本



 */

const fetch = require('node-fetch')
const PWR_GENERATE_OPS = 1;

const PWR_OPERATE_SPAWN = 2;

const PWR_OPERATE_TOWER = 3;

const PWR_OPERATE_STORAGE = 4;

const PWR_OPERATE_LAB = 5;

const PWR_OPERATE_EXTENSION = 6;

const PWR_OPERATE_OBSERVER = 7;

const PWR_OPERATE_TERMINAL = 8;

const PWR_DISRUPT_SPAWN = 9;

const PWR_DISRUPT_TOWER = 10;

const PWR_DISRUPT_SOURCE = 11;

const PWR_SHIELD = 12;

const PWR_REGEN_SOURCE = 13;

const PWR_REGEN_MINERAL = 14;


const PWR_DISRUPT_TERMINAL = 15;

const PWR_OPERATE_POWER = 16;


const PWR_FORTIFY = 17;


const PWR_OPERATE_CONTROLLER = 18;

const PWR_OPERATE_FACTORY = 19;
let powers = {
    [PWR_GENERATE_OPS]: 3,
    // [PWR_OPERATE_SPAWN]:1,
    [PWR_OPERATE_LAB]: 4,
    [PWR_OPERATE_EXTENSION]: 4,
    [PWR_REGEN_SOURCE]: 4
}
let pcid = "5ec25e15f60d177cdaaa501f"
let xusername = "6f9723dc2148bcdd94f63ea1f7c38096231ba51a"
let xtoken = "6f9723dc2148bcdd94f63ea1f7c38096231ba51a"
let body = {id: pcid, powers: powers}
body = JSON.stringify(body)
console.log(body)
let cookie = "_ga=GA1.2.1334217077.1589103257; _fbp=fb.1.1589103257684.4905259; _gid=GA1.2.1089139244.1589696755; mp_647fa4fef822c1d4e9fa7b25812599cf_mixpanel=%7B%22distinct_id%22%3A%20%22qq295087430%40outlook.com%22%2C%22%24device_id%22%3A%20%22171fdef667a9cc-0627c884a573b8-d373666-1fa400-171fdef667b90d%22%2C%22%24initial_referrer%22%3A%20%22%24direct%22%2C%22%24initial_referring_domain%22%3A%20%22%24direct%22%2C%22%24user_id%22%3A%20%22qq295087430%40outlook.com%22%2C%22email%22%3A%20%22qq295087430%40outlook.com%22%2C%22userId%22%3A%20%225d2deb651892b468392d5aa0%22%2C%22__mps%22%3A%20%7B%7D%2C%22__mpso%22%3A%20%7B%7D%2C%22__mpus%22%3A%20%7B%7D%2C%22__mpa%22%3A%20%7B%7D%2C%22__mpu%22%3A%20%7B%7D%2C%22__mpr%22%3A%20%5B%5D%2C%22__mpap%22%3A%20%5B%5D%7D"
fetch("https://screeps.com/api/game/power-creeps/upgrade", {
    "headers": {
        "accept": "application/json, text/plain, */*",
        "accept-language": "zh,zh-CN;q=0.9,en;q=0.8,zh-TW;q=0.7,en-US;q=0.6",
        "content-type": "application/json;charset=UTF-8",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-token": xtoken,
        "x-username": xusername,
        "cookie": cookie,
    },
    "referrer": "https://screeps.com/a/",
    "referrerPolicy": "no-referrer-when-downgrade",
    "body": body,
    "method": "POST",
    "mode": "cors"
}).then(res => res.json())
    .then(json => console.log(json));

