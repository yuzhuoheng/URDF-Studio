//设置本地缓存
export function setExpire(key,value, expire = 24 * 60 * 60){
  let obj = {
    data: value,
    time: Date.now(),
    expire: expire
  };
  localStorage.setItem(key, JSON.stringify(obj));
}
//获取本地缓存
export function getExpire(key){
  let val = localStorage.getItem(key);

  if (!val) {
    return val;
  }
  val = JSON.parse(val)
  if (Date.now() - val.time > val.expire * 1000) {
    localStorage.removeItem(key);
    return null;
  }
  return val.data;
}
