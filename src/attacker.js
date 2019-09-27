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
        if (!Game.flags['fighting']) creep.memory.status = 'wait'
        const goalx = creep.memory.goal
        let goal = new RoomPosition(goalx[0], goalx[1], goalx[2])
        if (creep.pos.roomName == goal.roomName) {
            const exitDir = Game.map.findExit(creep.room, creep.memory.missionid)
            const exit = creep.pos.findClosestByRange(exitDir)
            creep.moveTo(exit)
        }
        let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
        if (target) {
            let act = creep.attack(target)
            creep.say('🗡', true)
            if (act == ERR_NOT_IN_RANGE)
                creep.moveTo(target)
            return
        }
        target = Game.getObjectById('5d5d695658810a61c0be7d10')
        if (!target) target = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: obj => obj.structureType != STRUCTURE_CONTROLLER})
        if (target) {
            creep.say('💪', true)
            if (creep.dismantle(target) == ERR_NOT_IN_RANGE) creep.moveTo(target)
            return
        }
        target = creep.pos.findClosestByRange(FIND_HOSTILE_CONSTRUCTION_SITES)
        if (target&&(!(creep.pos.isEqualTo(target)))) {
            creep.say('🐎')
            creep.moveTo(target)
            return
        }
        target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
        if (target) {
            creep.attack(target)
            creep.moveTo(target, {plainCost: 1})
            return
        }
    } else if (creep.memory.status == 'pointing') {
        const roomName = creep.name.split('_')[0]
        const flag = Game.flags["pointing"]
        if (flag && creep.pos.getRangeTo(flag) > 1) {
            creep.moveTo(flag)
        }
        let target = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 1)[0]
        if (target) creep.attack(target)
        if (!target) {
            target = creep.pos.findInRange(FIND_STRUCTURES, 1)[0]
        }
        if (target) {
            creep.dismantle(target)

        }
        if (!target) {
            target = creep.pos.findInRange(FIND_HOSTILE_CONSTRUCTION_SITES, 1)[0]
        }
        if (target) {
            creep.moveTo(target)

        }

        if (!Game.flags['pointing']) creep.memory.status = 'wait'
    }


}

module.exports = {
    'work': work,
    'born': born,
};