function born(spawnnow, creepname, memory) {
    let bodyparts = require('tools').generatebody({
        'work': 24,
        'carry': 1,
        'move': 12
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
        }
    } else if (creep.memory.status == 'mining') {
        let target = Game.getObjectById(creep.memory.target)
        creep.harvest(target)
    }
}

module.exports = {
    'work': work,
    'born': born
};