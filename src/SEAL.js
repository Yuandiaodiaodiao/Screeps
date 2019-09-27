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
        const config = Memory.army[creep.memory.missionid].from[creep.name.split('_')[0]]

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
        const goalx = creep.memory.goal
        let goal = new RoomPosition(goalx[0], goalx[1], goalx[2])
        const target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
        if (creep.hits / creep.hitsMax < 0.95) {
            if (creep.pos.roomName == goal.roomName && target && target.pos.getRangeTo(creep.pos) <= 2) {
                let ans = PathFinder.search(creep.pos, {pos: target.pos, range: 2}, {
                    plainCost: 1, swampCost: 5, roomCallback: require('tools').roomc, maxRooms: 1, flee: true
                })
                creep.moveByPath(ans.path);
            } else if (creep.pos.getRangeTo(goal) > 1) {
                creep.moveTo(goal)
            }
        } else {
            if (Game.flags['rush']) {
                creep.memory.status = 'rushing'
            } else if (Game.flags['go']) {
                creep.memory.status = "flaging"
            } else if (Game.flags['test']) {
                creep.memory.status = "testing"
            }
            if (creep.pos.roomName == goal.roomName) {
                const exitDir = Game.map.findExit(creep.room, creep.memory.missionid)
                const exit = creep.pos.findClosestByRange(exitDir)
                creep.moveTo(exit)
            } else {
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
    if (creep.memory.status == 'rushing') {
        creep.heal(creep)
        creep.say('👎')
        let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
        if (!target) target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: obj => obj.structureType != STRUCTURE_RAMPART && (!obj.pos.lookFor(LOOK_STRUCTURES).some(obj => obj.structureType == STRUCTURE_RAMPART)) && obj.structureType != STRUCTURE_CONTROLLER})
        if (!target) target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: obj => obj.structureType != STRUCTURE_CONTROLLER})
        if (creep.hits / creep.hitsMax < 0.7) {
            creep.memory.status = 'fighting'
            if (creep.pos.roomName == goal.roomName && target && target.pos.getRangeTo(creep.pos) <= 2) {
                let ans = PathFinder.search(creep.pos, {pos: target.pos, range: 2}, {
                    plainCost: 1, swampCost: 5, roomCallback: require('tools').roomc, maxRooms: 1, flee: true
                })
                creep.moveByPath(ans.path);
            } else if (creep.pos.getRangeTo(goal) > 1) {
                creep.moveTo(goal, {plainCost: 1, swampCost: 5})
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
                if (creep.pos.getRangeTo(target) <= 1 && (target.structureType ? target.structureType != STRUCTURE_ROAD && target.structureType != STRUCTURE_CONTAINER : true)) {
                    creep.rangedMassAttack()
                } else {
                    creep.rangedAttack(target)
                    creep.moveTo(target)
                }
            }
        } else {
            const exitDir = Game.map.findExit(creep.room, creep.memory.missionid)
            const exit = creep.pos.findClosestByRange(exitDir)
            creep.moveTo(exit)
        }
        if (!Game.flags['rush']) {
            creep.memory.status = 'fighting'
        }
    } else if (creep.memory.status == 'flaging') {
        creep.heal(creep)
        creep.say('👎')

        let target = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3)[0]
        if (!target) target = Game.getObjectById("5d7655c5c44c5f3c1b6a03da")
        if (!target) target = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 3)[0]
        if (target) {
            if (creep.pos.getRangeTo(target) <= 1) {
                creep.rangedMassAttack()
            } else {
                creep.rangedAttack(target)
            }
        }
        let flag = Game.flags['go']
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
        let flag1 = Game.flags['test']
        let flag2 = Game.flags['return']
        if (!flag1) {
            creep.memory.status = 'fighting'
        } else if (creep.hits == creep.hitsMax && creep.pos.getRangeTo(flag1) >= 2) {
            creep.moveTo(flag1)
        } else if (creep.pos.getRangeTo(flag2) > 1) {
            creep.moveTo(flag2)
        }
    }

}

module.exports = {
    'work': work,
    'born': born,
};