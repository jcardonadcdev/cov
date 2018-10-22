define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "esri/widgets/Sketch/SketchViewModel", "esri/layers/GroupLayer", "esri/layers/GraphicsLayer", "esri/Graphic", "esri/PopupTemplate", "./Markup/TextStyler", "./Markup/PointStyler", "./Markup/PolylineStyler", "./Markup/PolygonStyler", "esri/symbols/support/jsonUtils", "esri/geometry/support/jsonUtils", "esri/geometry/Point", "esri/geometry/Polyline", "esri/geometry/Polygon", "esri/geometry/geometryEngine", "esri/geometry/support/webMercatorUtils", "esri/geometry/coordinateFormatter", "dojo/number", "dojo/on", "./Markup/libs/MarkupLibs", "dojo/i18n!./Markup/nls/Markup"], function (require, exports, __extends, __decorate, decorators_1, Widget, widget_1, SketchViewModel, GroupLayer, GraphicsLayer, Graphic, PopupTemplate, TextStyler, PointStyler, PolylineStyler, PolygonStyler, symUtils, geomUtils, Point, Polyline, Polygon, geometryEngine, webMercatorUtils, coordinateFormatter, number, on, MarkupLibs_1, i18n) {
    "use strict";
    var CSS = {
        base: 'markup-widget esri-widget esri-widget--panel',
        header: 'markup-widget--title',
        pane: 'markup-widget--pane',
        activePane: 'active',
        heading: 'markup-widget--heading',
        label: 'markup-widget--label',
        button: 'esri-button',
        select: 'esri-select',
        input: 'esri-input',
        buttonGroup: 'markup-widget--button-group',
        undoButton: 'markup-widget--undo',
        redoButton: 'markup-widget--redo',
    };
    var Markup = (function (_super) {
        __extends(Markup, _super);
        function Markup(params) {
            var _this = _super.call(this, params) || this;
            _this.pointSymbol = {
                type: 'simple-marker',
                style: 'square',
                size: 10,
                color: 'red',
                outline: {
                    color: 'white',
                    width: 2
                }
            };
            _this.polylineSymbol = {
                type: 'simple-line',
                style: 'solid',
                color: 'red',
                width: 2
            };
            _this.polygonSymbol = {
                type: 'simple-fill',
                color: [255, 0, 0, 0.25],
                style: 'solid',
                outline: {
                    color: 'red',
                    width: 2
                }
            };
            _this.textSymbol = {
                type: 'text',
                color: 'red',
                haloColor: 'white',
                haloSize: 1,
                verticalAlignment: 'middle',
                horizontalAlignment: 'center',
                text: 'New Text',
                font: {
                    size: 12,
                    family: 'sans-serif',
                    weight: 'bold'
                }
            };
            _this.cursorTextSymbol = {
                type: 'text',
                color: 'red',
                haloColor: 'white',
                haloSize: 1,
                verticalAlignment: 'middle',
                horizontalAlignment: 'left',
                yoffset: 0,
                xoffset: 12,
                font: {
                    size: 10,
                    family: 'sans-serif',
                    weight: 'bold'
                }
            };
            _this.locationUnit = 'dec';
            _this.locationUnits = {
                'dec': 'Decimal Degrees',
                'dms': 'Degrees Minutes Seconds'
            };
            _this.lengthUnit = 'feet';
            _this.lengthUnits = {
                'meters': 'Meters',
                'feet': 'Feet',
                'kilometers': 'Kilometers',
                'miles': 'Miles',
                'nautical-miles': 'Nautical Miles',
                'yards': 'Yard'
            };
            _this.areaUnit = 'acres';
            _this.areaUnits = {
                'acres': 'Acres',
                'ares': 'Ares',
                'hectares': 'Hectacres',
                'square-feet': 'Square Feet',
                'square-meters': 'Square Meters',
                'square-yards': 'Square Yards',
                'square-kilometers': 'Square Kilometers',
                'square-miles': 'Square Miles'
            };
            _this._coordFormat = coordinateFormatter;
            _this._isText = false;
            _this._actions = [{
                    title: 'Edit Geometry',
                    id: 'markup-widget-edit-geometry',
                    className: 'esri-icon-edit'
                }, {
                    title: 'Move Up',
                    id: 'markup-widget-edit-move-up',
                    className: 'esri-icon-up'
                }, {
                    title: 'Move Down',
                    id: 'markup-widget-edit-move-down',
                    className: 'esri-icon-down'
                }, {
                    title: 'Delete',
                    id: 'markup-widget-edit-delete',
                    className: 'esri-icon-trash'
                }];
            _this._openFileInputHandle = null;
            _this.watch('view', _this._initWidget.bind(_this));
            _this._coordFormat.load();
            console.log(_this);
            return _this;
        }
        Markup.prototype._initWidget = function (view) {
            var _this = this;
            this._layer = new GroupLayer({
                id: 'markup_widget_group_layer',
                listMode: 'hide',
                layers: [
                    this._polygonLayer = new GraphicsLayer({
                        listMode: 'hide'
                    }),
                    this._polylineLayer = new GraphicsLayer({
                        listMode: 'hide'
                    }),
                    this._pointLayer = new GraphicsLayer({
                        listMode: 'hide'
                    }),
                    this._textLayer = new GraphicsLayer({
                        listMode: 'hide'
                    })
                ]
            });
            view.map.add(this._layer);
            view.map.add(this._sketchLayer = new GraphicsLayer({
                listMode: 'hide'
            }));
            this._sketch = new SketchViewModel({
                view: view,
                layer: this._sketchLayer
            });
            this._sketch.on('create-complete', this._addGraphic.bind(this));
            this._sketch.on('update-complete, update-cancel', this._updateGeometry.bind(this));
            view.popup.viewModel.on('trigger-action', function (evt) {
                var graphic = view.popup.viewModel.selectedFeature;
                switch (evt.action.id) {
                    case 'markup-widget-edit-delete':
                        _this._deleteGraphic(graphic);
                        break;
                    case 'markup-widget-edit-geometry':
                        _this._editGeometry(graphic);
                        break;
                    case 'markup-widget-edit-move-up':
                        _this._moveUp(graphic);
                        break;
                    case 'markup-widget-edit-move-down':
                        _this._moveDown(graphic);
                        break;
                    default:
                        break;
                }
            });
        };
        Markup.prototype.render = function () {
            return (widget_1.tsx("div", { class: CSS.base },
                widget_1.tsx("header", { class: CSS.header }, i18n.title),
                widget_1.tsx("section", { class: this.classes(CSS.pane, 'active'), bind: this, afterCreate: widget_1.storeNode, "data-node-ref": "_defaultPane" },
                    widget_1.tsx("div", { class: CSS.buttonGroup },
                        widget_1.tsx("button", { class: CSS.button, title: i18n.titles.point, bind: this, onclick: this.drawPoint },
                            widget_1.tsx("span", { class: "esri-icon-map-pin" })),
                        widget_1.tsx("button", { class: CSS.button, title: i18n.titles.polyline, bind: this, onclick: this.drawPolyline },
                            widget_1.tsx("span", { class: "esri-icon-polyline" })),
                        widget_1.tsx("button", { class: CSS.button, title: i18n.titles.polygon, bind: this, onclick: this.drawPolygon },
                            widget_1.tsx("span", { class: "esri-icon-polygon" })),
                        widget_1.tsx("button", { class: CSS.button, title: i18n.titles.rectangle, bind: this, onclick: this.drawRectangle },
                            widget_1.tsx("span", { class: "esri-icon-checkbox-unchecked" })),
                        widget_1.tsx("button", { class: CSS.button, title: i18n.titles.circle, bind: this, onclick: this.drawCircle },
                            widget_1.tsx("span", { class: "esri-icon-radio-unchecked" })),
                        widget_1.tsx("button", { class: CSS.button, title: i18n.titles.text, bind: this, onclick: this.drawText },
                            widget_1.tsx("span", { class: "esri-icon-labels" }))),
                    widget_1.tsx("div", { class: CSS.buttonGroup },
                        widget_1.tsx("button", { class: CSS.button, title: i18n.titles.zoomTo, bind: this, onclick: this._zoomAll }, "Zoom To All"),
                        widget_1.tsx("button", { class: CSS.button, title: i18n.titles.deleteAll, bind: this, onclick: this._deleteAll }, "Delete All"),
                        widget_1.tsx("button", { class: CSS.button, title: i18n.titles.units, bind: this, onclick: this._showPane, "data-pane": "units" }, "Units")),
                    widget_1.tsx("div", { class: CSS.buttonGroup },
                        widget_1.tsx("button", { class: CSS.button, title: "Save markup to file", bind: this, onclick: this._saveFile }, "Save"),
                        widget_1.tsx("input", { bind: this, afterCreate: widget_1.storeNode, "data-node-ref": "_openFileInput", type: "file", accept: ".geojson", style: "display:none !important;" }),
                        widget_1.tsx("button", { class: CSS.button, title: "Open markup from file", bind: this, onclick: this._openFile }, "Open"))),
                widget_1.tsx("section", { class: CSS.pane, bind: this, afterCreate: widget_1.storeNode, "data-node-ref": "_unitsPane" },
                    widget_1.tsx("span", { class: CSS.label }, i18n.locationLabel),
                    widget_1.tsx("select", { class: CSS.select, bind: this, onchange: this._setLocationUnit }, this._createUnitOptions(this.locationUnits, this.locationUnit)),
                    widget_1.tsx("span", { class: CSS.label }, i18n.lengthLabel),
                    widget_1.tsx("select", { class: CSS.select, bind: this, onchange: this._setLengthUnit }, this._createUnitOptions(this.lengthUnits, this.lengthUnit)),
                    widget_1.tsx("span", { class: CSS.label }, i18n.areaLabel),
                    widget_1.tsx("select", { class: CSS.select, bind: this, onchange: this._setAreaUnit }, this._createUnitOptions(this.areaUnits, this.areaUnit)),
                    widget_1.tsx("br", null),
                    widget_1.tsx("button", { class: CSS.button, title: i18n.buttons.done, bind: this, onclick: this._showPane, "data-pane": "default" }, i18n.buttons.done))));
        };
        Markup.prototype._showPane = function (evt) {
            this._activePane = this._activePane || this._defaultPane;
            var pane = evt.target.getAttribute('data-pane');
            var activePane = this['_' + pane + 'Pane'];
            this._activePane.classList.remove('active');
            activePane.classList.add('active');
            this._activePane = activePane;
        };
        Markup.prototype._createUnitOptions = function (units, defaultUnit) {
            var options = [];
            for (var unit in units) {
                if (units.hasOwnProperty(unit)) {
                    options.push(widget_1.tsx("option", { value: unit, selected: unit === defaultUnit }, units[unit]));
                }
            }
            return options;
        };
        Markup.prototype._setLocationUnit = function (evt) {
            this.locationUnit = evt.target.value;
        };
        Markup.prototype._setLengthUnit = function (evt) {
            this.lengthUnit = evt.target.value;
        };
        Markup.prototype._setAreaUnit = function (evt) {
            this.areaUnit = evt.target.value;
        };
        Markup.prototype._pointCursorEvents = function () {
            this._draw.activeAction.on('cursor-update', this._updateCursorText.bind(this, 'point'));
            this._draw.activeAction.on('draw-complete', this._clearCursorText.bind(this));
        };
        Markup.prototype._vertexCursorEvents = function (geom) {
            this._draw.activeAction.on('vertex-add, vertex-remove, cursor-update', this._updateCursorText.bind(this, geom));
            this._draw.activeAction.on('draw-complete', this._clearCursorText.bind(this));
        };
        Markup.prototype._updateCursorText = function (geom, evt) {
            var text = 'geometry';
            var coords = evt.coordinates;
            var vertices = evt.vertices;
            var spatialReference = this.view.spatialReference;
            if (!coords) {
                coords = vertices[vertices.length - 1];
            }
            if (this._cursorTextGraphic) {
                this._sketchLayer.remove(this._cursorTextGraphic);
            }
            switch (geom) {
                case 'point':
                    var lngLat = webMercatorUtils.xyToLngLat(coords[0], coords[1]);
                    if (this.locationUnit === 'dec') {
                        text = number.round(lngLat[0], 4) + ', ' + number.round(lngLat[1], 4);
                    }
                    else {
                        text = this._coordFormat.toLatitudeLongitude(new Point({
                            x: lngLat[0],
                            y: lngLat[1],
                            spatialReference: {
                                wkid: 4326
                            }
                        }), 'dms', 2);
                    }
                    break;
                case 'polyline':
                    var polyline = new Polyline({
                        paths: evt.vertices,
                        spatialReference: spatialReference
                    });
                    var length_1 = geometryEngine.geodesicLength(polyline, this.lengthUnit);
                    if (length_1 < 0) {
                        var simplifiedPolyline = geometryEngine.simplify(polyline);
                        if (simplifiedPolyline) {
                            length_1 = geometryEngine.geodesicLength(simplifiedPolyline, this.lengthUnit);
                        }
                    }
                    text = length_1.toFixed(2) + ' ' + this.lengthUnit;
                    break;
                case 'polygon':
                    var polygon = new Polygon({
                        rings: vertices,
                        spatialReference: spatialReference
                    });
                    var area = geometryEngine.geodesicArea(polygon, this.areaUnit);
                    if (area < 0) {
                        var simplifiedPolygon = geometryEngine.simplify(polygon);
                        if (simplifiedPolygon) {
                            area = geometryEngine.geodesicArea(simplifiedPolygon, this.areaUnit);
                        }
                    }
                    text = area.toFixed(2) + ' ' + this.areaUnit;
                default:
                    break;
            }
            this.cursorTextSymbol.text = text;
            this._cursorTextGraphic = new Graphic({
                geometry: new Point({
                    x: coords[0],
                    y: coords[1],
                    spatialReference: spatialReference
                }),
                symbol: this.cursorTextSymbol
            });
            this._sketchLayer.add(this._cursorTextGraphic);
        };
        Markup.prototype._clearCursorText = function () {
            if (this._cursorTextGraphic) {
                this._sketchLayer.remove(this._cursorTextGraphic);
            }
        };
        Markup.prototype.drawPoint = function () {
            this._sketch.create('point');
            this._pointCursorEvents();
        };
        Markup.prototype.drawPolyline = function () {
            this._sketch.create('polyline');
            this._vertexCursorEvents('polyline');
        };
        Markup.prototype.drawPolygon = function () {
            this._sketch.create('polygon');
            this._vertexCursorEvents('polygon');
        };
        Markup.prototype.drawRectangle = function () {
            this._sketch.create('rectangle');
        };
        Markup.prototype.drawCircle = function () {
            this._sketch.create('circle');
        };
        Markup.prototype.drawText = function () {
            this._isText = true;
            this._sketch.create('point');
            this._pointCursorEvents();
        };
        Markup.prototype._createPopup = function (tool, graphic) {
            var title = i18n.title + ' ' + i18n.geometry[tool];
            var container = document.createElement('div');
            var popupTemplate = new PopupTemplate({
                title: title,
                actions: this._actions
            });
            switch (tool) {
                case 'point':
                    if (this._isText) {
                        new TextStyler({
                            graphic: graphic,
                            container: container
                        });
                    }
                    else {
                        new PointStyler({
                            graphic: graphic,
                            container: container
                        });
                    }
                    break;
                case 'polyline':
                    new PolylineStyler({
                        graphic: graphic,
                        container: container
                    });
                    break;
                case 'polygon':
                    new PolygonStyler({
                        graphic: graphic,
                        container: container
                    });
                    break;
                default:
                    break;
            }
            popupTemplate.content = container;
            return popupTemplate;
        };
        Markup.prototype._addGraphic = function (evt) {
            var tool = evt.tool === 'rectangle' || evt.tool === 'circle' ? 'polygon' : evt.tool;
            var graphic = new Graphic({
                geometry: evt.geometry,
                attributes: {
                    OBJECTID: new Date().getTime()
                },
                symbol: this._isText ? this.textSymbol : this[tool + 'Symbol']
            });
            var layer = this._isText ? this._textLayer : this['_' + tool + 'Layer'];
            graphic.popupTemplate = this._createPopup(tool, graphic);
            layer.add(graphic);
            this._isText = false;
        };
        Markup.prototype._deleteGraphic = function (graphic) {
            var layer = graphic.layer;
            this.view.popup.close();
            layer.remove(graphic);
        };
        Markup.prototype._editGeometry = function (graphic) {
            var updateGraphic = graphic.clone();
            var layer = graphic.layer;
            this.view.popup.close();
            layer.remove(graphic);
            this._editGraphic = updateGraphic;
            this._sketch.update(updateGraphic);
        };
        Markup.prototype._updateGeometry = function (graphic) {
            var updatedGraphic = new Graphic({
                geometry: graphic.geometry,
                attributes: this._editGraphic.attributes,
                symbol: this._editGraphic.symbol
            });
            this['_' + graphic.geometry.type + 'Layer'].add(updatedGraphic);
            updatedGraphic.popupTemplate = this._createPopup(graphic.geometry.type, updatedGraphic);
        };
        Markup.prototype._moveUp = function (graphic) {
            var collection = graphic.get('layer.graphics');
            var idx = collection.indexOf(graphic);
            if (idx < collection.length - 1) {
                collection.reorder(graphic, idx + 1);
            }
        };
        Markup.prototype._moveDown = function (graphic) {
            var collection = graphic.get('layer.graphics');
            var idx = collection.indexOf(graphic);
            if (idx > 0) {
                collection.reorder(graphic, idx - 1);
            }
        };
        Markup.prototype._zoomAll = function () {
            var _this = this;
            var graphics = [];
            ['text', 'point', 'polyline', 'polygon'].forEach(function (lyr) {
                _this['_' + lyr + 'Layer'].graphics.forEach(function (graphic) {
                    graphics.push(graphic);
                });
            });
            if (graphics.length) {
                this.view.goTo(graphics);
            }
        };
        Markup.prototype._deleteAll = function () {
            var _this = this;
            ['text', 'point', 'polyline', 'polygon'].forEach(function (lyr) {
                _this['_' + lyr + 'Layer'].removeAll();
            });
        };
        Markup.prototype._saveFile = function (evt) {
            var geojson = this._parseGeoJSON(false);
            evt.preventDefault();
            if (!geojson.features.length) {
                return;
            }
            else {
                geojson = JSON.stringify(geojson);
            }
            MarkupLibs_1.FileSaver.saveAs(new Blob([
                geojson
            ], {
                type: 'text/plain;charset=utf-8'
            }), 'markup-export.geojson');
        };
        Markup.prototype._openFile = function (evt) {
            var _this = this;
            evt.preventDefault();
            if (!this._openFileInputHandle) {
                this._openFileInputHandle = on(this._openFileInput, 'change', function (evt) {
                    var file = evt.target.files[0];
                    if (!file) {
                        return;
                    }
                    var reader = new FileReader();
                    reader.onload = function (res) {
                        _this._addGeoJSON(JSON.parse(res.target.result), true);
                    };
                    reader.readAsText(file);
                });
            }
            this._openFileInput.click();
        };
        Markup.prototype._addGeoJSON = function (geojson, clear) {
            var _this = this;
            if (clear) {
                this._deleteAll();
            }
            geojson.features.forEach(function (feat) {
                var geometry = geomUtils.fromJSON(MarkupLibs_1.TerraArcGIS.convert(feat.geometry));
                var attributes = feat.properties || {};
                var symbol = feat.symbol ? symUtils.fromJSON(feat.symbol) : _this['_' + geometry.type + 'Symbol'];
                var graphic = new Graphic({
                    geometry: geometry,
                    attributes: attributes,
                    symbol: symbol
                });
                _this._isText = symbol && symbol.type && (symbol.type === 'esriTS' || symbol.type === 'text');
                var layer = _this._isText ? _this._textLayer : _this['_' + geometry.type + 'Layer'];
                graphic.popupTemplate = _this._createPopup(geometry.type, graphic);
                layer.add(graphic);
                _this._isText = false;
            });
        };
        Markup.prototype._parseGeoJSON = function (stringify) {
            var geojson = {
                type: 'FeatureCollection',
                features: []
            };
            this._layer.layers.forEach(function (layer) {
                layer.graphics.forEach(function (graphic) {
                    var geometry = MarkupLibs_1.TerraArcGIS.parse(webMercatorUtils.webMercatorToGeographic(graphic.geometry));
                    var symbol = graphic.symbol.toJSON();
                    var properties = graphic.attributes || {};
                    geojson.features.push({
                        type: 'Feature',
                        geometry: geometry,
                        properties: properties,
                        symbol: symbol
                    });
                });
            });
            return stringify === true ? JSON.stringify(geojson) : geojson;
        };
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "view", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "_sketch", void 0);
        __decorate([
            decorators_1.aliasOf('_sketch.draw')
        ], Markup.prototype, "_draw", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "_layer", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "_sketchLayer", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "_textLayer", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "_pointLayer", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "_polylineLayer", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "_polygonLayer", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "pointSymbol", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "polylineSymbol", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "polygonSymbol", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "textSymbol", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "cursorTextSymbol", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "locationUnit", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "locationUnits", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "lengthUnit", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "lengthUnits", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "areaUnit", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "areaUnits", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "_coordFormat", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "_panes", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "_activePane", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "_defaultPane", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "_unitsPane", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "_cursorTextGraphic", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "_isText", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "_actions", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "_editGraphic", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "_openFileInput", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "_openFileInputHandle", void 0);
        Markup = __decorate([
            decorators_1.subclass('Markup')
        ], Markup);
        return Markup;
    }(decorators_1.declared(Widget)));
    return Markup;
});
//# sourceMappingURL=Markup.js.map