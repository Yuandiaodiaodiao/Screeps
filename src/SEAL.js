function born(spawnnow, creepname, memory) {
    let body = memory.body
    if (!body) {
        body = {
            'ranged_attack': 9,
            'move': 10,
            'heal': 1,
        }
    }


    let bodyparts = require('tools').generatebody(body, spawnnow)
    return spawnnow.spawnCreep(
        bodyparts,
        creepname,
        {
            memory: {
                status: 'going',
                missionid: memory.targetRoomName,
                step: 0,
                goal: memory.goal,
            }
        }
    )
}


function work(creep) {
    if(creep.memory.statusx && !creep.memory.status){
        //是别人伪装的我
        if(creep.memory.missionid==="E29N37"){
            creep.memory.missionid="W29N37"
        }
        if(creep.room.name!==creep.memory.missionid){
            const exitDir = Game.map.findExit(creep.room.name,creep.memory.missionid)
            const exit = creep.pos.findClosestByRange(exitDir);
            console.log(exit,creep.memory.missionid)
            creep.moveTo(exit)
            return
        }

        const goal=Game.tools.leaveDoor(creep.pos)
        creep.memory.goal=Game.tools.pos2array(goal)
        creep.memory.status="fighting"

    }
    if (creep.memory.status == 'going') {
        let config = null
        try {
            config = Memory.army[creep.memory.missionid].from[creep.name.split('_')[0]]

        } catch (e) {
            console.log('seal.work.config' + e)
            return
        }
        try {
            const act = Game.tools.moveByLongPath(config.path, creep)
            if (act === OK) {
                creep.memory.status = 'fighting'
            }
        } catch (e) {
            console.log('seal moveBypath error' + e)
        }

        if (creep.hits < creep.hitsMax) {
            creep.heal(creep)
        }
        const target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
        if (target) {
            let boost = require('tower.targetSelecter').isBoost(target.body, RANGED_ATTACK)
            if (boost) {
                creep.memory.status = 'fighting'
            }
        }
    } else if (creep.memory.status == 'fighting') {


        creep.heal(creep)
        let goal = new RoomPosition(...creep.memory.goal)
        let targets = creep.room.find(FIND_HOSTILE_CREEPS)
        fireTargets(creep)
        let boostTarget = targets.filter(o => {
            o.range = o.body.some(bodypart => bodypart.type === RANGED_ATTACK) ? 5 : (o.body.some(bodypart => bodypart.type === ATTACK) ? 3 : undefined)
            if (require('tower.targetSelecter').isBoost(o.body, RANGED_ATTACK) || require('tower.targetSelecter').isBoost(o.body, ATTACK)) {
                o.boost = require('tower.targetSelecter').isBoost(o.body, RANGED_ATTACK) ? RANGED_ATTACK : ATTACK
                return true
            } else {
                return false
            }
        })
        if (boostTarget.length > 0) {
            let act = moveFromBoost(creep, targets, boostTarget)
            if (act) {
                return
            }
        }
        let dangerousCreep = targets.filter(o => o.range && o.pos.getRangeTo(creep.pos) <= 5)
        let inDanger = dangerousCreep.find(o => o.range >= o.pos.getRangeTo(creep.pos))
        if (creep.hits / creep.hitsMax < 0.95 || inDanger) {
            if (creep.pos.roomName === goal.roomName) {
                if (dangerousCreep.length > 0) {
                    let act = moveFromCreep(creep, dangerousCreep)
                }
            } else if (creep.pos.getRangeTo(goal) > 1) {
                creep.moveTo(goal)
            }

        } else {
            if (Game.flags['rush' + creep.memory.missionid]) {
                creep.memory.status = 'rush'
            } else if (Game.flags['go' + creep.memory.missionid]) {
                creep.memory.status = "go"
            } else if (Game.flags['test' + creep.memory.missionid]) {
                creep.memory.status = "testing"
            } else if (Game.flags['point' + creep.memory.missionid]) {
                creep.memory.status = "point"
            } else if (Game.flags['this' + creep.memory.missionid]) {
                creep.memory.status = "this"
            } else if (Game.flags['guard' + creep.memory.missionid]) {
                creep.memory.status = "guard"
            } else if (Game.flags['stay' + creep.memory.missionid]) {
                creep.memory.status = "stay"

            }
            if (creep.pos.roomName === goal.roomName) {
                //去下一个屋
                const exitDir = Game.map.findExit(creep.room, creep.memory.missionid)
                const exit = creep.pos.findClosestByRange(exitDir)
                creep.moveTo(exit)
            } else {
                if (creep.pos.roomName === goal.roomName && inDanger && inDanger.pos.getRangeTo(creep.pos) <= 2) {
                    let ans = PathFinder.search(creep.pos, {pos: inDanger.pos, range: 4}, {
                        plainCost: 1, swampCost: 5, roomCallback: require('tools').roomc, maxRooms: 2, flee: true
                    })
                    creep.moveByPath(ans.path);
                }
            }
        }


    }
    if (creep.memory.status == 'rush') {
        if (creep.pos.roomName === creep.memory.missionid) {
            if (Game.time % (Math.ceil(Math.random() * 5)) === 0) {
                if (creep.room.towers.length === 0) {
                    Game.war.moveAwayFromSide(creep)
                }
            }
        }
        if (creep.getActiveBodyparts(ATTACK) === 0 && creep.getActiveBodyparts(HEAL) === 0 && creep.getActiveBodyparts(RANGED_ATTACK) === 0) {
            return Game.war.workRush(creep)
        }
        if (Game.time % 20 == 0) {
            Game.memory.roomCachettl[creep.pos.roomName] = 0
        }
        if (creep.hits / creep.hitsMax < 0.95) {
            creep.memory.status = 'fighting'
            creep.heal(creep)
            let goal = new RoomPosition(...creep.memory.goal)
            if (creep.pos.roomName == goal.roomName && target && target.pos.getRangeTo(creep.pos) <= 2) {
                let ans = PathFinder.search(creep.pos, {pos: target.pos, range: 4}, {
                    plainCost: 1, swampCost: 5, roomCallback: require('tools').roomc, maxRooms: 1, flee: true
                })
                creep.moveByPath(ans.path)
            } else if (creep.pos.getRangeTo(goal) > 1) {
                creep.moveTo(goal, {plainCost: 1, swampCost: 5, ignoreCreeps: false})
            }
            const target = Game.war.getEnemy(creep)[0]
            if (target) {
                if (creep.pos.getRangeTo(target) <= 1) {
                    creep.rangedMassAttack()
                } else {
                    creep.rangedAttack(target)
                }
            }
        } else if (creep.pos.roomName === creep.memory.missionid) {
            const enemys = Game.war.getEnemy(creep)

            if (enemys.length > 0) {
                if (enemys[3]) {
                    Game.war.fightDangerous(creep, enemys)
                } else {
                    Game.war.fightNormal(creep, enemys)
                }
            } else {

                let target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: obj => obj.hits && obj.structureType != STRUCTURE_RAMPART && (!obj.pos.lookFor(LOOK_STRUCTURES).some(obj => obj.structureType == STRUCTURE_RAMPART)) && obj.structureType != STRUCTURE_CONTROLLER})
                if (!target) target = creep.pos.findClosestByRange(FIND_HOSTILE_CONSTRUCTION_SITES)
                if (!target) target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: obj => obj.hits && obj.structureType != STRUCTURE_CONTROLLER})
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
                }
            }

        } else {
            const exitDir = Game.map.findExit(creep.room, creep.memory.missionid)
            const exit = creep.pos.findClosestByRange(exitDir)
            creep.moveTo(exit)
        }
        if (!Game.flags['rush' + creep.memory.missionid]) {
            creep.memory.status = 'fighting'
        }
    } else if (creep.memory.status == 'go') {
        creep.heal(creep)
        creep.say('👎')
        let target = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3)[0]
        if (!target) target = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 3)[0]
        if (!target) target = creep.pos.findInRange(FIND_STRUCTURES, 3)[0]
        if (target) {
            if (creep.pos.getRangeTo(target) <= 1) {
                creep.rangedMassAttack()
            } else {
                creep.rangedAttack(target)
            }
        }
        let flag = Game.flags['go' + creep.memory.missionid]
        if (!flag) {
            creep.memory.status = 'fighting'
        } else {
            creep.moveTo(flag, {plainCost: 1, swampCost: 5, ignoreCreeps: false})
        }
    } else if (creep.memory.status == 'testing') {
        creep.heal(creep)
        creep.say('✌')

        let target = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3)[0]
        if (!target) target = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 3)[0]
        if (target) {
            if (creep.pos.getRangeTo(target) <= 1) {
                creep.rangedMassAttack()
            } else {
                creep.rangedAttack(target)
            }
        }
        let flag1 = Game.flags['test' + creep.memory.missionid]
        let flag2 = Game.flags['return' + creep.memory.missionid]
        if (!flag1) {
            creep.memory.status = 'fighting'
        } else if (creep.hits == creep.hitsMax && creep.pos.getRangeTo(flag1) >= 2) {
            creep.moveTo(flag1)
        } else if (creep.pos.getRangeTo(flag2) > 1) {
            creep.moveTo(flag2)
        }
    } else if (creep.memory.status == 'point') {
        let target = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 8, {filter: o => require('tower.targetSelecter').isBoost(o.body, RANGED_ATTACK)})[0]
        if (target) {
            if (target && target.pos.getRangeTo(creep.pos) <= 6) {
                let ans = PathFinder.search(creep.pos, {pos: target.pos, range: 6}, {
                    plainCost: 1, swampCost: 5, roomCallback: require('tools').roomc, maxRooms: 2, flee: true
                })
                creep.moveByPath(ans.path);
                creep.memory.status = 'fighting'
                return
            }
        }

        target = creep.pos.findInRange(FIND_HOSTILE_CREEPS, creep.getActiveBodyparts(RANGED_ATTACK) ? 3 : 1)[0]
        if (target) {
            if (creep.pos.getRangeTo(target) <= 1) {
                if (creep.getActiveBodyparts('attack')) {
                    creep.attack(target)
                } else {
                    creep.heal(creep)
                }
                creep.rangedMassAttack()
            } else {
                creep.rangedAttack(target)
                creep.heal(creep)
            }
        } else {
            target = undefined
        }
        const flag = Game.flags["point" + creep.memory.missionid]

        if(!target){
            const structures = flag.pos.lookFor(LOOK_STRUCTURES)
            const rampart = structures.find(struct => struct.structureType === STRUCTURE_RAMPART)
            if (rampart) {
                target=rampart
                if (creep.getActiveBodyparts(WORK)) {
                    creep.dismantle(rampart)
                } else {
                    creep.attack(rampart)
                }

                creep.rangedAttack(rampart)
            } else if (structures[0]) {
                target=structures[0]
                if (creep.getActiveBodyparts(WORK)) {
                    creep.dismantle(structures[0])
                } else {
                    creep.attack(structures[0])

                }

            }
        }
        if (!target) {
            target = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, creep.getActiveBodyparts(RANGED_ATTACK) ? 3 : 1)[0]
            if (target) {
                if (creep.getActiveBodyparts('work')) {
                    creep.dismantle(target)
                } else if (creep.getActiveBodyparts('attack')) {
                    creep.attack(target)
                }
                creep.rangedAttack(target)
            }
        }

        if (!target) {
            target = creep.pos.findInRange(FIND_HOSTILE_CONSTRUCTION_SITES, creep.getActiveBodyparts(RANGED_ATTACK) ? 3 : 1)[0]
            if (target) {
                creep.moveTo(target)
            }
        }
        if (!target) {
            target = creep.pos.findInRange(FIND_STRUCTURES, creep.getActiveBodyparts(RANGED_ATTACK) ? 3 : 1)[0]
            if (target) {
                creep.rangedAttack(target)
                creep.dismantle(target)
            }
        }

        if (flag && creep.pos.getRangeTo(flag) > 0) {
            creep.moveTo(flag, {ignoreCreeps: false, reusePath: 5})
        } else if (!flag) creep.memory.status = 'fighting'
        if (creep.hits / creep.hitsMax < 0.95) {
            creep.heal(creep)
            creep.memory.status = 'fighting'
        } else if (creep.getActiveBodyparts(RANGED_ATTACK)) {
            creep.heal(creep)
        } else if (creep.hits < creep.hitsMax) {
            creep.heal(creep)
        }
    } else if (creep.memory.status == 'round') {

    } else if (creep.memory.status == 'this') {
        if (!Game.flags['this' + creep.memory.missionid]) {
            creep.memory.status = 'fighting'
            return
        }
        const newRoomName = Game.flags['this' + creep.memory.missionid].pos.roomName
        if (Game.time % 20 == 0) {
            Game.memory.roomCachettl[newRoomName] = 0
        }
        if (creep.pos.roomName == newRoomName) {

            let target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: obj => obj.structureType != STRUCTURE_RAMPART && (!obj.pos.lookFor(LOOK_STRUCTURES).some(obj => obj.structureType == STRUCTURE_RAMPART)) && obj.structureType != STRUCTURE_CONTROLLER})
            if (!target) target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: obj => obj.structureType != STRUCTURE_CONTROLLER})
            if (!target) target = creep.pos.findClosestByRange(FIND_HOSTILE_CONSTRUCTION_SITES)
            if (target) {
                creep.moveTo(target, {ignoreCreeps: false, reusePath: 10})
                creep.dismantle(target)
            }
        } else {
            const exitDir = Game.map.findExit(creep.room, newRoomName)
            const exit = creep.pos.findClosestByRange(exitDir)
            creep.moveTo(exit)
        }

    } else if (creep.memory.status === 'guard') {
        if (!Game.flags['guard' + creep.memory.missionid]) {
            creep.memory.status = 'fighting'
            return
        }
        let target = Game.getObjectById(creep.memory.target)
        if (!target) {
            if (Game.time % 2 === 0) {
                target = creep.room.find(FIND_HOSTILE_CREEPS, {filter: o => o.owner.username === 'Atanner'||o.owner.username==='Yoner'})[0]
                if (target) {
                    creep.memory.target = target.id
                }
            }

        }

        if (target) {
            creep.moveTo(target, {reusePath: 0})
            creep.rangedAttack(target)
        }
        if (creep.room.name !== creep.memory.missionid) {
            creep.moveTo(new RoomPosition(25, 25, creep.memory.missionid))
        } else if (!target) {
            if (creep.pos.x <= 3) creep.move(RIGHT)
            else if (creep.pos.x >= 47) creep.move(LEFT)
            else if (creep.pos.y <= 3) creep.move(BOTTOM)
            else if (creep.pos.y >= 47) creep.move(TOP)
        }
    } else if (creep.memory.status === 'stay') {
        let flag = Game.flags['stay' + creep.memory.missionid]
        if (!flag) {
            creep.memory.status = 'fighting'
            return
        }
        let targets = creep.room.find(FIND_HOSTILE_CREEPS)

        let boostTarget = targets.filter(o => {
            o.range = o.body.some(bodypart => bodypart.type === RANGED_ATTACK) ? 5 : (o.body.some(bodypart => bodypart.type === ATTACK) ? 3 : undefined)
            if (require('tower.targetSelecter').isBoost(o.body, RANGED_ATTACK) || require('tower.targetSelecter').isBoost(o.body, ATTACK)) {
                o.boost = require('tower.targetSelecter').isBoost(o.body, RANGED_ATTACK) ? RANGED_ATTACK : ATTACK
                return true
            } else {
                return false
            }
        })
        if (boostTarget.length > 0) {
            let act = moveFromBoost(creep, targets, boostTarget)
            if (act) {
                creep.memory.status = 'fighting'
                return
            }
        }
        let dangerousCreep = targets.find(o => o.range)

        if (!dangerousCreep) {
            if (!creep.pos.isNearTo(flag.pos)) {
                creep.moveTo(flag)
            }
            if (!creep.memory.healSleep || (Game.time - creep.memory.healSleep) < 10) {
                creep.heal(creep)
            }
        } else {
            creep.heal(creep)
            creep.memory.healSleep = Game.time
        }
        if (dangerousCreep) {
            fireTargets(creep)
        }
        if (creep.hits === creep.hitsMax) {
            let dangerCreeps = targets.filter(o => o.range)
            if (dangerCreeps.length === 1) {
                let target = dangerCreeps[0]
                if (creep.pos.getRangeTo(target.pos)>= 2) {
                    creep.moveTo(target)
                }
            }
        }

        if (!flag) creep.memory.status = 'fighting'
        if (creep.hits / creep.hitsMax < 0.96) {
            creep.heal(creep)
            creep.memory.status = 'fighting'
        } else if (creep.hits < creep.hitsMax) {
            creep.heal(creep)
        }
        if (!dangerousCreep && (Game.time - (creep.memory.healSleep || 0)) > 10) {
            let target = targets.find(o => o.getActiveBodyparts(WORK) || o.getActiveBodyparts(CLAIM) || o.getActiveBodyparts(HEAL))
            if (!target) target = creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: o => o.structureType === STRUCTURE_RAMPART})[0]
            if (target) {
                creep.memory.status = 'killWorker'
            }
        }
    } else if (creep.memory.status === 'killWorker') {
        let targets = creep.room.find(FIND_HOSTILE_CREEPS)
        let boostTarget = targets.filter(o => {
            o.range = o.body.some(bodypart => bodypart.type === RANGED_ATTACK) ? 5 : (o.body.some(bodypart => bodypart.type === ATTACK) ? 3 : undefined)
            if (require('tower.targetSelecter').isBoost(o.body, RANGED_ATTACK) || require('tower.targetSelecter').isBoost(o.body, ATTACK)) {
                o.boost = require('tower.targetSelecter').isBoost(o.body, RANGED_ATTACK) ? RANGED_ATTACK : ATTACK
                return true
            } else {
                return false
            }
        })
        if (boostTarget.length > 0) {
            let act = moveFromBoost(creep, targets, boostTarget)
            if (act) {
                creep.memory.status = 'fighting'
                return
            }
        }
        let dangerousCreep = targets.find(o => o.range)
        if (dangerousCreep||creep.hits/creep.hitsMax<0.96) {
            fireTargets(creep)
            creep.heal(creep)
            creep.memory.status = 'fighting'
            return
        }
        let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: o => o.getActiveBodyparts(WORK) || o.getActiveBodyparts(CLAIM) || o.getActiveBodyparts(HEAL)|| o.getActiveBodyparts(CARRY)})
        if (target) {
            if (creep.pos.getRangeTo(target) <= 1) {
                if (havePart(creep, ATTACK)) {
                    creep.attack(target)
                } else {
                    creep.rangedAttack(target)
                    creep.heal(creep)
                }
            } else {
                creep.rangedAttack(target)
                creep.heal(creep)
            }
            creep.moveTo(target, {ignoreCreeps: false, reusePath: 5})
        }
        let byTheWay=target?target.pos.getRangeTo(creep.pos)>3:undefined
        if (!target) target = creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: o => o.structureType === STRUCTURE_RAMPART})[0]
        if (target) {
            if (creep.pos.getRangeTo(target) <= 1) {
                if (havePart(creep, ATTACK)) {
                    creep.attack(target)
                } else {
                    creep.rangedAttack(target)
                    creep.heal(creep)
                }
            } else {
                creep.rangedAttack(target)
                creep.heal(creep)
            }
            if(!byTheWay){
                creep.moveTo(target, {ignoreCreeps: false, reusePath: 5})
            }
        } else {
            creep.memory.status = 'stay'
        }
        creep.heal(creep)
    }
}

let rangeDamage = [10, 10, 4, 1]

function fireTargets(creep) {
    let targets = creep.pos.findInRange(FIND_HOSTILE_CREEPS, havePart(creep, RANGED_ATTACK) ? 3 : 1)
    if (targets.length > 0) {
        let canRange = _.sum(targets, o => rangeDamage[o.pos.getRangeTo(creep.pos)])
        let target = _.min(targets, o => o.pos.getRangeTo(creep.pos))
        if (target) {
            if (creep.pos.getRangeTo(target.pos) <= 1) {
                if (havePart(creep, ATTACK)) {
                    creep.attack(target)
                } else {
                    creep.rangedMassAttack()
                    creep.heal(creep)
                }
            } else {
                if (canRange > 10) {
                    creep.rangedMassAttack()
                } else {
                    creep.rangedAttack(target)
                }
                creep.heal(creep)
            }
        }
    }

}

function moveFromCreep(creep, targets) {

    let nearTargets = targets.filter(o => o.pos.getRangeTo(creep.pos) <= 4 && o.range)
    if (nearTargets.length <= 0) return false
    let nearParam = nearTargets.map(o => {
        return {
            pos: o.pos,
            range: o.boost ? (o.boost === RANGED_ATTACK ? 6 : 4) : o.range
        }
    })
    let ans = PathFinder.search(creep.pos, nearParam, {
        plainCost: 1, swampCost: 5, roomCallback: require('tools').roomc, maxRooms: 2, flee: true
    })
    creep.moveByPath(ans.path)
    return true
}

function moveFromBoost(creep, targets, boostTarget) {
    let clostTarget = _.min(boostTarget, o => o.pos.getRangeTo(creep.pos))
    if (clostTarget && clostTarget.pos.getRangeTo(creep.pos) <= 6) {
        let nearTargets = targets.filter(o => o.pos.getRangeTo(creep.pos) <= 4 && o.range).push(clostTarget)
        if(nearTargets.length===0)return false
        let nearParam = nearTargets.map(o => {
            return {
                pos: o.pos,
                range: o.boost ? (o.boost === RANGED_ATTACK ? 6 : 4) : o.range
            }
        })
        let ans = PathFinder.search(creep.pos, nearParam, {
            plainCost: 1, swampCost: 5, roomCallback: require('tools').roomc, maxRooms: 2, flee: true
        })
        creep.moveByPath(ans.path)
        return true
    }
    return false
}

function havePart(creep, type) {
    return creep.body.some(bodypart => bodypart.type === type)
}

module.exports = {
    'work': work,
    'born': born,
};
