module.exports.work = function (room) {

    if (Game.time % 5 == 0 && room.find(FIND_NUKES).length > 0) {
        // room.visual.text('FUCK!', 25, 25, {color: 'red', font: 5})
        console.log('NUKE!!!!!!!!!!')
    }

    // let ls=require('tools').extensionList[room.name]||[]
    // for(let x in ls){
    //     let pos=Game.getObjectById(ls[x]).pos
    //     room.visual.text(''+x,pos.x, pos.y, {color: 'red', font: 0.5})
    // }
    if (Memory.lastViewed === room.name && Game.time - Memory.lastViewedTime < 10) {
        room.visual.text('tick ' + Game.time % 100, 36, 21, {color: 'red', font: 0.5})
        room.visual.text(((Memory.cpu.uses / Memory.cpu.ticks).toFixed(1)) + "cpu", 36, 22, {color: 'red', font: 0.8})
        room.visual.text(Game.cpu.bucket + 'bucket', 36, 23, {color: 'red', font: 0.8})


        let busy = room.memory.busy || 0
        let lazy = room.memory.lazy || 0
        room.visual.text(((busy / (busy + lazy) * 100).toFixed(1)) + '%spawn', 36, 24, {color: 'red', font: 0.5})

        if (require('tools').extensionList && require('tools').extensionList[room.name]) {
            room.visual.text('extension OK', 36, 25, {color: 'red', font: 0.5})
        }
        let nukey = 1
        Object.keys(Memory.rooms).forEach(roomName => {
            const nuke = Game.rooms[roomName].nuker
            if (nuke) {
                room.visual.text(`nuke ${roomName} ${(nuke.cooldown || 0) === 0 ? 'OK' : "" + (100 - nuke.cooldown / 100000 * 100).toFixed(1) + "%"}`,
                    5, nukey++, {color: 'red', font: 0.5}
                )
            }
        })

    }


}
module.exports.statistics = function () {

    if (Game.time - Memory.lastViewedTime < 10) {
        let leP = require('RoomPlanner').LeveLPlan
        let draw = require('RoomPlanner').drawPlan(leP[4])
        let t2 = Game.cpu.getUsed()
    }


    const flagDraw = Game.flags['draw']
    if (flagDraw) {
        const roomName = flagDraw.pos.roomName
        const costMatrix = Game.memory.roomCache[roomName]
        if (costMatrix) {
            for (let x = 0; x <= 49; ++x) {
                for (let y = 0; y <= 49; ++y) {
                    let val = costMatrix.get(x, y)
                    if (val > 0) {
                        new RoomVisual(flagDraw.pos.roomName).text(val.toString(), x, y, {font: 0.3})
                    }
                }
            }
        } else {

            new RoomVisual(flagDraw.pos.roomName).text('no costMatrix' + JSON.stringify(costMatrix), 25, 23, {font: 0.8})
        }

        new RoomVisual(flagDraw.pos.roomName).text(`time=${Game.time}`, 25, 24, {font: 0.8})
        const cacheTTL = Game.memory.roomCachettl[roomName]
        new RoomVisual(flagDraw.pos.roomName).text(`cacheTTL=${cacheTTL}`, 25, 25, {font: 0.8})
        const obCache = Game.memory.observerCache[roomName]
        new RoomVisual(flagDraw.pos.roomName).text(`obCache=${JSON.stringify(obCache)}`, 25, 26, {font: 0.8})
        new RoomVisual(flagDraw.pos.roomName).text(`roomCacheUse=${Game.memory.roomCacheUse[roomName]}`, 25, 27, {font: 0.8})


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
            memory.busy.toFixed(1)
            memory.lazy /= 2
            memory.busy.toFixed(1)
        }
    })
    // let tw=[[27,38],[12,11]]
    // tw.forEach(obj=>{
    //     new RoomVisual('E31N41').rect(obj[0]-5.5, obj[1]-5.5, 11, 11)
    // })

    Memory.cpu = Memory.cpu || {}
    Memory.cpu.ticks = Memory.cpu.ticks || 0
    Memory.cpu.uses = Memory.cpu.uses || 0
    if (Memory.cpu.ticks >= 250) {
        Memory.cpu.ticks /= 2
        Memory.cpu.uses /= 2
    }


    if (!Memory.grafana) {
        Memory.grafana = {}
    } else {
        Memory.grafana.cpuper30 = Memory.grafana.cpuper30 || []
        while (Memory.grafana.cpuper30.length >= 30) {
            Memory.grafana.cpuper30.shift()
        }

        Memory.grafana.cpuper30.push(Memory.lastCpuUsed)
        Memory.grafana.cpuper30val = _.sum(Memory.grafana.cpuper30) / Memory.grafana.cpuper30.length
        Memory.grafana.cpuavg = Memory.cpu.uses / Memory.cpu.ticks
        Memory.grafana.cpu = Game.cpu.getUsed()
        Memory.grafana.bucket = Game.cpu.bucket
        if (Game.time % 10 === 0) {
            if(Game.time%100===0){
                Memory.grafana.hits={}
                Object.keys(Memory.rooms).forEach(roomName => {
                    let room = Game.rooms[roomName]
                    if (!room) return
                    let structures=room.find(FIND_STRUCTURES,{filter:o=>o.hits&&(o.structureType===STRUCTURE_RAMPART
                            ||o.structureType===STRUCTURE_WALL)})
                    let hits=Game.lodash.meanBy(structures,o=>o.hits)
                    Memory.grafana.hits[roomName]=hits
                })
            }
            let storageUse = {}
            let roomController = {}
            let Xresource = {}
            let Xmine = {}
            let Nuke = {}
            let terminalUse = {}
            let spawning = {}
            Object.keys(Memory.rooms).forEach(roomName => {
                let room = Game.rooms[roomName]
                if (!room) return
                if (room && room.storage) {
                    storageUse[roomName] = room.storage.store[RESOURCE_ENERGY]
                }
                if (room && room.controller.level < 8) {
                    roomController[roomName] = room.controller.progress / room.controller.progressTotal
                }
                if (room && room.terminal) {
                    terminalUse[room.name] = _.sum(room.terminal.store)
                    Object.values(REACTIONS.X).forEach(o => {
                        Xresource[o] = (Xresource[o] || 0) + (room.terminal.store[o] || 0)
                    })
                    Object.keys(MINERAL_MIN_AMOUNT).forEach(o => {
                        Xmine[o] = (Xmine[o] || 0) + (room.terminal.store[o] || 0)
                    })
                }
                const nuke = room.nuker
                if (nuke) {
                    Nuke[roomName] = (100 - nuke.cooldown / 100000 * 100).toFixed(1)
                }
                for (let spawn of room.spawns) {
                    let spawningx = spawn.spawning
                    if (spawningx && spawningx.name) {
                        let type = spawningx.name.split('_')[1]
                        spawning[type] = (spawning[type] || 0) + 1
                    }
                }
            })
            let pbProcess = {}
            for (let pbRoom in Memory.powerPlan) {
                let pb = undefined
                let plan = Memory.powerPlan[pbRoom]
                if (plan.pbid) {
                    pb = Game.getObjectById(plan.pbid)
                }
                if (!pb) {
                    let pbr = Game.rooms[pbRoom]
                    if (pbr) {
                        pb = pbr.powerBanks[0]
                    }
                }
                if (pb) {
                    pbProcess[pbRoom] = 1 - pb.hits / pb.hitsMax
                } else {
                    pbProcess[pbRoom] = 0
                }


            }

            Memory.grafana.creepNum = Object.keys(Game.creeps).length
            Memory.grafana.terminalUse = terminalUse
            Memory.grafana.spawning = spawning
            Memory.grafana.Nuke = Nuke
            Memory.grafana.creepType = _.countBy(Object.keys(Game.creeps), o => o.split('_')[1])
            Memory.grafana.storageUse = storageUse
            Memory.grafana.roomController = roomController
            Memory.grafana.Xresource = Xresource
            Memory.grafana.Xmine = Xmine
            Memory.grafana.money = Game.market.credits
            Memory.grafana.gpl = Game.gpl
            Memory.grafana.gcl = Game.gcl
            Memory.grafana.cpu20 = 20
            Memory.grafana.pbProcess = pbProcess
            Memory.grafana.enemy={}
        }

    }
    Memory.cpu.ticks++
    Memory.cpu.uses += Game.cpu.getUsed()
    Memory.lastCpuUsed = Game.cpu.getUsed()

}

