module.exports.main = function () {
    Object.values(Game.creeps).forEach(obj => {
        try {
            if (!obj.spawning) {
                const type = obj.name.split('_')[1]
                require(type).work(obj)
            }
        } catch (e) {
            console.log('role=' + obj.name + 'error' + e + e.stack)
        }
    })

    require("interShardMemoryManager").saveThisShard()
}