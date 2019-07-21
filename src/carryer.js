/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('carryer');
 * mod.thing == 'a thing'; // true
 */
function work2(spawns,name){
    let creep=Game.creeps[name]

    if(creep.memory.status=='getting'){

        let target=spawns.room.storage

        if(target){
            if(creep.withdraw(target,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){
                creep.moveTo(target)
            }
        }else{
            creep.moveTo(22,19)
        }
        if(creep.carry.energy>=creep.carryCapacity){
            creep.memory.status='carrying';
        }
    }
    if(creep.memory.status=='carrying'){
        let target=creep.pos.findClosestByPath(FIND_STRUCTURES,{
            filter:(structure)=>{
                return (structure.structureType==STRUCTURE_SPAWN
                        ||structure.structureType==STRUCTURE_EXTENSION
                        ||structure.structureType==STRUCTURE_TOWER
                    )
                    && structure.energy<structure.energyCapacity;
            }
        })
        if(target){
            if(creep.transfer(target,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){
                creep.moveTo(target)
            }
        }else{
            creep.moveTo(22,19)
        }
        if(creep.carry.energy==0){
            creep.memory.status='getting';
        }
    }
}

function work(spawns,name){
    let creep=Game.creeps[name]

    if(creep.memory.status=='getting'){

        let target=Game.getObjectById(creep.memory.gettarget)

        if(target){
            if(creep.withdraw(target,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){
                creep.moveTo(target)
            }
        }else{

        }
        if(creep.carry.energy>=creep.carryCapacity){
            creep.memory.status='carrying';
        }
    }
    if(creep.memory.status=='carrying'){
        let target=spawns.room.storage
        if(target){
            if(creep.transfer(target,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){
                creep.moveTo(target)
            }
        }else{

        }
        if(creep.carry.energy==0){
            creep.memory.status='getting';
        }
    }


}
module.exports = {
    'work':work,
    'work2':work2
};