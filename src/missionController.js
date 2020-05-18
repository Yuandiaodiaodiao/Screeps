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



let missions_ori = {
    filler: {},
    watcher: {},
    centerminer: {},
    subprotecter: {},
    miner: {//挖矿&修复附近的建筑物
    },
    linkmanager: {},
    carryer: {//from A transfer to B
    },
    rattacker: {},

    coreminer: {},


    upgrader: {},
    reserver: {},


    builder: {},
    flagworker: {},
    collecter: {},
    mineraler: {},
    opener: {},
    terminalmanager: {},
    farcarryer: {},
    destroyer: {},
}


module.exports.mission_generator=function (room) {

// Memory.rooms[room.name].missions=missions
    if (room.spawns.length === 0) return
    room.memory.missions = room.memory.missions || {}
    let thisroom = Memory.rooms[room.name]
    thisroom.missions = Game.tools.deepcopy(missions_ori)
    //找到所有资源
    const sources = []
    let targets = Game.tools.findrooms(room, FIND_SOURCES)
    for (let obj of targets) {
        sources.push(obj)
    }
    //修路
    try {
        if (Game.runTime > 0) {
            Game.RoomPlanner.autoRoad(room)
        }

    } catch (e) {
        console.log('buildroad error' + e + 'in' + room.name)
    }
    //找矿
    const minerals = []
    {
        const mineralstemp = room.find(FIND_MINERALS)
        if (mineralstemp.length > 0) {
            for (let obj of mineralstemp) {
                if (obj.pos.findInRange(FIND_STRUCTURES, 1,
                    {filter: obj => obj.structureType === STRUCTURE_EXTRACTOR}).length > 0) {
                    minerals.push(obj)
                } else {
                    //建造矿井
                    room.createConstructionSite(obj.pos, STRUCTURE_EXTRACTOR)
                    room.createConstructionSite(Game.tools.nearavailable(obj.pos), STRUCTURE_CONTAINER)
                }
            }
        }
    }
    {
        //centerlink
        if (room.storage) {
            let centerlink = room.storage.pos.findClosestByRange(FIND_STRUCTURES, {filter: obj => obj.structureType ===STRUCTURE_LINK})
            if (centerlink) thisroom.centerlink = centerlink.id
            thisroom.wallLink = []
            for (let link of room.links) {
                if (link.pos.findInRange(FIND_SOURCES, 2).length > 0) {
                    continue
                }
                if (link.pos.x <= 3 || link.pos.y <= 3 || link.pos.x >= 45 || link.pos.y >= 45) {
                    continue
                }
                if (link.id !== thisroom.centerlink) {
                    thisroom.wallLink.push(link.id)
                }
            }
            if (thisroom.wallLink.length === 0) {
                thisroom.wallLink = undefined
            }
        }
    }
    //findlab
    if (room.controller.level === 8) {
        thisroom.lab = {}
        try {
            let labs = room.labs
            if (labs.length === 10) {
                let xb = 0
                let yb = 0
                for (let lab of labs) {
                    xb += lab.pos.x
                    yb += lab.pos.y
                }
                xb /= 10
                yb /= 10
                labs.sort((a, b) => Math.abs(a.pos.x - xb) + Math.abs(a.pos.y - yb) - Math.abs(b.pos.x - xb) - Math.abs(b.pos.y - yb))
                thisroom.lab['input'] = [labs[0].id, labs[1].id]
                thisroom.lab['output'] = []
                labs.slice(2).forEach(obj => thisroom.lab['output'].push(obj.id))
                thisroom.lab['ok'] = true
            }
        } catch (e) {
            console.log('findlab' + e)
        }
    }

    require('tools').solveExtension(room)
    let missions = thisroom.missions
    //分配miner
    if (room.controller.level >= 4) {
        for (let source of sources) {
            const container = source.pos.findInRange(FIND_STRUCTURES, 1, {
                filter: structure => structure.structureType === STRUCTURE_CONTAINER
            })[0]
            const link = source.pos.findInRange(FIND_STRUCTURES, 2, {
                filter: structure => structure.structureType === STRUCTURE_LINK && structure.my === true && structure.isActive()
            })[0]
            if (room.controller.level < 8) {
                if (link && container) {
                    container.destroy()
                }
            }
            missions.miner[source.id] = {
                target: source.id,
                container: container ? container.id : undefined,
                link: link ? link.id : undefined,
            }

        }
    }


    //分配carryer
    for (let sourceid in missions.miner) {
        if (missions.miner[sourceid].container) {
            if (Game.getObjectById(missions.miner[sourceid].link)) continue
            let canfill = room.links
            let containerid = missions.miner[sourceid].container
            let container = Game.getObjectById(containerid)
            let filltarget = null
            let mincost = 999
            if (!room.storage) {
                let spawns = room.spawns
                if (spawns.length == 0) continue
                let spawn = spawns[0]
                filltarget = spawn.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: obj => obj.structureType === STRUCTURE_CONTAINER
                })
                if (filltarget)
                    mincost = PathFinder.search(container.pos, {pos: filltarget.pos, range: 1}, {
                        plainCost: 2, swampCost: 10, roomCallback: require('tools').roomc_nocreep
                    }).cost
            } else {

                filltarget = room.storage
                mincost = PathFinder.search(container.pos, {pos: filltarget.pos, range: 0}, {
                    plainCost: 2, swampCost: 10, roomCallback: require('tools').roomc_nocreep
                }).cost
                if (container.pos.roomName !== room.name) {
                    for (let obj of canfill) {
                        if (!obj.isActive()) continue
                        let nowcost = PathFinder.search(container.pos, {pos: obj.pos, range: 1}, {
                            plainCost: 2, swampCost: 10, roomCallback: require('tools').roomc_nocreep
                        }).cost
                        if (nowcost <= mincost) {
                            filltarget = obj
                            mincost = nowcost
                        }
                    }
                }

            }

            if (filltarget) {
                if (mincost > 1 || room.controller.level === 4) {
                    missions.carryer[containerid] = {
                        gettarget: containerid,
                        fill: filltarget.id,
                        type: RESOURCE_ENERGY,
                        carrycost: mincost,
                    }
                }

            }

        }
    }

    //分配upgrader
    let controller = room.controller
    missions.upgrader[controller.id] = {
        controller: controller.id,
    }

    //分配filler
    {
        let storage = room.storage
        if (storage) {

            missions.filler = {}
            missions.filler[storage.id] = {
                gettarget: storage.id,
            }
        } else {
            let spawns = room.find(FIND_MY_SPAWNS)
            if (spawns.length > 0) {
                let spawn = spawns[0]
                let gettarget = spawn.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: obj => obj.structureType === STRUCTURE_CONTAINER
                })
                if (gettarget) {
                    missions.filler[gettarget.id] = {
                        gettarget: gettarget.id,
                    }
                }

            }

        }
    }


    //分配watcher
    for (let subroom of thisroom.subroom) {
        missions.watcher[subroom] = {
            roomName: subroom,
        }
    }


    //opener
    //mineraler
    if (room.controller.level >= 6) {
        for (let source of minerals) {

            const container = source.pos.findInRange(FIND_STRUCTURES, 3, {
                filter: structure => structure.structureType === STRUCTURE_CONTAINER
            })[0]
            if (container && !source.ticksToRegeneration) {
                //已经配置了container 允许采矿
                missions.mineraler[source.id] = {
                    target: source.id,
                    container: container.id,
                }
            }
        }
    }


    //mineraler配套carryer
    for (let sourceid in missions.mineraler) {
        if (missions.mineraler[sourceid].container) {
            let containerid = missions.mineraler[sourceid].container
            let filltarget = room.terminal
            let source = Game.getObjectById(sourceid)
            if (filltarget && !source.ticksToRegeneration) {
                missions.carryer[containerid] = {
                    gettarget: containerid,
                    fill: filltarget.id,
                    type: source.mineralType,
                }
            }

        }
    }


    // //rattacker
    // missions.rattacker[room.name] = {
    //     roomName: room.name
    // }
    // farcarryer
    // missions.farcarryer[room.name] = {
    //     roomName: room.name
    // }
    // // controllerattack
    // missions.controllerattack[room.name] = {
    //     roomName: room.name
    // }


    //linkmanager
    {
        const storage = room.storage
        if (storage) {
            const container = room.storage.pos.findInRange(FIND_STRUCTURES, 6, {filter: obj => obj.structureType === STRUCTURE_CONTAINER}).sort(
                (a, b) => {
                    return a.pos.getRangeTo(room.controller.pos) - b.pos.getRangeTo(room.controller.pos)
                }
            )[0]
            const link = room.storage.pos.findInRange(FIND_STRUCTURES, 6, {filter: obj => obj.structureType === STRUCTURE_LINK})[0]
            if (container && link) {
                missions.linkmanager[room.name] = {
                    roomName: room.name,
                    link: link.id,
                    container: container.id
                }
            }
        }
    }


    for (let miss in missions) {
        if (_.isEmpty(missions[miss])) {
            delete missions[miss]
        }
    }
    missions['subprotecter'] = missions['subprotecter'] || {}
}

