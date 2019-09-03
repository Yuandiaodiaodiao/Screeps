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
    if (creep.memory.status == 'going') {
        const posx = powerp.position[creep.memory.step]
        let pos = new RoomPosition(posx[0], posx[1], posx[2])
        creep.moveTo(pos, {reusePath: 20})
        if (creep.pos.getRangeTo(pos) <= 3) {
            creep.memory.step++
        }
        if (creep.memory.step == powerp.position.length) {
            creep.memory.status = 'heal'
            delete creep.memory.step
        }
        if(creep.hits<creep.hitsMax){
            creep.heal(creep)
        }
    } else if (creep.memory.status == 'heal') {
        const target=Game.getObjectById(creep.memory.target)||creep.pos.findClosestByRange(FIND_MY_CREEPS,{filter:obj=>obj.name.split('_')[1]=='power-a'})
        if(!target)return
        creep.memory.target=target.id
        const act = creep.heal(target)
        if (act == ERR_NOT_IN_RANGE) {
            creep.moveTo(target)
        }
        if(powerp.status==4){
            creep.suicide()
        }
    }

}

module.exports = {
    'work': work,
    'born': born,
};