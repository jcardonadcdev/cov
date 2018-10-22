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
        select: 'esri-select'
    };
    var PolygonStyler = (function (_super) {
        __extends(PolygonStyler, _super);
        function PolygonStyler(params) {
            return _super.call(this, params) || this;
        }
        PolygonStyler.prototype.postInitialize = function () { };
        PolygonStyler.prototype.render = function () {
            return (widget_1.tsx("div", { class: CSS.base },
                widget_1.tsx("ul", { class: CSS.tabPanel, role: "tablist" },
                    widget_1.tsx("li", { afterCreate: widget_1.storeNode, "data-node-ref": "_outlineTab", id: this.id + "_outlineTab", bind: this, onclick: this._toggleTabContent, class: CSS.tab, role: "tab", "data-tab-id": "_outlineTab", "data-content-id": "_outlineContent", "aria-selected": "true" }, "Outline"),
                    widget_1.tsx("li", { afterCreate: widget_1.storeNode, "data-node-ref": "_fillTab", id: this.id + "_fillTab", bind: this, onclick: this._toggleTabContent, class: CSS.tab, role: "tab", "data-tab-id": "_fillTab", "data-content-id": "_fillContent", "aria-selected": "false" }, "Fill")),
                widget_1.tsx("section", { afterCreate: widget_1.storeNode, "data-node-ref": "_outlineContent", id: this.id + "_outlineContent", bind: this, class: CSS.tabContent, "aria-labelledby": this.id + "_outlineTab", role: "tabcontent" },
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
                        widget_1.tsx("div", { class: CSS.colorPicker, bind: this, afterCreate: this._lineColorPicker }))),
                widget_1.tsx("section", { afterCreate: widget_1.storeNode, "data-node-ref": "_fillContent", id: this.id + "_fillContent", bind: this, class: CSS.tabContent, "aria-labelledby": this.id + "_fillTab", role: "tabcontent", style: "display:none" },
                    widget_1.tsx("div", { class: CSS.left },
                        widget_1.tsx("span", { class: CSS.label }, "Color"),
                        widget_1.tsx("div", { class: CSS.colorPicker, bind: this, afterCreate: widget_1.storeNode, "data-node-ref": "_fillColor" })),
                    widget_1.tsx("div", { class: CSS.right },
                        widget_1.tsx("div", { class: CSS.colorPicker, bind: this, afterCreate: widget_1.storeNode, "data-node-ref": "_fillTransparency" }))),
                widget_1.tsx("div", { bind: this, afterCreate: this._fillColorPicker })));
        };
        PolygonStyler.prototype._toggleTabContent = function (evt) {
            this._outlineContent.style.display = 'none';
            this._fillContent.style.display = 'none';
            this[evt.target.getAttribute('data-content-id')].style.display = 'block';
            this._outlineTab.setAttribute('aria-selected', 'false');
            this._fillTab.setAttribute('aria-selected', 'false');
            this[evt.target.getAttribute('data-tab-id')].setAttribute('aria-selected', 'true');
        };
        PolygonStyler.prototype._lineStyle = function (node) {
            var _this = this;
            node.value = this.symbol.style;
            on(node, 'change', function () {
                var newSym = _this.symbol.clone();
                newSym.outline.style = node.value;
                _this.symbol = newSym;
            });
        };
        PolygonStyler.prototype._lineWidth = function (node) {
            var _this = this;
            node.value = this.symbol.outline.width.toString();
            on(node, 'change', function () {
                var newSym = _this.symbol.clone();
                newSym.outline.width = parseInt(node.value, 10);
                _this.symbol = newSym;
            });
        };
        PolygonStyler.prototype._lineColorPicker = function (node) {
            var _this = this;
            var cp = new ColorPicker({
                color: this.symbol.outline.color
            }, document.createElement('div'));
            cp.startup();
            cp.on('color-change', function (evt) {
                var newSym = _this.symbol.clone();
                newSym.outline.color = evt.color;
                _this.symbol = newSym;
            });
            node.append(cp.dap_paletteContainer);
        };
        PolygonStyler.prototype._fillColorPicker = function () {
            var _this = this;
            var cp = new ColorPicker({
                color: this.symbol.color
            }, document.createElement('div'));
            cp.startup();
            cp.on('color-change', function (evt) {
                var newSym = _this.symbol.clone();
                newSym.color = evt.color;
                _this.graphic.symbol = newSym;
            });
            this._fillColor.append(cp.dap_paletteContainer);
            this._fillTransparency.append(cp.dap_transparencySection);
        };
        __decorate([
            decorators_1.property()
        ], PolygonStyler.prototype, "graphic", void 0);
        __decorate([
            decorators_1.aliasOf('graphic.symbol')
        ], PolygonStyler.prototype, "symbol", void 0);
        __decorate([
            decorators_1.property()
        ], PolygonStyler.prototype, "_outlineTab", void 0);
        __decorate([
            decorators_1.property()
        ], PolygonStyler.prototype, "_fillTab", void 0);
        __decorate([
            decorators_1.property()
        ], PolygonStyler.prototype, "_outlineContent", void 0);
        __decorate([
            decorators_1.property()
        ], PolygonStyler.prototype, "_fillContent", void 0);
        __decorate([
            decorators_1.property()
        ], PolygonStyler.prototype, "_fillColor", void 0);
        __decorate([
            decorators_1.property()
        ], PolygonStyler.prototype, "_fillTransparency", void 0);
        PolygonStyler = __decorate([
            decorators_1.subclass('PolygonStyler')
        ], PolygonStyler);
        return PolygonStyler;
    }(decorators_1.declared(Widget)));
    return PolygonStyler;
});
//# sourceMappingURL=PolygonStyler.js.map