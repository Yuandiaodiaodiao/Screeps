let lodash = require('lodash-my')

module.exports.work = function (room) {
    let terminal = room.terminal
    if (!terminal || !terminal.my) return
    if (terminal && room.storage && room.storage.store[RESOURCE_ENERGY] / room.storage.storeCapacity > 0.88) {
        const helpRoomNameList = _.filter(Object.keys(Memory.rooms), roomName => {
            let room2 = Game.rooms[roomName]
            return room2.storage && room2.storage.store[RESOURCE_ENERGY] / room2.storage.storeCapacity < 0.7
                && room2.terminal && room2.terminal.my && room2.terminal.store[RESOURCE_ENERGY] <= 90000
        })
        const targetRoomName = lodash.minBy(helpRoomNameList, roomName => {
            return Game.rooms[roomName].storage.store[RESOURCE_ENERGY]
        })
        if (targetRoomName && targetRoomName !== Infinity) {
            terminal.send(RESOURCE_ENERGY, 6000, targetRoomName)
            // console.log(`${room.name} help ${targetRoomName} ${RESOURCE_ENERGY} 6000`)
            return
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
                if (rooms.controller.level == 8) {
                    let terminals = rooms.terminal
                    // console.log('send='+ rooms.name+' last='+(terminals.storeCapacity - _.sum(terminals.store) ))
                    if (terminals && (terminals.store[type] || 0) < 3000 && terminals.storeCapacity - _.sum(terminals.store) > 3000) {
                        terminal.send(type, 3000, rooms.name)
                        break
                    }
                }
            }
        }
    }

    if ((terminal.store[RESOURCE_POWER] || 0) > 4000) {
        const powerHave=terminal.store[RESOURCE_POWER]
        for (let roomNames in Memory.rooms) {
            let rooms = Game.rooms[roomNames]
            if (rooms.controller.level == 8) {
                let terminals = rooms.terminal
                const powerLast=(terminals.store[RESOURCE_POWER] || 0)
                if ( powerLast< 1500) {
                    terminal.send(RESOURCE_POWER,Math.max(0, 2000-powerLast), rooms.name)
                    break
                }
            }
        }
    }

    if ((terminal.store[RESOURCE_GHODIUM] || 0) >= 3000) {
        for (let roomNames in Memory.rooms) {
            let rooms = Game.rooms[roomNames]
            if (rooms.controller.level == 8) {
                let terminals = rooms.terminal
                if ((terminals.store[RESOURCE_GHODIUM] || 0) < 1500) {
                    terminal.send(RESOURCE_GHODIUM, 1000, rooms.name)
                    break
                }
            }
        }
    }

    if (Game.time % 500 == 0) {
        handlesell(room.name)
    }
}
module.exports.handlesell = handlesell

function handlesell(roomName) {
    const room = Game.rooms[roomName]

    const terminal = room.terminal
    const mineral = room.find(FIND_MINERALS)[0]
    const type = mineral.mineralType
    if (terminal && mineral && terminal.store[type] / terminal.storeCapacity > 0.25) {
        let time1 = Game.cpu.getUsed()
        const allorders = Game.market.getAllOrders({resourceType: type})
        const mineorder = _.filter(allorders, obj => obj.type == ORDER_BUY && obj.amount > 100 && obj.price > 0.04)
        let time2 = Game.cpu.getUsed()
        console.log('ordercache time=' + (time2 - time1))
        if (mineorder.length == 0) return -10
        const order = lodash.maxBy(mineorder, obj => obj.price * 1000 - Game.market.calcTransactionCost(1000, room.name, obj.roomName) * 0.008)
        const energycost = Game.market.calcTransactionCost(1000, room.name, order.roomName) / 1000
        const maxsend = terminal.store[RESOURCE_ENERGY] / energycost
        const maxsell = Math.min(terminal.store[type] - terminal.storeCapacity * 0.25, order.amount)
        const sell = Math.min(maxsend, maxsell)
        console.log('room:' + room.name + ' sell ' + order.roomName + ' amount:' + sell)
        return Game.market.deal(order.id, sell, room.name)
    }

}