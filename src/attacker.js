function born(spawnnow, creepname, memory) {
    console.log('spawnhealer')

    let bodyparts = require('tools').generatebody({
        'work': 23,
        'move': 26,
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
        if (Game.flags['pointing']) creep.memory.status = 'pointing'
        else if (Game.flags['fighting']) creep.memory.status = 'fighting'
    } else if (creep.memory.status == 'fighting') {
        let target = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3)[0]
        if (target) {
            let act = creep.attack(target)
            creep.say('🗡', true)
            if (act == ERR_NOT_IN_RANGE)
                creep.moveTo(target)
            // creep.moveTo(new RoomPosition(25,25,'E29N38'))
        } else {
            let target = Game.getObjectById('ID: 5d474d21713d616445252c9f')
            if (!target) {
                target = Game.getObjectById('5d5d695658810a61c0be7d10')
            }
            if (!target) target = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: obj => obj.structureType != STRUCTURE_CONTROLLER})
            if (creep.getActiveBodyparts('work')) {
                creep.say('💪', true)
                if (creep.dismantle(target) == ERR_NOT_IN_RANGE) creep.moveTo(target)
            } else {
                if (creep.attack(target) == ERR_NOT_IN_RANGE) creep.moveTo(target)
            }
        }
        if (!Game.flags['fighting']) creep.memory.status = 'wait'
    } else if (creep.memory.status == 'pointing') {
        const roomName = creep.name.split('_')[0]
        const flag = Game.flags["he"]
        if (flag && creep.pos.getRangeTo(flag) > 1) {
            creep.moveTo(flag)
        }
        let target = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 1)[0]
        if (target) creep.attack(target)
        if (!target) {
            target = creep.pos.findInRange(FIND_STRUCTURES, 1)[0]
            creep.dismantle(target)
        }
        if (!Game.flags['pointing']) creep.memory.status = 'wait'
    }


}

module.exports = {
    'work': work,
    'born': born,
};