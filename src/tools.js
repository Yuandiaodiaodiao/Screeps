
module.exports = {
    'findrooms': findrooms,
};
function findrooms(room,findconst){
    let roomset=new Set(Memory.rooms[room.name].subroom)
    roomset.add(room.name)
    let ans=[]
    for(let name in Game.rooms){
        if(roomset.has(name)){
            ans=ans.concat(Game.rooms[name].find(findconst))
        }
    }
    return ans
}