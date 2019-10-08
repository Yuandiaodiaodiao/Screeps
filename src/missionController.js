let MissionCache = {}
module.exports.missionCache=MissionCache
function mission_detector() {
    MissionCache = {}
    Object.values(Game.creeps).forEach(creep => {
        try {
            const [roomName, role] = creep.name.split('_')
            const room = MissionCache[roomName] = MissionCache[roomName] || {}
            const missions = room[role] = room[role] || {}
            const mission = missions[creep.memory.missionid] = missions[creep.memory.missionid] || []
            mission.push(creep.id)
        } catch (e) {
            console.log('mission_detector' + e)
        }
    })
}

module.exports.detector = mission_detector

let SpawnList = {}
module.exports.spawnList=SpawnList
function mission_spawner(room) {
    const spawn = _.find(room.spawns, obj => !obj.spawning)
    if (!spawn) return
    const missions = Memory.rooms[room.name].missions
    const missionCreeps = MissionCache[room.name] || {}
    const spList = SpawnList[room.name] = []
    const role_num_fix = Game.config.role_num_fix
    const role_num = Game.config.role_num
    for (let roleName in missions) {
        const role = missions[roleName]
        const missionCreepsRole = missionCreeps[roleName] || {}
        for (let missionId in role) {
            const missionCreepsId = missionCreepsRole[missionId] || []
            try {
                const mission = role[missionId]
                const num = (role_num_fix[room.name] && role_num_fix[room.name][roleName] || 0) + (mission.numfix || 0) + (role_num[roleName] || 0)
                const len = missionCreepsId.length
                if (len >= num) {
                    let effective = len
                    let extCost = 10 + (mission.cost || 0)
                    for (let a = 0; a < len; ++a) {
                        const onlyCreep = Game.getObjectById(missionCreepsId[a])
                        if (!onlyCreep || (onlyCreep.ticksToLive || 1e5) < onlyCreep.body.length * 3 + extCost) {
                            --effective
                            if (effective < num) {
                                spList.push([roleName, mission, false])
                                break
                            }
                        } else {
                            break
                        }
                    }
                } else {
                    spList.push([roleName, mission, true])
                }
            } catch (e) {
                console.log("mission_spawner" + roleName + missionId + 'error' + e)
            }
        }
    }
}

module.exports.spawner = mission_spawner

function do_spawn(room) {
    const spawn = _.find(room.spawns, obj => !obj.spawning)
    if (!spawn) return
    const miss = SpawnList[room.name] || []
    while (miss.length > 0) {
        const spawnMiss = _.head(miss)
        if (!spawnMiss) {
            miss.shift()
            continue
        }
        let act = call_born(spawn, ...spawnMiss)
        if (act === OK) {
            miss.shift()
            break
        } else if (act === ERR_NOT_ENOUGH_ENERGY) {
            break
        } else {
            miss.shift()
        }
    }
}

module.exports.spawn = do_spawn

function call_born(spawnnow, types, memory, isonly) {
    const creepName = `${spawnnow.room.name}_${types}_${Game.time % 10000}`
    try {
        return require(types).born(spawnnow, creepName, memory, isonly)
    } catch (e) {
        console.log(`missionController.call_born ${creepName} ${e} `)
        return -12
    }
}