/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('miner');
 * mod.thing == 'a thing'; // true
 */
function work(name) {
    let creep = Game.creeps[name]
    if (creep.memory.status == 'going') {
        let posm = creep.memory.position[creep.memory.step]
        let poss = new RoomPosition(posm[0], posm[1], posm[2])
        creep.moveTo(poss)
        if (creep.pos.getRangeTo(poss) == 0) {
            creep.memory.step++
        }
        if (creep.memory.step == creep.memory.position.length) {
            creep.memory.status = 'mining'
        }
    } else if (creep.memory.status == 'mining') {
        let target = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE)
        if(target){
            if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            }
        }else{
            let target=creep.pos.findClosestByPath(FIND_STRUCTURES,{
                filter:obj=>obj.structureType==STRUCTURE_CONTAINER
                &&obj.store[RESOURCE_ENERGY]>1000
            })
            if(creep.withdraw(target,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){
                creep.moveTo(target)
            }

        }

        if (creep.carry.energy >= creep.carryCapacity) {
            creep.memory.status = creep.memory.role
        }
    } else if (creep.memory.status == 'building') {
        let target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES,{
            filter:obj=>obj.structureType!=STRUCTURE_WALL
        })
        if (creep.build(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target)
        }
        if (creep.carry.energy == 0) {
            creep.memory.status = 'mining'
        }
    } else if (creep.memory.status == 'upgrading') {
        let target=creep.room.controller
        if(creep.upgradeController(target)==ERR_NOT_IN_RANGE){
            creep.moveTo(target)
        }
        if (creep.carry.energy == 0) {
            creep.memory.status = 'mining'
        }
    }


}
function  work2(name) {

    let creep = Game.creeps[name]
    if (creep.memory.status == 'going') {
        let posm = creep.memory.position[creep.memory.step]
        let poss = new RoomPosition(posm[0], posm[1], posm[2])
        creep.moveTo(poss)
        if (creep.pos.getRangeTo(poss) == 0) {
            creep.memory.step++
        }
        if (creep.memory.step == creep.memory.position.length) {
            creep.memory.status = 'goback'
        }
    } else  if (creep.memory.status == 'goback') {
        creep.moveTo(new RoomPosition(46, 44, 'E28N46'), {reusePath: 0})
        if (creep.hits == creep.hitsMax) creep.memory.status = 'goto'
    } else if (creep.memory.status == 'goto') {
        // if (creep.hits / creep.hitsMax < 0.85) {
        //     creep.memory.status = 'goback'
        // }
        if (creep.pos.roomName == 'E28N46') {
            creep.moveTo(new RoomPosition(3, 44, 'E29N46'))

            return
        }
        let target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS)
        if (target) {
            if(creep.attack(target)==ERR_NOT_IN_RANGE){
                creep.moveTo(target)
            }
        } else {
            target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: obj => obj.id == '5d34ac74a57273269a97df7f'
            })
            if (target) {
                if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target)
                }
            }
        }

    } else {
        creep.memory.status = 'goback'
    }

}
function born(spawnnow, creepname, memory = {}) {
    if(spawnnow.room.name!='E25N43'){
        return -11
    }

    let bodyparts = require('tools').generatebody({
        'attack': 20,
        'move': 20
    },spawnnow)
    return spawnnow.spawnCreep(
        bodyparts,
        creepname,
        {
            memory: {
                status: 'going',
                step: 0,
                role: 'building',
                missionid:spawnnow.room.name,
                position: [
                    [11, 49, 'E25N44'],
                    [11, 41, 'E25N44'],
                    [49, 25, 'E25N44'],
                    [39, 12, 'E26N44'],
                    [36, 0, 'E26N44'],
                    [35, 47, 'E26N45'],
                    [35, 46, 'E26N45'],
                    [40, 45, 'E26N45'],
                    [30, 0, 'E26N45'],
                    [40, 45, 'E26N46'],
                    [49, 29, 'E26N46'],
                    [49, 14, 'E27N46'],
                    [8, 12, 'E28N46'],
                ]
            }
        }
    )
}


module.exports = {
    'work': work2,
    'born': born
};