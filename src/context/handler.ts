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
  sendGroupMsg(member.groups, message)
}

export async function onVideoPost ({
  aid,
  member,
  ctxitem
}: {
  aid: string | number,
  member: IMember,
  ctxitem: IContextItem
}) {
  const params = Object.entries({
    build: '6060600',
    buvid: '0',
    oid: String(aid),
    platform: 'android',
    share_channel: 'QQ',
    share_id: 'main.ugc-video-detail.0.0.pv',
    share_mode: '7',
  }).reduce((t, v) => (t.append(v[0], v[1]), t), new URLSearchParams())

  const shareInfo = (await $http.post('https://api.biliapi.net/x/share/click', params)).data

  const message = `
  [CQ:image,file=${shareInfo.data.picture}]

  ♥ ${ctxitem.uname} 发布了新投稿 ${shareInfo.data.title}

  ${shareInfo.data.link}
  `
  sendGroupMsg(member.groups, message)
}
