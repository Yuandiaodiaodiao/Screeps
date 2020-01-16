function born(spawnnow, creepname, memory) {
    let bodyparts = require('tools').generatebody({
        'heal': 16,
        'move': 16,
    }, spawnnow)
    return spawnnow.spawnCreep(
        bodyparts,
        creepname,
        {
            memory: {
                status: 'going',
                missionid: memory.roomn,
                step: 0,
            }
        }
    )
}


function work(creep) {
    //rush
    const powerp = Memory.powerPlan[creep.memory.missionid]
    if (!powerp) creep.suicide()
    if (creep.memory.status == 'going') {
        const act = Game.tools.moveByLongPath(powerp.position, creep)
        if (act == OK) {
            creep.memory.status = 'heal'
        }
        if (creep.hits < creep.hitsMax) {
            creep.heal(creep)
        }
    } else if (creep.memory.status == 'heal') {
        const target = Game.getObjectById(creep.memory.target) || creep.pos.findClosestByRange(FIND_MY_CREEPS, {filter: obj => obj.name.split('_')[1] == 'power-a'})
        if (creep.hits / creep.hitsMax < 0.99) {
            creep.heal(creep)
            return
        }
        if (powerp.status == 4) {
            creep.suicide()
        }
        if (!target) return
        creep.memory.target = target.id
        if (!target.memory.sleep) {
            const act = creep.heal(target)
            if (act === ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {ignoreCreeps: false, serializeMemory: false})
            }
        }


    }

}

module.exports = {
    'work': work,
    'born': born,
};