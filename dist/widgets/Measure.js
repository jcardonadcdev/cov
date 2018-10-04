define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "esri/views/2d/draw/Draw", "esri/geometry/Polygon", "esri/geometry/Polyline", "esri/geometry/Point", "esri/Graphic", "esri/geometry/geometryEngine", "esri/geometry/support/webMercatorUtils", "dojo/number", "./../geometryUtils", "dojo/i18n!./Measure/nls/Measure"], function (require, exports, __extends, __decorate, decorators_1, Widget, widget_1, Draw, Polygon, Polyline, Point, Graphic, geometryEngine, webMercatorUtils, number, geometryUtils_1, i18n) {
    "use strict";
    var CSS = {
        base: 'measure-widget esri-widget esri-widget--panel',
        header: 'measure-widget__title',
        tabPanel: 'measure-widget__tab-panel',
        tab: 'measure-widget__tab',
        tabContent: 'measure-widget__tab-content',
        button: 'esri-button',
        locationButtonIcon: 'esri-icon-map-pin',
        lengthButtonIcon: 'esri-icon-polyline',
        areaButtonIcon: 'esri-icon-polygon',
        clearButtonIcon: 'esri-icon-trash',
        label: 'measure-widget__label',
        select: 'esri-select'
    };
    var Measure = (function (_super) {
        __extends(Measure, _super);
        function Measure(params) {
            var _this = _super.call(this, params) || this;
            _this.locationUnit = 'dec';
            _this.locationSymbol = {
                type: 'simple-marker',
                style: 'cross',
                size: 10,
                outline: {
                    color: 'red',
                    width: 1
                }
            };
            _this.locationTextSymbol = {
                type: 'text',
                color: 'red',
                haloColor: 'white',
                haloSize: 1,
                verticalAlignment: 'middle',
                horizontalAlignment: 'left',
                yoffset: 0,
                xoffset: 12,
                font: {
                    size: 12,
                    family: 'sans-serif',
                    weight: 'bold'
                }
            };
            _this._locationUnits = {
                'dec': 'Decimal Degrees',
                'dms': 'Degrees Minutes Seconds'
            };
            _this.lengthUnit = 'feet';
            _this.lengthSymbol = {
                type: 'simple-line',
                style: 'solid',
                color: 'yellow',
                width: 4
            };
            _this.lengthTextSymbol = {
                type: 'text',
                color: 'red',
                haloColor: 'white',
                haloSize: 1,
                verticalAlignment: 'middle',
                horizontalAlignment: 'center',
                font: {
                    size: 12,
                    family: 'sans-serif',
                    weight: 'bold'
                }
            };
            _this._lengthUnits = {
                'meters': 'Meters',
                'feet': 'Feet',
                'kilometers': 'Kilometers',
                'miles': 'Miles',
                'nautical-miles': 'Nautical Miles',
                'yards': 'Yard'
            };
            _this.areaUnit = 'acres';
            _this.areaSymbol = {
                type: 'simple-fill',
                color: [255, 255, 0, 0.1],
                style: 'solid',
                outline: {
                    color: 'yellow',
                    width: 4
                }
            };
            _this.areaTextSymbol = {
                type: 'text',
                color: 'red',
                haloColor: 'white',
                haloSize: 1,
                verticalAlignment: 'middle',
                horizontalAlignment: 'center',
                font: {
                    size: 12,
                    family: 'sans-serif',
                    weight: 'bold'
                }
            };
            _this._areaUnits = {
                'acres': 'Acres',
                'ares': 'Ares',
                'hectares': 'Hectacres',
                'square-feet': 'Square Feet',
                'square-meters': 'Square Meters',
                'square-yards': 'Square Yards',
                'square-kilometers': 'Square Kilometers',
                'square-miles': 'Square Miles'
            };
            _this._resultText = i18n.resultsDefault;
            _this._uid = Date.now().toString(22);
            _this.watch('view', function (view) {
                _this._draw = new Draw({
                    view: view
                });
            });
            return _this;
        }
        Measure.prototype.postInitialize = function () { };
        Measure.prototype.render = function () {
            var result = this._resultText;
            return (widget_1.tsx("div", { class: CSS.base },
                widget_1.tsx("header", { class: CSS.header }, i18n.title),
                widget_1.tsx("ul", { class: CSS.tabPanel, role: "tablist" },
                    widget_1.tsx("li", { afterCreate: widget_1.storeNode, "data-node-ref": "_measureTab", id: this.id + "_measureTab", bind: this, onclick: this._toggleContent, class: CSS.tab, role: "tab", "data-tab-id": "_measureTab", "data-content-id": "_measureContent", "aria-selected": "true" }, i18n.title),
                    widget_1.tsx("li", { afterCreate: widget_1.storeNode, "data-node-ref": "_settingsTab", id: this.id + "_settingsTab", bind: this, onclick: this._toggleContent, class: CSS.tab, role: "tab", "data-tab-id": "_settingsTab", "data-content-id": "_settingsContent", "aria-selected": "false" }, i18n.settings)),
                widget_1.tsx("section", { afterCreate: widget_1.storeNode, "data-node-ref": "_measureContent", id: this.id + "_measureContent", bind: this, class: CSS.tabContent, "aria-labelledby": this.id + "_measureTab", role: "tabcontent" },
                    widget_1.tsx("button", { class: CSS.button, title: i18n.locationButton, bind: this, onclick: this._location },
                        widget_1.tsx("span", { class: CSS.locationButtonIcon })),
                    widget_1.tsx("button", { class: CSS.button, title: i18n.lengthButton, bind: this, onclick: this._length },
                        widget_1.tsx("span", { class: CSS.lengthButtonIcon })),
                    widget_1.tsx("button", { class: CSS.button, title: i18n.areaButton, bind: this, onclick: this._area },
                        widget_1.tsx("span", { class: CSS.areaButtonIcon })),
                    widget_1.tsx("button", { class: CSS.button, title: i18n.clearButton, bind: this, onclick: this._clear },
                        widget_1.tsx("span", { class: CSS.clearButtonIcon })),
                    widget_1.tsx("p", null,
                        widget_1.tsx("b", null, i18n.results)),
                    widget_1.tsx("p", null, result)),
                widget_1.tsx("section", { afterCreate: widget_1.storeNode, "data-node-ref": "_settingsContent", id: this.id + "_settingsContent", bind: this, class: CSS.tabContent, "aria-labelledby": this.id + "_settingsTab", role: "tabcontent", style: "display:none" },
                    widget_1.tsx("span", { class: CSS.label }, i18n.locationLabel),
                    widget_1.tsx("select", { class: CSS.select, bind: this, onchange: this._setLocationUnit }, this._createUnitOptions(this._locationUnits, this.locationUnit)),
                    widget_1.tsx("span", { class: CSS.label }, i18n.lengthLabel),
                    widget_1.tsx("select", { class: CSS.select, bind: this, onchange: this._setLengthUnit }, this._createUnitOptions(this._lengthUnits, this.lengthUnit)),
                    widget_1.tsx("span", { class: CSS.label }, i18n.areaLabel),
                    widget_1.tsx("select", { class: CSS.select, bind: this, onchange: this._setAreaUnit }, this._createUnitOptions(this._areaUnits, this.areaUnit)))));
        };
        Measure.prototype._createUnitOptions = function (units, defaultUnit) {
            var options = [];
            for (var unit in units) {
                if (units.hasOwnProperty(unit)) {
                    options.push(widget_1.tsx("option", { value: unit, selected: unit === defaultUnit }, units[unit]));
                }
            }
            return options;
        };
        Measure.prototype._toggleContent = function (evt) {
            this._measureContent.style.display = 'none';
            this._settingsContent.style.display = 'none';
            this[evt.target.getAttribute('data-content-id')].style.display = 'block';
            this._measureTab.setAttribute('aria-selected', 'false');
            this._settingsTab.setAttribute('aria-selected', 'false');
            this[evt.target.getAttribute('data-tab-id')].setAttribute('aria-selected', 'true');
        };
        Measure.prototype._clear = function () {
            this._draw.reset();
            this.view.graphics.removeAll();
            this._resultText = i18n.resultsDefault;
        };
        Measure.prototype.onHide = function () {
            this._clear();
        };
        Measure.prototype._setAreaUnit = function (evt) {
            this.areaUnit = evt.target.value;
        };
        Measure.prototype._area = function () {
            this._clear();
            var action = this._draw.create('polygon', {});
            this.view.focus();
            action.on('vertex-add', this.__area.bind(this));
            action.on('cursor-update', this.__area.bind(this));
            action.on('vertex-remove', this.__area.bind(this));
            action.on('draw-complete', this.__area.bind(this));
        };
        Measure.prototype.__area = function (evt) {
            var view = this.view;
            var vertices = evt.vertices;
            view.graphics.removeAll();
            var polygon = new Polygon({
                rings: vertices,
                spatialReference: view.spatialReference
            });
            var graphic = new Graphic({
                geometry: polygon,
                symbol: this.areaSymbol
            });
            view.graphics.add(graphic);
            var area = geometryEngine.geodesicArea(polygon, this.areaUnit);
            if (area < 0) {
                var simplifiedPolygon = geometryEngine.simplify(polygon);
                if (simplifiedPolygon) {
                    area = geometryEngine.geodesicArea(simplifiedPolygon, this.areaUnit);
                }
            }
            this._resultText = area.toFixed(2) + ' ' + this.areaUnit;
            this.areaTextSymbol.text = this._resultText;
            view.graphics.add(new Graphic({
                geometry: polygon.centroid,
                symbol: this.areaTextSymbol
            }));
        };
        Measure.prototype._setLengthUnit = function (evt) {
            this.lengthUnit = evt.target.value;
        };
        Measure.prototype._length = function () {
            this._clear();
            var action = this._draw.create('polyline', {});
            this.view.focus();
            action.on('vertex-add', this.__length.bind(this));
            action.on('cursor-update', this.__length.bind(this));
            action.on('vertex-remove', this.__length.bind(this));
            action.on('draw-complete', this.__length.bind(this));
        };
        Measure.prototype.__length = function (evt) {
            var view = this.view;
            var vertices = evt.vertices;
            view.graphics.removeAll();
            var polyline = new Polyline({
                paths: vertices,
                spatialReference: view.spatialReference
            });
            var graphic = new Graphic({
                geometry: polyline,
                symbol: this.lengthSymbol
            });
            view.graphics.add(graphic);
            var length = geometryEngine.geodesicLength(polyline, this.lengthUnit);
            if (length < 0) {
                var simplifiedPolyline = geometryEngine.simplify(polyline);
                if (simplifiedPolyline) {
                    length = geometryEngine.geodesicLength(simplifiedPolyline, this.lengthUnit);
                }
            }
            this._resultText = length.toFixed(2) + ' ' + this.lengthUnit;
            this.lengthTextSymbol.text = this._resultText;
            view.graphics.add(new Graphic({
                geometry: geometryUtils_1.polylineMidpoint(polyline),
                symbol: this.lengthTextSymbol
            }));
        };
        Measure.prototype._setLocationUnit = function (evt) {
            this.locationUnit = evt.target.value;
        };
        Measure.prototype._location = function () {
            this._clear();
            var action = this._draw.create('point', {});
            this.view.focus();
            action.on('cursor-update', this.__location.bind(this));
            action.on('draw-complete', this.__location.bind(this));
        };
        Measure.prototype.__location = function (evt) {
            var text;
            var view = this.view;
            var coords = evt.coordinates;
            var lngLat = webMercatorUtils.xyToLngLat(coords[0], coords[1]);
            view.graphics.removeAll();
            var point = new Point({
                x: coords[0],
                y: coords[1],
                spatialReference: view.spatialReference
            });
            var graphic = new Graphic({
                geometry: point,
                symbol: this.locationSymbol
            });
            view.graphics.add(graphic);
            if (this.locationUnit === 'dec') {
                text = number.round(lngLat[0], 4) + ', ' + number.round(lngLat[1], 4);
                this.locationTextSymbol.text = text;
                this._resultText = text;
            }
            else {
                text = geometryUtils_1.decimalToDMS(point, 2);
                this.locationTextSymbol.text = text;
                this._resultText = text;
            }
            view.graphics.add(new Graphic({
                geometry: point,
                symbol: this.locationTextSymbol
            }));
        };
        __decorate([
            decorators_1.property()
        ], Measure.prototype, "view", void 0);
        __decorate([
            decorators_1.property()
        ], Measure.prototype, "locationUnit", void 0);
        __decorate([
            decorators_1.property()
        ], Measure.prototype, "locationSymbol", void 0);
        __decorate([
            decorators_1.property()
        ], Measure.prototype, "locationTextSymbol", void 0);
        __decorate([
            decorators_1.property()
        ], Measure.prototype, "_locationUnits", void 0);
        __decorate([
            decorators_1.property()
        ], Measure.prototype, "lengthUnit", void 0);
        __decorate([
            decorators_1.property()
        ], Measure.prototype, "lengthSymbol", void 0);
        __decorate([
            decorators_1.property()
        ], Measure.prototype, "lengthTextSymbol", void 0);
        __decorate([
            decorators_1.property()
        ], Measure.prototype, "_lengthUnits", void 0);
        __decorate([
            decorators_1.property()
        ], Measure.prototype, "areaUnit", void 0);
        __decorate([
            decorators_1.property()
        ], Measure.prototype, "areaSymbol", void 0);
        __decorate([
            decorators_1.property()
        ], Measure.prototype, "areaTextSymbol", void 0);
        __decorate([
            decorators_1.property()
        ], Measure.prototype, "_draw", void 0);
        __decorate([
            decorators_1.property()
        ], Measure.prototype, "_areaUnits", void 0);
        __decorate([
            decorators_1.aliasOf('view.type')
        ], Measure.prototype, "_viewType", void 0);
        __decorate([
            decorators_1.property()
        ], Measure.prototype, "_measureTab", void 0);
        __decorate([
            decorators_1.property()
        ], Measure.prototype, "_settingsTab", void 0);
        __decorate([
            decorators_1.property()
        ], Measure.prototype, "_measureContent", void 0);
        __decorate([
            decorators_1.property()
        ], Measure.prototype, "_settingsContent", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], Measure.prototype, "_resultText", void 0);
        __decorate([
            decorators_1.property()
        ], Measure.prototype, "_uid", void 0);
        Measure = __decorate([
            decorators_1.subclass('Measure')
        ], Measure);
        return Measure;
    }(decorators_1.declared(Widget)));
    return Measure;
});
//# sourceMappingURL=Measure.js.map