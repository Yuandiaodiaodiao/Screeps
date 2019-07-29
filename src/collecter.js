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
    let drop = null
    let link = null
    if (creep.memory.status == 'collecting') {
        let rubbish = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
            filter: obj => _.sum(obj.store) > 0
        })
        if (rubbish) {
            creep.moveTo(rubbish, {visualizePathStyle: {}})
            for (const resourceType in rubbish.store) {
                creep.withdraw(rubbish, resourceType)
            }
        } else if (drop = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES)) {
            if (creep.pickup(drop) == ERR_NOT_IN_RANGE)
                creep.moveTo(drop, {visualizePathStyle: {}})
        } else if (creep.memory.link &&(link = Game.getObjectById(creep.memory.link)) && link.energy > 500) {
            if(creep.withdraw(link,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){
                creep.moveTo(link)
            }
        } else {
            if (_.sum(creep.carry) == 0) {
                // creep.moveTo(23, 15)
                let target = creep.pos.findClosestByPath(FIND_FLAGS, {
                    filter: obj => obj.name.split('_')[0] == 'sc'
                })
                if (target) {
                    creep.moveTo(target)
                }
            } else {
                creep.memory.status = 'carrying'
            }
        }

        if (_.sum(creep.carry) >= creep.carryCapacity) {
            creep.memory.status = 'carrying';
        }
    } else if (creep.memory.status == 'carrying') {
        let target = Game.rooms[creep.memory.missionid].storage
        if (target) {
            for (const resourceType in creep.carry) {
                creep.transfer(target, resourceType)
            }
            creep.moveTo(target)
        } else {
            let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: obj => obj.structureType == STRUCTURE_CONTAINER &&
                    _.sum(obj.store) < obj.storeCapacity
            })
            for (const resourceType in creep.carry) {
                creep.transfer(target, resourceType)
            }
            creep.moveTo(target)
        }

        if (_.sum(creep.carry) == 0) {
            creep.memory.status = 'collecting'
        }
    }

}

function born(spawnnow, creepname, memory) {
    return spawnnow.spawnCreep(
        [MOVE, CARRY, CARRY, MOVE, CARRY, CARRY],
        creepname,
        {
            memory: {
                status: 'collecting',
                missionid: memory.roomName,
                link: memory.linkid
            }
        }
    )
}


module.exports = {
    'work': work,
    'born': born
};