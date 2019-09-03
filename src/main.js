var api = require('api');
var tower = require('tower');
var link = require('link')
require('prototype.Room.structures')

function clearmem() {
    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }
    for (let name in Memory.powerCreeps) {
        if (!Game.powerCreeps[name] || !Game.powerCreeps[name].ticksToLive) {
            delete Memory.powerCreeps[name];
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


    builder: {},
    flagworker: {},
    collecter: {},
    mineraler: {},
    opener: {},
    healer: {},
    attacker: {},
    terminalmanager: {},
    farcarryer: {}
}

var role_num = {
    linkmanager: 1,
    filler: 1,
    carryer: 1,
    miner: 1,
    upgrader: 0,
    reserver: 1,
    watcher: 1,
    builder: 1,
    collecter: 0,
    flagworker: 0,
    mineraler: 1,
    opener: 0,
    healer: 2,
    attacker: 1,
    rattacker: 0,
    controllerattack: 0,
    centerminer: 0,
    coreminer: 0,
    subprotecter: 1,
    terminalmanager: 1,
    farcarryer: 0,
    'power-a': 0,
    'power-b': 0,
    'power-c': 0
}

var role_num_fix = {
    'E28N46': {},
    'E25N43': {
        opener: 0,
        // rattacker: 2,
        attacker: 0,
    },
    'E27N38': {
        rattacker: 0,
        healer: 0,
        opener: 0,
        controllerattack: 0,
    },
    'E27N42': {
        attacker: 0,
        healer: 0,
        opener: 0,
        controllerattack: 0,
    },
    'E29N41': {
        attacker: -2,
        opener: 0,
        farcarryer: 0,
    },
    'E29N38': {
        farcarryer: 0,
    },
    'E19N41': {
        farcarryer: 1
    },
}
var hostile = {
    // 'E34N42': {
    //     next: [27, 3, 'E34N41'],
    //     stage: ['healer'],
    // }
}

module.exports.role_num_fix = role_num_fix

function mission_generator(room) {


// Memory.rooms[room.name].missions=missions
    if (!room.memory.missions) room.memory.missions = {}
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
                // if (container.id == '5d447eca758e3f7453447016') console.log('filltargetcost' + mincost)
                if (container.pos.roomName != room.name) {
                    for (let obj of canfill) {
                        let nowcost = PathFinder.search(container.pos, {pos: obj.pos, range: 1}, {
                            plainCost: 2, swampCost: 10, roomCallback: require('tools').roomc_nocreep
                        }).cost
                        // if (container.id == '5d447eca758e3f7453447016') console.log('linkid=' + obj.id + 'cost=' + nowcost)
                        if (nowcost <= mincost) {
                            filltarget = obj
                            mincost = nowcost
                        }
                    }
                }

            }

            if (filltarget) {
                // if (container.id == '5d447eca758e3f7453447016') console.log('filltar=' + filltarget.id)
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
    if (room.controller.level >= 5) {
        missions.opener[room.name] = {
            roomName: room.name
        }
    }


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
    missions.farcarryer[room.name] = {
        roomName: room.name
    }
    //controllerattack
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


    //healer
    if (room.controller.level >= 6) {
        for (let roomName in hostile) {
            if (hostile[roomName].stage.indexOf('healer') == -1 && hostile[roomName].stage.indexOf('attacker') == -1) continue
            let goal = hostile[roomName].next
            goal = new RoomPosition(goal[0], goal[1], goal[2])
            console.log('goal=' + goal)
            let ans = PathFinder.search(room.find(FIND_MY_SPAWNS)[0].pos, {pos: goal, range: 2}, {
                plainCost: 1,
                swampCost: 5,
                roomCallback: require('tools').roomc_nocreep,
                maxOps: 20000,
                maxRooms: 32,
                maxCost: 500,
            })
            console.log('room' + room.name + 'complete' + ans.incomplete + ' ops' + ans.ops + ' cost' + ans.cost)
            if (ans.incomplete) continue
            let position = []
            let leng = ans.path.length
            for (let a in ans.path) {
                if (a % 20 == 0) {
                    position.push([ans.path[a].x, ans.path[a].y, ans.path[a].roomName])
                }
            }
            position.push(hostile[roomName].next)
            if (hostile[roomName].stage.indexOf('healer') != -1) {
                let pos = require('tools').deepcopy(position)
                missions.healer[roomName] = {
                    roomName: roomName,
                    goal: hostile[roomName].next,
                    position: pos,
                    cost: leng
                }
            }
            if (hostile[roomName].stage.indexOf('attacker') != -1) {
                let pos = require('tools').deepcopy(position)
                missions.attacker[roomName] = {
                    roomName: roomName,
                    goal: hostile[roomName].next,
                    position: pos,
                    cost: leng
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

var MissionCache = {}
var SpawnList = {}

function mission_detector() {
    MissionCache = {}
    Object.values(Game.creeps).forEach(cep => {
        try {
            const namearray = cep.name.split('_')
            const roomName = namearray[0]
            const role = namearray[1]
            let room = MissionCache[roomName] || (MissionCache[roomName] = {})
            let missions = room[role] || (room[role] = {})
            let mission = missions[cep.memory.missionid] || (missions[cep.memory.missionid] = [])
            if (cep.id) {
                mission.push(cep.id)
            }
        } catch (e) {
            console.log('missioncache' + e)
        }
    })


}

function mission_spawner(room) {

    const spawn = _.find(room.spawns, obj => !obj.spawning)
    if (!spawn) return
    const missions = Memory.rooms[room.name].missions
    const missioncreeps = MissionCache[room.name]
    SpawnList[room.name] = []
    const splist = SpawnList[room.name]
    for (let roleName in missions) {
        const role = missions[roleName]
        const missioncreepsrole = missioncreeps ? missioncreeps[roleName] : null
        for (let missionid in role) {
            const missioncreepsid = missioncreepsrole ? (missioncreepsrole[missionid] || []) : []
            try {
                let ifreturn = false
                const mission = role[missionid]
                const fix = ((role_num_fix[room.name] && role_num_fix[room.name][roleName]) ? role_num_fix[room.name][roleName] : 0) + (mission.numfix || 0)
                if (missioncreepsid.length <= role_num[roleName] - 1 + fix) {
                    splist.push([roleName, mission, true])
                } else if (missioncreepsid.length >= 1 && missioncreepsid.length == role_num[roleName] + fix) {
                    const onlycreep = Game.getObjectById(missioncreepsid[0])
                    if (onlycreep.ticksToLive < onlycreep.body.length * 3 + 25 + (mission.cost || 0)) {
                        splist.push([roleName, mission, false])
                    }
                } else if (missioncreepsid.length >= 2 && missioncreepsid.length == role_num[roleName] + fix + 1) {
                    const onlycreep = Game.getObjectById(missioncreepsid[1])
                    if (onlycreep.ticksToLive < onlycreep.body.length * 3 + 25 + (mission.cost || 0)) {
                        splist.push([roleName, mission, false])
                    }

                }

            } catch (e) {
                console.log("mission_spawner" + roleName + missionid + 'error' + e)
            }
            // if (missioncreepsid) missioncreepsid.length = 0

        }
    }

}

function do_spawn(room) {
    const spawn = _.find(room.spawns, obj => !obj.spawning)
    if (!spawn) return
    const miss = SpawnList[room.name] || []
    while (miss.length > 0) {
        const spawnmiss = _.head(miss)

        let act = api.missionspawn(spawn, spawnmiss[0], spawnmiss[1], spawnmiss[2])
        if (act == OK) {
            miss.shift()
            break
        } else if (act == ERR_NOT_ENOUGH_ENERGY) {
            break
        } else {
            miss.shift()
        }
    }
}

var lasttime = 0

function timer(strs = null) {
    let timeuse = Game.cpu.getUsed() - lasttime
    if (true && strs) console.log(strs + "  " + timeuse.toFixed(4))
    lasttime = Game.cpu.getUsed()
    return timeuse
}

var testtick = 0
module.exports.loop = function () {
    Memory.testtick = Math.max(Memory.testtick || 0, ++testtick)
    if (Game.time % 20 == 0) {
        if (!Game.getObjectById('5d43b391314ba67018b43081')) {
            role_num.attacker = -3
            role_num.healer = -3
        }
        clearmem()
    }
    if (Game.time % 10 == 0) {

        for (let roomName in Memory.rooms) {
            let room = Game.rooms[roomName]

            room.memory.missions.subprotecter = {}
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

    if (Game.time % 1000 == 0) {
        require('observer').find()
        require('tools').roomCache = {}
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
    if (Game.time % 10 == 0) {
        mission_detector()
        for (let roomName in Memory.rooms) {
            let room = Game.rooms[roomName]
            if (!room) continue
            mission_spawner(room)
            try {
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
        try {
            do_spawn(room)
        } catch (e) {
            console.log('dospawn' + e)
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

    if ((Game.time + 1) % 500 == 0) {
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
            console.log('power ' + obj.name + e)
        }
    })
    if ((Game.time + 10) % 50 == 0) {
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
    if (Game.time % 100 == 0) {
        //terminal
        for (let roomName in Memory.rooms) {
            let room = Game.rooms[roomName]
            try {
                const t1 = Game.cpu.getUsed()
                require('terminal').work(room)
                const t2 = Game.cpu.getUsed()
                console.log('terminal time' + roomName + '=' + (t2 - t1))
            } catch (e) {
                console.log('terminal' + roomName + e)
            }
            try {
                const t1 = Game.cpu.getUsed()
                require('reaction').work(room)
                const t2 = Game.cpu.getUsed()
                console.log('terminal time' + roomName + '=' + (t2 - t1))
            } catch (e) {
                console.log('reaction' + roomName + e)
            }
            try {
                require('upgrader').miss(room)
            } catch (e) {
                console.log('upgrader miss' + e)
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


    if (!(Game.cpu.bucket < 1000 && Game.time % 3 == 0)) {
        Object.values(Game.creeps).forEach(obj => {
            try {
                require(obj.name.split('_')[1]).work(obj)
            } catch (e) {
                console.log('role=' + obj.name + 'error' + e)
            }
        })

    }


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
        console.log(JSON.stringify(MissionCache[roomName]))
    }
}