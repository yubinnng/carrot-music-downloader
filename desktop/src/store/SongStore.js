/**
 * @author xue chen
 * @since 2020/3/25
 */
import {observable} from 'mobx';

class SongStore {

  @observable
  platformList = [
    {
      platform: 'netease',
      value: '网易云音乐'
    }
  ]
}

export default SongStore;