var role_num_fix = {
    'E28N46': {
        opener: 0,
    },
    'E25N43': {
        // rattacker: 2,
    },
    'E27N38': {
        rattacker: 0,
        healer: 0,
    },
    'E27N42': {},
    'E29N41': {
        farcarryer: 0,
    },
    'E29N38': {
        //1
        farcarryer: 0,
    },
    'E19N41': {
        opener: 0,
        farcarryer: 0,
        controllerattack: 0,
    },
    'E14N41': {}
}
module.exports.role_num_fix = role_num_fix
var role_num = {
    linkmanager: 1,
    filler: 1,
    carryer: 1,
    miner: 1,
    upgrader: 0,
    reserver: 1,
    watcher: 1,
    builder: 1,
    collecter: 0,
    flagworker: 0,
    mineraler: 1,
    opener: 0,
    rattacker: 0,
    centerminer: 0,
    coreminer: 0,
    subprotecter: 1,
    terminalmanager: 1,
    farcarryer: 0,
    'power-a': 0,
    'power-b': 0,
    'power-c': 0,
    SEAL: 0,
    destroyer: 0
}
module.exports.role_num = role_num
let funcQueue = []
module.exports.funcQueue = funcQueue
module.exports.dofuncQueue = function () {
    for (let x of funcQueue) {
        try {
            x()
        } catch (e) {
            console.log('funcQueue err' + e)
        }
    }
}

let price = {}
function solveAveragePrice(type, dayLen = 2) {
    if (price[type]) return price[type]
    let history = Game.market.getHistory(type)
    if(!history)return
    if(!history.slice)return
    try{
        history = history.slice(history.length - dayLen)
        let max = _.max(history, o => o.avgPrice + o.stddevPrice)
        let min = _.min(history, o => o.avgPrice - o.stddevPrice)
        price[type] = {
            maxPrice: max.avgPrice + max.stddevPrice,
            minPrice: min.avgPrice - min.stddevPrice
        }
    }catch (e) {
        console.log(type+'solveAveragePrice error'+e+JSON.stringify(history))
    }

    return price[type]
}

module.exports.solveAveragePrice = solveAveragePrice
let resources =RESOURCES_ALL
for (let type of resources) {
    try {
        solveAveragePrice(type)
    } catch (e) {
        console.log('config price' + e)
    }

}
price.power.sell = price.power.minPrice
price.power.order = price.power.minPrice * 1.05

module.exports.price = price
// for (let type in price) {
//     console.log(`price ${type} ${price[type].minPrice} ~ ${price[type].maxPrice}`)
// }
module.exports.userName = 'Yuandiaodiaodiao'
module.exports.powerLimit = 0.9
module.exports.obterminal = {
    // W12N9: {
    //     limit: 8e3,
    //     merge: false
    // }

}
module.exports.refreshPrice=function(){
    for (let type of resources) {
        try {
            price[type]=undefined
            solveAveragePrice(type)
        } catch (e) {
            console.log('config price' + e)
        }
    }
    price.power.sell = price.power.minPrice
    price.power.order = price.power.minPrice * 1.05

}