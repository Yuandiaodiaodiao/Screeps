Game.lodash = require('lodash-my')


require('prototype.SpeedUp.getAllOrders')
load()

require('prototype.Creep.move')
// require('prototype.Find.cache')
require('prototype.Whitelist')
require('prototype.Room.structures')
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


let lastTime = 0

function timer(strs = null) {
    let timeuse = Game.cpu.getUsed() - lastTime
    if (true && strs) console.log(strs + "  " + timeuse.toFixed(4))
    lastTime = Game.cpu.getUsed()
    return timeuse
}

function isNotshard3() {
    if (Game.shard.name !== 'shard3') {
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
    Game.tower = require("tower")
    for (let roomName in Memory.rooms) {
        let room = Game.rooms[roomName]
        if (!room) {
            delete Memory.rooms[roomName]
        }
    }
}

var missionController = require('missionController')
// profiler.enable()
module.exports.loop = function () {
    if (isNotshard3()) {
        require("overshardBase").main()
        return
    }


    load()
    try {
        require('Game.memory').work()
        if (Game.time % 100e3 === 0) {
            Game.memory.dealBlackList = new Set()
            Game.memory.dealWhiteList = new Set()
            Game.config.refreshPrice()
        }
    } catch (e) {
        console.log('main.Game.memory error' + e)
    }
    require("constructionVisual").work()

    require('prototype.Creep.move').clear()
    if (Game.time % 20 == 0) {
        clearmem()
    }
    if (Game.time % 1000 == 0) {
        require('observer').find()
        // Game.memory.roomCache = {}
        for (let roomName in Memory.rooms) {
            try {

                missionController.mission_generator(Game.rooms[roomName])
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
        try {
            Game.war.miss()

        } catch (e) {
            console.log("Game.war error " + e)
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
    // for (let rooms in Game.rooms) {
    //     let room = Game.rooms[rooms]
    //     if (room && room.terminal && room.terminal.isActive()&&!room.terminal.cooldown) {
    //         let act = room.terminal.send("energy", 5000, "E13S25");
    //         if (act === OK) {
    //             console.log("火星救援!!!")
    //             break
    //         }
    //     }
    //
    // }
    for (let rooms in Game.rooms) {
        let room = Game.rooms[rooms]
        try {

            // if(room.terminal&&room.terminal.isActive()&&!room.terminal.cooldown){
            //     let order=Game.market.getOrderById("5ec1b46c6c38e27217a8ae79")
            //
            //     let act=Game.market.deal("5ec1b46c6c38e27217a8ae79",order.amount,room.name)
            //     if(act===OK){
            //         console.log("羊毛来了!!!!"+order.amount)
            //     }
            // }
        } catch (e) {

        }

        if (room.controller && room.controller.my) {
            try {
                Game.tower.work(room)
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
        missionController.mission_generator(room)
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