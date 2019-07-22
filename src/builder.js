/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('upgrader');
 * mod.thing == 'a thing'; // true
 */
function getting(spawns,creep,next_status , baseline=0){
    let target=spawns.room.storage
    if(target && target.store[RESOURCE_ENERGY]>baseline){
        if(creep.withdraw(target,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){
            creep.moveTo(target)
        }
    }else{

    }
    if(creep.carry.energy>=creep.carryCapacity){
        creep.memory.status=next_status;
    }
}

function work2(spawns,name){
    //build
    let creep=Game.creeps[name]
    if(creep.memory.status=='building'){
        let targets=[]
        for(let name in Game.rooms){
            let room=Game.rooms[name]
            targets.push.apply(targets, room.find(FIND_CONSTRUCTION_SITES))
        }
        if(targets.length>0) {
            if(creep.build(targets[targets.length-1]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[targets.length-1]);
            }
        }else{
            creep.moveTo(24,17)
            creep.memory.status='repairing'
        }

        if(creep.carry.energy==0){
            creep.memory.status='getting'
        }
    }
    if(creep.memory.status=='repairing'){
        let target=creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: object => object.hits < object.hitsMax&&
                object.structureType!=STRUCTURE_WALL
        });
        if(target){
            if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }else{
            creep.moveTo(24,17)
            creep.memory.status='building'
        }
        if(creep.carry.energy==0){
            creep.memory.status='getting'
        }
    }
    if(creep.memory.status=='getting'){
        getting(spawns,creep,'building',5e4)
    }
}
function work(spawns,name){
    //repair
    let creep=Game.creeps[name]
    if(creep.memory.status=='building'){
        let target=creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES)
        if(target) {
            if(creep.build(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }else{
            creep.memory.status='repairing'
        }

        if(creep.carry.energy==0){
            creep.memory.status='getting'
        }
    }
    if(creep.memory.status=='repairing'){
        let target=creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: object => {return object.hits < object.hitsMax
                && object.structureType!= STRUCTURE_WALL
            }
        });
        if(target){
            if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }else{
            creep.status='building'
        }
        if(creep.carry.energy==0){
            creep.memory.status='getting'
        }
    }
    if(creep.memory.status=='getting'){
        getting(spawns,creep,'repairing',5e4)
    }
}
module.exports = {
    'work':work,
    'work2':work2
};