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
    var TextStyler = (function (_super) {
        __extends(TextStyler, _super);
        function TextStyler(params) {
            return _super.call(this, params) || this;
        }
        TextStyler.prototype.postInitialize = function () { };
        TextStyler.prototype.render = function () {
            return (widget_1.tsx("div", { class: CSS.base },
                widget_1.tsx("ul", { class: CSS.tabPanel, role: "tablist" },
                    widget_1.tsx("li", { afterCreate: widget_1.storeNode, "data-node-ref": "_textTab", id: this.id + "_textTab", bind: this, onclick: this._toggleTabContent, class: CSS.tab, role: "tab", "data-tab-id": "_textTab", "data-content-id": "_textContent", "aria-selected": "true" }, "Text"),
                    widget_1.tsx("li", { afterCreate: widget_1.storeNode, "data-node-ref": "_haloTab", id: this.id + "_haloTab", bind: this, onclick: this._toggleTabContent, class: CSS.tab, role: "tab", "data-tab-id": "_haloTab", "data-content-id": "_haloContent", "aria-selected": "false" }, "Halo")),
                widget_1.tsx("section", { afterCreate: widget_1.storeNode, "data-node-ref": "_textContent", id: this.id + "_textContent", bind: this, class: CSS.tabContent, "aria-labelledby": this.id + "_textTab", role: "tabcontent" },
                    widget_1.tsx("div", { class: CSS.left },
                        widget_1.tsx("span", { class: CSS.label }, "Text"),
                        widget_1.tsx("input", { type: "text", class: CSS.input, bind: this, afterCreate: this._textText }),
                        widget_1.tsx("span", { class: CSS.label }, "Size"),
                        widget_1.tsx("select", { class: CSS.select, bind: this, afterCreate: this._textSize },
                            widget_1.tsx("option", { value: "8" }, "8"),
                            widget_1.tsx("option", { value: "9" }, "9"),
                            widget_1.tsx("option", { value: "10" }, "10"),
                            widget_1.tsx("option", { value: "11" }, "11"),
                            widget_1.tsx("option", { value: "12" }, "12"),
                            widget_1.tsx("option", { value: "13" }, "13"),
                            widget_1.tsx("option", { value: "14" }, "14"),
                            widget_1.tsx("option", { value: "15" }, "15"),
                            widget_1.tsx("option", { value: "16" }, "16"))),
                    widget_1.tsx("div", { class: CSS.right },
                        widget_1.tsx("span", { class: CSS.label }, "Color"),
                        widget_1.tsx("div", { class: CSS.colorPicker, bind: this, afterCreate: this._textColorPicker }))),
                widget_1.tsx("section", { afterCreate: widget_1.storeNode, "data-node-ref": "_haloContent", id: this.id + "_haloContent", bind: this, class: CSS.tabContent, "aria-labelledby": this.id + "_haloTab", role: "tabcontent", style: "display:none" },
                    widget_1.tsx("div", { class: CSS.left },
                        widget_1.tsx("span", { class: CSS.label }, "Size"),
                        widget_1.tsx("select", { class: CSS.select, bind: this, afterCreate: this._haloSize },
                            widget_1.tsx("option", { value: "0" }, "0"),
                            widget_1.tsx("option", { value: "1" }, "1"),
                            widget_1.tsx("option", { value: "2" }, "2"),
                            widget_1.tsx("option", { value: "3" }, "3"))),
                    widget_1.tsx("div", { class: CSS.right },
                        widget_1.tsx("span", { class: CSS.label }, "Color"),
                        widget_1.tsx("div", { class: CSS.colorPicker, bind: this, afterCreate: this._haloColorPicker })))));
        };
        TextStyler.prototype._toggleTabContent = function (evt) {
            this._textContent.style.display = 'none';
            this._haloContent.style.display = 'none';
            this[evt.target.getAttribute('data-content-id')].style.display = 'block';
            this._textTab.setAttribute('aria-selected', 'false');
            this._haloTab.setAttribute('aria-selected', 'false');
            this[evt.target.getAttribute('data-tab-id')].setAttribute('aria-selected', 'true');
        };
        TextStyler.prototype._textText = function (node) {
            var _this = this;
            node.value = this.symbol.text;
            on(node, 'keyup, change', function () {
                var newSym = _this.symbol.clone();
                newSym.text = node.value || 'New Text';
                _this.symbol = newSym;
            });
        };
        TextStyler.prototype._textSize = function (node) {
            var _this = this;
            node.value = this.symbol.font.size.toString();
            on(node, 'change', function () {
                var newSym = _this.symbol.clone();
                newSym.font.size = parseInt(node.value, 10);
                _this.symbol = newSym;
            });
        };
        TextStyler.prototype._textColorPicker = function (node) {
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
        TextStyler.prototype._haloSize = function (node) {
            var _this = this;
            node.value = this.symbol.haloSize.toString();
            on(node, 'change', function () {
                var newSym = _this.symbol.clone();
                newSym.haloSize = parseInt(node.value, 10);
                _this.symbol = newSym;
            });
        };
        TextStyler.prototype._haloColorPicker = function (node) {
            var _this = this;
            var cp = new ColorPicker({
                color: this.symbol.haloColor
            }, document.createElement('div'));
            cp.startup();
            cp.on('color-change', function (evt) {
                var newSym = _this.symbol.clone();
                newSym.haloColor = evt.color;
                _this.graphic.symbol = newSym;
            });
            node.append(cp.dap_paletteContainer);
        };
        __decorate([
            decorators_1.property()
        ], TextStyler.prototype, "graphic", void 0);
        __decorate([
            decorators_1.aliasOf('graphic.symbol')
        ], TextStyler.prototype, "symbol", void 0);
        __decorate([
            decorators_1.property()
        ], TextStyler.prototype, "_textTab", void 0);
        __decorate([
            decorators_1.property()
        ], TextStyler.prototype, "_haloTab", void 0);
        __decorate([
            decorators_1.property()
        ], TextStyler.prototype, "_textContent", void 0);
        __decorate([
            decorators_1.property()
        ], TextStyler.prototype, "_haloContent", void 0);
        TextStyler = __decorate([
            decorators_1.subclass('TextStyler')
        ], TextStyler);
        return TextStyler;
    }(decorators_1.declared(Widget)));
    return TextStyler;
});
//# sourceMappingURL=TextStyler.js.map