function born(spawnnow, creepname, memory) {
    let body = memory.body
    if (!body) {
        body = {
            'tough': 12,
            'work': 28,
            'move': 10,
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
        if (creep.memory.pair) {
            Game.getObjectById(creep.memory.pair).memory.pair=creep.id
            creep.memory.status = 'going'
        }
    } else if (creep.memory.status === 'going') {
        let config = null
        try {
            config = Memory.army[creep.memory.missionid].from[creep.name.split('_')[0]]

        } catch (e) {
            console.log('boostAttack.work.config' + e)
            creep.memory.status = 'fighting'
            return
        }
        const act = Game.tools.moveByLongPath(config.path, creep)
        if (act == OK) {
            creep.memory.status = 'fighting'
        }

    } else if (creep.memory.status == 'fighting') {
        let goal = new RoomPosition(...creep.memory.goal)
        if (Game.flags['rush' + creep.memory.missionid]) {
            creep.memory.status = 'rush'
        }
    } else if (creep.memory.status == 'rush') {
        if (Game.time % 5 == 0) {
            require('tools').roomCachettl[creep.pos.roomName] = 0
        }
        const flag = Game.flags['rush' + creep.memory.missionid]
        if (!flag) {
            creep.memory.status = 'fighting'
            return
        }
        if (creep.hits === creep.hitsMax) {
            if (creep.pos.isNearTo(flag.pos)) {
                let target = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 1)[0]
                if (!target) target = creep.pos.findInRange(FIND_STRUCTURES, 1)[0]
                if (target) {
                    creep.dismantle(target)
                }
            } else {
                const structures = flag.pos.lookFor(LOOK_STRUCTURES)
                const rampart = structures.find(struct => struct.structureType = STRUCTURE_RAMPART)
                if (rampart) {
                    creep.dismantle(rampart)
                } else {
                    creep.dismantle(structures[0])
                }
            }
            creep.moveTo(flag.pos)
        }
    }
}

module.exports = {
    'work': work,
    'born': born,
};
