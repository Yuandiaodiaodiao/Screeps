function born(spawnnow, creepname, memory) {
    if (spawnnow.room.name != 'E28N46') return -11
    let bodyparts = require('tools').generatebody({
        'ranged_attack': 20,
        'move': 20
    }, spawnnow)
    // console.log(JSON.stringify(bodyparts))
    return spawnnow.spawnCreep(
        bodyparts,
        creepname,
        {
            memory: {
                status: 'goto',
                missionid: memory.roomName,
            }
        }
    )
}


function work(name) {


    let creep = Game.creeps[name]
    if (creep.memory.status == 'goback') {
        creep.moveTo(new RoomPosition(46, 44, 'E28N46'), {reusePath: 0})
        if (creep.hits == creep.hitsMax) creep.memory.status = 'goto'
    } else if (creep.memory.status == 'goto') {
        if (creep.pos.roomName == 'E28N46') {
            creep.moveTo(new RoomPosition(2, 44, 'E29N46'))
            return
        }
        let ene = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS)
        if (ene) {
            if (creep.rangedAttack(ene) == ERR_NOT_IN_RANGE) {
                creep.moveTo(ene)
            }
        } else {
            let target = creep.pos.findClosestByRange(FIND_STRUCTURES,{
                filter:obj=>obj.structureType==STRUCTURE_TOWER
            })
            if (creep.rangedAttack(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            }
        }
        // if (creep.hits / creep.hitsMax < 0.85) {
        //     creep.memory.status = 'goback'
        // }
    } else {
        creep.memory.status = 'goback'
    }

}


module.exports = {
    'work': work,
    'born': born,
};