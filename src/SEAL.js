function born(spawnnow, creepname, memory) {
    let body = memory.body
    if (!body) {
        body = {
            'tough': 6,
            'ranged_attack': 3,
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

    if (creep.memory.status == 'going') {
        let config = null
        try {
            config = Memory.army[creep.memory.missionid].from[creep.name.split('_')[0]]

        } catch (e) {
            console.log('seal.work.config' + e)
            creep.memory.status = 'fighting'
            return
        }
        const act = Game.tools.moveByLongPath(config.path, creep)
        if (act == OK) {
            creep.memory.status = 'fighting'
        }
        if (creep.hits < creep.hitsMax) {
            creep.heal(creep)
        }
    } else if (creep.memory.status == 'fighting') {


        creep.heal(creep)
        let goal = new RoomPosition(...creep.memory.goal)
        const target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
        if (creep.hits / creep.hitsMax < 0.98) {
            if (creep.pos.roomName == goal.roomName && target && target.pos.getRangeTo(creep.pos) <= 2) {
                let ans = PathFinder.search(creep.pos, {pos: target.pos, range: 4}, {
                    plainCost: 1, swampCost: 5, roomCallback: require('tools').roomc, maxRooms: 1, flee: true
                })
                creep.moveByPath(ans.path);
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
            }
            if (creep.pos.roomName == goal.roomName) {
                const exitDir = Game.map.findExit(creep.room, creep.memory.missionid)
                const exit = creep.pos.findClosestByRange(exitDir)
                creep.moveTo(exit)
            } else {
                if (creep.pos.roomName == goal.roomName && target && target.pos.getRangeTo(creep.pos) <= 2) {
                    let ans = PathFinder.search(creep.pos, {pos: target.pos, range: 4}, {
                        plainCost: 1, swampCost: 5, roomCallback: require('tools').roomc, maxRooms: 1, flee: true
                    })
                    creep.moveByPath(ans.path);
                }
            }
        }

        if (target) {
            if (creep.pos.getRangeTo(target) <= 1) {
                creep.rangedMassAttack()
            } else {
                creep.rangedAttack(target)
            }
        }


    }
    if (creep.memory.status == 'rush') {
        if(creep.getActiveBodyparts(ATTACK)===0&&creep.getActiveBodyparts(HEAL)===0&&creep.getActiveBodyparts(RANGED_ATTACK)==0){
            return Game.war.workRush(creep)
        }
        if (Game.time % 20 == 0) {
            require('tools').roomCachettl[creep.pos.roomName] = 0
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
        } else if (creep.pos.roomName == creep.memory.missionid) {
            const enemys = Game.war.getEnemy(creep)
            if (enemys.length > 0) {
                if (enemys[3]) {
                    Game.war.fightDangerous(creep, enemys)
                } else {
                    Game.war.fightNormal(creep, enemys)
                }
            } else {
                let target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: obj => obj.structureType != STRUCTURE_RAMPART && (!obj.pos.lookFor(LOOK_STRUCTURES).some(obj => obj.structureType == STRUCTURE_RAMPART)) && obj.structureType != STRUCTURE_CONTROLLER})
                if (!target) target = creep.pos.findClosestByRange(FIND_HOSTILE_CONSTRUCTION_SITES)
                if (!target) target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: obj => obj.structureType != STRUCTURE_CONTROLLER})
                if (target) {
                    creep.moveTo(target, {ignoreCreeps: false, reusePath: 10})
                    if (!target.ticksToLive && creep.pos.getRangeTo(target) <= 1 && !target.progressTotal && (target.structureType ? target.structureType != STRUCTURE_ROAD && target.structureType != STRUCTURE_CONTAINER : true)) {
                        creep.rangedMassAttack()
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

        let target = creep.pos.findInRange(FIND_HOSTILE_CREEPS, creep.getActiveBodyparts(RANGED_ATTACK) ? 3 : 1)[0]
        if (target) {
            if (creep.pos.getRangeTo(target) <= 1) {
                if (creep.getActiveBodyparts('attack')) {
                    creep.attack(target)
                }
                creep.rangedMassAttack()
            } else {
                creep.rangedAttack(target)
            }
        } else {
            target = undefined
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

        const flag = Game.flags["point" + creep.memory.missionid]
        if (flag && creep.pos.getRangeTo(flag) > 1) {
            creep.moveTo(flag, {ignoreCreeps: false, reusePath: 5})
        } else if (!flag) creep.memory.status = 'fighting'
        if (creep.hits / creep.hitsMax < 0.97) {
            creep.heal(creep)
            creep.memory.status = 'fighting'
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
            require('tools').roomCachettl[newRoomName] = 0
        }
        if (creep.pos.roomName == newRoomName) {

            let target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: obj => obj.structureType != STRUCTURE_RAMPART && (!obj.pos.lookFor(LOOK_STRUCTURES).some(obj => obj.structureType == STRUCTURE_RAMPART)) && obj.structureType != STRUCTURE_CONTROLLER})
            if (!target) target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: obj => obj.structureType != STRUCTURE_CONTROLLER})
            if (!target) target = creep.pos.findClosestByRange(FIND_HOSTILE_CONSTRUCTION_SITES)
            if (target) {
                creep.moveTo(target, {ignoreCreep: false, reusePath: 10})
                creep.dismantle(target)
                }
        } else {
            const exitDir = Game.map.findExit(creep.room,newRoomName)
            const exit = creep.pos.findClosestByRange(exitDir)
            creep.moveTo(exit)
        }

    }

}

module.exports = {
    'work': work,
    'born': born,
};
