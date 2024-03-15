import { Env, IContextItem, IMember } from '../types'
import { loadConfig } from '../utils'
import { $http } from '../utils/httpservice'

const env: Env = loadConfig('.env')
const HTTP_URL = `http://${env.peer.addr}:${env.peer.httpport}/send_group_msg`

async function sendGroupMsg (groups: number[], msg: string) {
  Promise.allSettled(groups.map(g => $http.post(HTTP_URL, { group_id: g, message: msg })))
}

export async function onLiveStart ({
  member,
  ctxitem
}: {
  member: IMember
  ctxitem: IContextItem
}) {
  const message = `
  [CQ:image,file=${ctxitem.live.cover}]

  ♪ ${ctxitem.uname} 正在直播: ${ctxitem.live.title}
  
  https://live.bilibili.com/${ctxitem.live.roomId}
  `
  console.log(message)
  sendGroupMsg(member.groups, message)
}

export async function onDynaPost ({
  member,
  ctxitem
}: {
  member: IMember
  ctxitem: IContextItem
}) {
  const message = `
  ♥ ${ctxitem.uname} 发布了新动态

  https://t.bilibili.com/${ctxitem.recentDynaId}
  `
  console.log(message)
  sendGroupMsg(member.groups, message)
}
