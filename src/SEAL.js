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
        let config=null
        try{
            config= Memory.army[creep.memory.missionid].from[creep.name.split('_')[0]]

        }
        catch (e) {
            console.log('seal.work.config'+e)
            creep.memory.status='fighting'
            return
        }

        const posx = config.path[creep.memory.step]
        let pos = new RoomPosition(posx[0], posx[1], posx[2])
        if (creep.pos.isEqualTo(pos)) {
            creep.memory.step++
            const posx = config.path[creep.memory.step]
            pos = new RoomPosition(posx[0], posx[1], posx[2])
        }
        if (creep.pos.isNearTo(pos)) {
            creep.memory.step++
            creep.move(creep.pos.getDirectionTo(pos))
        } else {
            creep.moveTo(pos, {plainCost: 1, swampCost: 5, reusePath: 20})
        }

        if (creep.memory.step >= config.path.length - 1) {
            creep.memory.status = 'fighting'
            delete creep.memory.step
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
        creep.heal(creep)
        let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
        if (!target) target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: obj => obj.structureType != STRUCTURE_RAMPART && (!obj.pos.lookFor(LOOK_STRUCTURES).some(obj => obj.structureType == STRUCTURE_RAMPART)) && obj.structureType != STRUCTURE_CONTROLLER})
        if (!target) target = creep.pos.findClosestByRange(FIND_HOSTILE_CONSTRUCTION_SITES)
        if (!target) target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: obj => obj.structureType != STRUCTURE_CONTROLLER})
        if (creep.hits / creep.hitsMax < 0.97) {
            creep.memory.status = 'fighting'
            let goal = new RoomPosition(...creep.memory.goal)
            if (creep.pos.roomName == goal.roomName && target && target.pos.getRangeTo(creep.pos) <= 2) {
                let ans = PathFinder.search(creep.pos, {pos: target.pos, range: 4}, {
                    plainCost: 1, swampCost: 5, roomCallback: require('tools').roomc, maxRooms: 1, flee: true
                })
                creep.moveByPath(ans.path)
            } else if (creep.pos.getRangeTo(goal) > 1) {
                creep.moveTo(goal, {plainCost: 1, swampCost: 5, ignoreCreeps: false})
            }
            if (target) {
                if (creep.pos.getRangeTo(target) <= 1) {
                    creep.rangedMassAttack()
                } else {
                    creep.rangedAttack(target)
                }
            }
        } else if (creep.pos.roomName == creep.memory.missionid) {
            if (target) {
                if (!target.ticksToLive && creep.pos.getRangeTo(target) <= 1 && !target.progressTotal && (target.structureType ? target.structureType != STRUCTURE_ROAD && target.structureType != STRUCTURE_CONTAINER : true)) {
                    creep.rangedMassAttack()
                    creep.say('⚡')
                } else {
                    let act = null
                    if (target.ticksToLive&&target.pos.getRangeTo(creep.pos) <= 1) {
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

                    if (creep.pos.getRangeTo(target) >= (target.progressTotal ? 0 : 3)) {
                        creep.moveTo(target)
                    } else if (target.ticksToLive && target.pos.getRangeTo(creep.pos) <= 2) {
                        let ans = PathFinder.search(creep.pos, {pos: target.pos, range: 4}, {
                            plainCost: 1, swampCost: 5, roomCallback: require('tools').roomc, maxRooms: 1, flee: true
                        })
                        creep.moveByPath(ans.path)
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

        let target = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3)[0]
        if (target) {
            if (creep.pos.getRangeTo(target) <= 1) {
                if (creep.getActiveBodyparts('attack')) {
                    creep.attack(target)
                }
                creep.rangedMassAttack()
            } else {
                creep.rangedAttack(target)
            }
        }
        if (!target) {
            target = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 3)[0]
            if (target) {
                if (creep.getActiveBodyparts('work')) {
                    creep.dismantle(target)
                } else if (creep.getActiveBodyparts('attack')) {
                    creep.attack(target)
                }
                creep.rangedMassAttack()
            }
        }

        if (!target) {
            target = creep.pos.findInRange(FIND_HOSTILE_CONSTRUCTION_SITES, 1)[0]
            if (target) {
                creep.moveTo(target)
            }
        }
        if (!target) {
            target = creep.pos.findInRange(FIND_STRUCTURES, 1)[0]
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

    }

}

module.exports = {
    'work': work,
    'born': born,
};