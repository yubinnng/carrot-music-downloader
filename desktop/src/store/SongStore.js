/**
 * @author xue chen
 * @since 2020/3/25
 */
import {observable, action} from 'mobx';

class SongStore {

  constructor() {
    this.init();
  }

  @action
  init() {
    this.platformList.forEach(item => {
      this.resultList.push({
        id: item.id,
        platform: item.platform,
        songList: []
      })
    })
  }

  @observable
  platformList = [
    {
      id: 1,
      platform: 'Netease',
      value: '网易云音乐'
    },
    {
      id: 2,
      platform: 'QQMusic',
      value: 'QQ音乐'
    }
  ];

  @observable
  resultList = [];

  @action
  addResultList(platform, data) {
    this.resultList.forEach(item => {
      if(item.platform === platform) {
        data.map(_item => (
          _item.selected = false
        ));
        item.songList = data;
      }
    })
  }

}

export default SongStore;