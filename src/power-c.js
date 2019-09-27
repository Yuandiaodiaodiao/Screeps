function born(spawnnow, creepname, memory) {
    let bodyparts = require('tools').generatebody({
        'carry': 25,
        'move': 25,
    }, spawnnow)
    return spawnnow.spawnCreep(
        bodyparts,
        creepname,
        {
            memory: {
                status: 'going',
                missionid: memory.roomn,
                step: 0,
            }
        }
    )
}


function work(creep) {
    //rush
    const powerp = Memory.powerPlan[creep.memory.missionid]
    if (powerp) {
        powerp.timelock = Game.time
    }else{
        creep.suicide()
    }
    if (creep.memory.status == 'going') {
        const posx = powerp.position[creep.memory.step]
        let pos = new RoomPosition(posx[0], posx[1], posx[2])
        creep.moveTo(pos, {reusePath: 25, plainCost: 1, swampCost: 5})
        if (creep.pos.getRangeTo(pos) <= 3) {
            creep.memory.step++
        }
        if (creep.memory.step == powerp.position.length) {
            creep.memory.status = 'get'

        }
    } else if (creep.memory.status == 'get') {
        // console.log('poerpstatus=' + powerp.status)
        let pb=creep.room.powerBanks[0]
        if(!pb &&powerp.status<4){
            powerp.status=4
        }
        if (powerp.status >= 4) {
            let res = creep.room.find(FIND_DROPPED_RESOURCES)[0]
            if (res) {
                const act = creep.pickup(res)
                if (act == ERR_NOT_IN_RANGE) {
                    creep.moveTo(res, {plainCost: 1, swampCost: 5})
                } else if (act == ERR_FULL) {
                    creep.memory.status = 'return'
                }
            } else if (_.sum(creep.carry) == creep.carryCapacity) {
                creep.memory.status = 'return'
            } else if (res = creep.room.find(FIND_TOMBSTONES, {filter: o => _.sum(o.store) > 0})[0]) {
                for (let type in res.store) {
                    creep.withdraw(res, type)
                    break
                }
                if (!creep.pos.isNearTo(res)) {
                    creep.moveTo(res, {plainCost: 1, swampCost: 5})
                }
            } else {
                creep.memory.status = 'return'
            }
        }

    } else if (creep.memory.status == 'return') {
        const posx = powerp.position[creep.memory.step - 1]
        let pos = new RoomPosition(posx[0], posx[1], posx[2])
        creep.moveTo(pos, {reusePath: 20})
        if (creep.pos.getRangeTo(pos) <= 3) {
            creep.memory.step--
        }
        if (creep.memory.step == 2) {
            creep.memory.status = 'fill'
        }
    } else if (creep.memory.status == 'fill') {
        const target = Game.rooms[powerp.spawnRoom].terminal
        if (creep.pos.getRangeTo(target) > 1) {
            creep.moveTo(target)
        } else {
            for (let type in creep.carry) {
                if (creep.carry[type] > 0) {
                    creep.transfer(target, type)
                    break
                }

            }
            if (_.sum(creep.carry) == 0) {
                creep.memory.status = 'suicide'
            }
        }
    } else if (creep.memory.status == 'suicide') {
        require('tools').suicide(creep)
    }


}

module.exports = {
    'work': work,
    'born': born,
};