function born(spawnnow, creepname, memory) {
    let bodyparts = require('tools').generatebody({
        'ranged_attack': 10,
        'heal': 15,
        'move': 25,
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
    //rush

    if (creep.memory.status == 'going') {
        const posx = creep.memory.position[creep.memory.step]
        let pos = new RoomPosition(posx[0], posx[1], posx[2])
        creep.moveTo(pos, {reusePath: 20})
        if (creep.pos.getRangeTo(pos) <= 1) {
            creep.memory.step++
        }
        if (creep.memory.step == creep.memory.position.length) {
            creep.memory.status = 'fighting'
            delete creep.memory.position
            delete creep.memory.step
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
            }else if(Game.flags['go']){
                creep.memory.status = "flaging"
            }else if(Game.flags['test']) {
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
                creep.moveTo(goal)
            }
            if (target) {
                if (creep.pos.getRangeTo(target) <= 1 ) {
                    creep.rangedMassAttack()
                } else {
                    creep.rangedAttack(target)
                }
            }
        } else if (creep.pos.roomName == creep.memory.missionid) {
            if (target) {
                if (creep.pos.getRangeTo(target) <= 1&& (target.structureType ? target.structureType != STRUCTURE_ROAD && target.structureType != STRUCTURE_CONTAINER : true)) {
                    creep.rangedMassAttack()
                } else {
                    creep.rangedAttack(target)
                    creep.moveTo(target)
                }
            }
        } else {
            creep.memory.status = 'fighting'
        }

    }else if(creep.memory.status=='flaging'){
        creep.heal(creep)

        let target = creep.pos.findInRange(FIND_HOSTILE_CREEPS,3)[0]
        if(!target)target=creep.pos.findInRange(FIND_HOSTILE_STRUCTURES,3)[0]
        if (target) {
            if (creep.pos.getRangeTo(target) <= 1 ) {
                creep.rangedMassAttack()
            } else {
                creep.rangedAttack(target)
            }
        }
        let flag=Game.flags['go']
        if(!flag){
            creep.memory.status='fighting'
        }else{
            creep.moveTo(flag)
        }
    }else if(creep.memory.status=='testing'){
        creep.heal(creep)

        let target = creep.pos.findInRange(FIND_HOSTILE_CREEPS,3)[0]
        if(!target)target=creep.pos.findInRange(FIND_HOSTILE_STRUCTURES,3)[0]
        if (target) {
            if (creep.pos.getRangeTo(target) <= 1 ) {
                creep.rangedMassAttack()
            } else {
                creep.rangedAttack(target)
            }
        }
        let flag1=Game.flags['test']
        let flag2=Game.flags['return']
        if(!flag1){
            creep.memory.status='fighting'
        }else if(creep.hits==creep.hitsMax&& creep.pos.getRangeTo(flag1)>=2){
            creep.moveTo(flag1)
        }else if(creep.pos.getRangeTo(flag2)>1){
            creep.moveTo(flag2)
        }
    }

}

module.exports = {
    'work': work,
    'born': born,
};