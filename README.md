# feature 
2019/9/10 自杀系统  
2019/9/27 cacheController 能够自动将多segment合并为一个 来保存大于100kb的对象  
2019/9/27 war module 从控制台进行指挥的战争系统  
# bugfixd  
2019/9/9 修复了power-b在治疗时左右横跳的bug  
2019/9/9 修复了watcher堵门口的bug  
2019/9/10 修改powercreep的移动cost=1
2019/9/13 修复creep对穿roomPosition越界问题
2019/9/13 在有视野的敌对区域执行正常寻路

# 进攻日志  
2019/9/5 10235956 进攻E14N41 玩家guy  
2019/9/6 10241074 进攻E14N41失败 对方填充tower优先级过高  
2019/9/9          nuke E36N49 E33N38  
2019/9/9 10349375 进攻E14N41 玩家guy 
2019/9/10         进攻E14N41失败 敌人开启了safemode   
2019/9/24 nuke E15N41 overmind-1  
2019/9/24 nuke E34N47 玩家Meekohi  
2019/9/24 nuke E27N47 玩家Devnix  
2019/9/27 nuke E25N48 玩家Devnix  
2019/9/27 attack E23N47 Blokkie_NL  
2019/9/27 attack E31N41 barret50cal  
2019/9/27 attack E23N41 dandykong  
2019/9/27 attack E17N39 TwelveBaud  
2019/9/28 nuke E19N39 Morkonena  
2019/9/28 attack E22N42 Ower  
2019/9/28 attack E19N45 Azusa  
2019/9/28 attack E38N41 TKerstiens  
2019/9/28 attack E34N47 Meekohi  
2019/9/28 attack E17N42 woofmao  
2019/9/28 attack E31N32 nullpointerat  
2019/9/28 attack E32N33 fredboy  
2019/9/28 attack E33N37 damfle  
2019/9/28 attack E36N42 GCZ  
2019/9/28 attack E34N42 grgushi  
2019/9/28 attack E33N41 Cardy31  
2019/9/30 nuke E32N32 AndrewTawin  
2019/9/30 nuke E21N43 thdetdestro  
2019/9/30 nuke E19N47 Devnix  
2019/9/30 attack E12N41 ags131  
2019/10/1 nuke E33N38 hackgpp    
2019/10/2 nuke E16N38 TwelveBaud      
2019/10/3 nuke E21N39 Devnix  
2019/10/5 attack E11N39 ags131  
2019/10/5 attack E33N36 hackgpp 
2019/10/6 nuke E39N47 Armaos 
2019/10/6 attack E33N38 hackgpp  
Game.war.init(['E12N41',[39,2,'E12N40'],{SEAL:1},['E14N41'],{SEAL:{smallattack:true}}])  
Game.war.init(['E11N38',[24,47,'E11N39'],{SEAL:1},['E14N41'],{SEAL:{smallattack:true}}])  
2019/10/8 nuke E37N38 IC4U  
Game.war.init(['E12N41',[39,2,'E12N40'],{SEAL:1},['E14N41'],{SEAL:{smallattack:true}}])  
Game.war.init(['E14N39',[24,46,'E14N40'],{SEAL:1},['E14N41'],{SEAL:{smallattack:true}}])  
Game.war.init(['E12N38',[30,46,'E12N39'],{SEAL:1},['E14N41'],{SEAL:{smallattack:true}}])  
Game.war.init(['E11N37',[4,31,'E12N37'],{SEAL:1},['E14N41'],{SEAL:{smallattack:true}}])  
Game.war.init(['E12N36',[4,31,'E12N37'],{SEAL:1},['E14N41'],{SEAL:{smallattack:true}}])  
Game.war.init(['E8N41',[4,6,'E9N41'],{SEAL:1},['E14N41'],{SEAL:{smallattack:true}}])  
Game.war.init(['E7N41',[41,2,'E7N40'],{SEAL:1},['E14N41'],{SEAL:{smallattack:true}}])  
Game.war.init(['E9N45',[4,26,'E10N45'],{SEAL:1},['E14N41'],{SEAL:{smallattack:true}}])  
Game.war.init(['E31N45',[48,25,'E30N45'],{SEAL:1},['E28N46'],{SEAL:{wall:true}}])  
Game.war.init(['E41N39',[43,24,'E40N39'],{boostAttack:1,boostHeal:1},['E27N38'],{},['boost']])  
Game.war.init(['E30N35',[25,25,'E30N35'],{boostAttack:1,boostHeal:1},['E27N38'],{},['boost','keep']])  
Game.war.init(['E43N39',[40,47,'E43N40'],{boostAttack:1,boostHeal:1},['E27N38'],{},['boost']])  
Game.war.init(['E40N38',[25,25,'E40N38'],{boostAttack:1,boostHeal:1},['E27N38'],{},['boost']])  
Game.war.init(['E42N34',[25,25,'E40N39'],{SEAL:1},['E27N38'],{SEAL:{heal:true}}])  
Game.war.init(['E18N44',[11,27,'E19N44'],{SEAL:1},['E19N41'],{SEAL:{smallattack:true}}])
Game.war.init(['E33N38',[29,46,'E33N39'],{SEAL:1},['E29N38'],{SEAL:{smallattack:true}}])


# 其他  
刷墙效率=刷墙数量Q/(刷墙时间+路程时间 * 2)  
刷墙时间=容量carry/刷墙work数=carry * 50/work  
刷墙量Q=carry * 100  
move=(carry+work)/2  
carry+work+move=48  
carry+work=32  
work=32-carry   
F=carry*100/(carry*50/(32-carry)+dist*2)