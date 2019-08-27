function born(spawnnow, creepname, memory) {
    let bodyparts = require('tools').generatebody({
        'work': 24,
        'move': 25,
        'attack': 1,
    }, spawnnow)
    // console.log(JSON.stringify(bodyparts))
    return spawnnow.spawnCreep(
        bodyparts,
        creepname,
        {
            memory: {
                status: 'going',
                missionid: memory.roomName,
                step: 0,
                goal: memory.goal,
                position: memory.position,
            }
        }
    )
}


function work(creep) {
    //打爆

    if (creep.memory.status == 'going') {
        const posx = creep.memory.position[creep.memory.step]
        let pos = new RoomPosition(posx[0], posx[1], posx[2])
        creep.moveTo(pos, {reusePath: 20})
        if (creep.pos.getRangeTo(pos) <= 1) {
            creep.memory.step++
        }
        if (creep.memory.step == creep.memory.position.length) {
            creep.memory.status = 'wait'
            delete creep.memory.position
            delete creep.memory.step
        }
    } else if (creep.memory.status == 'wait') {
        creep.moveTo(new RoomPosition(27, 46, 'E31N41'))
        if (creep.pos.getRangeTo(new RoomPosition(27, 46, 'E31N41'))==0) {
            let flag = Game.flags['attack']
            if (flag) creep.memory.status = 'pointing'

        }
    }
    else if (creep.memory.status == 'move') {
        let pos = new RoomPosition(25, 25, creep.memory.missionid)
        creep.moveTo(pos)
        if (creep.pos.getRangeTo(pos) <= 20) {
            creep.memory.status = 'fighting'
        }
    } else if (creep.memory.status == 'fighting') {
        let target = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3)[0]
        if (target) {
            let act = creep.attack(target)
            creep.say('🗡')
            if (act == ERR_NOT_IN_RANGE)
                creep.moveTo(target)
            // creep.moveTo(new RoomPosition(25,25,'E29N38'))
        } else {
            let target = Game.getObjectById('5d5dcbb6debcf91de55318e1')
            if (!target) {
                target = Game.getObjectById('5d5d695658810a61c0be7d10')
            }
            if (!target) target = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: obj => obj.structureType != STRUCTURE_CONTROLLER})
            if (creep.getActiveBodyparts('work')) {
                creep.say('💪')
                if (creep.dismantle(target) == ERR_NOT_IN_RANGE) creep.moveTo(target)
            } else {
                if (creep.attack(target) == ERR_NOT_IN_RANGE) creep.moveTo(target)
            }
        }
    } else if (creep.memory.status == 'pointing') {
        const roomName = creep.name.split('_')[0]
        const flag = Game.flags["he"]
        if (flag && creep.pos.getRangeTo(flag)>1) {
            creep.moveTo(flag)
        }
        let target = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 1)[0]
        if (target) creep.attack(target)
        if (!target) {
            target = creep.pos.findInRange(FIND_STRUCTURES, 1)[0]
            creep.dismantle(target)
        }


    }


}

module.exports = {
    'work': work,
    'born': born,
};