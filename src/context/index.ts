import { IMember, IContextItem } from '../types'
import { getRoomStatusInfoByUids } from '../bilireq/live'
import { getSpaceHistory } from '../bilireq/space'
import { getUserInfo } from '../bilireq/user'
import { onLiveStart, onDynaPost, onVideoPost } from './handler'

const contextItemFactory = (item: Partial<IContextItem>): IContextItem => {
  return {
    uname: item.uname ?? '',
    live: {
      roomId: item.live?.roomId ?? 0,
      onAir: item.live?.onAir ?? false,
      title: item.live?.title ?? '',
      cover: ''
    },
    recentDynaId: item.recentDynaId ?? '0'
  }
}

export class Context {
  members: {
    [key: string]: IContextItem
  }

  constructor () {
    this.members = {}
  }

  get () {
    return this.members
  }

  async syncLiveStatus (members: IMember[]) {
    const roomStatusInfo = (await getRoomStatusInfoByUids(members.map(m => m.uid))).data
    for (const member of members) {
      if (roomStatusInfo.data[member.uid]) {
        if (this.members[member.uid]) {
          if (!this.members[member.uid].live.onAir && roomStatusInfo.data[member.uid].live_status === 1) {
            onLiveStart({
              member,
              ctxitem: this.members[member.uid]
            })
          }

          this.members[member.uid].live.roomId = roomStatusInfo.data[member.uid].room_id
          this.members[member.uid].live.onAir = roomStatusInfo.data[member.uid].live_status === 1
          this.members[member.uid].live.title = roomStatusInfo.data[member.uid].title
          this.members[member.uid].live.cover = roomStatusInfo.data[member.uid].cover_from_user
          this.members[member.uid].uname = roomStatusInfo.data[member.uid].uname
        } else {
          this.members[member.uid] = contextItemFactory({
            live: {
              roomId: roomStatusInfo.data[member.uid].room_id,
              onAir: Boolean(roomStatusInfo.data[member.uid].live_status),
              title: roomStatusInfo.data[member.uid].title,
              cover: roomStatusInfo.data[member.uid].cover_from_user
            },
            uname: roomStatusInfo.data[member.uid].uname
          })
        }
      } else {
        this.members[member.uid] = contextItemFactory({})
      }
    }
  }

  async syncDynamicId (members: IMember[]) {
    for (const member of members) {
      const recentDynamics = (await getSpaceHistory(member.uid)).data
  
      if (recentDynamics.data.cards?.length) {
        if (this.members[member.uid]) {
          const recentId = recentDynamics.data.cards[1]?.desc
            ? BigInt(recentDynamics.data.cards[1].desc.dynamic_id_str) - BigInt(recentDynamics.data.cards[0].desc.dynamic_id_str) > 0
              ? recentDynamics.data.cards[1].desc.dynamic_id_str
              : recentDynamics.data.cards[0].desc.dynamic_id_str
            : recentDynamics.data.cards[0].desc.dynamic_id_str

          if (!this.members[member.uid]) {
            this.members[member.uid] = contextItemFactory({
              recentDynaId: recentId
            })
          }

          if (this.members[member.uid].recentDynaId !== '0' && BigInt(this.members[member.uid].recentDynaId) < BigInt(recentId)) {
            this.members[member.uid].recentDynaId = recentId
            const recentDynamic = recentDynamics.data.cards.find(c => c.desc.dynamic_id_str === recentId)

            if (recentDynamic?.desc.bvid) {
              const aid = JSON.parse(recentDynamic.card)?.aid
              onVideoPost({
                aid,
                member,
                ctxitem: this.members[member.uid]
              })
            } else {
              onDynaPost({
                member,
                ctxitem: this.members[member.uid]
              })
            }
          }
        }
      } else {
        this.members[member.uid] = contextItemFactory({})
      }
    }
  }
}
