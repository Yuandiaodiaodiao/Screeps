module.exports.work = function () {
    Object.values(Game.spawns).forEach(
        obj => {
            if (obj.spawning) return
            const creep = obj.pos.findInRange(FIND_MY_CREEPS, 1, {
                filter:
                    cep => {
                        if(cep.ticksToLive > 1400 ||cep.ticksToLive<=100)return false
                        if(obj.room.storage&&obj.room.storage.store[RESOURCE_ENERGY]<5e4)return false
                        if(cep.name.split('_')[1]=='upgrader'&&obj.room.storage&&obj.room.storage.store[RESOURCE_ENERGY] / obj.room.storage.storeCapacity < 0.4)return false
                        if(cep.name.split('_')[1]=='subprotecter')return false
                        if(cep.name.split('_')[1]=='builder')return false
                        if(cep.name.split('_')[1]=='terminalmanager'&&cep.memory.type!=RESOURCE_POWER)return false
                        return true
                    }
            })[0]
            if (creep) {
                obj.renewCreep(creep)
            }
        }
    )
}