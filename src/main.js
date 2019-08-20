var api = require('api');
var tower = require('tower');

function clearmem() {
    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }
}

module.exports.roomjson = {
    ctm: [],
    subroom: [],
    source: [],
    missions: {},
    tower: [],
    mineral: [],
    link: []
}

var missions_ori = {
    filler: {},
    controllerattack: {},
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

    watcher: {},
    builder: {},
    flagworker: {},
    collecter: {},
    mineraler: {},
    opener: {},
    healer: {},
    attacker: {},
    terminalmanager: {}
}

var role_num = {
    linkmanager: 1,
    filler: 1,
    carryer: 1,
    miner: 1,
    upgrader: 2,
    reserver: 1,
    watcher: 1,
    builder: 1,
    collecter: 0,
    flagworker: 1,
    mineraler: 1,
    opener: 0,
    healer: 0,
    attacker: 0,
    rattacker: 0,
    controllerattack: 0,
    centerminer: 3,
    coreminer: 1,
    subprotecter: 1,
    terminalmanager: 1
}

var role_num_fix = {
    'E28N46': {
        upgrader: -2,
    },
    'E25N43': {
        upgrader: -2,
        opener: 0,
        // rattacker: 2,
        attacker: 0,
    },
    'E27N38': {
        upgrader: -2,
        rattacker: 0,
        healer: 1,
        controllerattack: 1,
    },
    'E27N42': {
        upgrader: -2,
        attacker: 0,
        healer:1,
    },
    'E29N41': {
        upgrader: -2,
        attacker: 0,
    }
}

module.exports.role_num_fix=role_num_fix

function mission_generator(room) {
//分配upgrader
    if (room.storage && room.controller.level >= 5) {
        if (room.storage.store[RESOURCE_ENERGY] / room.storage.storeCapacity < 0.4) {
            role_num_fix[room.name].upgrader = -2
        } else if (room.storage.store[RESOURCE_ENERGY] / room.storage.storeCapacity < 0.6) {
            role_num_fix[room.name].upgrader = -1
        } else if (room.storage.store[RESOURCE_ENERGY] / room.storage.storeCapacity < 0.8) {
            role_num_fix[room.name].upgrader = 0
        } else if (room.storage.store[RESOURCE_ENERGY] / room.storage.storeCapacity >= 0.8) {
            role_num_fix[room.name].upgrader = 1
        }
    }
    if (room.controller.level >= 8) {
        if (role_num_fix[room.name].upgrader >= 0) {
            role_num_fix[room.name].upgrader = -1
        }
    }
    if (room.controller.ticksToDowngrade < 3000 && role_num_fix[room.name].upgrader == -2) {
        role_num_fix[room.name].upgrader = -1
    }

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
    //findlink
    thisroom.link = []
    let links = room.find(FIND_STRUCTURES,
        {filter: obj => obj.structureType == STRUCTURE_LINK})
    if (links.length > 0) {
        for (let link of links) {
            thisroom.link.push(link.id)
        }
    }
    if (room.storage) {
        let centerlink = room.storage.pos.findClosestByRange(FIND_STRUCTURES, {filter: obj => obj.structureType == STRUCTURE_LINK})
        if (centerlink) thisroom.centerlink = centerlink.id
    }


    let missions = thisroom.missions
    //分配miner
    for (let sourceid of thisroom.source) {
        const container = Game.getObjectById(sourceid).pos.findInRange(FIND_STRUCTURES, 2, {
            filter: structure => structure.structureType == STRUCTURE_CONTAINER
        })[0]
        const link = Game.getObjectById(sourceid).pos.findInRange(FIND_STRUCTURES, 2, {
            filter: structure => structure.structureType == STRUCTURE_LINK && structure.my == true
        })[0]

        missions.miner[sourceid] = {
            target: sourceid,
            container: container ? container.id : null,
            link: link ? link.id : null,
            creeps: []
        }

    }
    //分配carryer
    for (let sourceid in missions.miner) {
        if (missions.miner[sourceid].container) {
            if (Game.getObjectById(missions.miner[sourceid].link)) continue
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
                let mincost = PathFinder.search(container.pos, {pos: room.storage.pos, range: 1}).cost - 4
                for (let obj of canfill) {
                    let nowcost = PathFinder.search(container.pos, {pos: obj.pos, range: 1}).cost
                    if (mincost >= nowcost && obj.pos.roomName == room.name && container.pos.roomName != room.name) {
                        filltarget = obj.id
                        mincost = nowcost
                    }
                }
            }

            if (filltarget) {
                let cost = PathFinder.search(container.pos, {pos: Game.getObjectById(filltarget).pos, range: 1}).cost
                if (cost > 5) {
                    missions.carryer[containerid] = {
                        gettarget: containerid,
                        fill: filltarget,
                        type: RESOURCE_ENERGY,
                        carrycost: cost,
                        creeps: []
                    }
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
            if (gettarget) {
                missions.filler[gettarget.id] = {
                    gettarget: gettarget.id,
                    creeps: []
                }
            }

        }

    }

    //分配reserver
    if (!thisroom.subroom) thisroom.subroom = []
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
        if (!(room.storage && room.storage.store[RESOURCE_ENERGY] / room.storage.storeCapacity < 0.2)) {
            missions.builder[room.name] = {
                creeps: [],
                roomName: room.name
            }
        }

    }

    //分配collecter
    {
        let link = null
        if (room.storage) {
            link = room.storage.pos.findInRange(FIND_STRUCTURES, 5, {filter: obj => obj.structureType == STRUCTURE_LINK})[0]
        }
        missions.collecter[room.name] = {
            creeps: [],
            roomName: room.name,
            linkid: link ? link.id : null
        }
    }

    //opener
    if (room.controller.level >= 2) {
        missions.opener[room.name] = {
            creeps: [],
            roomName: room.name
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
    if (!thisroom.ctm) thisroom.ctm = []
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
                    if (mincost > nowcost && obj.pos.roomName == room.name) {
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


    //linkmanager
    {
        const storage = room.storage
        if (storage) {
            const container = room.storage.pos.findInRange(FIND_STRUCTURES, 6, {filter: obj => obj.structureType == STRUCTURE_CONTAINER}).sort(
                (a, b) => {
                    return a.pos.getRangeTo(room.controller.pos) - b.pos.getRangeTo(room.controller.pos)
                }
            )[0]
            const link = room.storage.pos.findInRange(FIND_STRUCTURES, 6, {filter: obj => obj.structureType == STRUCTURE_LINK})[0]
            if (container && link) {
                missions.linkmanager[room.name] = {
                    creeps: [],
                    roomName: room.name,
                    storage: storage.id,
                    link: link.id,
                    container: container.id
                }
            }
        }
    }

    {
        //terminalmamager
        const terminal = room.terminal
        if (terminal) {
            if (terminal.store[RESOURCE_ENERGY] > 50000
                || (terminal.store[RESOURCE_POWER])) {
                missions.terminalmanager[room.name] = {
                    creeps: [],
                    roomName: room.name,
                }
            }
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
            if (Memory.rooms[roomName].missions[role][creep.memory.missionid])
                Memory.rooms[roomName].missions[role][creep.memory.missionid].creeps.push(name)
        } catch (e) {
            console.log(name + 'mission_detector' + e)
        }
    }
}

function mission_spawner(room) {
    let spawns = room.find(FIND_MY_SPAWNS)
    if (spawns.length == 0) return
    for (let spawn of spawns) {
        if (spawn.spawning) continue
        let missions = Memory.rooms[room.name].missions
        for (let roleName in missions) {
            let role = missions[roleName]
            for (let missionid in role) {
                try {
                    let mission = role[missionid]
                    // console.log(roleName + '--' + missionid + ' ' + mission.creeps.length)
                    let fix = ((role_num_fix[room.name] && role_num_fix[room.name][roleName]) ? role_num_fix[room.name][roleName] : 0)
                    if (mission.creeps.length <= role_num[roleName] - 1 + fix) {
                        mission.isonly = true
                        let act = api.missionspawn(spawn, roleName, mission)
                        if (act == OK || act == ERR_NOT_ENOUGH_ENERGY) {
                            return
                        }
                    } else if (mission.creeps.length != 0 && mission.creeps.length == role_num[roleName] + fix) {
                        mission.isonly = false
                        let onlycreep = Game.creeps[mission.creeps[0]]
                        if (onlycreep.ticksToLive < onlycreep.body.length * 3 + 25) {
                            let act = api.missionspawn(spawn, roleName, mission)
                            if (act == OK || act == ERR_NOT_ENOUGH_ENERGY) {
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

}

var everyTick = 0;
var lasttime = 0
var iftimer = true

function timer(strs = null) {
    let timeuse = Game.cpu.getUsed() - lasttime
    lasttime = Game.cpu.getUsed()
    if (iftimer && strs) console.log(strs + "  " + timeuse.toFixed(4))
    return timeuse
}

var cpuuse = 0
module.exports.loop = function () {

    try {
        require('spawn').work()
    } catch (e) {
        console.log('spawnerror' + e)
    }
    if (Game.time % 10 == 0) {
        clearmem()


    }
    if (Game.time % 10 == 0) {
        for (let roomName in Memory.rooms) {
            let room = Game.rooms[roomName]
            if (require('tools').findroomselsefilter(room, FIND_HOSTILE_CREEPS, {
                filter: obj => {
                    return require('whitelist').whitelist.indexOf(obj.owner.username) == -1
                }
            }).length > 0) {
                room.memory.missions.subprotecter[room.name] = {
                    creeps: [],
                    roomName: room.name
                }
            }
        }
    }
    if (Game.time % 100 == 0) {
        for (let roomName in Memory.rooms) {
            mission_generator(Game.rooms[roomName])

            try {

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
    if (Game.time % 2 == 0) {
        mission_detector()
        for (let roomName in Memory.rooms) {
            let room = Game.rooms[roomName]
            if (!room) continue
            try {
                mission_spawner(room)
            } catch (e) {
                console.log('mission_spawner' + e)
            }
        }
    }
    for (let roomName in Memory.rooms) {
        let room = Game.rooms[roomName]
        if (!room) continue
        if (everyTick != 0) {
            room.visual.text(((cpuuse / everyTick).toFixed(1)) + "cpu", 36, 22, {color: 'red', font: 0.8})
            room.visual.text(Game.cpu.bucket + 'bucket', 36, 23, {color: 'red', font: 0.8})
        }
        if (room.find(FIND_NUKES).length > 0) {
            room.visual.text('FUCK!', 25, 25, {color: 'red', font: 5})
        }
        let busy = room.memory.busy || 0
        let lazy = room.memory.lazy || 0
        room.visual.text(((busy / (busy + lazy) * 100).toFixed(1)) + '%spawn', 36, 24, {color: 'red', font: 0.5})
        try {
            tower.work(room)
        } catch (e) {
            console.log(roomName + 'tower error ' + e)
        }
        try {
            require('link').work(room)
        } catch (e) {
            console.log(roomName + 'link error ' + e)
        }

        if (room.memory.tower && room.memory.tower.length == 0 && room.find(FIND_HOSTILE_CREEPS).length > 0) {
            room.controller.activateSafeMode()
        }
    }


    for (let roomName in Memory.rooms) {
        try {
            let room = Game.rooms[roomName]
            let powers = room.find(FIND_STRUCTURES, {filter: obj => obj.structureType == STRUCTURE_POWER_SPAWN})[0]
            if (powers && powers.power > 0) {
                powers.processPower()
            }
        } catch (e) {
            console.log('pows ' + e)
        }
    }


    if (Game.time % 50 == 0) {
        for (let roomName in Memory.rooms) {
            try {
                let room = Game.rooms[roomName]
                let terminal = room.terminal
                if (terminal && room.storage && room.storage.store[RESOURCE_ENERGY] / room.storage.storeCapacity > 0.9) {
                    for (let roomNames in Memory.rooms) {
                        let rooms = Game.rooms[roomNames]
                        if (rooms.storage && rooms.storage.store[RESOURCE_ENERGY] / rooms.storage.storeCapacity < 0.7) {
                            let terminals = rooms.terminal
                            if (terminals && terminals.store[RESOURCE_ENERGY] < 100000) {
                                terminal.send(RESOURCE_ENERGY, 6000, rooms.name)
                                break
                            }
                        }
                    }
                }
            } catch (e) {
                console.log('terminal ' + e)
            }
        }
    }
    Object.values(Game.spawns).forEach(obj => {
        let memory = obj.room.memory
        if (!memory.busy) memory.busy = 0
        if (!memory.lazy) memory.lazy = 0
        if (obj.spawning) {
            memory.busy++
        } else {
            memory.lazy++
        }
        if (memory.busy + memory.lazy > 3000) {
            memory.busy /= 2
            memory.lazy /= 2
        }

    })

    for (let name in Game.creeps) {
        if (name.split('_') < 1) continue
        try {
            let role = name.split('_')[1]
            require(role).work(name)
        } catch (e) {
            console.log('role=' + name + 'error' + e)
        }
    }

    everyTick++
    everyTick %= 1000
    if (everyTick == 0) cpuuse = 0
    cpuuse += Game.cpu.getUsed()

}
module.exports.handmission = function () {
    for (let roomName in Memory.rooms) {
        let room = Game.rooms[roomName]
        if (!room) continue
        mission_generator(room)
    }
}