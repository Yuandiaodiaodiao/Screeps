module.exports.work = function (room) {
        let terminal = room.terminal
        if (terminal && room.storage && room.storage.store[RESOURCE_ENERGY] / room.storage.storeCapacity > 0.9) {
            for (let roomNames in Memory.rooms) {
                let rooms = Game.rooms[roomNames]
                if (rooms.storage && rooms.storage.store[RESOURCE_ENERGY] / rooms.storage.storeCapacity < 0.7) {
                    let terminals = rooms.terminal
                    if (terminals && terminals.store[RESOURCE_ENERGY] < 100000) {
                        terminal.send(RESOURCE_ENERGY, 6000, rooms.name)
                        break
                    }
                }
            }
        }
        // console.log('findminerals')
        let mineral = room.find(FIND_MINERALS)[0]
        if (terminal && mineral) {
            let type = mineral.mineralType
            if (['U', 'L', 'Z', 'K'].some(obj => obj == type) && terminal.store[type] && terminal.store[type] > 3000) {
                // console.log(room.name+' type='+type+' store='+ terminal.store[type])
                for (let roomNames in Memory.rooms) {
                    let rooms = Game.rooms[roomNames]
                    if (rooms.controller.level == 8) {
                        let terminals = rooms.terminal
                        // console.log('send='+ rooms.name+' last='+(terminals.storeCapacity - _.sum(terminals.store) ))
                        if (terminals && (terminals.store[type] ? terminals.store[type] < 100 : true) && terminals.storeCapacity - _.sum(terminals.store) > 3000) {
                            terminal.send(type, 3000, rooms.name)
                            break
                        }
                    }
                }
            }
        }
}