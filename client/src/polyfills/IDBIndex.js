/**
 * Inspired by https://github.com/dumbmatter/IndexedDB-getAll-shim
 */
/* eslint-disable strict,no-console */
((function(self) {
  'use strict';
  if (self._IDBIndexPolyfill) {
    return;
  }
  global._IDBIndexPolyfill = true;

  if (typeof window.IDBIndex === 'undefined') {
    throw new Error('Browser doesn\'t support IndexedDB');
  }

  /**
   * Fake IDBRequest prototype
   * @private
   */
  const _IDBRequest = function () {
    this.result = null;
    this.error = null;
    this.source = null;
    this.transaction = null;
    this.readyState = 'pending';
    this.onsuccess = null;
    this.onerror = null;

    this.toString = function () {
      return '[object IDBRequest]';
    };
  };

  const _Event = function (type) {
    this.type = type;
    this.target = null;
    this.currentTarget = null;

    this.NONE = 0;
    this.CAPTURING_PHASE = 1;
    this.AT_TARGET = 2;
    this.BUBBLING_PHASE = 3;
    this.eventPhase = this.NONE;

    this.stopPropagation = function () {
      console.log('stopPropagation not implemented in _IDBIndexPolyfill');
    };
    this.stopImmediatePropagation = function () {
      console.log('stopImmediatePropagation not implemented in _IDBIndexPolyfill');
    };

    this.bubbles = false;
    this.cancelable = false;
    this.preventDefault = function () {
      console.log('preventDefault not implemented in IndexedDB-getAll-shim');
    };
    this.defaultPrevented = false;

    this.isTrusted = false;
    this.timestamp = Date.now();
  };

  const _getAllKeys = function(key, count) {
    const ret = new _IDBRequest();
    const cursorRequest = this.openKeyCursor(key);
    const result = [];
    cursorRequest.onsuccess = function(event) {
      if (event && event.target && event.target.result) {
        const cursor = event.target.result;
        result.push(cursor.primaryKey);
        if (typeof count === 'undefined' || result.length < count) {
          cursor.continue();
          return;
        }
      }

      if (ret.onsuccess) {
        const successEvent = new _Event('success');
        successEvent.target = {
          readyState: 'done',
          result: result
        };
        ret.result = result;
        ret.onsuccess(successEvent);
      }
    };
    cursorRequest.onerror = function(event) {
      ret.onerror(event);
    };
    return ret;
  };

  if (!window.IDBIndex.prototype.getAllKeys) {
    window.IDBIndex.prototype.getAllKeys = _getAllKeys;
  }
})(typeof self !== 'undefined' ? self : this));
