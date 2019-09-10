function born(spawnnow, creepname, memory) {
    let bodyparts = require('tools').generatebody({
        'attack': 25,
        'move': 25,
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
        creep.moveTo(pos, {reusePath: 25,plainCost: 1, swampCost: 5})
        if (creep.pos.getRangeTo(pos) <= 1) {
            creep.memory.step++
        }
        if (creep.memory.step == powerp.position.length) {
            creep.memory.status = 'dig'
            delete creep.memory.step
        }
    } else if (creep.memory.status == 'dig') {
        if(creep.memory.sleep&&--creep.memory.sleep>0)return
        const pb = creep.room.powerBanks[0]
        if (pb && pb.hits < 1000 && pb.ticksToDecay > 10 && creep.ticksToLive > 10 && creep.room.find(FIND_MY_CREEPS,{filter:obj=>obj.name.split('_')[1]=='power-c'}).length<powerp.carry ) {
            creep.memory.sleep=5
        } else {
            const act = creep.attack(pb)
            if (act == ERR_NOT_IN_RANGE) {
                creep.moveTo(pb)
            } else if (act == OK) {
                creep.memory.digtick = (creep.memory.digtick || 0) + 1
            }
        }

        if (pb && powerp.status == 1 && pb.hits < creep.ticksToLive * 750 && creep.hits == creep.hitsMax && creep.memory.digtick >= 2) {
            powerp.status = 2
        } else if (pb && powerp.status == 2 && (pb.hits / 750) < powerp.roadcost + Math.ceil(powerp.carry / 3) * 250) {
            powerp.status = 3
        } else if (powerp.status == 3 && !pb) {
            powerp.status = 4
            creep.suicide()
        } else if (!pb) {
            powerp.status = 4
            creep.suicide()
        }

    }

}

module.exports = {
    'work': work,
    'born': born,
};