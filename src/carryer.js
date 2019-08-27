function work(creep) {
    const memory = creep.memory
    if (memory.status == 'getting') {
        const target = Game.getObjectById(memory.missionid)
        if (target) {
            if (creep.pos.getRangeTo(target) > 1) {
                creep.moveTo(target, {reusePath: 10})
                const tomb = creep.pos.lookFor(LOOK_TOMBSTONES)[0]
                if (tomb) {
                    creep.withdraw(tomb, memory.type)
                }
            } else if (target.store[memory.type] >= creep.carryCapacity - (creep.carry[memory.type] || 0)) {
                const action = creep.withdraw(target, memory.type)
                if (action == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target)
                } else if (action == OK) {
                    memory.status = 'carrying'
                }else if(action==ERR_FULL){
                    memory.status='carrying'
                }
            }
        }
    } else if (memory.status == 'carrying') {
        const target = Game.getObjectById(memory.fill)
        if (target.structureType == STRUCTURE_STORAGE && _.sum(target.store) / target.storeCapacity > 0.95) return
        if (target) {
            if (creep.pos.getRangeTo(target) > 6) {
                creep.moveTo(target, {reusePath: 10})
                let road = creep.pos.lookFor(LOOK_STRUCTURES)[0]
                if (road && road.hits < road.hitsMax) {
                    creep.repair(road)
                }
            } else {
                if (target.structureType == STRUCTURE_LINK && target.energy >= 800) return
                const act = creep.transfer(target, memory.type)
                if (act == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target)
                } else if (act == OK) {
                    if (target.structureType == STRUCTURE_LINK && target.energyCapacity - target.energy >= creep.carry[memory.type]) {
                        memory.status = 'getting'
                    } else if (target.storeCapacity - _.sum(target.store) >= creep.carry[memory.type]) {
                        memory.status = 'getting'
                    }
                }
            }
        }
    }
}


function born(spawnnow, creepname, memory) {

    let body = {

        'carry': 16,
        'move': 9,
        'work': memory.type == RESOURCE_ENERGY ? 1 : 0,
    }
    let spawnnum = spawnnow.room.spawns.length
    if (memory.carrycost && spawnnum <= 2) {
        body = {

            'carry': Math.max(16, 0.55 * memory.carrycost),
            'move': (1 + Math.max(16, 0.55 * memory.carrycost) + 0.01) / 2,
            'work': memory.type == RESOURCE_ENERGY ? 1 : 0,
        }
    } else if (spawnnum >= 3) {
        body = {
            'carry': 32 + (memory.type == RESOURCE_ENERGY ? 0 : 1),
            'move': 17,
            'work': memory.type == RESOURCE_ENERGY ? 1 : 0,
        }
    }
    if (memory.type != RESOURCE_ENERGY) {
        body = {
            'carry': 16,
            'move': 8
        }
    }
    let bodyarray = require('tools').generatebody(body, spawnnow)
    return spawnnow.spawnCreep(
        bodyarray,
        creepname,
        {
            memory: {
                status: 'getting',
                missionid: memory.gettarget,
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