/**
 Module: Game.memory
 Author: Yuandiaodiaodiao
 Date:   2019.10.21
 Usage:
 module:main
 require('Game.memory')

 //your modules go here

 module.exports.loop=function(){
     require('Game.memory').work()

     //your codes go here


}

 This module will allow you save your Object,Array,Variable
 in a global object called 'Game.memory'.
 you can just {let x=1 ; Game.memory.x=x}
 then when you reload your code, the variable 'x'
 may large probability in 'Game.memory'.
 This module suit to save Objects like CostMatrixCache PathCache.
warning!!! you cant use RawMemory.setActiveSegments out the module
 only if you change the code to merge ActiveSegments
 全局储存器 用来将变量保存致ram中来节省Memory开销
 最大可存10*100k 并且相比于Memory cpu消耗极低
 注意 只能用来保存易失数据 如CostMatrix缓存 路径缓存,
 当push代码之后 您保存的数据可能会被回滚至(0,maxSaveFrequency)之前
警告: 使用此模块后不能在其他位置使用RawMemory.setActiveSegments
 除非你自己将ActiveSegments的开启操作合并
 Changelog:
 1.0: Initial publish

 */

let segStart = 20
//segId used from segStart to segStart+10 默认使用20Segments~30
let maxSaveFrequency = 1000
//save Frequency your change will be save after reload 2ticks 8ticks 32ticks....1000ticks
//保存频率 全局reload后保存频率将从2 8 32 倍增至maxSaveFrequency











const specialSave = {
    roomCache: function (cache) {
        let temp = {}
        for (let name in cache) {
            if (cache[name]) {
                try {
                    temp[name] = Game.tools.zipCostMatrix(cache[name])
                } catch (e) {
                    console.log('Game.tools.zipCostMatrix' + e + name)
                }
            }
        }
        return temp
    }
}
const specialLoad = {
    roomCache: function (cache) {
        for (let name in cache) {
            try {
                cache[name] = Game.tools.unzipCostMatrix(cache[name])
            } catch (e) {
                console.log('  Game.tools.unzipCostMatrix error ' + e + 'name')
            }
        }
        return cache
    }
}
const dataStruct = {
    observerCache: {},
    roomCache: {},
    roomCacheUse: {},
    roomCachettl: {},
}
Game.memory={}
let memory = undefined
const initData = function () {
    for (let key in dataStruct) {
        if (!Game.memory[key]) {
            Game.memory[key] = dataStruct[key]
        }
    }
}
let status = 'check'
let frequency = 2
let startTime = 0
let preSaveStr = undefined
RawMemory.setActiveSegments([])
module.exports.work = work

function work() {
    startTime++
    Game.memory = memory
    const gameMemory = Memory['Game.memory'] = Memory['Game.memory'] || {}
    const config = gameMemory.config = gameMemory.config || {}
    if (status === 'check') {
        let doRead = false
        if (!memory) {
            doRead = true
        }
        if (doRead) {
            const len = config.len || 0
            const segNum = Math.floor(len / 99e3)
            let openArray = []
            for (let segid = segStart; segid <= segStart + segNum; ++segid) {
                openArray.push(segid)
            }
            // console.log('doRead seg=' + JSON.stringify(openArray))
            RawMemory.setActiveSegments(openArray)
            status = 'read'
            Game.memory = memory = {}
            initData()
            return false
        } else {
            RawMemory.setActiveSegments([])
        }

    } else if (status === 'read') {
        const len = config.len || 0
        const segNum = Math.floor(len / 99e3)
        let strs = undefined
        for (let segid = segStart; segid <= segStart + segNum; ++segid) {
            strs = (strs || "") + (RawMemory.segments[segid] || "")
        }

        let readObject = {}
        try {
            readObject = JSON.parse(strs) || {}
        } catch (e) {
            console.log(`Game.memory.read.json.parse error ${e} \n str=${strs}`)
        }
        for (let key in readObject) {
            try {
                if (specialLoad[key]) {
                    readObject[key] = specialLoad[key](readObject[key])
                }
            } catch (e) {
                console.log('Game.memory.read.specialLoad error' + e + " key= " + key)
            }
        }
        // console.log('readObject=' + JSON.stringify(readObject))
        console.log('Game.memory.read length= '+config.len)
        Game.memory = memory = readObject
        initData()
        status = 'check'
        RawMemory.setActiveSegments([])
    } else if (status === 'save') {
        let saveStr = preSaveStr
        // console.log('save' + saveStr)
        const len = saveStr.length
        config.len = len
        const segNum = Math.floor(len / 99e3)
        for (let segid = segStart; segid <= segStart + segNum; ++segid) {
            try {
                RawMemory.segments[segid] = saveStr.substr((segid - segStart) * 99e3, 99e3)
            } catch (e) {
                console.log('seg ' + segid + ' save error' + e)
            }
        }
        RawMemory.setActiveSegments([])
        status = 'check'
    }
    if (startTime >= 3 && status === 'check' && startTime % frequency === 0) {
        frequency = Math.min(frequency * 4, maxSaveFrequency)
        let saveTemp = {}
        for (let key in memory) {
            if (specialSave[key]) {
                saveTemp[key] = specialSave[key](memory[key])
            } else {
                saveTemp[key] = memory[key]
            }
        }
        preSaveStr = JSON.stringify(saveTemp)
        const len = preSaveStr.length
        // console.log('Game.memory.save len= ' + len)
        const segNum = Math.floor(len / 99e3)
        let openArray = []
        for (let segid = segStart; segid <= segStart + segNum; ++segid) {
            openArray.push(segid)
        }
        RawMemory.setActiveSegments(openArray)
        status = 'save'
    }
    return true
}