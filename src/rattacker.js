function born(spawnnow, creepname, memory) {
    let bodyparts = require('tools').generatebody({
        'ranged_attack': 10,
        'heal': 10,
        'move': 25,
    }, spawnnow)
    // console.log(JSON.stringify(bodyparts))
    return spawnnow.spawnCreep(
        bodyparts,
        creepname,
        {
            memory: {
                status: 'going',
                missionid: memory.roomName,
                step: 0,
                position: [
                    [26, 14, 'E26N40'],
                    [2, 35, 'E29N40'],


                ]
            }
        }
    )
}


function work(name) {
    //rush
    let creep = Game.creeps[name]
    // if (creep.hits == creep.hitsMax) {
    //     let healc = creep.pos.findClosestByRange(FIND_MY_CREEPS, {filter: obj => obj.hits < obj.hitsMax})
    //     if (healc)
    //         if(creep.heal(healc)==ERR_NOT_IN_RANGE){
    //             creep.moveTo(healc)
    //             return
    //         }
    // }else{
        creep.heal(creep)
    // }

    if (creep.memory.status == 'going') {
        let posm = creep.memory.position[creep.memory.step]
        let poss = new RoomPosition(posm[0], posm[1], posm[2])
        creep.moveTo(poss)
        if (creep.pos.getRangeTo(poss) <= 1) {
            creep.memory.step++
        }
        if (creep.memory.step == creep.memory.position.length) {
            creep.memory.status = 'waiting'
        }
    } else if (creep.memory.status == 'waiting') {
        if (creep.hits / creep.hitsMax <0.95) {
            if (creep.pos.getRangeTo(new RoomPosition(9, 47, 'E29N39')) >1) {
                creep.moveTo(new RoomPosition(9, 47, 'E29N39'))
            }
        } else {
            // creep.moveTo(new RoomPosition(25,25,'E29N38'))


            let target = Game.getObjectById('a')
            if (!target) {
                target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
                if(!target){
                    target=creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES)
                }
            }

            if (creep.pos.getRangeTo(target) <= 1) {
                creep.rangedMassAttack()
            } else {
                if (creep.rangedAttack(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target)
                }
            }
        }

    }


}

module.exports = {
    'work': work,
    'born': born,
};