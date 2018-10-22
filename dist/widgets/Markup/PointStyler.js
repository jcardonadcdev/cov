define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/widgets/ColorPicker", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "dojo/on"], function (require, exports, __extends, __decorate, ColorPicker, decorators_1, Widget, widget_1, on) {
    "use strict";
    var CSS = {
        base: 'markup-symbol-styler esri-widget',
        tabPanel: 'markup-symbol-styler--tab-panel',
        tab: 'markup-symbol-styler--tab',
        tabContent: 'markup-symbol-styler--tab-content',
        left: 'markup-symbol-styler--left-pane',
        right: 'markup-symbol-styler--right-pane',
        colorPicker: 'esri-color-picker',
        label: 'markup-symbol-styler--label',
        button: 'esri-button',
        select: 'esri-select',
        input: 'esri-input'
    };
    var PointStyler = (function (_super) {
        __extends(PointStyler, _super);
        function PointStyler(params) {
            return _super.call(this, params) || this;
        }
        PointStyler.prototype.postInitialize = function () { };
        PointStyler.prototype.render = function () {
            return (widget_1.tsx("div", { class: CSS.base },
                widget_1.tsx("ul", { class: CSS.tabPanel, role: "tablist" },
                    widget_1.tsx("li", { afterCreate: widget_1.storeNode, "data-node-ref": "_pointTab", id: this.id + "_pointTab", bind: this, onclick: this._toggleTabContent, class: CSS.tab, role: "tab", "data-tab-id": "_pointTab", "data-content-id": "_pointContent", "aria-selected": "true" }, "Point"),
                    widget_1.tsx("li", { afterCreate: widget_1.storeNode, "data-node-ref": "_outlineTab", id: this.id + "_outlineTab", bind: this, onclick: this._toggleTabContent, class: CSS.tab, role: "tab", "data-tab-id": "_outlineTab", "data-content-id": "_outlineContent", "aria-selected": "false" }, "Outline")),
                widget_1.tsx("section", { afterCreate: widget_1.storeNode, "data-node-ref": "_pointContent", id: this.id + "_pointContent", bind: this, class: CSS.tabContent, "aria-labelledby": this.id + "_pointTab", role: "tabcontent" },
                    widget_1.tsx("div", { class: CSS.left },
                        widget_1.tsx("span", { class: CSS.label }, "Style"),
                        widget_1.tsx("select", { class: CSS.select, bind: this, afterCreate: this._pointStyle },
                            widget_1.tsx("option", { value: "circle" }, "Circe"),
                            widget_1.tsx("option", { value: "square" }, "Square"),
                            widget_1.tsx("option", { value: "diamond" }, "Diamond"),
                            widget_1.tsx("option", { value: "cross" }, "Cross"),
                            widget_1.tsx("option", { value: "x" }, "X")),
                        widget_1.tsx("span", { class: CSS.label }, "Size"),
                        widget_1.tsx("select", { class: CSS.select, bind: this, afterCreate: this._pointSize },
                            widget_1.tsx("option", { value: "8" }, "8"),
                            widget_1.tsx("option", { value: "9" }, "9"),
                            widget_1.tsx("option", { value: "10" }, "10"),
                            widget_1.tsx("option", { value: "11" }, "11"),
                            widget_1.tsx("option", { value: "12" }, "12"))),
                    widget_1.tsx("div", { class: CSS.right },
                        widget_1.tsx("span", { class: CSS.label }, "Color"),
                        widget_1.tsx("div", { class: CSS.colorPicker, bind: this, afterCreate: this._pointColorPicker }))),
                widget_1.tsx("section", { afterCreate: widget_1.storeNode, "data-node-ref": "_outlineContent", id: this.id + "_outlineContent", bind: this, class: CSS.tabContent, "aria-labelledby": this.id + "_outlineTab", role: "tabcontent", style: "display:none" },
                    widget_1.tsx("div", { class: CSS.left },
                        widget_1.tsx("span", { class: CSS.label }, "Outline Width"),
                        widget_1.tsx("select", { class: CSS.select, bind: this, afterCreate: this._outlineWidth },
                            widget_1.tsx("option", { value: "1" }, "1"),
                            widget_1.tsx("option", { value: "2" }, "2"),
                            widget_1.tsx("option", { value: "3" }, "3"),
                            widget_1.tsx("option", { value: "4" }, "4"))),
                    widget_1.tsx("div", { class: CSS.right },
                        widget_1.tsx("span", { class: CSS.label }, "Outline Color"),
                        widget_1.tsx("div", { class: CSS.colorPicker, bind: this, afterCreate: this._outlineColorPicker })))));
        };
        PointStyler.prototype._toggleTabContent = function (evt) {
            this._pointContent.style.display = 'none';
            this._outlineContent.style.display = 'none';
            this[evt.target.getAttribute('data-content-id')].style.display = 'block';
            this._pointTab.setAttribute('aria-selected', 'false');
            this._outlineTab.setAttribute('aria-selected', 'false');
            this[evt.target.getAttribute('data-tab-id')].setAttribute('aria-selected', 'true');
        };
        PointStyler.prototype._pointStyle = function (node) {
            var _this = this;
            node.value = this.symbol.style;
            on(node, 'change', function () {
                var newSym = _this.symbol.clone();
                newSym.style = node.value;
                _this.symbol = newSym;
            });
        };
        PointStyler.prototype._pointSize = function (node) {
            var _this = this;
            node.value = this.symbol.size.toString();
            on(node, 'change', function () {
                var newSym = _this.symbol.clone();
                newSym.size = parseInt(node.value, 10);
                _this.symbol = newSym;
            });
        };
        PointStyler.prototype._pointColorPicker = function (node) {
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
        PointStyler.prototype._outlineWidth = function (node) {
            var _this = this;
            node.value = this.symbol.outline.width.toString();
            on(node, 'change', function () {
                var newSym = _this.symbol.clone();
                newSym.outline.width = parseInt(node.value, 10);
                _this.symbol = newSym;
            });
        };
        PointStyler.prototype._outlineColorPicker = function (node) {
            var _this = this;
            var cp = new ColorPicker({
                color: this.symbol.outline.color
            }, document.createElement('div'));
            cp.startup();
            cp.on('color-change', function (evt) {
                var newSym = _this.symbol.clone();
                newSym.outline.color = evt.color;
                _this.graphic.symbol = newSym;
            });
            node.append(cp.dap_paletteContainer);
        };
        __decorate([
            decorators_1.property()
        ], PointStyler.prototype, "graphic", void 0);
        __decorate([
            decorators_1.aliasOf('graphic.symbol')
        ], PointStyler.prototype, "symbol", void 0);
        __decorate([
            decorators_1.property()
        ], PointStyler.prototype, "_pointTab", void 0);
        __decorate([
            decorators_1.property()
        ], PointStyler.prototype, "_outlineTab", void 0);
        __decorate([
            decorators_1.property()
        ], PointStyler.prototype, "_pointContent", void 0);
        __decorate([
            decorators_1.property()
        ], PointStyler.prototype, "_outlineContent", void 0);
        PointStyler = __decorate([
            decorators_1.subclass('PointStyler')
        ], PointStyler);
        return PointStyler;
    }(decorators_1.declared(Widget)));
    return PointStyler;
});
//# sourceMappingURL=PointStyler.js.map