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
    if (_.sum(creep.carry) == 0) {
        creep.memory.status = 'getting';
    }
    if (creep.memory.status == 'getting') {
        let target = Game.getObjectById(creep.memory.gettarget)
        if (target) {
            if (creep.pos.getRangeTo(target) > 1) {
                creep.moveTo(target, {reusePath: 10})
            } else if (target.store[creep.memory.type] > creep.carryCapacity - _.sum(creep.carry)) {
                let action = creep.withdraw(target, creep.memory.type)
                if (action == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target)
                }
            }

        }
        let tomb = creep.pos.lookFor(LOOK_TOMBSTONES)[0]
        if (tomb) {
            creep.withdraw(tomb, creep.memory.type)
        }
        if (_.sum(creep.carry) >= creep.carryCapacity) {
            creep.memory.status = 'carrying';
        }
    } else if (creep.memory.status == 'carrying') {
        let target = Game.getObjectById(creep.memory.fill)
        if (target.structureType == STRUCTURE_STORAGE && _.sum(target.store) / target.storeCapacity > 0.95) return
        if (target) {
            if (creep.pos.getRangeTo(target) > 6) {
                creep.moveTo(target, {reusePath: 10})
                let road = creep.pos.lookFor(LOOK_STRUCTURES)[0]
                if (road && road.hits < road.hitsMax) {
                    creep.repair(road)
                } else if (!road && (road = creep.pos.lookFor(LOOK_CONSTRUCTION_SITES)[0])) {
                    creep.build(road)
                }
            } else {
                if(target.structureType==STRUCTURE_LINK&&target.energy>=800)return
                const act = creep.transfer(target, creep.memory.type)
                if (act == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target)
                } else if (act == OK) {
                    const target = Game.getObjectById(creep.memory.gettarget)
                    if (target) {
                        creep.moveTo(target, {reusePath: 10})
                    }
                }
            }
        }
    }
}


function born(spawnnow, creepname, memory) {

    let body = {
        'work': memory.type == RESOURCE_ENERGY ? 1 : 0,
        'carry': 16,
        'move': 9
    }
    let spawnnum = spawnnow.room.find(FIND_MY_SPAWNS).length
    if (memory.carrycost && spawnnum <= 1) {
        body = {
            'work': memory.type == RESOURCE_ENERGY ? 1 : 0,
            'carry': 0.50 * memory.carrycost,
            'move': (1 + 0.50 * memory.carrycost + 0.01) / 2
        }
    } else if (spawnnum >= 2) {
        body = {
            'work': memory.type == RESOURCE_ENERGY ? 1 : 0,
            'carry': 32 + (memory.type == RESOURCE_ENERGY ? 0 : 1),
            'move': 17
        }
    }
    let bodyarray = require('tools').generatebody(body, spawnnow)
    // console.log(JSON.stringify(bodyarray))
    return spawnnow.spawnCreep(
        bodyarray,
        creepname,
        {
            memory: {
                status: 'getting',
                missionid: memory.gettarget,
                gettarget: memory.gettarget,
                fill: memory.fill,
                type: memory.type
            }
        }
    )
}

module.exports = {
    'work': work,
    'born': born
};