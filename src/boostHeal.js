function born(spawnnow, creepname, memory) {
    let body = memory.body
    if (!body) {
        body = {
            'tough': 12,
            'move': 10,
            'heal': 28
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
            if (creep.getActiveBodyparts('move') > 10 &&
                lab.mineralType === 'XZHO2'
            ) {
                creep.memory.boostStep++
            } else {
                const act = lab.boostCreep(creep)
                if (act === OK || act === ERR_NOT_FOUND) {
                    creep.memory.boostStep++
                } else if (act === ERR_NOT_IN_RANGE) {
                    creep.moveTo(lab)
                }
            }

        } else {
            creep.memory.status = 'going'
            creep.room.memory.reaction.boostReady = false

        }
    } else if (creep.memory.status === 'pair') {
        if (creep.ticksToLive >= 1490) {
            if (Game.flags['single' + creep.memory.missionid]) {
                creep.memory.status = 'goBoost'

            }
        } else {
            const spawn = creep.room.spawns.find(o => !o.spawning)
            if (spawn) {
                creep.moveTo(spawn, {range: 1})
                spawn.renewCreep(creep)
            }
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
        if (creep.hits < creep.hitsMax) {
            creep.heal(creep)
        }

    } else if (creep.memory.status == 'fighting') {
        let range1Creep = creep.pos.findInRange(FIND_MY_CREEPS, 1)
        let range3Creep = creep.pos.findInRange(FIND_MY_CREEPS, 3)
        let goal = new RoomPosition(...creep.memory.goal)
        let target = Game.getObjectById(creep.memory.pair)
        let healT
        if (creep.hitsMax - creep.hits < 400) {
            let hurtCreep = _.max(range1Creep, o => o.hitsMax - o.hits)
            let hurtCreep3 = _.max(range3Creep, o => o.hitsMax - o.hits)
            if (hurtCreep && typeof hurtCreep === 'object' && hurtCreep.id && hurtCreep.hitsMax > hurtCreep.hits) {
                healT = hurtCreep
            } else if (creep.hitsMax > creep.hits) {
                healT = creep
            } else if (hurtCreep3 && typeof hurtCreep3 === 'object' && hurtCreep3.id && hurtCreep3.hitsMax > hurtCreep3.hits) {
                healT=hurtCreep3
            } else {
                let outPut = range1Creep.find(o => o.getActiveBodyparts(ATTACK) || o.getActiveBodyparts(WORK))
                if (outPut) {
                    healT = outPut
                    if (!target) {
                        creep.memory.pair = outPut.id
                        target = outPut
                    }
                }
                if (!healT) {
                    healT = creep
                }
            }
        } else {
            healT = creep
        }
        if (target && target.memory.pair !== creep.id) {
            if (!creep.pos.isNearTo(target.pos)) {
                creep.moveTo(target, {ignoreCreeps: false, range: 1})
            }
        }

        if (!creep.pos.isNearTo(healT.pos) > 1 && !creep.getActiveBodyparts(RANGED_ATTACK)) {
            creep.rangedHeal(healT)
        } else {
            creep.heal(healT)
        }

        const fix = Game.flags['fix' + creep.memory.missionid]

        if (fix) {
            creep.moveTo(fix, {ignoreCreeps: false})
        }

    } else if (creep.memory.status == 'rush') {

        if (creep.getActiveBodyparts(ATTACK) === 0 && creep.getActiveBodyparts(HEAL) === 0 && creep.getActiveBodyparts(RANGED_ATTACK) === 0) {
            return Game.war.workRush(creep)
        }
        if (Game.time % 20 == 0) {
            Game.memory.roomCachettl[creep.pos.roomName] = 0
        }
        const enemys = Game.war.getEnemy(creep)
        if (enemys.length > 0) {
            if (enemys[3]) {
                Game.war.fightDangerous(creep, enemys)
            } else {
                Game.war.fightNormal(creep, enemys)
            }
        } else {

            let target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: obj => obj.hits && obj.structureType != STRUCTURE_RAMPART && (!obj.pos.lookFor(LOOK_STRUCTURES).some(obj => obj.structureType == STRUCTURE_RAMPART))})
            if (!target) target = creep.pos.findClosestByRange(FIND_HOSTILE_CONSTRUCTION_SITES, {filter: o => o.progress > 0})
            if (target) {
                creep.moveTo(target, {ignoreCreeps: false, reusePath: 10})
                if (!target.ticksToLive && creep.pos.getRangeTo(target) <= 1 && !target.progressTotal && (target.structureType ? target.structureType != STRUCTURE_ROAD && target.structureType != STRUCTURE_CONTAINER : true)) {
                    creep.rangedMassAttack()
                    creep.dismantle(target)
                    creep.say('⚡')
                } else {
                    let act = null
                    if (target.ticksToLive && target.pos.getRangeTo(creep.pos) <= 1) {
                        act = creep.rangedMassAttack()
                        creep.say('⚡')

                    } else {
                        let act = creep.rangedAttack(target)
                        if (act == OK) {
                            creep.say('🏹')
                        } else {
                            creep.say('🚀')
                        }
                    }


                }
            } else {
                creep.say('')
            }
        }


    } else if (creep.memory.status === 'flagRush') {
        creep.heal(creep)
        let flag = Game.flags['heal' + creep.memory.missionid]
        if (flag) {
            creep.moveTo(flag.pos, {range: 1})
        }
        let enemy = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3, {filter: o => o.pos.lookFor(LOOK_STRUCTURES).every(o => o.structureType !== STRUCTURE_RAMPART)})
        enemy = require('lodash-my').maxBy(enemy, Game.war.howDangerous)
        if (enemy) {
            if (enemy.pos.isNearTo(creep)) {
                creep.rangedMassAttack()
            } else {
                creep.rangedAttack(enemy)
            }
        } else {
            enemy = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 3, {filter: o => o.hits})[0]
            if (!enemy) creep.pos.findInRange(FIND_STRUCTURES, 3)[0]
            creep.rangedAttack(enemy)
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
