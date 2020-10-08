const lastExec = []
module.exports.lastExec = lastExec
module.exports.main = function () {

    Object.values(Game.creeps).forEach(obj => {
        try {
            if (!obj.spawning) {
                const type = obj.name.split('_')[1]
                require(type).work(obj)
                require("interShardMemoryManager").saveThisShard()
            }
        } catch (e) {
            console.log('role=' + obj.name + 'error' + e + e.stack)
        }
    })
    try{
        require("interShardMemoryManager").clear()

    }catch(e){
        console.log(e)
    }


}
module.exports.execTick = function () {
    lastExec.forEach(e => e())
    lastExec.length=0
}

