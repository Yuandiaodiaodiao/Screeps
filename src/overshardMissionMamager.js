/**
 * {rooms:["W19N23"],path:["shard3_W19N23","shard3_W30N40",],targetRoom:"E29N37",role:{SEAL:1},part:{SEAL:{work:20,heal:5,move:25}}}
 * @param room
 * @param path
 * @param targetRoom
 * @param role
 * @param part
 */
Memory.overshardMissions=Memory.overshardMissions||{}
module.exports.registMission=function({rooms,path,targetRoom,role,part,additionalMemory}){
    Memory.overshardMissions[targetRoom]={
        rooms,path,targetRoom,role,part
    }
}
const overshardPath=require("overshardPath")
module.exports.work=function (born=false) {
    Object.entries(Memory.overshardMissions).forEach(([targetRoom,plan])=>{
        let path=overshardPath[plan.path[0]][plan.path[1]]
        // 同时n只的话 就要在有效工作时间内生产n只 而有效工作时间=1500-路程
        Object.entries(plan.role).forEach(([type,number])=>{
            //每一个role独自生产
            if(Game.time%Math.round((1500-(path.distance))/number)===0 ||born){
                let body=Game.war.genbody(plan.part[type])
                //多初始房间
                plan.rooms.forEach(room=>{
                    //之后考虑重构为添加入房间生产队列中
                    Game.tools.spawnCreep(room, "overshardBase", {
                        body,roomName:targetRoom,path:plan.path,role:type
                    })
                })
            }
        })
    })
}

/*

require("overshardMissionMamager").registMission({rooms:["W19N23"],path:["shard3_W19N23","shard3_W30N40",],targetRoom:"E29N37",role:{SEAL:3},part:{SEAL:{work:22,move:25,heal:3}}})


 */