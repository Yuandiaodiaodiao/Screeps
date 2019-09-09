function born(spawnnow, creepname, memory) {
    let bodyparts = require('tools').generatebody({
        'work': 40,
        'move': 10
    }, spawnnow)
    // console.log(JSON.stringify(bodyparts))
    return spawnnow.spawnCreep(
        bodyparts,
        creepname,
        {
            memory: {
                status: 'going',
                missionid: memory.target,
                container: memory.container
            }
        }
    )
}

function work(creep) {
    if (creep.memory.status == 'going') {
        let target = Game.getObjectById(creep.memory.container)
        if (target) {
            creep.moveTo(target,{reusePath: 50})
            if (creep.pos.getRangeTo(target) == 0) {
                creep.memory.status = 'mining'
            }
        }
    } else if (creep.memory.status == 'mining') {
        if(Game.time%6==0){
            let target = Game.getObjectById(creep.memory.missionid)
            creep.harvest(target)
        }
    }
}

module.exports = {
    'work': work,
    'born': born
};