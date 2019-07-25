/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('carryer');
 * mod.thing == 'a thing'; // true
 */


function work(name) {
    let creep = Game.creeps[name]

    if (creep.memory.status == 'getting') {

        let target = Game.getObjectById(creep.memory.gettarget)
        // console.log('targetid=' + target.id)
        if (target) {
            if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            }
        }

        let drops = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 1)
        if (drops.length > 0) {
            creep.memory.status = 'dropping'
        }
        if (_.sum(creep.carry) >= creep.carryCapacity) {
            creep.memory.status = 'carrying';
        }
    } else if (creep.memory.status == 'carrying') {
        let target = Game.getObjectById(creep.memory.fill)
        if (target) {
            for(const resourceType in creep.carry) {
                creep.transfer(target, resourceType)
            }
            if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
                let roads = creep.pos.findInRange(FIND_STRUCTURES, 1, {
                    filter: obj => obj.structureType == STRUCTURE_ROAD
                        && obj.hits < obj.hitsMax
                })
                if (roads.length > 0) {
                    creep.repair(roads[0])
                }
            }
        } else {

        }
        if (_.sum(creep.carry) == 0) {
            creep.memory.status = 'getting';
        }
    }
    if (creep.memory.status == 'rubbishing') {
        creep.memory.status = 'getting'
        let rubbishs = creep.pos.findInRange(FIND_TOMBSTONES, 3, {
            filter: obj => obj.store[RESOURCE_ENERGY] > 0
        })
        if (rubbishs.length > 0) {
            creep.say('rub')
            let action = creep.withdraw(rubbishs[0], RESOURCE_ENERGY)
            if (action == ERR_NOT_IN_RANGE) {
                creep.moveTo(rubbishs[0]);
            } else if (action == OK) {
                creep.memory.status = 'getting'
            }
        } else {
            creep.memory.status = 'getting'
        }
        if (_.sum(creep.carry) >= creep.carryCapacity) {
            creep.memory.status = 'carrying';
        }

    } else if (creep.memory.status == 'dropping') {
        let drops = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 3)
        if (drops.length > 0) {
            let action = creep.pickup(drops[0])
            if (action == ERR_NOT_IN_RANGE) {
                creep.moveTo(drops[0]);
            } else if (action == OK) {
                creep.memory.status = 'getting'
            }
        } else {
            creep.memory.status = 'getting'
        }
        if (_.sum(creep.carry) >= creep.carryCapacity) {
            creep.memory.status = 'carrying';
        }
    }


}

function born(spawnnow, creepname, memory) {
    let body={
        'work':1,
        'carry':16,
        'move':9
    }
    let bodyarray=require('tools').generatebody(body,spawnnow)
    // console.log(JSON.stringify(bodyarray))
    return spawnnow.spawnCreep(
       bodyarray,
        creepname,
        {
            memory: {
                status: 'getting',
                missionid: memory.gettarget,
                gettarget: memory.gettarget,
                fill: memory.fill
            }
        }
    )
}

module.exports = {
    'work': work,
    'born': born
};