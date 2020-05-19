


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
            InterShardMemory.setLocal(JSON.stringify(this.memory));
        }
    }

    get(shard) {
        if (!this.shardCache[shard]) {
            this.shardCache = JSON.parse(InterShardMemory.getRemote(shard) || "{}")
        }
        return this.shardCache[shard]
    }

    getNextShard(nowShard) {
        let shardNum = Number(nowShard[5])
        let ans = []
        if (nowShard + 1 <= 3) {
            ans.push("shard" + (nowShard + 1))
        }
        if (nowShard - 1 >= 0) {
            ans.push("shard" + (nowShard - 1))

        }
        return ans
    }

    mergeMaxKey(nowShard, keys) {
        //如果是从sharda来到了shardb 那么肯定是sharda里存着最新数据
        let otherShard = this.getNextShard(nowShard)
        let maxNum = 0
        for (let shard of otherShard) {
            let memory = this.get(shard)
            let num = _.get(memory, keys) || 0
            maxNum = Math.max(maxNum, num)
        }
        return maxNum
    }
}
let Manager=new Manager()
module.exports=Manager