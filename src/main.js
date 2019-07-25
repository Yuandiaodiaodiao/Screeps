var miner = require('miner');
var api = require('api');
var carryer = require('carryer');
var upgrader = require('upgrader');
var builder = require('builder');
var tower = require('tower');
var reserver = require('reserver')
var filler = require('filler')
var creepsnum = 7;
var range = api.range;
var spawnnow = Game.spawns['spawn1']
var creeplist = {
    'f': 0,//filler
    'm': 0,//miner
    'c': 0,//carryer
    'u': 0,//upgrader
    'b': 0,//builder
    'r': 0,//reserver

}
//require('api').missionspawn(Game.spawns['spawn1'], 'opener')
var findrooms = require('tools').findrooms

function clearmem() {
    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }
}

function renew(spawns) {
    if (spawns.spawning) return
    for (let types in creeplist) {
        for (let i of range(0, creeplist[types])) {
            if (!Game.creeps.hasOwnProperty(types + i)) {
                api.spawn(spawns, types, i)
                return
            }
        }
    }


}

var missions_ori = {
    filler: {},
    carryer: {//from A transfer to B
    },
    miner: {//挖矿&修复附近的建筑物
    },

    upgrader: {},
    reserver: {},
    watcher: {},
    builder: {},
    collecter: {},
    opener: {}
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
    opener: 1
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
    missions.builder[room.name] = {
        creeps: [],
        roomName: room.name
    }
    //分配collecter
    missions.collecter[room.name] = {
        creeps: [],
        roomName: room.name
    }
    //opener
    if (room.controller.level >= 5) {
        missions.opener[room.name] = {
            creeps: [],
            roomName: 'E25N43'
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
                if (mission.creeps.length <=role_num[roleName]-1 ) {
                    if (api.missionspawn(spawn, roleName, mission) == OK) {
                        return
                    }
                } else if (mission.creeps.length == role_num[roleName]) {
                    let onlycreep = Game.creeps[mission.creeps[0]]
                    if (onlycreep.ticksToLive < 100) {
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

var cpuper10 = 0;
var everyTick = 0;
module.exports.loop = function () {
    clearmem()
    if (everyTick % 10 == 0) {
        for (let roomName in Memory.rooms) {
            try {
                mission_generator(Game.rooms[roomName])
            } catch (e) {
                console.log(roomName + 'mission_generator error ' + e)
            }
        }
    }

    mission_detector()

    for (let roomName in Memory.rooms) {
        let room = Game.rooms[roomName]
        if (!room) continue
        for (let id of room.memory.tower) {
            try {
                tower.work(Game.getObjectById(id))
            } catch (e) {
                console.log('tower error ' + e)
            }
        }
        mission_spawner(room)
        if (room.memory.tower.length == 0 && room.find(FIND_HOSTILE_CREEPS).length > 0) {
            room.controller.activateSafeMode()
        }
    }
    for (let name in Game.creeps) {
        let role = name.split('_')[1]
        try {
            // console.log('role=' + role)
            // let timex=Game.cpu.getUsed()

            require(role).work(name)
            // console.log('times '+name+'='+(Game.cpu.getUsed()-timex))
        } catch (e) {
            console.log('role=' + name + 'error' + e)
        }
    }


    let link = Game.getObjectById('5d358783c08d9e7cff85ad34')
    link.transferEnergy(Game.getObjectById('5d3578ad4e9f615e2bd44cac'))


    everyTick++
    everyTick %= 1000

}