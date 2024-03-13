import { $http } from '../../utils/httpservice'

const BASE_URL = 'https://api.vc.bilibili.com'

export async function getSpaceHistory (uid: number) {
  const url = `${BASE_URL}/dynamic_svr/v1/dynamic_svr/space_history`
  const params = {
    host_uid: uid,
    need_top: 1
  }

  return await $http.get(url, params)
}
