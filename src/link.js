/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('tower');
 * mod.thing == 'a thing'; // true
 */

function work(room) {
    let centerlink=Game.getObjectById(room.memory.centerlink)
    if(!centerlink)return
    if(centerlink.energy>0)return
    for(let linkid of room.memory.link){
        let link=Game.getObjectById(linkid)
        if(link.id==centerlink.id ||link.cooldown!=0 ||link.energy<750)continue
        link.transferEnergy(centerlink)
        break
    }



}

module.exports = {
    'work': work
};