/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('api');
 * mod.thing == 'a thing'; // true
 */
var testa="aaa";
function spawnminer(spawnnow,name){
    let unitper=1;
    let numb=0
    let target=spawnnow.room.find(FIND_SOURCES)
    if(target.length>0){

        for(let i of range(0,unitper*target.length)){

            Memory.creeps['m'+i].target
                =target[Math.floor(numb / unitper)].id
            Memory.creeps['m'+i].container=target[Math.floor(numb / unitper)].pos.findClosestByRange(FIND_STRUCTURES,{
                filter:(structure)=>{
                    return (
                        structure.structureType==STRUCTURE_CONTAINER
                    )

                }
            }).id
            numb++
        }
    }

    Game.spawns['spawn1'].spawnCreep(
        [WORK,WORK,WORK,WORK,WORK,WORK,,CARRY,MOVE,MOVE,MOVE],
        name,
        {
            memory: {status: 'going',
                energy_per_tick:12,
                target:'',
                container:''
            }
        }
    );
};
function spawncarryer(name){
    Game.spawns['spawn1'].spawnCreep(
        [CARRY,CARRY,CARRY,CARRY,
            CARRY,CARRY,CARRY,CARRY,
            CARRY,CARRY,CARRY,CARRY
            ,MOVE,MOVE,
            MOVE,MOVE,
            MOVE,MOVE],
        name,
        {
            memory: {status: 'getting'}
        }
    )
}
function spawnupgrader(name){
    Game.spawns['spawn1'].spawnCreep(
        [WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE],
        name,
        {
            memory: {status: 'getting'}
        }
    )
}
function spawnbuilder(name){
    Game.spawns['spawn1'].spawnCreep(
        [WORK,WORK,WORK,CARRY,CARRY,CARRY,
            MOVE,MOVE,MOVE],
        name,
        {
            memory: {status: 'getting'}
        }
    )
}
function spawn(spawnnow,types,id){
    if(types=='m'){
        spawnminer(spawnnow,types+id)
    }else if (types=='c'){
        spawncarryer(types+id)
    }else if(types=='u'){
        spawnupgrader(types+id)
    }else if(types=='b'){
        spawnbuilder(types+id)
    }
}

function* range(beg, end, step = 1) {
    for (let i = beg; i < end; i += step)
        yield i;
}
module.exports={
    'range':range,
    'testa':testa,
    'spawn':spawn
};
