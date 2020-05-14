Game.lodash = require('lodash-my')


require('prototype.SpeedUp.getAllOrders')
load()

require('prototype.Creep.move')
// require('prototype.Find.cache')
require('prototype.Whitelist')
require('prototype.Room.structures')
var tower = require('tower')
var link = require('link')
console.log('reload---------------------')
require('command')

function clearmem() {
    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name]
        }
    }
    for (let name in Memory.powerCreeps) {
        if (!Game.powerCreeps[name] || !Game.powerCreeps[name].ticksToLive) {
            delete Memory.powerCreeps[name]
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


function mission_generator(room) {

// Memory.rooms[room.name].missions=missions
    if (room.spawns.length === 0) return
    room.memory.missions = room.memory.missions || {}
    let thisroom = Memory.rooms[room.name]
    thisroom.missions = require('tools').deepcopy(missions_ori)
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
            let centerlink = room.storage.pos.findClosestByRange(FIND_STRUCTURES, {filter: obj => obj.structureType == STRUCTURE_LINK})
            if (centerlink) thisroom.centerlink = centerlink.id
            thisroom.wallLink = []
            for (let link of room.links) {
                if (link.pos.findInRange(FIND_SOURCES, 2).length > 0) {
                    continue
                }
                if (link.pos.x <= 3 || link.pos.y <= 3 || link.pos.x >= 45 || link.pos.y >= 45) {
                    continue
                }
                if (link.id != thisroom.centerlink) {
                    thisroom.wallLink.push(link.id)
                }
            }
            if (thisroom.wallLink.length === 0) {
                thisroom.wallLink = undefined
            }
        }
    }
    //findlab
    if (room.controller.level == 8) {
        thisroom.lab = {}
        try {
            let labs = room.labs
            if (labs.length == 10) {
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
                filter: structure => structure.structureType == STRUCTURE_CONTAINER
            })[0]
            const link = source.pos.findInRange(FIND_STRUCTURES, 2, {
                filter: structure => structure.structureType == STRUCTURE_LINK && structure.my == true&&structure.isActive()
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
                        if(!obj.isActive())continue
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
                    filter: obj => obj.structureType == STRUCTURE_CONTAINER
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
                filter: structure => structure.structureType == STRUCTURE_CONTAINER
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
            const container = room.storage.pos.findInRange(FIND_STRUCTURES, 6, {filter: obj => obj.structureType == STRUCTURE_CONTAINER}).sort(
                (a, b) => {
                    return a.pos.getRangeTo(room.controller.pos) - b.pos.getRangeTo(room.controller.pos)
                }
            )[0]
            const link = room.storage.pos.findInRange(FIND_STRUCTURES, 6, {filter: obj => obj.structureType == STRUCTURE_LINK})[0]
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


let lastTime = 0

function timer(strs = null) {
    let timeuse = Game.cpu.getUsed() - lastTime
    if (true && strs) console.log(strs + "  " + timeuse.toFixed(4))
    lastTime = Game.cpu.getUsed()
    return timeuse
}

function shard() {
    if (Game.shard.name != 'shard3') {
        module.exports.loop = function () {
        }
        return true
    }
    return false
}

Memory.cpu.pushTime = Game.time

function load() {
    Game.test = require('test').test
    Game.war = require('war')
    Game.config = require('config')
    Game.missionController = require('missionController')
    Game.tools = require('tools')
    Game.terminal = require('terminal')
    Game.factory = require('factory')
    Game.observer = require('observer')
    Game.RoomPlanner = require('RoomPlanner')
    Game.lodash = require('lodash-my')
    // require('prototype.SpeedUp.getAllOrders').load()
    Game.runTime = Game.time - Memory.cpu.pushTime
    Game.defend = require('defendController')
    Game.reaction = require('reaction')
    for (let roomName in Memory.rooms) {
        let room=Game.rooms[roomName]
        if(!room){
            delete Memory.rooms[roomName]
        }
    }
}

var missionController = require('missionController')
// profiler.enable()
module.exports.loop = function () {
    if (shard()) return

    

    load()
    try {
        require('Game.memory').work()
        if(Game.time%100e3===0){
            Game.memory.dealBlackList=new Set()
            Game.memory.dealWhiteList=new Set()
            Game.config.refreshPrice()
        }
    } catch (e) {
        console.log('main.Game.memory error' + e)
    }
    require("constructionVisual").work()
    // try {
    //     require('cacheController').Cache()
    // } catch (e) {
    //     console.log('cacheController error' + e)
    // }
    require('prototype.Creep.move').clear()
    if (Game.time % 20 == 0) {
        clearmem()
    }
    if (Game.time % 1000 == 0) {
        require('observer').find()
        // Game.memory.roomCache = {}
        for (let roomName in Memory.rooms) {
            try {

                mission_generator(Game.rooms[roomName])
            } catch (e) {
                console.log(roomName + 'mission_generator error ' + e)
            }
        }

    }

    if (Game.time % 50 === 0) {
        for (let roomName in Memory.rooms) {
            const room = Game.rooms[roomName]
            try {
                require('defendController').miss(room)

            } catch (e) {
                console.log('defendController error' + e)
            }
        }
    }
    if (Game.time % 10 == 0) {

        for (let roomName in Memory.rooms) {
            const room = Game.rooms[roomName]
            try {
                require('subprotecter').miss(room)

            } catch (e) {
                console.log('subprotecter error' + e)
            }
        }
    }
    if (Game.time % 10 == 0) {
        try {
            require('nuke').work()
        } catch (e) {
            console.log('nuke.work error' + e)
        }
        try {
            missionController.detector()
        } catch (e) {
            console.log(`missionController.detector ${e}`)
        }
        for (let roomName in Memory.rooms) {
            let room = Game.rooms[roomName]
            try {
                missionController.spawner(room)
            } catch (e) {
                console.log('mission_spawner' + e)
            }
        }
    }
    {
        try {
            require('observer').work()
        } catch (e) {
            console.log('observerwork' + e)
        }

    }
    if ((Game.time - 20) % 50 === 0) {
        for (let roomName in Game.config.obterminal) {
            try {
                require('terminalObserver').work(roomName)
            } catch (e) {
                console.log('terminal ob error' + e)
            }
        }


    }
    for (let roomName in Memory.rooms) {
        let room = Game.rooms[roomName]
        if (!room) continue
        if (Game.time % 2 === 0) {
            Game.factory.doReact(room)
        }
        try {
            missionController.spawn(room)
        } catch (e) {
            console.log('missionController.spawn' + e)
        }
        try {
            require('roomvisual').work(room)
        } catch (e) {
            console.log('roomvisual' + roomName + e)
        }
        try {
            require('spawn').work(room)
        } catch (e) {
            console.log('spawnerror' + e)
        }

        try {
            link.work(room)
        } catch (e) {
            console.log(roomName + 'link error ' + e)
        }

        if (room.towers.length === 0 && room.find(FIND_HOSTILE_CREEPS).length > 0 && (room.controller.level <= 3 || room.controller.level >= 8)) {
            room.controller.activateSafeMode()
        }

        try {
            const powers = room.powerSpawn
            if (powers && powers.power > 0) {
                powers.processPower()
            }
        } catch (e) {
            console.log('pows ' + e)
        }
    }

    if ((Game.time + 20) % 500 == 0) {
        try {
            require('observer').cache()
        } catch (e) {
            console.log('observer' + e)
        }
    }

    timer()
    Object.values(Game.powerCreeps).forEach(obj => {
        try {
            if (Game.time <= Game.rooms[obj.name].memory.runAwayTick && Game.rooms[obj.name].memory.runAwayTick - Game.time <= 100) {
                require('nukeWall').pcRunAway(obj)
            } else {
                require('powerscreep').work(obj)
            }
        } catch (e) {
            console.log('powerscreep ' + obj.name + e)
        }
    })
    Memory.cpu.pcCpu = timer()
    if ((Game.time + 25) % 50 == 0) {
        try {
            require('powerBank').cache()
        } catch (e) {
            console.log('powerBank-cache' + e)
        }
    }
    if (Game.time % 50 == 0) {

        try {
            require('powerBank').miss()
        } catch (e) {
            console.log('powerBank-miss' + e)
        }
        for (let roomn in Memory.powerPlan) {
            try {
                require('powerBank').solveplan(roomn)
            } catch (e) {
                console.log('powerBank-solveplan' + e)
            }
        }
    }

    if (Game.time % 10 === 0) {
        for (let roomName in Memory.rooms) {
            let room = Game.rooms[roomName]
            let ticks = 100
            let rate = room.storage ? room.storage.store[RESOURCE_ENERGY] / room.storage.store.getCapacity() : 0
            if (room.storage && rate >= 0.9) {
                ticks = Math.ceil(Math.round(Math.max(10, 50 - (0.93 - 0.9) * 800) / 10)) * 10
            }
            if (Game.time % ticks === 0) {
                try {
                    require('terminal').work(room)
                } catch (e) {
                    console.log('terminal' + roomName + e)
                }
            }

        }
    }
    if ((Game.time - 25) % 100 === 0) {
        try {
            Game.terminal.avgT3()
        } catch (e) {
            console.log('main avgT3 error' + e)
        }
    }
    if ((Game.time - 24) % 100 === 0) {
        try {
            Game.terminal.sendOverT3()
        } catch (e) {
            console.log('main sendOverT3 error' + e)
        }
    }
    if ((Game.time - 13) % 100 === 0) {
        try {
            Game.terminal.fillOverT3()
        } catch (e) {
            console.log('main sendOverT3 error' + e)
        }
    }
    if (Game.time % 100 === 0) {


        try {
            require('opener').miss()
        } catch (e) {
            console.log('opener.miss ' + e)
        }

        //terminal
        for (let roomName in Memory.rooms) {
            let room = Game.rooms[roomName]
            try {
                require('wallWorker').miss(room)
            } catch (e) {
                console.log('wallWorker.miss error' + e)
            }
            try {
                require('nukeWall').miss(room)
            } catch (e) {
                console.log('nukeWall.miss error' + e)

            }
            try {
                Game.factory.miss(room)
            } catch (e) {
                console.log('Game.factory.miss error' + e)
            }
            try {
                require('reaction').work(room)
            } catch (e) {
                console.log('reaction' + roomName + e)
            }
            try {
                require('upgrader').miss(room)

            } catch (e) {
                console.log('upgrader miss' + roomName + e)
            }
            try {
                require('builder').miss(room)
            } catch (e) {
                console.log('builder miss' + e)
            }
            try {
                require('terminalmanager').miss(room)
            } catch (e) {
                console.log('terminalmanager' + e)
            }
            try {
                require('reserver').miss(room)
            } catch (e) {
                console.log('reserver-miss' + e)
            }
        }
    }

    if (Game.time % 5 == 0) {
        for (let roomName in Memory.rooms) {
            let room = Game.rooms[roomName]
            try {
                require('reaction').doreaction(room)
            } catch (e) {
                console.log('doreaction' + roomName + e)
            }
        }
    }
    timer()
    Object.values(Game.creeps).forEach(obj => {
        try {
            if (!obj.spawning) {
                const type = obj.name.split('_')[1]
                let time = Game.cpu.getUsed()
                if (type === 'wallWorker' || type === 'warCarry' || type === 'warWall') {
                    if (!((Game.cpu.bucket < 9000 && Object.keys(Memory.powerPlan).length > 0) || Game.cpu.bucket < 3000)) {
                        require(type).work(obj)
                    }
                } else if (type === 'upgrader') {
                    if (Game.cpu.bucket > 3000) {
                        require(type).work(obj)
                    }
                } else if (type === 'carryer') {
                    if (Game.cpu.bucket > 2000) {
                        require(type).work(obj)
                    }
                } else if (type === 'boostAttack' || type === 'boostHeal' || type === 'subprotecter' || type === 'destroyer' || type === 'SEAL') {
                    require(type).work(obj)
                } else if (Game.cpu.bucket > 1000) {
                    require(type).work(obj)
                } else if (Game.time % 3 !== 0) {
                    require(type).work(obj)
                }
                let ticks = Game.cpu.getUsed() - time
                if (ticks > Memory.highTicks) {
                    console.log(`${Game.time % 1000} high cpu in ${obj.name}  cost=${ticks.toFixed(3)}`)
                }
            }
        } catch (e) {
            console.log('role=' + obj.name + 'error' + e)
        }
    })
    Memory.cpu.creepCpu = timer()


    if (Game.time % 20 === 0) {
        try{
            Game.war.miss()

        }catch (e) {
            console.log("Game.war error "+e)
        }
    }

    if (Game.market.credits > 2e6) {
        let tokens = Game.market.getAllOrders({type: ORDER_SELL, resourceType: SUBSCRIPTION_TOKEN})
        for (let x of tokens) {
            if (x.price <= Game.market.credits) {
                Game.market.deal(x.id, 1)
            }
        }
    }

    if ((Game.time - 20) % 10 === 0 && Memory.giveRoom) {
        Game.tools.give(Memory.giveRoom, 'energy', 2000000)
    }

    for (let rooms in Game.rooms) {
        let room = Game.rooms[rooms]
        if (room.controller && room.controller.my) {
            try {
                tower.work(room)
            } catch (e) {
                console.log(rooms + 'tower error ' + e)
            }

        }

    }

    Game.config.dofuncQueue()

    require('roomvisual').statistics()

}
module.exports.handlemission = function (roomNamein) {
    timer()
    for (let roomName in Memory.rooms) {
        if (roomNamein && roomName !== roomNamein) {
            continue
        }
        let room = Game.rooms[roomName]
        if (!room) continue
        mission_generator(room)
    }
    timer('mission_generator use=')
}
module.exports.handlespawn = function (roomName) {
    const room = Game.rooms[roomName]
    mission_spawner(room)
}
module.exports.spawncache = function () {
    mission_detector()
    for (let roomName in MissionCache) {
        console.log(roomName + JSON.stringify(MissionCache[roomName]))
    }
}