import { IMember, Env } from './types'
import { loadConfig, asyncTimeout } from './utils'
import { logger } from './utils/logger'
import { Context } from './context'

import { inspect } from 'node:util'

const env: Env = loadConfig('.env')
;(async function () {
  const members: IMember[] = loadConfig('member.yml')
  logger.info('加载成员列表，成功', { label: 'app' })

  const context = new Context()
  
  await context.syncLiveStatus(members).then(() => {
    logger.info('加载全部成员直播间状态，成功', { label: 'syncLiveStatus' })
  }).catch(err => {
    logger.error('加载直播间状态失败，退出', { label: 'syncLiveStatus' })
    throw err
  })
  
  await context.syncDynamicId(members).then(() => {
    logger.info('加载全部成员空间动态，成功', { label: 'syncDynamicId' })
  }).catch(err => {
    logger.error('加载成员空间动态失败，退出', { label: 'syncDynamicId' })
    throw err
  })
  
  while (true) {
    const members: IMember[] = loadConfig('./member.yml')
    
    await context.syncLiveStatus(members).then(() => {
      logger.info('live synced', { label: 'syncLiveStatus' })
    }).catch(() => {
      logger.error('live synce failed, waiting for the next try', { label: 'syncLiveStatus' })
    })
    
    await context.syncDynamicId(members).then(() => {
      logger.info('dynamic synced', { label: 'syncDynamicId' })
    }).catch(() => {
      logger.error('dynamic synce failed, waiting for the next try', { label: 'syncDynamicId' })
    })
    
    logger.info(inspect(context, false, 100, false), { label: 'app' })

    await asyncTimeout(env.interval.request * 1000)
  }
})()
