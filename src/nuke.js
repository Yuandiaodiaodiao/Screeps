module.exports.work = work

function work() {
    const flag = Game.flags['nuke']
    try {
        if (flag) {
            for (let roomName in Memory.rooms) {
                const room = Game.rooms[roomName]
                if (room && room.nuker && !(room.nuker.cooldown)) {
                    const act = room.nuker.launchNuke(flag.pos)
                    if (act == OK) {
                        break
                    }
                }
            }
        }
    } catch (e) {
    }
    if (Game.flags['nuke']) {
        Game.flags['nuke'].remove()
    }
}