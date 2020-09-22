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
    if (!powerp) creep.suicide()
    if (creep.memory.status == 'going') {
        const act = Game.tools.moveByLongPath(powerp.position, creep)
        if (act == OK) {
            creep.memory.status = 'dig'
        }

    } else if (creep.memory.status == 'dig') {
        if(Game.time%5===0){
            let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
            if (target && creep.pos.getRangeTo(target) <= 5) {
                creep.memory.status='fight'
                const act = creep.attack(target)
                if (act == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {ignoreCreeps: false, serializeMemory: false})
                }
                return
            }
        }


        if (creep.memory.sleep && --creep.memory.sleep > 0) return
        const pb = creep.room.powerBanks[0]
        if(creep.ticksToLive===1&&pb.hits>creep.getActiveBodyparts(ATTACK)*30){
            //挖不完了
            //重新激活
            Memory.powerPlan[creep.memory.missionid].status = 1
            const act = creep.attack(pb)
            if (act === ERR_NOT_IN_RANGE) {
                creep.moveTo(pb)
            } else if (act === OK) {
                creep.memory.digtick = (creep.memory.digtick || 0) + 1
            }
            //produce attack
            require('powerBank').solveplan(creep.memory.missionid)
            return;
        }

        if (pb && pb.hits < 1000 && pb.ticksToDecay > 10 && creep.ticksToLive > 10 && (powerp.carryArrive||0) < (powerp.carry||1)) {
            creep.memory.sleep = 5

        } else {
            creep.memory.sleep=undefined
            const act = creep.attack(pb)
            if (act === ERR_NOT_IN_RANGE) {
                creep.moveTo(pb)
            } else if (act === OK) {
                creep.memory.digtick = (creep.memory.digtick || 0) + 1
            }
        }

        if (pb && powerp.status == 1 && pb.hits < 500000 && pb.hits < creep.ticksToLive * 750 && creep.hits == creep.hitsMax && creep.memory.digtick >= 2) {
            powerp.status = 2
        } else if (pb && powerp.status == 2 && (pb.hits / 750) < powerp.roadcost + Math.ceil(powerp.carry / 3) * 250) {
            powerp.status = 3
        } else if (powerp.status == 3 && !pb) {
            powerp.status = 4

        } else if (!pb) {
            powerp.status = 4
            powerp.status4ticks=(powerp.status4ticks||0)+1
            if(powerp.status4ticks>20){
                let powerbs=creep.room.find(FIND_MY_CREEPS, {filter: obj => obj.name.split('_')[1] === 'power-b'})
                powerbs.forEach(o=>o.suicide())
                creep.suicide()
            }
        }else if(powerp.status===5){
            creep.suicide()
        }
        if (pb && pb.hits > creep.ticksToLive * 750) {
            powerp.status = 1
        }


    }else if(creep.memory.status=='fight'){
        let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
        if (target && creep.pos.getRangeTo(target) <= 5) {
            creep.memory.status='fight'
            const act = creep.attack(target)
            if (act == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {ignoreCreeps: false, serializeMemory: false})
            }
        }
        if(!target){
            creep.memory.status = 'dig'
        }
    }


}

module.exports = {
    'work': work,
    'born': born,
};