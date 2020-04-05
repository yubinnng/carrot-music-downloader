/**
 * @author qiyubing
 */
const ElectronStore = window.require('electron-store');

class PathStore {

    constructor() {
        this.init();
    }

    init() {
        this.localStore = new ElectronStore();
    }

    getLocalStore() {
        return this.localStore;
    }
}

export default PathStore;