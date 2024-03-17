import { IMember, Env } from './types'
import { loadConfig, asyncTimeout } from './utils'
import { Context } from './context'

import { inspect } from 'node:util'

const env: Env = loadConfig('.env')
;(async function () {
  const members: IMember[] = loadConfig('member.yml')
  console.log(`[${new Date().toLocaleString()}] 加载成员列表，成功`)

  const context = new Context()
  
  await context.syncLiveStatus(members).then(() => {
    console.log(`[${new Date().toLocaleString()}] 加载全部成员直播间状态，成功`)
  }).catch(err => {
    console.log(`[${new Date().toLocaleString()}] 加载直播间状态失败，退出`)
    throw err
  })
  
  await context.syncDynamicId(members).then(() => {
    console.log(`[${new Date().toLocaleString()}] 加载全部成员空间动态，成功`)
  }).catch(err => {
    console.log(`[${new Date().toLocaleString()}] 加载成员空间动态失败，退出`)
    throw err
  })
  
  while (true) {
    const members: IMember[] = loadConfig('./member.yml')
    
    await context.syncLiveStatus(members).then(() => {
      console.log(`\n[${new Date().toLocaleString()}] live synced`)
    }).catch(() => {
      console.log(`\n[${new Date().toLocaleString()}] live synce failed, waiting for the next try`)
    })
    
    await context.syncDynamicId(members).then(() => {
      console.log(`[${new Date().toLocaleString()}] dynamic synced`)
    }).catch(() => {
      console.log(`\n[${new Date().toLocaleString()}] dynamic synce failed, waiting for the next try`)
    })
    
    console.log(inspect(context, false, 100, false))

    await asyncTimeout(env.interval.request * 1000)
  }
})()
