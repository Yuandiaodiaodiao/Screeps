let lodash = require('lodash-my')

module.exports.work = function (room, rate) {
    let terminal = room.terminal
    if (!terminal || !terminal.my) return

    if (Game.time % 100 === 0 && terminal && room.storage && room.storage.store[RESOURCE_ENERGY] / room.storage.store.getCapacity() > 0.7) {
        const helpRoomNameList = _.filter(Object.keys(Memory.rooms), roomName => {
            let room2 = Game.rooms[roomName]
            return ((room2.storage && (room.storage.store[RESOURCE_ENERGY] / room.storage.store.getCapacity() - room2.storage.store[RESOURCE_ENERGY] / room2.storage.store.getCapacity()) > 0.2) || (!room2.storage))
                && room2.terminal && room2.terminal.my && room2.terminal.store[RESOURCE_ENERGY] <= 90000
        })
        const targetRoomName = lodash.minBy(helpRoomNameList, roomName => {
            return Game.rooms[roomName].storage ? Game.rooms[roomName].storage.store[RESOURCE_ENERGY] : 0
        })
        if (targetRoomName && targetRoomName !== Infinity) {
            return terminal.send(RESOURCE_ENERGY, 6000, targetRoomName)
            // console.log(`${room.name} help ${targetRoomName} ${RESOURCE_ENERGY} 6000`)
        }
    }
    // console.log('findminerals')
    let mineral = room.find(FIND_MINERALS)[0]
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
                        return terminal.send(type, 3000, rooms.name)
                    }
                }
            }
        }

    }

    if ((terminal.store[RESOURCE_POWER] || 0) > 8000) {
        const powerHave = terminal.store[RESOURCE_POWER]
        for (let roomNames in Memory.rooms) {
            let rooms = Game.rooms[roomNames]
            if (rooms.controller.level === 8) {
                let terminals = rooms.terminal
                if (!terminals) continue
                const powerLast = (terminals.store[RESOURCE_POWER] || 0)
                if (powerLast < 1500) {
                    return terminal.send(RESOURCE_POWER, Math.max(0, 2000 - powerLast), rooms.name)
                }
            }
        }
    }

    if ((terminal.store[RESOURCE_GHODIUM] || 0) >= 3000) {
        for (let roomNames in Memory.rooms) {
            let rooms = Game.rooms[roomNames]
            if (rooms.controller.level === 8) {
                let terminals = rooms.terminal
                if (!terminals) continue
                if ((terminals.store[RESOURCE_GHODIUM] || 0) < 1500) {
                    return terminal.send(RESOURCE_GHODIUM, 1000, rooms.name)

                }
            }
        }
    }


    return handlesell(room.name)
}
module.exports.handlesell = handlesell

function handlesell(roomName) {
    const room = Game.rooms[roomName]
    const terminal = room.terminal
    const mineral = room.find(FIND_MINERALS)[0]
    const type = mineral.mineralType
    if (terminal && mineral && terminal.store[type] / terminal.store.getCapacity() > 75e3) {
        let act = sellSome(room, terminal, type, terminal.store[type] - terminal.store.getCapacity() * 0.25)
        if (act === OK) {
            return act
        }
    }
    const storage = room.storage
    if (storage && terminal && terminal.store[RESOURCE_ENERGY] >= 5e3 && storage.store[RESOURCE_ENERGY] / storage.store.getCapacity() > 0.8) {
        let act = sellSome(room, terminal, RESOURCE_ENERGY, 5000)
        if (act === OK) {
            return act
        }
    }
    if (terminal && mineral && terminal.store.getUsedCapacity(Game.factory.produce[type]) > 500) {
        let act = sellSome(room, terminal, Game.factory.produce[type], terminal.store.getUsedCapacity(Game.factory.produce[type]) - 500, 0.25)
        if (act === OK) {
            return act
        }
    }

    if (storage && terminal && (terminal.store[RESOURCE_POWER] || 0) > 0) {
        let act = sellSome(room, terminal, RESOURCE_POWER, 2500, Game.config.price.power.sell)
        if (act === OK) {
            return act
        }
    }


}

function sellSome(room, terminal, type, amount, minPrice) {
    const allorders = Game.market.getAllOrders({resourceType: type})
    const mineorder = _.filter(allorders, obj => obj.type === ORDER_BUY && obj.amount >= (type === RESOURCE_ENERGY ? 1000 : 1) && obj.price >= (minPrice || (type === RESOURCE_ENERGY ? 0 : 0.04)))
    if (mineorder.length === 0) return -10
    let failedset = new Set()
    let ans = ERR_TIRED
    while (ans === ERR_TIRED && failedset.size <= 4) {
        const order = lodash.maxBy(mineorder, obj => failedset.has(obj.id) ? -100 : obj.price * 1000 - Game.market.calcTransactionCost(1000, room.name, obj.roomName) * 0.004)
        // console.log(`room ${room.name} try order= ${JSON.stringify(order)}`)
        const energycost = Game.market.calcTransactionCost(1000, room.name, order.roomName) / 1000
        const maxsend = type === RESOURCE_ENERGY ? terminal.store[RESOURCE_ENERGY] / (1 + energycost) : terminal.store[RESOURCE_ENERGY] / energycost
        const maxsell = Math.min(amount, order.amount)
        const sell = Math.min((terminal.store[type] || 0), Math.min(maxsend, maxsell))
        ans = Game.market.deal(order.id, sell, room.name)
        if (ans === OK) {
            console.log('room:' + room.name + ' sell ' + order.roomName + ' ' + sell + ' ' + type)
        }
        failedset.add(order.id)
    }


}

module.exports.needBoost = needBoost

function needBoost(room) {
    const terminal = room.terminal
    if (room.memory.reaction.status === 'boost') {
        let type = _.find(room.memory.reaction.boostList, o => (terminal.store[o] || 0) < 3000)
        let need = 3000 - (terminal.store[type] || 0)
        for (let roomNames in Memory.rooms) {
            if (roomNames == room.name) continue
            let rooms = Game.rooms[roomNames]
            if (rooms.controller.level == 8) {
                let terminals = rooms.terminal
                if (!terminals) continue
                const last = (terminals.store[type] || 0)
                if (last > 0) {
                    let act = terminals.send(type, Math.min(last, need), room.name)
                    if (act == OK) {
                        need -= Math.min(last, need)
                    }
                }
            }
            if (need <= 0) break
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

module.exports.solveOrderNum = function (roomN, type = 'power', sell = ORDER_SELL) {
    let noworder = _.filter(Game.market.orders, o => o.roomName === roomN
        && o.resourceType === type
        && o.type === sell)
    let ordernum = Game.lodash.sumBy(noworder, o => {
        console.log(JSON.stringify(o))
        try{
            if (o.remainingAmount === 0) {
                Game.market.cancelOrder(o.id)
            }
        }catch (e) {
            console.log('cancelorder error')
        }

        if (o && o.remainingAmount) {
            return o.remainingAmount
        }else{
            return 1e7
        }
    }) || 1e7
    return ordernum
}
module.exports.autoOrder = function (roomN, type = 'power') {
    if(!(Game.rooms[roomN].controller&&Game.rooms[roomN].controller.my))return
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