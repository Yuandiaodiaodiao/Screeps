function parseRoom(roomName){
    const parsed = /^([WE])([0-9]+)([NS])([0-9]+)$/.exec(roomName);
    return{
        x:(parseInt(parsed[4])+0.5)*(parsed[3]==="N"?-1:1),
        y:(parseInt(parsed[2])+0.5)*(parsed[1]==="W"?-1:1),
    }
}
function stringifyRoom(roomWorldPos){
    return ""+(roomWorldPos.y>0?"E":"W")
        +Math.floor(Math.abs(roomWorldPos.y))
    +(roomWorldPos.x>0?"S":"N")
    +Math.floor(Math.abs(roomWorldPos.x))
}
// let ans=parseRoom("W15N32")
// console.log(ans)
// let ans2=stringifyRoom(ans)
// console.log(ans2)
module.exports={
    parseRoom,
    stringifyRoom
}
