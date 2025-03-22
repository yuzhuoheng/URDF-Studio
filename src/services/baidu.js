import { request } from '@umijs/max';


export async function query(params={}) {
  const url = `/translate-service/api/v1/translate/baidu/query`
  return request(url,{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    data: params,
    // ...(options || {}),
  });
}

