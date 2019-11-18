function born(spawnnow, creepname, memory) {
    let body = memory.body
    if (!body) {
        body = {
            'tough': 10,
            'work': 30,
            'move': 10,
        }
    }


    let bodyparts = require('tools').generatebody(body, spawnnow)
    return spawnnow.spawnCreep(
        bodyparts,
        creepname,
        {
            memory: {
                status: 'pair',
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
            creep.room.memory.reaction.boostReady = false
            creep.memory.status = 'going'
        }
    } else if (creep.memory.status === 'pair') {
        if (creep.ticksToLive >= 1490) {
            if (creep.memory.pair) {
                Game.getObjectById(creep.memory.pair).memory.pair = creep.id
                creep.memory.status = 'goBoost'
            }
        } else {
            const spawn = creep.room.spawns.find(o => !o.spawning)
            if (spawn) {
                creep.moveTo(spawn)
                spawn.renewCreep(creep)
            }
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
        if (Game.flags['rush' + creep.memory.missionid]) {
            creep.memory.status = 'rush'
        } else if (Game.flags['realrush' + creep.memory.missionid]) {
            creep.memory.status = 'realrush'
        }
    } else if (creep.memory.status == 'rush') {
        if (Game.time % 5 == 0) {
            Game.memory.roomCachettl[creep.pos.roomName] = 0
        }
        const flag = Game.flags['rush' + creep.memory.missionid]
        if (!flag) {
            creep.memory.status = 'fighting'
            return
        }
        let pair = Game.getObjectById(creep.memory.pair)
        if (creep.pos.roomName === flag.pos.roomName) {
            if (!creep.pos.isNearTo(flag.pos)) {
                let target = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 1)[0]
                if (!target) target = creep.pos.findInRange(FIND_STRUCTURES, 1, {filter: o => o.structureType !== STRUCTURE_CONTAINER})[0]
                if (target) {
                    creep.dismantle(target)
                    creep.rangedAttack(target)
                }
            } else {
                const structures = flag.pos.lookFor(LOOK_STRUCTURES)
                const rampart = structures.find(struct => struct.structureType === STRUCTURE_RAMPART)
                if (rampart) {
                    creep.dismantle(rampart)
                    creep.rangedAttack(rampart)
                } else if (structures[0]) {
                    creep.rangedAttack(structures[0])
                    creep.dismantle(structures[0])
                } else {
                    let target = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 1)[0]
                    if (!target) target = creep.pos.findInRange(FIND_STRUCTURES, 1, {filter: o => o.structureType !== STRUCTURE_CONTAINER})[0]
                    if (target) {
                        creep.dismantle(target)
                        creep.rangedAttack(target)
                    }
                }
            }
        }
        if (creep.pos.isNearTo(pair) || creep.pos.x <= 1 || creep.pos.x >= 48 || creep.pos.y <= 1 || creep.pos.y >= 48) {
            if (!creep.pos.isEqualTo(flag) && pair.fatigue === 0) {
                creep.moveTo(flag, {ignoreCreeps: false})
                pair.moveTo(creep)
            }
        }
        const fix = Game.flags['fix2' + creep.memory.missionid]
        if (fix) {
            creep.moveTo(fix)
        }
    } else if (creep.memory.status == 'realrush') {
        const flag = Game.flags['realrush' + creep.memory.missionid]
        if (!flag) {
            creep.memory.status = 'fighting'
            return
        }
        let pair = Game.getObjectById(creep.memory.pair)
        if (creep.hits === creep.hitsMax) {
            let target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {filter: o => o.structureType != STRUCTURE_CONTROLLER && o.structureType != STRUCTURE_RAMPART && o.structureType != STRUCTURE_EXTRACTOR})
            if (!target) target = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: o => o.structureType != STRUCTURE_WALL && o.structureType != STRUCTURE_RAMPART})
            if (!target) target = creep.room.find(FIND_STRUCTURES, {filter: o => o.hits})
            if (target) {
                creep.dismantle(target)
            }
            if (creep.pos.isNearTo(pair) || creep.pos.x <= 1 || creep.pos.x >= 48 || creep.pos.y <= 1 || creep.pos.y >= 48) {
                creep.moveTo(target, {ignoreCreeps: false})
                pair.moveTo(creep)
            }
            if(!target){
                creep.memory.status='sign'
            }
        }

    } else if (creep.memory.status === 'sign') {
        creep.moveTo(creep.room.controller)
        let act = creep.signController(creep.room.controller, 'Non-coding players unwelcome outside shard0 - expect summary execution')
        if (act === OK) {
            creep.memory.status = 'fighting'
        }
    }
}

module.exports = {
    'work': work,
    'born': born,
};
