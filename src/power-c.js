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
    powerp.timelock = Game.time
    if (creep.memory.status == 'going') {
        const posx = powerp.position[creep.memory.step]
        let pos = new RoomPosition(posx[0], posx[1], posx[2])
        creep.moveTo(pos, {reusePath: 20})
        if (creep.pos.getRangeTo(pos) <= 3) {
            creep.memory.step++
        }
        if (creep.memory.step == powerp.position.length) {
            creep.memory.status = 'get'

        }
    } else if (creep.memory.status == 'get') {
        // console.log('poerpstatus=' + powerp.status)
        if (powerp.status >= 4) {
            const res = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES)
            if (res) {
                const act = creep.pickup(res)
                if (act == ERR_NOT_IN_RANGE) {
                    creep.moveTo(res)
                } else if (act == ERR_FULL) {
                    creep.memory.status = 'return'
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
                if (creep.carry[type] > 0){
                    creep.transfer(target, type)
                    break
                }

            }
            if (_.sum(creep.carry) == 0) {
                creep.suicide()
            }
        }
    }

}

module.exports = {
    'work': work,
    'born': born,
};