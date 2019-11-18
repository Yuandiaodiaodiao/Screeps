module.exports.work = function (room) {
    room.visual.text('tick ' + Game.time % 100, 36, 21, {color: 'red', font: 0.5})
    room.visual.text(((Memory.cpu.uses / Memory.cpu.ticks).toFixed(1)) + "cpu", 36, 22, {color: 'red', font: 0.8})
    room.visual.text(Game.cpu.bucket + 'bucket', 36, 23, {color: 'red', font: 0.8})

    if (Game.time % 5 == 0 && room.find(FIND_NUKES).length > 0) {
        // room.visual.text('FUCK!', 25, 25, {color: 'red', font: 5})
        console.log('NUKE!!!!!!!!!!')
    }
    let busy = room.memory.busy || 0
    let lazy = room.memory.lazy || 0
    room.visual.text(((busy / (busy + lazy) * 100).toFixed(1)) + '%spawn', 36, 24, {color: 'red', font: 0.5})
    // let ls=require('tools').extensionList[room.name]||[]
    // for(let x in ls){
    //     let pos=Game.getObjectById(ls[x]).pos
    //     room.visual.text(''+x,pos.x, pos.y, {color: 'red', font: 0.5})
    // }
    if (require('tools').extensionList[room.name]) {
        room.visual.text('extension OK', 36, 25, {color: 'red', font: 0.5})
    }
    let nukey = 1
    Object.keys(Memory.rooms).forEach(roomName => {
        const nuke = Game.rooms[roomName].nuker
        if (nuke) {
            room.visual.text(`nuke ${roomName} ${(nuke.cooldown || 0) == 0 ? 'OK' : "" + (100 - nuke.cooldown / 100000 * 100).toFixed(1) + "%"}`,
                5, nukey++, {color: 'red', font: 0.5}
            )
        }
    })

}
module.exports.statistics = function () {

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

            new RoomVisual(flagDraw.pos.roomName).text('no costMatrix'+JSON.stringify(costMatrix), 25, 23, {font: 0.8})
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
    if (Memory.cpu.ticks >= 1000) {
        Memory.cpu.ticks /= 2
        Memory.cpu.uses /= 2
    }
    Memory.cpu.ticks++
    Memory.cpu.uses += Game.cpu.getUsed()
}

