import { $http } from '../../utils/httpservice'

const BASE_URL = 'https://api.live.bilibili.com'

export async function getRoomStatusInfoByUids (uids: number[]) {
  const url = `${BASE_URL}/room/v1/Room/get_status_info_by_uids`
  const data = { uids }
  return await $http.post(url, data)
}
