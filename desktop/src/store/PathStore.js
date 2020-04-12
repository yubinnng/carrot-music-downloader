/**
 * storage
 *
 * storage.set(value, key)
 * storage.session.set(value, key)
 *
 * @author xue chen
 * @since 2019/7/30
 */

// 移动端无痕模式下localStorage使用
(function () {

    const KEY = '_localStorage',
      VALUE = 'test';

    // 检测是否正常
    try {
        localStorage.setItem(KEY, VALUE);
    } catch (e) {
        let noop = function () {};
        localStorage._proto_ = {
            setItem: noop,
            getItem: noop,
            removeItem: noop,
            clear: noop
        }
    }

    // 删除测试数据
    if(localStorage.getItem(KEY) === VALUE) {
        localStorage.removeItem(KEY);
    }
})();

let storage = {
    storage: window.localStorage,
    session: {
        storage: window.sessionStorage
    }
};

const storageApi = {

    set(key, value) {
        if(!value) return;
        this.storage.setItem(key, JSON.stringify(value))
    },

    get(key) {
        if(!key) return;
        const result = this.storage.getItem(key);
        return JSON.parse(result);
    },

    remove(key) {
        if(!key) return;
        this.storage.removeItem(key);
    },

    clear() {
        this.storage.clear()
    },

};

Object.assign(storage, storageApi);
Object.assign(storage.session, storageApi);

export default storage;
