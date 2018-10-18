define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/widgets/ColorPicker", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "dojo/on"], function (require, exports, __extends, __decorate, ColorPicker, decorators_1, Widget, widget_1, on) {
    "use strict";
    var CSS = {
        base: 'markup-symbol-styler esri-widget',
        left: 'markup-symbol-styler__left-pane',
        right: 'markup-symbol-styler__right-pane',
        colorPicker: 'esri-color-picker',
        label: 'markup-symbol-styler__label',
        button: 'esri-button',
        select: 'esri-select'
    };
    var PolylineStyler = (function (_super) {
        __extends(PolylineStyler, _super);
        function PolylineStyler(params) {
            return _super.call(this, params) || this;
        }
        PolylineStyler.prototype.postInitialize = function () { };
        PolylineStyler.prototype.render = function () {
            return (widget_1.tsx("div", { class: CSS.base },
                widget_1.tsx("div", { class: CSS.left },
                    widget_1.tsx("span", { class: CSS.label }, "Style"),
                    widget_1.tsx("select", { class: CSS.select, bind: this, afterCreate: this._lineStyle },
                        widget_1.tsx("option", { value: "solid" }, "Solid"),
                        widget_1.tsx("option", { value: "dash" }, "Dashed"),
                        widget_1.tsx("option", { value: "dot" }, "Dotted"),
                        widget_1.tsx("option", { value: "dashdot" }, "Dash Dot")),
                    widget_1.tsx("span", { class: CSS.label }, "Width"),
                    widget_1.tsx("select", { class: CSS.select, bind: this, afterCreate: this._lineWidth },
                        widget_1.tsx("option", { value: "1" }, "1"),
                        widget_1.tsx("option", { value: "2" }, "2"),
                        widget_1.tsx("option", { value: "3" }, "3"),
                        widget_1.tsx("option", { value: "4" }, "4"),
                        widget_1.tsx("option", { value: "5" }, "5"),
                        widget_1.tsx("option", { value: "6" }, "6"))),
                widget_1.tsx("div", { class: CSS.right },
                    widget_1.tsx("span", { class: CSS.label }, "Color"),
                    widget_1.tsx("div", { class: CSS.colorPicker, bind: this, afterCreate: this._lineColorPicker }))));
        };
        PolylineStyler.prototype._lineStyle = function (node) {
            var _this = this;
            node.value = this.symbol.style;
            on(node, 'change', function () {
                var newSym = _this.symbol.clone();
                newSym.style = node.value;
                _this.symbol = newSym;
            });
        };
        PolylineStyler.prototype._lineWidth = function (node) {
            var _this = this;
            node.value = this.symbol.width.toString();
            on(node, 'change', function () {
                var newSym = _this.symbol.clone();
                newSym.width = parseInt(node.value, 10);
                _this.symbol = newSym;
            });
        };
        PolylineStyler.prototype._lineColorPicker = function (node) {
            var _this = this;
            var cp = new ColorPicker({
                color: this.symbol.color
            }, document.createElement('div'));
            cp.startup();
            cp.on('color-change', function (evt) {
                var newSym = _this.symbol.clone();
                newSym.color = evt.color;
                _this.symbol = newSym;
            });
            node.append(cp.dap_paletteContainer);
        };
        __decorate([
            decorators_1.property()
        ], PolylineStyler.prototype, "graphic", void 0);
        __decorate([
            decorators_1.aliasOf('graphic.symbol')
        ], PolylineStyler.prototype, "symbol", void 0);
        PolylineStyler = __decorate([
            decorators_1.subclass('PolylineStyler')
        ], PolylineStyler);
        return PolylineStyler;
    }(decorators_1.declared(Widget)));
    return PolylineStyler;
});
//# sourceMappingURL=PolylineStyler.js.map