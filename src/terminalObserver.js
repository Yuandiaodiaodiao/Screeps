function work(targetRoom){
    Game.observer.observer_queue[targetRoom]={roomName:targetRoom}
    let usefult3=require('reaction').usefult3
    let obcache=Game.memory.observerCache[targetRoom]
    let limit=Game.config.obterminal[targetRoom].limit
    if(obcache&&obcache.terminalstore){
        // console.log('ob terminal room= '+`${targetRoom} num=${JSON.stringify(obcache.terminalstore)} `)

        for(let type in obcache.terminalstore){
            if(usefult3.has(type)){
                let num=obcache.terminalstore[type]

                if(limit-num>1000){
                    let act=Game.tools.give(targetRoom,type,limit-num)
                    console.log('ob terminal give'+`num=${limit-num} type=${type} nowlast=${num} room=${targetRoom}`)
                    if(act){
                        return
                    }
                }
            }
        }
    }
}
module.exports.work=work