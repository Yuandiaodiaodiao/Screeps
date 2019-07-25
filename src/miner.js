function born(spawnnow, creepname, memory) {
    let bodyparts = require('tools').generatebody({
        'work': 6,
        'carry': 1,
        'move': 3
    }, spawnnow)
    // console.log(JSON.stringify(bodyparts))
    return spawnnow.spawnCreep(
        bodyparts,
        creepname,
        {
            memory: {
                status: 'going',
                target: memory.target,
                missionid: memory.target,
                container: memory.container
            }
        }
    )
}

function work(name) {
    let creep = Game.creeps[name]
    if (creep.memory.status == 'going') {
        let target = Game.getObjectById(creep.memory.container)
        if (target) {
            creep.moveTo(target)
            if (creep.pos.getRangeTo(target) == 0) {
                creep.memory.status = 'mining'
            }
        } else {
            target = Game.getObjectById(creep.memory.target)
            if (!target) console.log(name + 'no mine')
            creep.moveTo(target)
            if (creep.pos.getRangeTo(target) == 1) {
                creep.memory.status = 'dropping'
            }
        }
    } else if (creep.memory.status == 'mining') {
        let target = Game.getObjectById(creep.memory.target)
        let container = Game.getObjectById(creep.memory.container)
        // console.log(JSON.stringify(creep.memory))
        if (container.hits < container.hitsMax && creep.carry.energy > 0) {
            creep.repair(container)
        } else {
            creep.harvest(target)
        }
    } else if (creep.memory.status == 'dropping') {
        let target = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 2, {
            filter: obj => obj.structureType == STRUCTURE_CONTAINER
        })
        if (target) {
            if (creep.carry.energy / creep.carryCapacity > 0.85 && target.length > 0) {
                creep.build(target[0])
            } else {
                let target = Game.getObjectById(creep.memory.target)
                if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target)
                }
            }
        } else if (creep.pos.findInRange(FIND_STRUCTURES, 2, {
            filter: obj => obj.structureType == STRUCTURE_CONTAINER
        })) {
            creep.memory.status = 'going'
            creep.memory.container = creep.pos.findInRange(FIND_STRUCTURES, 2, {
                filter: obj => obj.structureType == STRUCTURE_CONTAINER
            })[0].id
        }

    }
}

module.exports = {
    'work': work,
    'born': born
};