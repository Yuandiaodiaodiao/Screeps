module.exports.work = function (room) {
        const spawns = room.spawns
        const creeps = room.find(FIND_MY_CREEPS, {
            filter: obj => {
                if (obj.ticksToLive > 1400 || obj.ticksToLive <= 250) return false
                const role = obj.name.split('_')[1]
                if (role == 'linkmanager' || role == 'filler' ) return true
                return false
            }
        })
        if(creeps.length>0){
            for(let spawn of spawns){
                if(spawn.spawning)continue

                const creep=_.find(creeps,obj=>obj.pos.getRangeTo(spawn)<=1)

                if(creep)spawn.renewCreep(creep)
            }
        }
}
