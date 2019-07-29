var api = require('api');
var tower = require('tower');

function clearmem() {
    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }
}


var missions_ori = {
    filler: {},
    centerminer: {},
    subprotecter:{},
    miner: {//挖矿&修复附近的建筑物
    },
    carryer: {//from A transfer to B
    },
    coreminer:{},


    upgrader: {},
    reserver: {},

    watcher: {},
    builder: {},
    flagworker: {},
    collecter: {},
    mineraler: {},
    opener: {},
    controllerattack: {},
    healer: {},
    attacker: {},
    rattacker: {},
}

var role_num = {
    filler: 1,
    carryer: 1,
    miner: 1,
    upgrader: 1,
    reserver: 1,
    watcher: 1,
    builder: 1,
    collecter: 1,
    flagworker: 1,
    mineraler: 1,
    opener: -1,
    healer: -1,
    attacker: -1,
    rattacker: -1,
    controllerattack: -1,
    centerminer: 3,
    coreminer:1,
    subprotecter:1
}

function mission_generator(room) {


// Memory.rooms[room.name].missions=missions
    let thisroom = Memory.rooms[room.name]
    thisroom.missions = require('tools').deepcopy(missions_ori)
    //找到所有资源
    let targets = require('tools').findrooms(room, FIND_SOURCES)
    thisroom.source = []
    for (let obj of targets) {
        thisroom.source.push(obj.id)
    }
    //找矿
    let minerals = room.find(FIND_MINERALS)
    if (minerals.length > 0) {
        thisroom.mineral = []
        for (let obj of minerals) {
            if (obj.pos.findInRange(FIND_STRUCTURES, 1,
                {filter: obj => obj.structureType == STRUCTURE_EXTRACTOR}).length > 0)
                thisroom.mineral.push(obj.id)
        }
    }
    //找塔
    thisroom.tower = []
    let towers = room.find(FIND_STRUCTURES,
        {filter: obj => obj.structureType == STRUCTURE_TOWER})
    if (towers.length > 0) {
        for (let tower of towers) {
            thisroom.tower.push(tower.id)
        }
    }

    let missions = thisroom.missions
    //分配miner
    for (let sourceid of thisroom.source) {
        let containers = Game.getObjectById(sourceid).pos.findInRange(FIND_STRUCTURES, 3, {
            filter: structure => structure.structureType == STRUCTURE_CONTAINER
        })
        if (containers.length > 0) {
            //已经配置了container 允许采矿
            missions.miner[sourceid] = {
                target: sourceid,
                container: containers[0].id,
                creeps: []
            }
        } else {
            //没有配置container 丢在地上
            missions.miner[sourceid] = {
                target: sourceid,
                container: null,
                creeps: []
            }
        }

    }
    //分配carryer
    for (let sourceid in missions.miner) {
        if (missions.miner[sourceid].container) {
            let canfill = require('tools').findroomsfilter(room, FIND_STRUCTURES, {
                filter: obj => obj.structureType == STRUCTURE_LINK
            })
            let containerid = missions.miner[sourceid].container
            let container = Game.getObjectById(containerid)
            let filltarget = null
            if (!room.storage) {
                let spawns = room.find(FIND_MY_SPAWNS)
                if (spawns.length == 0) continue
                let spawn = spawns[0]
                filltarget = spawn.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: obj => obj.structureType == STRUCTURE_CONTAINER
                }).id
            } else {
                filltarget = room.storage.id;
                let mincost = PathFinder.search(container.pos, {pos: room.storage.pos, range: 1}).cost - 10
                for (let obj of canfill) {
                    let nowcost = PathFinder.search(container.pos, {pos: obj.pos, range: 1}).cost
                    if (mincost > nowcost) {
                        filltarget = obj.id
                        mincost = nowcost
                    }
                }
            }
            if (filltarget) {
                missions.carryer[containerid] = {
                    gettarget: containerid,
                    fill: filltarget,
                    type: RESOURCE_ENERGY,
                    creeps: []
                }
            }

        }
    }
    //分配upgrader
    let controller = room.controller
    missions.upgrader[controller.id] = {
        controller: controller.id,
        creeps: []
    }
    //分配filler
    let storage = room.storage
    if (storage) {
        missions.filler[storage.id] = {
            gettarget: storage.id,
            creeps: []
        }
    } else {
        let spawns = room.find(FIND_MY_SPAWNS)
        if (spawns.length > 0) {
            let spawn = spawns[0]
            let gettarget = spawn.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: obj => obj.structureType == STRUCTURE_CONTAINER
            })
            missions.filler[gettarget.id] = {
                gettarget: gettarget.id,
                creeps: []
            }
        }

    }

    //分配reserver
    for (let subroom of thisroom.subroom) {
        missions.reserver[subroom] = {
            roomName: subroom,
            creeps: []
        }
    }
    //分配watcher
    for (let subroom of thisroom.subroom) {
        missions.watcher[subroom] = {
            roomName: subroom,
            creeps: []
        }
    }
    //分配builder
    if (require('tools').findrooms(room, FIND_CONSTRUCTION_SITES).length > 0) {
        missions.builder[room.name] = {
            creeps: [],
            roomName: room.name
        }
    }

    //分配collecter
    {let link=null
        if(room.storage){
        link= room.storage.pos.findInRange(FIND_STRUCTURES,5,{filter:obj=>obj.structureType==STRUCTURE_LINK})[0]
        }
        missions.collecter[room.name] = {
            creeps: [],
            roomName: room.name,
            linkid:link.id
        }
    }

    //opener
    if (room.controller.level >= 5) {
        missions.opener[room.name] = {
            creeps: [],
            roomName: 'E25N43'
        }
    }
    //flagworker
    if (require('tools').findroomsfilter(room, FIND_FLAGS, {
        filter: obj => obj.name.split('_')[0] == 'fw'
    }).length > 0) {
        missions.flagworker[room.name] = {
            creeps: [],
            roomName: room.name
        }
    }

    //mineraler
    for (let sourceid of thisroom.mineral) {
        let containers = Game.getObjectById(sourceid).pos.findInRange(FIND_STRUCTURES, 3, {
            filter: structure => structure.structureType == STRUCTURE_CONTAINER
        })
        if (containers.length > 0 && !Game.getObjectById(sourceid).ticksToRegeneration) {
            //已经配置了container 允许采矿
            missions.mineraler[sourceid] = {
                target: sourceid,
                container: containers[0].id,
                creeps: []
            }
        }
    }
    //mineraler配套carryer
    for (let sourceid in missions.mineraler) {
        if (missions.mineraler[sourceid].container) {
            let containerid = missions.mineraler[sourceid].container
            let filltarget = room.terminal
            if (filltarget && !Game.getObjectById(sourceid).ticksToRegeneration) {
                missions.carryer[containerid] = {
                    gettarget: containerid,
                    fill: filltarget.id,
                    type: Game.getObjectById(sourceid).mineralType,
                    creeps: []
                }
            }

        }
    }
    //healer
    missions.healer[room.name] = {
        creeps: [],
        roomName: room.name
    }
    //attacker
    missions.attacker[room.name] = {
        creeps: [],
        roomName: room.name
    }
    //rattacker
    missions.rattacker[room.name] = {
        creeps: [],
        roomName: room.name
    }
    //controllerattack
    missions.controllerattack[room.name] = {
        creeps: [],
        roomName: room.name
    }
    //centerminer
    for (let posr of thisroom.ctm) {
        missions.centerminer[posr.x + posr.y + posr.roomName] = {
            creeps: [],
            x: posr.x,
            y: posr.y,
            roomName: posr.roomName
        }
    }
    //coreminer
    for (let posr of thisroom.ctm) {
        missions.coreminer[posr.x + posr.y + posr.roomName] = {
            creeps: [],
            x: posr.x,
            y: posr.y,
            roomName: posr.roomName
        }
    }
    //centcarryer
    //分配carryer
    for (let posr of thisroom.ctm) {
        try {
            let cpos = new RoomPosition(posr.x, posr.y, posr.roomName)
            let container = cpos.findInRange(FIND_STRUCTURES, 3, {filter: obj => obj.structureType == STRUCTURE_CONTAINER})[0]
            if (!container) continue
            let canfill = require('tools').findroomsfilter(room, FIND_STRUCTURES, {
                filter: obj => obj.structureType == STRUCTURE_LINK
            })
            let filltarget = null
            if (!room.storage) {
                let spawns = room.find(FIND_MY_SPAWNS)
                if (spawns.length == 0) continue
                let spawn = spawns[0]
                filltarget = spawn.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: obj => obj.structureType == STRUCTURE_CONTAINER
                }).id
            } else {
                filltarget = room.storage.id;
                let mincost = PathFinder.search(container.pos, {pos: room.storage.pos, range: 1}).cost - 10
                for (let obj of canfill) {
                    let nowcost = PathFinder.search(container.pos, {pos: obj.pos, range: 1}).cost
                    if (mincost > nowcost) {
                        filltarget = obj.id
                        mincost = nowcost
                    }
                }
            }
            if (filltarget) {
                missions.carryer[container.id] = {
                    gettarget: container.id,
                    fill: filltarget,
                    type: RESOURCE_ENERGY,
                    creeps: []
                }
            }
        } catch
            (e) {
        }
    }
    //subprotecter
    if (require('tools').findroomselse(room, FIND_HOSTILE_CREEPS).length > 0) {
        missions.subprotecter[room.name] = {
            creeps: [],
            roomName: room.name
        }
    }

}

function mission_detector() {
    for (let roomName in Memory.rooms) {
        let missions = Memory.rooms[roomName].missions
        for (let roleName in missions) {
            let mission = missions[roleName]
            for (let missionid in mission) {
                mission[missionid].creeps = []
            }
        }
    }
    for (let name in Game.creeps) {
        try {
            let creep = Game.creeps[name]
            let namearray = name.split('_')
            let roomName = namearray[0]
            let role = namearray[1]
            Memory.rooms[roomName].missions[role][creep.memory.missionid].creeps.push(name)
        } catch (e) {
        }
    }
}

function mission_spawner(room) {
    let spawns = room.find(FIND_MY_SPAWNS)
    if (spawns.length == 0) return
    let spawn = spawns[0]
    if (spawn.spawning) return
    let missions = Memory.rooms[room.name].missions
    for (let roleName in missions) {
        let role = missions[roleName]
        for (let missionid in role) {
            try {
                let mission = role[missionid]
                // console.log(roleName + '--' + missionid + ' ' + mission.creeps.length)
                if (mission.creeps.length <= role_num[roleName] - 1) {
                    if (api.missionspawn(spawn, roleName, mission) == OK) {
                        return
                    }
                } else if (mission.creeps.length == role_num[roleName]) {
                    let onlycreep = Game.creeps[mission.creeps[0]]
                    if ((roleName!='centerminer'&&onlycreep.ticksToLive < 100)||((roleName=='centerminer'&&onlycreep.ticksToLive < 200))) {
                        if (api.missionspawn(spawn, roleName, mission) == OK) {
                            return
                        }
                    }
                }
            } catch (e) {
                console.log(roleName + missionid + 'error' + e)
            }

        }
    }
}

var everyTick = 0;
var lasttime = 0
var iftimer = false

function timer(strs = null) {
    let timeuse = Game.cpu.getUsed() - lasttime
    lasttime = Game.cpu.getUsed()
    if (iftimer && strs) console.log(strs + "  " + timeuse.toFixed(4))
    return timeuse
}

var cpuuse = 0
module.exports.loop = function () {
    clearmem()
    if ((everyTick+1) % 50 == 0) {
        for (let roomName in Memory.rooms) {
            try {
                mission_generator(Game.rooms[roomName])
            } catch (e) {
                console.log(roomName + 'mission_generator error ' + e)
            }
            if (Game.rooms[roomName].terminal && false) {
                let order = Game.market.getAllOrders({type: ORDER_BUY, resourceType: RESOURCE_HYDROGEN}).sort(
                    (b, a) => (a.price * 1000 - Game.market.calcTransactionCost(1000, roomName, a.roomName) * 15) -
                        (b.price * 1000 - Game.market.calcTransactionCost(1000, roomName, b.roomName) * 15)
                )[0]
                if (order) {
                    console.log(JSON.stringify(order))
                    console.log('cost=' + (order.price * 1000 - Game.market.calcTransactionCost(1000, roomName, order.roomName) * 15))
                }
            }

        }

    }
    timer()
    mission_detector()
    timer('mission_detector')

    for (let roomName in Memory.rooms) {
        let room = Game.rooms[roomName]
        if (!room) continue
        if (everyTick != 0) {
            room.visual.text(((cpuuse / everyTick).toFixed(1)) + "cpu", 36, 22, {color: 'red', font: 0.8})
        }
        try {
            timer()
            tower.work(room)
            timer('tower')
        } catch (e) {
            console.log(roomName + 'tower error ' + e)
        }

        timer()
        mission_spawner(room)
        timer('spawner' + roomName)
        if (room.memory.tower.length == 0 && room.find(FIND_HOSTILE_CREEPS).length > 0) {
            room.controller.activateSafeMode()
        }
    }
    for (let name in Game.creeps) {
        if (name.split('_') < 1) continue
        try {
            let role = name.split('_')[1]
            // console.log('role=' + role)
            timer()
            require(role).work(name)
            timer(name)
        } catch (e) {
            console.log('role=' + name + 'error' + e)
        }
    }


    let link = Game.getObjectById('5d358783c08d9e7cff85ad34')
    if (link.cooldown == 0)
        link.transferEnergy(Game.getObjectById('5d3578ad4e9f615e2bd44cac'))
    link = Game.getObjectById('5d3b0f5655e4f473c8741a81')
    if (link.cooldown == 0)
        link.transferEnergy(Game.getObjectById('5d3b12c35141741e27628e4f'))
    link = Game.getObjectById('5d3d2fc292f3f774843b2890')
    if (link.cooldown == 0)
        link.transferEnergy(Game.getObjectById('5d3578ad4e9f615e2bd44cac'))

    everyTick++
    everyTick %= 1000
    if (everyTick == 0) cpuuse = 0
    cpuuse += Game.cpu.getUsed()
}