var tools=require('tools')
module.exports = {
    'test': test,
};
function test() {
    let ans=tools.findrooms(Game.spawns['spawn1'].room,FIND_SOURCES)
    for(let x of ans){
        console.log(x.id)
    }
}