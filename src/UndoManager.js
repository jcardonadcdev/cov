define(["dojo/_base/declare", "dojo/_base/lang", "dojo/has", "dojo/when", "esri/kernel", "dojo/Evented", "dojo/has!extend-esri?./OperationBase"], function(i, t, o, n, s, h) {
  var e = i([h], {
    declaredClass: "esri.UndoManager",
    maxOperations: 10,
    canUndo: !1,
    canRedo: !1,
    position: 0,
    length: 0,
    onUndo: function() {},
    onRedo: function() {},
    onUndoComplete: function() {},
    onRedoComplete: function() {},
    onAdd: function() {},
    onChange: function() {},
    constructor: function(i) {
      i = i || {}, i.maxOperations && (this.maxOperations = i.maxOperations), this._historyStack = []
    },
    add: function(i) {
      if (this.maxOperations > 0)
        for (; this._historyStack.length >= this.maxOperations;) this._historyStack.shift();
      this._historyStack.splice(this.position, 0, i), this.position++, this.clearRedo(), this.onAdd(), this._checkAvailability()
    },
    undo: function() {
      if (0 === this.position) return null;
      var i = this.peekUndo();
      if (this.position--, i) {
        var o = i.performUndo();
        this.onUndo(), this._checkAvailability(), n(o).then(t.hitch(this, this.onUndoComplete))
      } else this.onUndo(), this._checkAvailability()
    },
    redo: function() {
      if (this.position === this._historyStack.length) return null;
      var i = this.peekRedo();
      if (this.position++, i) {
        var o = i.performRedo();
        this.onRedo(), this._checkAvailability(), n(o).then(t.hitch(this, this.onRedoComplete))
      } else this.onRedo(), this._checkAvailability()
    },
    _checkAvailability: function() {
      this.length = this._historyStack.length, 0 === this.length ? (this.canRedo = !1, this.canUndo = !1) : 0 === this.position ? (this.canRedo = !0, this.canUndo = !1) : this.position === this.length ? (this.canUndo = !0, this.canRedo = !1) : (this.canUndo = !0, this.canRedo = !0), this.onChange()
    },
    clearUndo: function() {
      this._historyStack.splice(0, this.position), this.position = 0, this._checkAvailability()
    },
    clearRedo: function() {
      this._historyStack.splice(this.position, this._historyStack.length - this.position), this.position = this._historyStack.length, this._checkAvailability()
    },
    peekUndo: function() {
      if (this._historyStack.length > 0 && this.position > 0) return this.get(this.position - 1)
    },
    peekRedo: function() {
      if (this._historyStack.length > 0 && this.position < this._historyStack.length) return this.get(this.position)
    },
    get: function(i) {
      return this._historyStack[i]
    },
    remove: function(i) {
      this._historyStack.length > 0 && (this._historyStack.splice(i, 1), this.position > 0 && i < this.position && this.position--, this._checkAvailability())
    },
    destroy: function() {
      this._historyStack = null
    }
  });
  return o("extend-esri") && (s.UndoManager = e), e
});
