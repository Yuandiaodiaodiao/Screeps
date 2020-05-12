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
                teamNum: memory.teamNum,
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
            const targetCreeps = creep.room.find(FIND_MY_CREEPS, {filter: o => o.name.split('_')[1] === 'boostHeal' && o.memory.missionid === creep.memory.missionid})

            if (creep.memory.pair) {
                Game.getObjectById(creep.memory.pair).memory.pair = creep.id
                let nums = 0
                targetCreeps.forEach(o => {
                    if (o.memory.pair === creep.id) {
                        nums++
                    }
                })
                if (nums >= (creep.memory.teamNum || 1)) {
                    creep.memory.status = 'goBoost'
                    targetCreeps.forEach(o => {
                        if (o.memory.pair === creep.id) {
                            o.memory.status = 'goBoost'
                        }
                    })
                } else {
                    let pair = targetCreeps.find(o => !o.memory.pair)
                    if (pair) {
                        pair.memory.pair = creep.id
                    }
                }
            } else {
                if (targetCreeps.length === 0) return
                let pair = targetCreeps.find(o => !o.memory.pair)
                if (pair) {
                    pair.memory.pair = creep.id
                    creep.memory.pair = pair.id
                }

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
            return
        }
        const act = Game.tools.moveByLongPath(config.path, creep)
        if (act == OK) {
            let nums = _.sum(creep.room.find(FIND_MY_CREEPS, {filter: o => o.memory.pair === creep.id}), p => {
                if (p.pos.isNearTo(creep.pos)) {
                    return 1
                } else {
                    p.moveTo(creep, {range: 1, ignoreCreeps: false})
                    return 0
                }
            })
            if (nums >= (creep.memory.teamNum || 1)) {
                creep.memory.status = 'autoIn'
            } else {
                creep.memory.status = 'fighting'
            }
        }

    } else if (creep.memory.status === 'autoIn') {
        let flagIn = Game.flags['autoIn' + creep.memory.missionid]

        let flag = Game.flags['rush' + creep.memory.missionid]
        if (!flagIn) {
            creep.memory.status = 'fighting'
            return
        }
        if (!flag) {
            creep.memory.status = 'fighting'
            return
        }

        let pair = Game.getObjectById(creep.memory.pair)
        let roomdis = Game.map.getRoomLinearDistance(creep.room.name, flag.pos.roomName)
        if (roomdis === 1) {
            if (!creep.pos.isNearTo(pair) && creep.pos.roomName === pair.pos.roomName) {
                pair.moveTo(creep)
            } else {
                creep.moveTo(flagIn)
                pair.moveTo(flagIn)
            }
        } else if (creep.room.name === flag.pos.roomName) {
            creep.moveTo(flagIn)
            pair.moveTo(flagIn)
        } else {

            creep.moveTo(flagIn)
            pair.moveTo(creep)
        }
        if (creep.pos.isNearTo(flagIn) && pair.pos.isNearTo(flagIn)) {
            creep.memory.status = 'rush'
        }

    } else if (creep.memory.status === 'fighting') {
        if (Game.flags['rush' + creep.memory.missionid]) {
            creep.memory.status = 'rush'
        } else if (Game.flags['realrush' + creep.memory.missionid]) {
            creep.memory.status = 'realrush'
        } else if (Game.flags['goin' + creep.memory.missionid]) {
            creep.memory.status = 'goin'
            creep.memory.goin = undefined
        }
    } else if (creep.memory.status === 'rush') {
        const flag = Game.flags['rush' + creep.memory.missionid]
        if (!flag) {
            creep.memory.status = 'fighting'
            return
        }

        if (Game.time % 10 === 0 && flag) {
            Game.memory.roomCachettl[creep.pos.roomName] = 0
            let sources = creep.pos.findClosestByPath(FIND_SOURCES, {filter: o => o.pos.findInRange(FIND_HOSTILE_CREEPS, 2,).length > 0})
            if (sources) {
                let ans = PathFinder.search(creep.pos, {pos: sources.pos, range: 0}, {
                    roomCallback: Game.tools.roomc_nocreep,
                    plainCost: 1,
                    swampCost: 5,
                    maxCost: 254,
                    maxRooms: 1,
                    maxOps: 500
                })
                if (!ans.incomplete) {
                    flag.setPosition(sources.pos)
                }
            } else {
                let wallflag = Game.flags['wall' + creep.memory.missionid]
                if (wallflag) {
                    flag.setPosition(wallflag.pos)
                }
            }
        }
        if (creep.hits < creep.hitsMax) {
            if (!flag.pos.isNearTo(creep.pos) && !Game.war.isSide(creep.pos)) {
                flag.setPosition(creep.pos)
            }
        }
        let pair = Game.getObjectById(creep.memory.pair)
        if (!pair) {
            pair = creep.room.find(FIND_MY_CREEPS, {filter: o => o.memory.pair === creep.id})[0]
            if (pair) {
                creep.memory.pair = pair.id
            }
        }

        let moved = false
        let moveTarget
        if (creep.pos.roomName === flag.pos.roomName) {
            let attackEd = false
            let enemy = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3, {filter: o => o.pos.lookFor(LOOK_STRUCTURES).every(o => o.structureType !== STRUCTURE_RAMPART)})
            let boostEnemys = creep.room.find(FIND_HOSTILE_CREEPS, {
                filter: o => {
                    return require('tower.targetSelecter').isBoost(o.body, RANGED_ATTACK) || require('tower.targetSelecter').isBoost(o.body, ATTACK)
                }
            })
            let boostEnemy

            if (boostEnemys.length > 0) {
                boostEnemy = creep.pos.findClosestByRange(boostEnemys)
            }
            let nearestEnemy
            let canAttack = creep.pos.findClosestByRange(enemy)
            if (boostEnemy) {
                nearestEnemy = boostEnemy
            } else {
                nearestEnemy = creep.pos.findClosestByRange(enemy)
            }
            if (canAttack && canAttack.pos.isNearTo(creep)) {
                creep.attack(canAttack)
                pair.rangedAttack(nearestEnemy)
                attackEd = true
            }
            let attackPart = creep.getActiveBodyparts(ATTACK) + creep.getActiveBodyparts(RANGED_ATTACK)
            if (typeof nearestEnemy === 'object' && nearestEnemy != null && nearestEnemy.id&& attackPart>0) {
                //主动出击
                let ans = PathFinder.search(creep.pos, {pos: nearestEnemy.pos, range: 0}, {
                    roomCallback: Game.tools.roomc_nocreep,
                    plainCost: 1,
                    swampCost: 5,
                    maxCost: 254,
                    maxRooms: 1,
                    maxOps: 500
                })
                if (!ans.incomplete) {
                    if (nearestEnemy.pos.isNearTo(creep.pos)) {
                        creep.attack(nearestEnemy)
                        moveTarget = nearestEnemy
                        moved = true
                        attackEd = true
                    } else {
                        pair.rangedAttack(nearestEnemy)
                        if (nearestEnemy.pos.getRangeTo(creep.pos) <= 3) {
                            moveTarget = nearestEnemy
                            moved = true
                        }
                    }
                } else if (boostEnemy && boostEnemy.pos.getRangeTo(creep.pos) <= 8) {
                    let nearBoost = _.sum(boostEnemys, o => o.pos.getRangeTo(creep.pos) <= 4 ? 1 : 0)
                    if (nearBoost >= 2) {
                        let flagc = Game.flags['comeon' + creep.memory.missionid]
                        flag.setPosition(flagc.pos)
                        console.log('reset comeon')
                    }

                }

            }
            if (!creep.pos.isNearTo(flag.pos) && attackEd === false) {
                //打沿路建筑
                let target = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 1)[0]
                if (!target) target = creep.pos.findInRange(FIND_STRUCTURES, 1, {filter: o => o.structureType !== STRUCTURE_CONTAINER})[0]
                if (target) {
                    if (creep.getActiveBodyparts(WORK)) {
                        creep.dismantle(target)
                    } else {
                        creep.attack(target)
                    }
                    creep.rangedAttack(target)
                }
            } else if (attackEd === false) {
                //打旗子建筑
                const structures = flag.pos.lookFor(LOOK_STRUCTURES)
                const rampart = structures.find(struct => struct.structureType === STRUCTURE_RAMPART)
                if (rampart) {
                    if (creep.getActiveBodyparts(WORK)) {
                        creep.dismantle(rampart)
                    } else {
                        creep.attack(rampart)
                    }
                    if (pair) {
                        pair.rangedMassAttack()
                    }
                    creep.rangedAttack(rampart)
                } else if (structures[0]) {
                    if (creep.getActiveBodyparts(WORK)) {
                        creep.dismantle(structures[0])
                    } else {
                        creep.attack(structures[0])
                        if (pair) {
                            if (structures[0].owner) {
                                pair.rangedMassAttack()
                            }
                        }
                    }

                } else {
                    //攻击过了 随便打打
                    let target = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 1)[0]
                    if (!target) target = creep.pos.findInRange(FIND_STRUCTURES, 1, {filter: o => o.structureType !== STRUCTURE_CONTAINER})[0]
                    if (target) {
                        if (creep.getActiveBodyparts(WORK)) {
                            creep.dismantle(target)
                        } else {
                            creep.attack(target)
                            if (pair) {
                                if (target.owner) {
                                    pair.rangedMassAttack()
                                }
                            }
                        }
                        creep.rangedAttack(target)
                    }
                }
            }


            if (creep.pos.isNearTo(pair.pos) && creep.pos.roomName === pair.pos.roomName && creep.pos.roomName === flag.pos.roomName) {
                if (Game.war.isSide(creep)) {
                    let act = Game.war.moveAwayFromSide(creep)
                    if (act === OK) {
                        act = true
                    }
                }
                if (Game.war.isSide(pair)) {
                    Game.war.moveAwayFromSide(pair)
                }
                if (!creep.pos.isNearTo(flag.pos) && pair.fatigue === 0 && !Game.war.isSide(creep) && !Game.war.isSide(pair) && !moved) {
                    // creep.moveTo(flag, {ignoreCreeps: false, range: 1})

                    // pair.moveTo(creep)
                    moveTarget = flag
                }
            }
            if (moveTarget && creep.pos.isNearTo(pair.pos) && creep.fatigue === 0 && pair.fatigue === 0 && !Game.war.isSide(creep) && !Game.war.isSide(pair)) {
                let nearcreeps = creep.pos.findInRange(FIND_MY_CREEPS, 1)
                let banPos = {}
                let lastM = require('prototype.Creep.move').lastMove
                let move2dir = require('prototype.Creep.move').pos2direction
                // creep.moveTo(moveTarget,{ignoreCreeps:false,reusePath:4,range:1})
                let cantMove = nearcreeps.some(o => {
                    if (o.id === pair.id) {
                        return false
                    }
                    let last = lastM[o.name]
                    if (last && lastM[3] === Game.time) {
                        let lastPos = new RoomPosition(lastM[0], lastM[1], o.pos.roomName)
                        let toPos = move2dir(lastPos, lastM[2])
                        if (toPos && creep.pos.isEqualTo(toPos)) {
                            return true
                        }
                    }
                    return false
                })
                if (cantMove) {
                    creep.cancelOrder('move')
                    console.log(`${creep.name} cancel move`)
                } else {
                    //可以移动
                    if (creep.pos.isNearTo(moveTarget) && moveTarget.body && !moveTarget.my) {
                        creep.move(creep.pos.getDirectionTo(moveTarget.pos))
                    } else {
                        creep.moveTo(moveTarget, {ignoreCreeps: false, reusePath: 4, range: 1})
                    }
                    let tarlastM = lastM[creep.name]
                    let tarpos = move2dir(new RoomPosition(tarlastM[0], tarlastM[1], creep.room.name), tarlastM[2])
                    if (!(tarpos && tarpos.isNearTo(pair.pos))) {
                        pair.moveTo(creep)
                    }

                }
            } else if (creep.pos.roomName === flag.pos.roomName && !Game.war.isSide(creep) && !Game.war.isSide(pair) && !creep.pos.isNearTo(pair.pos)) {
                if (creep.pos.getRangeTo(pair.pos) > 2) {
                    creep.moveTo(pair)
                    pair.moveTo(creep)
                } else {
                    if (pair.fatigue === 0) {
                        pair.moveTo(creep)
                    } else if (creep.fatigue === 0) {
                        creep.moveTo(pair)
                    }
                }

            }
        } else {
            creep.memory.status = 'autoIn'
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
            let target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {filter: o => o.hits && o.structureType != STRUCTURE_RAMPART && o.structureType != STRUCTURE_SPAWN})
            if (!target) target = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: o => o.hits && o.structureType != STRUCTURE_WALL})
            if (!target) target = creep.room.find(FIND_STRUCTURES, {filter: o => o.hits})
            if (target) {
                creep.dismantle(target)
            }
            if (creep.pos.isNearTo(pair) || creep.pos.x <= 1 || creep.pos.x >= 48 || creep.pos.y <= 1 || creep.pos.y >= 48) {
                if (pair.fatigue === 0) {
                    creep.moveTo(target, {ignoreCreeps: false})
                    pair.moveTo(creep)
                }
            }
            if (!target) {
                creep.memory.status = 'sign'
            }
        }

    } else if (creep.memory.status == 'goin') {

        let pair = Game.getObjectById(creep.memory.pair)
        if (!creep.memory.goinDir) {
            const flag1 = Game.flags['goin' + creep.memory.missionid]
            let dir = creep.pos.getDirectionTo(flag1.pos)
            creep.memory.goinDir = dir
        }
        let dir = creep.memory.goinDir
        creep.memory.goin = (creep.memory.goin || 0) + 1
        if (creep.memory.goin > 3) {
            const flag = Game.flags['goin' + creep.memory.missionid]
            if (!flag) {
                creep.memory.goin = undefined
                creep.memory.goinDir = undefined
                creep.memory.status = 'fighting'
            }
        } else {
            creep.move(dir)
            pair.move(dir)
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
