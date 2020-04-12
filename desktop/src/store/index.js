/**
 * @author xue chen
 * @since 2020/3/25
 */

import SongStore from "./SongStore";
import storage from "./PathStore";

let songStore = new SongStore();

const stores = {
  songStore,
  storage
};

export default stores;