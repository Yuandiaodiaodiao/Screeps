var tools = require('tools')
module.exports = {
    'test': test,
};

function test() {
    let room = Game.rooms['E28N46']

    let t1 = Game.cpu.getUsed()
    let roompos = new RoomPosition(19, 21, 'E28N46')

    // let pos1 = room.storage.pos
    // if (roompos.roomName == pos1.roomName)
    //     Math.max(Math.abs(pos1.x - roompos.x), Math.abs(pos1.y - roompos.y))
    let t2 = Game.cpu.getUsed()
    console.log('time' + (t2 - t1))
}
