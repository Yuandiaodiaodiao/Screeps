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
        if (target) {
            let action = creep.withdraw(target, creep.memory.type)
            if (action == ERR_NOT_IN_RANGE &&_.sum(target.store)>creep.carryCapacity*0.25) {
                creep.moveTo(target)
            }
        }
        let drop = creep.pos.lookFor(LOOK_RESOURCES)[0]
        if (drop &&drop.resourceType==creep.memory.type) {
            creep.pickup(drop)
        }
        if (_.sum(creep.carry) >= creep.carryCapacity) {
            creep.memory.status = 'carrying';
        }
    } else if (creep.memory.status == 'carrying') {
        let target = Game.getObjectById(creep.memory.fill)
        if (target) {
            if (creep.transfer(target, creep.memory.type) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
                let road = creep.pos.lookFor(LOOK_STRUCTURES)[0]
                if (road && road.hits < road.hitsMax) {
                    creep.repair(road)
                } else if (road = creep.pos.lookFor(LOOK_CONSTRUCTION_SITES)[0]) {
                    creep.build(road)
                }
            }
        }
    }
    if (_.sum(creep.carry) == 0) {
        creep.memory.status = 'getting';
    }
}




function born(spawnnow, creepname, memory) {
    let body = {
        'work': 1,
        'carry': 16,
        'move': 9
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