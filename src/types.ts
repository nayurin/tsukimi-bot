export interface IMember {
  uid: number
  groups: number[]
}

export interface Env {
  interval: {
    request: number
  }
  peer: {
    addr: string
    httpport: number
  }
}

export interface IContextItem {
  uname: string
  live: {
    onAir: boolean
    roomId: number
    title: string
  }
  recentDynaId: number
}
