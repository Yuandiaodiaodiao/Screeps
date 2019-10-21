require('prototype.Creep.move')
require('prototype.Room.structures')
var tower = require('tower');
var link = require('link')
console.log('reload---------------------')

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
    room.memory.missions = room.memory.missions || {}
    let thisroom = Memory.rooms[room.name]
    thisroom.missions = require('tools').deepcopy(missions_ori)
    //找到所有资源
    const sources = []
    let targets = require('tools').findrooms(room, FIND_SOURCES)
    for (let obj of targets) {
        sources.push(obj)
    }
    //找矿
    const minerals = []
    {
        const mineralstemp = room.find(FIND_MINERALS)
        if (mineralstemp.length > 0) {
            for (let obj of mineralstemp) {
                if (obj.pos.findInRange(FIND_STRUCTURES, 1,
                    {filter: obj => obj.structureType == STRUCTURE_EXTRACTOR}).length > 0)
                    minerals.push(obj)
            }
        }
    }
    {
        //centerlink
        if (room.storage) {
            let centerlink = room.storage.pos.findClosestByRange(FIND_STRUCTURES, {filter: obj => obj.structureType == STRUCTURE_LINK})
            if (centerlink) thisroom.centerlink = centerlink.id
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
    for (let source of sources) {
        const container = source.pos.findInRange(FIND_STRUCTURES, 2, {
            filter: structure => structure.structureType == STRUCTURE_CONTAINER
        })[0]
        const link = source.pos.findInRange(FIND_STRUCTURES, 2, {
            filter: structure => structure.structureType == STRUCTURE_LINK && structure.my == true
        })[0]

        missions.miner[source.id] = {
            target: source.id,
            container: container ? container.id : undefined,
            link: link ? link.id : undefined,
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
                    filter: obj => obj.structureType == STRUCTURE_CONTAINER
                })
                if (filltarget)
                    mincost = PathFinder.search(container.pos, {pos: filltarget.pos, range: 1}, {
                        plainCost: 2, swampCost: 10, roomCallback: require('tools').roomc_nocreep
                    }).cost
            } else {

                filltarget = room.storage
                mincost = PathFinder.search(container.pos, {pos: filltarget.pos, range: 1}, {
                    plainCost: 2, swampCost: 10, roomCallback: require('tools').roomc_nocreep
                }).cost - 4
                if (container.pos.roomName != room.name) {
                    for (let obj of canfill) {
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
                if (mincost > 1) {
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
    missions.opener = {}
    //mineraler
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

function load() {
    Game.test = require('test').test
    Game.war = require('war')
    Game.config = require('config')
    Game.missionController = require('missionController')
    Game.tools = require('tools')
    Game.terminal = require('terminal')
    Game.factory = require('factory')
    Game.observer=require('observer')
}

var missionController = require('missionController')
// profiler.enable()
module.exports.loop = function () {
    if (shard()) return
    load()
    // try{
    //     require('Game.memory').work()
    // }catch (e) {
    //     console.log('main.Game.memory error'+e)
    // }
    try {
        require('cacheController').Cache()
    } catch (e) {
        console.log('cacheController error' + e)
    }
    require('prototype.Creep.move').clear()
    if (Game.time % 20 == 0) {
        clearmem()
    }
    if (Game.time % 1000 == 0) {
        require('observer').find()
        // require('tools').roomCache = {}
        for (let roomName in Memory.rooms) {
            try {
                mission_generator(Game.rooms[roomName])
            } catch (e) {
                console.log(roomName + 'mission_generator error ' + e)
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

    for (let roomName in Memory.rooms) {
        let room = Game.rooms[roomName]
        if (!room) continue
        if(Game.time%2===0){
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
            tower.work(room)
        } catch (e) {
            console.log(roomName + 'tower error ' + e)
        }
        try {
            link.work(room)
        } catch (e) {
            console.log(roomName + 'link error ' + e)
        }

        if (room.towers.length == 0 && room.find(FIND_HOSTILE_CREEPS).length > 0) {
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


    Object.values(Game.powerCreeps).forEach(obj => {
        try {
            require('powerscreep').work(obj)
        } catch (e) {
            console.log('powerscreep ' + obj.name + e)
        }
    })
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
    if (Game.time % 10 == 0) {
        for (let roomName in Memory.rooms) {
            let room = Game.rooms[roomName]
            let ticks = 100
            if (room.storage && room.storage.store[RESOURCE_ENERGY] / room.storage.store.getCapacity() > 0.95) {
                ticks = 10
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

    if (Game.time % 100 == 0) {


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

    Object.values(Game.creeps).forEach(obj => {
        try {
            if (!obj.spawning) {
                const type = obj.name.split('_')[1]
                if (type == 'boostAttack' || type == 'boostHeal' || type == 'subprotecter') {
                    require(type).work(obj)
                } else {
                    if (!(Game.cpu.bucket < 1000 && Game.time % 3 == 0)) {
                        require(type).work(obj)
                    }
                }
            }
        } catch (e) {
            console.log('role=' + obj.name + 'error' + e)
        }
    })


    if (Game.time % 10 == 0) {
        Game.war.miss()
    }
    // if(Game.time%100==0){
    //     Game.getObjectById('5d5e20a452d12c73f02d996d').launchNuke(new RoomPosition(39,10,'E21N49')) //E25N43
    //     Game.getObjectById('5d58a050ea104379d90eb36e').launchNuke(new RoomPosition(32,24,'E22N49')) //E28N46
    //     Game.getObjectById('5d5b0a943a990a6377228922').launchNuke(new RoomPosition(37,11,'E21N45'))
    // }
    require('roomvisual').statistics()

}
module.exports.handlemission = function () {
    timer()
    for (let roomName in Memory.rooms) {
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