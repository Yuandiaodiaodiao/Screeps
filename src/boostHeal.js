function born(spawnnow, creepname, memory) {
    let body = memory.body
    if (!body) {
        body = {
            'tough': 12,
            'ranged_attack': 3,
            'move': 10,
            'heal': 25
        }
    }


    let bodyparts = require('tools').generatebody(body, spawnnow)
    return spawnnow.spawnCreep(
        bodyparts,
        creepname,
        {
            memory: {
                status: 'goBoost',
                boostStep: 0,
                missionid: memory.targetRoomName,
                step: 0,
                goal: memory.goal,
            }
        }
    )
}


function work(creep) {
    if (creep.memory.status === 'goBoost') {
        let boostStep = creep.memory.boostStep
        let lab = creep.room.labs[boostStep]
        while (lab && lab.mineralAmount === 0) {
            boostStep++
            lab = creep.room.labs[boostStep]
        }
        creep.memory.boostStep = boostStep
        if (lab) {
            const act = lab.boostCreep(creep)
            if (act === OK || act === ERR_NOT_FOUND) {
                creep.memory.boostStep++
            } else if (act === ERR_NOT_IN_RANGE) {
                creep.moveTo(lab)
            }
        } else {
            creep.memory.status = 'pair'
        }
    } else if (creep.memory.status === 'pair') {
        const targetCreep = creep.room.find(FIND_CREEPS, {filter: o => o.name.split('_')[1] === 'boostAttack'})
        if (!targetCreep.memory.pair) {
            targetCreep.memory.pair = creep.id
        }
        if (creep.memory.pair && Game.getObjectById(creep.memory.pair).memory.pair === creep.id) {
            creep.memory.status = 'going'
        }
    } else if (creep.memory.status === 'going') {
        let config = null
        try {
            config = Memory.army[creep.memory.missionid].from[creep.name.split('_')[0]]

        } catch (e) {
            console.log('boostHEAL.work.config' + e)
            creep.memory.status = 'fighting'
            return
        }
        const act = Game.tools.moveByLongPath(config.path, creep)
        if (act == OK) {
            creep.memory.status = 'fighting'
            creep.memory.healTarget = creep.id
        }

    } else if (creep.memory.status == 'fighting') {
        let goal = new RoomPosition(...creep.memory.goal)
        const target = Game.getObjectById(creep.memory.pair)
        creep.moveTo(target, {serializeMemory: false, ignoreCreeps: false})
        creep.memory.healTarget = creep.id
        if (creep.hits < creep.hitsMax) {
            creep.memory.healTarget = creep.id
        } else if (target.hits < target.hitsMax) {
            creep.memory.healTarget = target.id
        }
        creep.heal(Game.getObjectById(creep.memory.healTarget))
        let enemy = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3)[0]
        if (enemy) {
            if (enemy.pos.isNearTo(creep)) {
                creep.rangedMassAttack()
            } else {
                creep.rangedAttack(enemy)
            }
        } else {
            enemy = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 3)[0]
            creep.rangedAttack(enemy)
        }
    }

}

module.exports = {
    'work': work,
    'born': born,
};
