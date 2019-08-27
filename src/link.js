
function work(room) {
    let centerlink=Game.getObjectById(room.memory.centerlink)
    if(!centerlink)return
    if(centerlink.energy>0)return
    for(let link of room.links){
        if(link.id==centerlink.id ||link.cooldown!=0 ||link.energy<750)continue
        link.transferEnergy(centerlink)
        break
    }



}

module.exports = {
    'work': work
};