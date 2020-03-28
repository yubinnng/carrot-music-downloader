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
  allSelected = false;

  @observable
  platformList = [
    {
      id: 1,
      platform: 'Netease',
      value: '网易云音乐'
    },
    {
      id: 2,
      platform: 'QQ',
      value: 'QQ音乐'
    }
  ];

  @observable
  resultList = [];

  @action
  addResultList(platform, keyword, data) {
    this.resultList.map(item => {
      if(item.platform === platform) {
        item.keyword = keyword;
        data.map(_item => (
          _item.selected = false
        ));
        item.songList = data;
      }
      return item;
    })
  }

}

export default SongStore;