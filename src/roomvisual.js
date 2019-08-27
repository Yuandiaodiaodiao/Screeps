module.exports.work = function (room) {
    room.visual.text('tick ' + Game.time % 100, 36, 21, {color: 'red', font: 0.5})
    room.visual.text(((Memory.cpu.uses / Memory.cpu.ticks).toFixed(1)) + "cpu", 36, 22, {color: 'red', font: 0.8})
    room.visual.text(Game.cpu.bucket + 'bucket', 36, 23, {color: 'red', font: 0.8})
    // if (room.find(FIND_NUKES).length > 0) {
    //     room.visual.text('FUCK!', 25, 25, {color: 'red', font: 5})
    // }
    let busy = room.memory.busy || 0
    let lazy = room.memory.lazy || 0
    room.visual.text(((busy / (busy + lazy) * 100).toFixed(1)) + '%spawn', 36, 24, {color: 'red', font: 0.5})
}
module.exports.statistics = function () {

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
    // let tw=[[27,38],[12,11]]
    // tw.forEach(obj=>{
    //     new RoomVisual('E31N41').rect(obj[0]-5.5, obj[1]-5.5, 11, 11)
    // })

    if (Memory.cpu.ticks >= 1000) {
        Memory.cpu.ticks /= 2
        Memory.cpu.uses /= 2
    }
    Memory.cpu.ticks++
    Memory.cpu.uses += Game.cpu.getUsed()
}