import { $http } from '../../utils/httpservice'

const BASE_URL = 'https://api.bilibili.com'

export async function getUserInfo (uid: number) {
  const url = `${BASE_URL}/x/space/wbi/acc/info`
  const params = { mid: uid }
  return await $http.get(url, params)
}
