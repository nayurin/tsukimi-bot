import { IMember, Env } from './types'
import { loadConfig, asyncTimeout } from './utils'
import { Context } from './context'

import { inspect } from 'node:util'

const env: Env = loadConfig('.env')
;(async function () {
  const members: IMember[] = loadConfig('member.yml')
  console.log(`[${new Date().toLocaleString()}] 加载成员列表，成功`)

  const context = new Context()
  
  await context.syncLiveStatus(members)
  console.log(`[${new Date().toLocaleString()}] 加载全部成员直播间状态，成功`)
  
  await context.syncDynamicId(members)
  console.log(`[${new Date().toLocaleString()}] 加载全部成员空间动态，成功`)
  
  while (true) {
    const members: IMember[] = loadConfig('./member.yml')
    
    await context.syncLiveStatus(members)
    console.log(`\n[${new Date().toLocaleString()}] live synced`)
    
    await context.syncDynamicId(members)
    console.log(`[${new Date().toLocaleString()}] dynamic synced`)
    
    console.log(inspect(context, false, 100, false))

    await asyncTimeout(env.interval.request * 1000)
  }
})()
