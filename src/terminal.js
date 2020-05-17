let lodash = require('lodash-my')
let avgRoom = 'E19N41'
let t3list = []
for (let type in REACTIONS.X) {
    if (type.length === 4) {
        t3list.push(REACTIONS.X[type])
    }
}
let amountOf = require("command").amountOf

let roomMineralCache = {}
module.exports.roomMineralCache=roomMineralCache
module.exports.fillOverT3 = function () {
    let room2 = Game.rooms[avgRoom]
    if (room2.terminal.cooldown) return
    for (let roomName in Memory.rooms) {
        let room = Game.rooms[roomName]
        let t3limit = Game.reaction.produceLimit
        if (roomName === avgRoom) continue
        try {
            let terminal = room.terminal
            let storage = room.storage
            if (!terminal || !terminal.my || !storage) continue
            if (room.spawns.length === 0) continue
            for (let type in t3limit) {
                if (type in terminal.store) {
                    let limitNum = t3limit[type]
                    if (limitNum - terminal.store[type] < 3000 && (limitNum - terminal.store[type] > 0) && limitNum >= 12e3) {
                        let needsend = limitNum - terminal.store[type]
                        let ans = room2.terminal.send(type, needsend, roomName)
                        if (ans === OK) {
                            console.log(` ${room2.name}send${room.name}  ${needsend}${type}`)
                            return ans
                        }
                    }
                }
            }
        } catch (e) {
            console.log('avgT3' + roomName + e)
        }
    }
}


module.exports.sendOverT3 = function () {
    for (let roomName in Memory.rooms) {
        let room = Game.rooms[roomName]
        let t3limit = Game.reaction.produceLimit
        if (roomName === avgRoom) continue
        try {
            let terminal = room.terminal
            let storage = room.storage
            if (!terminal || !terminal.my || !storage) continue
            if (room.spawns.length === 0) continue
            if (terminal.cooldown) continue
            for (let type in t3limit) {
                if (type in terminal.store) {
                    let limitNum = t3limit[type]
                    if (terminal.store[type] > limitNum && limitNum >= 12e3) {
                        let needsend = terminal.store[type] - limitNum
                        let room2 = Game.rooms[avgRoom]
                        let ans = terminal.send(type, needsend, room2.name)
                        if (ans === OK) {
                            console.log(`${room.name} send ${room2.name} ${needsend}${type}`)
                            return ans
                        }
                    }
                }
            }
        } catch (e) {
            console.log('avgT3' + roomName + e)
        }
    }
}
module.exports.avgT3 = function () {
    for (let roomName in Memory.rooms) {
        let room = Game.rooms[roomName]
        let t3limit = Game.reaction.produceLimit
        try {
            let terminal = room.terminal
            let storage = room.storage
            if (!terminal || !terminal.my || !storage || !room.memory.missions || !room.memory.lab || !room.memory.lab.ok) continue
            if (room.spawns.length === 0) continue
            if (terminal.cooldown) continue
            for (let type in t3limit) {
                if (type in terminal.store) {
                    let limitNum = t3limit[type]
                    if (terminal.store[type] >= limitNum && limitNum - 3e3 > 0) {
                        for (let room2Name in Memory.rooms) {
                            let room2 = Game.rooms[room2Name]
                            if (!room2.terminal || !room2.terminal.my || !room2.storage) continue
                            if (room2.spawns.length === 0) continue
                            if (!room2.terminal.store[type] || room2.terminal.store[type] <= limitNum - 6e3) {
                                if (Game.tools.solveMaxSend(roomName, room2Name, type, terminal) >= 3e3) {
                                    let ans = terminal.send(type, 3e3, room2Name)
                                    if (ans === OK) {
                                        console.log(`${room.name} send ${room2Name} ${3e3}${type}`)
                                        return ans
                                    }
                                }

                            }
                        }


                    }
                }
            }
        } catch (e) {
            console.log('avgT3' + roomName + e)
        }
    }
}

module.exports.work = function (room, rate) {
    let terminal = room.terminal
    if (!terminal || !terminal.my || !terminal.isActive()) return
    // if (terminal && room.storage && room.storage.store[RESOURCE_ENERGY] / room.storage.store.getCapacity() > 0.65 && room.controller.level === 8) {
    //     const helpRoomNameList = _.filter(Object.keys(Memory.rooms), roomName => {
    //         let room2 = Game.rooms[roomName]
    //         return ((room2.storage && (room.storage.store[RESOURCE_ENERGY] / room.storage.store.getCapacity() - room2.storage.store[RESOURCE_ENERGY] / room2.storage.store.getCapacity()) > 0.2) || (!room2.storage))
    //             && room2.terminal && room2.terminal.my && room2.terminal.store[RESOURCE_ENERGY] <= 90000
    //     })
    //     const targetRoomName = lodash.minBy(helpRoomNameList, roomName => {
    //         return Game.rooms[roomName].storage ? Game.rooms[roomName].storage.store[RESOURCE_ENERGY] : 0
    //     })
    //     if (targetRoomName && targetRoomName !== Infinity) {
    //         let maxsend = Game.tools.solveMaxSend(room.name, targetRoomName, RESOURCE_ENERGY, room.terminal)
    //         if (maxsend > 6000) {
    //             let ans = terminal.send(RESOURCE_ENERGY, 6000, targetRoomName)
    //             if (ans) {
    //                 return ans
    //             }
    //         }
    //         // console.log(`${room.name} help ${targetRoomName} ${RESOURCE_ENERGY} 6000`)
    //     }
    // }
    // console.log('findminerals')
    if (terminal && (!room.storage || room.storage.store.energy / 1e6 < 0.65 || room.spawns.length === 0) && (room.terminal.store.energy <= 80e3 || (room.spawns.length === 0 && room.terminal.store.getFreeCapacity('energy') > 0))) {
        let storageRate = !room.storage || room.spawns.length === 0 ? 500e3 : room.storage.store.energy
        const sendRoomNameList = _.filter(Object.keys(Memory.rooms), roomName => {
            let room2 = Game.rooms[roomName]
            return (room2.storage && (room2.storage.store.energy > storageRate + 100e3) && room2.spawns.length >= 3)
        })
        let needSend = room.spawns.length === 0 ? room.terminal.store.getFreeCapacity('energy') : (90e3 - room.terminal.store.energy)
        sendRoomNameList.forEach(roomName => {
            if (needSend <= 0) return
            let fromRoom = Game.rooms[roomName]
            if (fromRoom.terminal.cooldown > 0) return
            let maxsend = Game.tools.solveMaxSend(roomName, room.name, RESOURCE_ENERGY, fromRoom.terminal)
            if (maxsend > 6000) {
                let ans = fromRoom.terminal.send(RESOURCE_ENERGY, maxsend, room.name)
                if (ans === OK) {
                    needSend -= maxsend
                }
            }
        })
    }
    if (room.spawns.length === 0) return

    let mineral = roomMineralCache[room.name]
    if (!mineral) {
        roomMineralCache[room.name] = mineral = room.find(FIND_MINERALS)[0]
    }
    if (mineral) {
        let type = mineral.mineralType
        if ((terminal.store[type] || 0) > 6000) {
            // console.log(room.name+' type='+type+' store='+ terminal.store[type])
            for (let roomNames in Memory.rooms) {
                let rooms = Game.rooms[roomNames]
                if (rooms.controller.level === 8) {
                    let terminals = rooms.terminal
                    if (!terminals) continue
                    // console.log('send='+ rooms.name+' last='+(terminals.store.getCapacity() - _.sum(terminals.store) ))
                    if (terminals && (terminals.store[type] || 0) < 3000 && terminals.store.getCapacity() - _.sum(terminals.store) > 3000) {
                        let maxsend = Game.tools.solveMaxSend(room.name, rooms.name, type, room.terminal)
                        if (maxsend > 3000) {
                            let ans = terminal.send(type, 3000, rooms.name)
                            if (ans) {
                                return ans
                            }
                        }
                    }
                }
            }
        } else if ((terminal.store[type] || 0) <= 6000) {
            let buyNum = 8e3 - (terminal.store[type] || 0)

            Game.terminal.autoBuy(room.name, type, buyNum, Game.config.price[type].minPrice, Game.config.price[type].maxPrice)
        }

    }

    if ((terminal.store[RESOURCE_POWER] || 0) > 8000) {
        const powerHave = terminal.store[RESOURCE_POWER]
        for (let roomNames in Memory.rooms) {
            let rooms = Game.rooms[roomNames]
            if (rooms.controller.level === 8 && rooms.powerSpawn) {
                let terminals = rooms.terminal
                if (!terminals) continue
                const powerLast = (terminals.store[RESOURCE_POWER] || 0)
                if (powerLast < 1500) {
                    let maxsend = Game.tools.solveMaxSend(room.name, rooms.name, RESOURCE_POWER, room.terminal)
                    if (maxsend > Math.max(0, 2000 - powerLast)) {
                        let ans = terminal.send(RESOURCE_POWER, Math.max(0, 2000 - powerLast), rooms.name)
                        if (ans) {
                            return ans
                        }
                    }
                }
            }
        }
    }

    if ((terminal.store[RESOURCE_GHODIUM] || 0) < 3000) {
        for (let roomNames in Memory.rooms) {
            let rooms = Game.rooms[roomNames]
            if (rooms.controller.level === 8 && rooms.nuker) {
                let terminals = rooms.terminal
                if (!terminals) continue
                if ((terminals.store[RESOURCE_GHODIUM] || 0) >= 6000) {
                    let maxsend = Game.tools.solveMaxSend(room.name, rooms.name, RESOURCE_GHODIUM, room.terminal)
                    if (maxsend > 3000) {
                        let ans = terminal.send(RESOURCE_GHODIUM, 3000, rooms.name)
                        if (ans) {
                            return ans
                        }
                    }
                }
            }
        }
    }
    if (require('tower').bigEnemy[room.name]) {
        if (terminal.store[RESOURCE_OPS] < 5e3) {
            let act = Game.tools.give(room.name, RESOURCE_OPS, 4000)
        }
    }
    return handlesell(room.name)
}
module.exports.handlesell = handlesell

function handlesell(roomName) {
    if (Game.runTime <= 2) return
    const room = Game.rooms[roomName]
    const terminal = room.terminal
    const mineral =  roomMineralCache[room.name] || room.find(FIND_MINERALS)[0]
    const type = mineral.mineralType
    if (terminal.cooldown > 0) return
    if (terminal && mineral && terminal.store[type] > 60e3) {
        let act = sellSome(room, terminal, type, terminal.store[type] - 50e3, 0.02)
        if (act === OK) {
            return act
        } else {
            console.log(`${room.name} sell ${type} error=${act} `)
        }
    }
    const storage = room.storage
    if (storage && terminal && terminal.store[RESOURCE_ENERGY] >= 5e3 && storage.store[RESOURCE_ENERGY] / storage.store.getCapacity() > 0.8 && room.controller.level >= 8) {
        let act = sellSome(room, terminal, RESOURCE_ENERGY, 6000, storage.store[RESOURCE_ENERGY] / storage.store.getCapacity() > 0.9 ? 0 : Game.config.price.energy.minPrice)

        if (act === OK) {
            return act
        }
    }
    if (terminal && mineral && terminal.store.getUsedCapacity(Game.factory.produce[type]) > 40e3) {
        let act = sellSome(room, terminal, Game.factory.produce[type], terminal.store.getUsedCapacity(Game.factory.produce[type]) - 40e3, Game.config.price[Game.factory.produce[type]].minPrice / 1.05)
        if (act === OK) {
            return act
        }
    }

    if (storage && terminal && (terminal.store[RESOURCE_POWER] || 0) > 10e3) {
        let act = sellSome(room, terminal, RESOURCE_POWER, 2500, Game.config.price.power.sell)
        if (act === OK) {
            return act
        }
    }
    if (roomName === 'E19N41') {

        if (storage && terminal) {
            if (terminal.store['XGH2O'] < 3000) {
                Game.tools.give('E19N41', 'XGH2O', 3000)
            } else {
                let act = sellSome(room, terminal, 'XGH2O', 3000, 4)
                if (act === OK) {
                    return act
                }
            }

            for (let type of t3list) {
                let amount = amountOf(type, false, false)
                if (amount > 100e3) {
                    if (terminal.store[type] < 3000) {
                        Game.tools.give('E19N41', type, 3000)
                    } else {
                        let act = sellSome(room, terminal, type, 3000, 5)
                        if (act === OK) {
                            return act
                        }
                    }
                }
            }

        }
    }


}

// let blackList = new Set(['W1N37', 'W9N12', 'W11N19', 'W1N11', 'W1N13', 'W11N8', 'W9N16', 'W7N19'
//     , 'W5N13', 'W4N21', 'W3N15', 'W3N12', 'W2N13', 'W2N12', 'W2N11', 'W1N18',
//     'W9N19', 'W1N12', 'W1N7', 'W1N4', 'W1S1', 'W1S4', 'E2N9', 'E1N14',
//     'E1N11', 'E1S9', 'E4N21', 'E1N25', 'E9N9', 'E21S28', 'W1N21', 'E2S31', 'E8N22', 'W2N24', 'E9N1', 'E11N14', 'E11S9', 'E11S31', 'W3N31', 'E11S22'])

let MarketCache = {}

function sellSome(room, terminal, type, amount, minPrice) {
    if (!(terminal.store[type] > 0)) {
        return -13
    }
    let allorders
    if (type === RESOURCE_ENERGY) {
        if (!MarketCache[type] || MarketCache[type].ttl !== Game.time) {
            MarketCache[type] = {
                orders: Game.market.getAllOrders({resourceType: type}),
                ttl: Game.time
            }
        }
        allorders = MarketCache[type].orders
    } else {
        allorders = Game.market.getAllOrders({resourceType: type})
    }

    const mineorder = _.filter(allorders, obj => {
        if (obj.type === ORDER_BUY && obj.amount >= (type === RESOURCE_ENERGY ? 1000 : 2) && obj.price >= (minPrice || (type === RESOURCE_ENERGY ? 0 : 0.04))) {
            if (Game.memory.dealBlackList.has(obj.roomName)) {
                return false
            } else if (Game.memory.dealWhiteList.has(obj.roomName) || Game.tools.isHighway(obj.roomName)) {
                return true
            } else {
                Game.observer.observer_queue[obj.roomName] = {
                    roomName: obj.roomName,
                    callBack: (roomObj) => {
                        let roomUser = roomObj.controller && roomObj.controller.owner && roomObj.controller.owner.username
                        if (!roomUser) {
                            console.log('ob roomUser= ' + JSON.stringify(roomObj.controller.owner))
                            return
                        }
                        if (require('prototype.Whitelist').blackList.has(roomObj.controller.owner.username)) {
                            Game.memory.dealBlackList.add(roomObj.name)
                        } else {
                            Game.memory.dealWhiteList.add(roomObj.name)
                        }
                    }
                }
                return false
            }
        }
        return false
    })

    if (mineorder.length === 0) {
        // allorders.forEach(o => {
        //     if (o.type === ORDER_BUY) {
        //         const {id, roomName, amount, price} = o
        //         console.log(`${id} ${roomName} ${amount} ${price}`)
        //     }
        // })
        return -13
    }
    let failedset = new Set()
    let ans = ERR_TIRED
    while (ans === ERR_TIRED && failedset.size <= 4) {
        let order
        if (type === RESOURCE_ENERGY) {
            order = lodash.minBy(mineorder, obj => failedset.has(obj.id) ? 1e9 : 1000 / obj.price + Game.market.calcTransactionCost(1000 / obj.price, room.name, obj.roomName))
        } else {
            order = lodash.maxBy(mineorder, obj => failedset.has(obj.id) ? -1e9 : obj.price * 1000 - Game.market.calcTransactionCost(1000, room.name, obj.roomName) * Game.config.price.energy.minPrice)
        }
        // console.log(`room ${room.name} try order= ${JSON.stringify(order)}`)
        const energycost = Game.market.calcTransactionCost(1000, room.name, order.roomName) / 1000
        const maxsend = type === RESOURCE_ENERGY ? terminal.store[RESOURCE_ENERGY] / (1 + energycost) - 20 : terminal.store[RESOURCE_ENERGY] / energycost
        const sell = _.min([(terminal.store[type] || 0), maxsend, amount, type in Game.reaction.produceLimit ? order.amount : order.amount - 1])
        ans = Game.market.deal(order.id, sell, room.name)
        if (ans === OK) {
            order.amount -= sell
            console.log('room:' + room.name + ' sell ' + order.roomName + ' ' + sell + ' ' + type)
            return ans
        } else {
            if (ans === ERR_INVALID_ARGS) {
                let idx = allorders.findIndex(o => o.id === order.id)
                allorders.splice(idx, 1)
            }
            console.log(`${room.name} try sell ${order.roomName} ${sell}${type} false because${ans} args=${JSON.stringify([order.id, sell, room.name])}`)
        }
        failedset.add(order.id)
    }
    return ans


}


module.exports.sellSome = sellSome

module.exports.needBoost = needBoost

function needBoost(room) {
    const terminal = room.terminal
    if (room.memory.reaction.status === 'boost') {
        let type = _.find(room.memory.reaction.boostList, o => (terminal.store[o] || 0) < 3000)
        for (let roomNames in Memory.rooms) {
            if (roomNames == room.name) continue
            let rooms = Game.rooms[roomNames]
            if (rooms.controller.level === 8) {
                let terminals = rooms.terminal
                if (!terminals) continue
                const last = (terminals.store[type] || 0)
                if (last > 0) {
                    let act = terminals.send(type, Math.min(last, 3000), room.name)
                    if (act === OK) {
                        return
                    }
                }
            }
        }
    }
}

module.exports.createOrder = function () {
    Object.values(Game.rooms).forEach(o => {
        if (o.terminal) {
            Game.market.createOrder({
                type: ORDER_SELL,
                resourceType: RESOURCE_POWER,
                price: 0.6,
                totalAmount: 0,
                roomName: o.name
            })
        }
    })
}
module.exports.change = function (type, price) {
    _.filter(Game.market.orders, order => order.resourceType === type &&
        order.type === ORDER_SELL
    ).forEach(o => {
        // console.log('change'+o.id)
        if (o.remainingAmount === 0) {
            Game.market.cancelOrder(o.id)
        } else {
            Game.market.changeOrderPrice(o.id, price)
        }

    })
}
module.exports.increasePrice = function (roomName, type, price, buyorsell) {
    _.filter(Game.market.orders, order => order.resourceType === type &&
        order.type === buyorsell && order.roomName === roomName
    ).forEach(o => {
        // console.log('change'+o.id)
        if (o.remainingAmount === 0) {
            Game.market.cancelOrder(o.id)
        } else {
            if (o.price < price) {
                Game.market.changeOrderPrice(o.id, price)
            }
        }

    })
}
module.exports.solveOrderNum = function (roomN, type = 'power', sell = ORDER_SELL) {
    let noworder = _.filter(Object.values(Game.market.orders), o => {
        let condi = o.roomName === roomN
            && o.resourceType === type
            && o.type === sell
        if (condi) {
            return true
        } else {
            return false
        }
    })
    let ordernum = Game.lodash.sumBy(noworder, o => {
        try {
            if (o.remainingAmount === 0) {
                Game.market.cancelOrder(o.id)
            }
        } catch (e) {
            console.log('cancelorder error')
        }

        if (o && o.remainingAmount) {
            return o.remainingAmount
        } else {
            return 1e9
        }
    }) || 1e9
    if (noworder.length === 0) {
        ordernum = 0
    }
    return ordernum
}
module.exports.autoOrder = function (roomN, type = 'power') {
    if (!(Game.rooms[roomN].controller && Game.rooms[roomN].controller.my)) return
    let ordernum = Game.terminal.solveOrderNum(roomN)
    let nownum = Game.rooms[roomN].terminal.store.getUsedCapacity(RESOURCE_POWER) || 0
    console.log('orderNum=' + ordernum + 'nownum=' + nownum)
    if (nownum - ordernum > 5000 && ordernum < 30e3) {
        return Game.market.createOrder({
            type: ORDER_SELL,
            resourceType: type,
            price: Game.config.price[type].order,
            totalAmount: Math.min(10e3, nownum - ordernum),
            roomName: roomN
        })
    }
    return false
}
module.exports.autoBuy = function (roomN, type, targetNum, MinPrice, MaxPrice) {
    if (!(Game.rooms[roomN].controller && Game.rooms[roomN].controller.my)) return
    let ordernum = Game.terminal.solveOrderNum(roomN, type, ORDER_BUY)

    let allorders = Game.market.getAllOrders({resourceType: type})
    let maxPrice = _.max(allorders, o => {
        if (o.type === ORDER_BUY && o.amount > 1000 && (!(o.roomName in Memory.rooms))) {
            return o.price
        } else {
            return 0
        }
    })
    let price = Math.min(MaxPrice, Math.max(MinPrice, maxPrice.price + 0.001))
    let buyNum = targetNum - ordernum
    Game.terminal.increasePrice(roomN, type, price - 0.001, ORDER_BUY)
    if (buyNum > (type === RESOURCE_ENERGY ? 30e3 : 2000)) {
        console.log(`I have order=${ordernum} i wanto buy ${type} at ${price} for ${buyNum}`)

        Game.terminal.increasePrice(roomN, type, price, ORDER_BUY)
        return Game.market.createOrder({
            type: ORDER_BUY,
            resourceType: type,
            price: price,
            totalAmount: buyNum,
            roomName: roomN
        })
    }
    return false
}
let marketQueue = []
module.exports.marketQueue = marketQueue
module.exports.sellOrder = function (room, type, num, price) {
    marketQueue.push(
        () => {
            return Game.market.createOrder({
                type: ORDER_SELL,
                resourceType: type,
                price: price,
                totalAmount: num,
                roomName: room.name
            })
        }
    )
    return (`from${room.name}sell ${num} ${type} at${price} ?`)
}