function work(room) {

    if (Game.defend.defendRoom.includes(room.name) && Memory.wallNum[room.name] > 1 && Game.defend.wallWorkLength[room.name] > 1 && room.memory.wallLink && room.memory.wallLink.length > 0) {
        let wallLinks = room.memory.wallLink.map(o => Game.getObjectById(o)).filter(o => o.store.energy < 300)
        let wallIt = wallLinks.values()
        let otherLink = room.links.filter(o => (!(room.memory.wallLink.includes(o.id))))
        for (let link of otherLink) {
            if ((!link.cooldown || link.cooldown === 0) && link.energy > 750) {
                let it = wallIt.next()
                if (it.value) {
                    link.transferEnergy(it.value)
                    break
                }
            }
        }
    } else {
        let centerlink = Game.getObjectById(room.memory.centerlink)
        if (!centerlink) return
        if (centerlink.energy > 0) return
        for (let link of room.links) {
            if (link.id === centerlink.id || link.cooldown !== 0 || link.energy < 750) continue
            let ans = link.transferEnergy(centerlink)
            if (ans === OK) {
                break
            }
        }
    }


}

module.exports = {
    'work': work
};