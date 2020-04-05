/**
 * @author xue chen
 * @since 2020/3/25
 */

import SongStore from "./SongStore";
import PathStore from "./PathStore";

let songStore = new SongStore();
let localStore = new PathStore().getLocalStore();

const stores = {
  songStore,
  localStore
};

export default stores;