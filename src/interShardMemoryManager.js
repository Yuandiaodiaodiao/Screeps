class Manager {
    constructor() {
        this.memory = undefined
        this.shardCache = {}
        this.writed = false
    }

    pertick() {
        this.writed = false
        this.shardCache = {}
    }

    getThisShard(writeData = false) {
        if (!this.memory) {
            this.memory = JSON.parse(InterShardMemory.getLocal() || "{}");
        }
        this.writed = this.writed || writeData
        return this.memory
    }

    saveThisShard() {
        if (this.memory && this.writed) {
            let creeps=this.memory.creeps
            if(creeps){
                for(let name in creeps){
                    let value=creeps[name]
                    if(value&&value.creepDieTime&&value.creepDieTime<Game.time){
                        creeps[name]=undefined
                    }
                }
            }
            InterShardMemory.setLocal(JSON.stringify(this.memory));
        }
    }

    get(shard) {
        if (this.shardCache[shard]===undefined) {
            this.shardCache[shard] = JSON.parse(InterShardMemory.getRemote(shard) || "{}")
        }
        return this.shardCache[shard]
    }

    getNextShard(nowShard) {
        let shardNum = Number(nowShard[5])
        let ans = []
        if (shardNum + 1 <= 3) {
            ans.push("shard" + (shardNum + 1))
        }
        if (shardNum - 1 >= 0) {
            ans.push("shard" + (shardNum - 1))

        }
        return ans
    }

    mergeMaxKey(nowShard, keys) {
        //如果是从sharda来到了shardb 那么肯定是sharda里存着最新数据
        let otherShard = this.getNextShard(nowShard)
        let maxNum = -1
        for (let shard of otherShard) {
            let memory = this.get(shard)
            let num = _.get(memory, keys) || -1
            console.log(shard + " step " + num)
            maxNum = Math.max(maxNum, num)
        }
        return maxNum
    }
}

let Manageri = new Manager()
module.exports = Manageri