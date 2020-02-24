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
            creep.moveTo(target,{reusePath: 50,range:1})
            if (creep.pos.getRangeTo(target) === 0) {
                creep.memory.status = 'mining'
            }
        }
    } else if (creep.memory.status === 'mining') {
        if(Game.time%6===0){
            let target = Game.getObjectById(creep.memory.missionid)
            let container = Game.getObjectById(creep.memory.container)
            if(container.store.getFreeCapacity()===0){
                return
            }
            let ans=creep.harvest(target)
            if(ans===ERR_NOT_IN_RANGE){
                creep.moveTo(target,{reusePath: 50})
            }
        }
    }
}

module.exports = {
    'work': work,
    'born': born
};