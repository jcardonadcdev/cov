define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "esri/widgets/Sketch/SketchViewModel", "esri/layers/GroupLayer", "esri/layers/GraphicsLayer", "esri/Graphic", "esri/PopupTemplate", "./Markup/TextStyler", "./Markup/PointStyler", "./Markup/PolylineStyler", "./Markup/PolygonStyler", "esri/geometry/Point", "esri/geometry/Polyline", "esri/geometry/Polygon", "esri/geometry/geometryEngine", "esri/geometry/support/webMercatorUtils", "esri/geometry/coordinateFormatter", "dojo/number", "./Markup/libs/MarkupLibs", "dojo/i18n!./Markup/nls/Markup"], function (require, exports, __extends, __decorate, decorators_1, Widget, widget_1, SketchViewModel, GroupLayer, GraphicsLayer, Graphic, PopupTemplate, TextStyler, PointStyler, PolylineStyler, PolygonStyler, Point, Polyline, Polygon, geometryEngine, webMercatorUtils, coordinateFormatter, number, MarkupLibs_1, i18n) {
    "use strict";
    var CSS = {
        base: 'markup-widget esri-widget esri-widget--panel',
        header: 'markup-widget__title',
        pane: 'markup-widget__pane',
        drawMessage: 'markup-widget__draw-message',
        button: 'esri-button',
        buttonGroup: 'markup-widget__button-group',
        buttonGroupSeparator: 'markup-widget__button-group--separator',
        pointButtonIcon: 'esri-icon-map-pin',
        polylineButtonIcon: 'esri-icon-polyline',
        polygonButtonIcon: 'esri-icon-polygon',
        rectangleButtonIcon: 'esri-icon-checkbox-unchecked',
        circleButtonIcon: 'esri-icon-radio-unchecked',
        textButtonIcon: 'esri-icon-labels',
        undoRedoButtonIcon: 'esri-icon-reply',
        undoButton: 'markup-widget__undo',
        redoButton: 'markup-widget__redo',
        zoomToButtonIcon: 'esri-icon-zoom-out-fixed',
        deleteButtonIcon: 'esri-icon-trash',
        settingsButtonIcon: 'esri-icon-settings2',
        exportButtonIcon: 'esri-icon-download',
        label: 'markup-widget__label',
        select: 'esri-select'
    };
    var Markup = (function (_super) {
        __extends(Markup, _super);
        function Markup(params) {
            var _this = _super.call(this, params) || this;
            _this._coordFormat = coordinateFormatter;
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
            _this._locationUnits = {
                'dec': 'Decimal Degrees',
                'dms': 'Degrees Minutes Seconds'
            };
            _this.lengthUnit = 'feet';
            _this._lengthUnits = {
                'meters': 'Meters',
                'feet': 'Feet',
                'kilometers': 'Kilometers',
                'miles': 'Miles',
                'nautical-miles': 'Nautical Miles',
                'yards': 'Yard'
            };
            _this.areaUnit = 'acres';
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
            _this.watch('view', function (view) {
                _this._layer = new GroupLayer({
                    id: 'markup_widget_group_layer',
                    layers: [
                        _this._polygonLayer = new GraphicsLayer(),
                        _this._polylineLayer = new GraphicsLayer(),
                        _this._pointLayer = new GraphicsLayer(),
                        _this._textLayer = new GraphicsLayer(),
                        _this._sketchLayer = new GraphicsLayer()
                    ]
                });
                view.map.add(_this._layer);
                _this._sketch = new SketchViewModel({
                    view: view,
                    layer: _this._sketchLayer
                });
                _this._sketch.on('create-complete', _this._addGraphic.bind(_this));
                _this._sketch.on('update-complete, update-cancel', _this._updateGeometry.bind(_this));
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
                _this._coordFormat.load();
                _this.dojoRequire = window['require'];
            });
            console.log(_this);
            return _this;
        }
        Markup.prototype.postInitialize = function () { };
        Markup.prototype.render = function () {
            return (widget_1.tsx("div", { class: CSS.base },
                widget_1.tsx("header", { class: CSS.header }, i18n.title),
                widget_1.tsx("section", { class: CSS.pane, bind: this, afterCreate: widget_1.storeNode, "data-node-ref": "_defaultPane" },
                    widget_1.tsx("span", { class: CSS.label }, "Draw Tools"),
                    widget_1.tsx("div", { class: CSS.buttonGroup },
                        widget_1.tsx("button", { class: CSS.button, title: i18n.buttons.point, bind: this, onclick: this.drawPoint },
                            widget_1.tsx("span", { class: CSS.pointButtonIcon })),
                        widget_1.tsx("button", { class: CSS.button, title: i18n.buttons.polyline, bind: this, onclick: this.drawPolyline },
                            widget_1.tsx("span", { class: CSS.polylineButtonIcon })),
                        widget_1.tsx("button", { class: CSS.button, title: i18n.buttons.polygon, bind: this, onclick: this.drawPolygon },
                            widget_1.tsx("span", { class: CSS.polygonButtonIcon })),
                        widget_1.tsx("button", { class: CSS.button, title: i18n.buttons.rectangle, bind: this, onclick: this.drawRectangle },
                            widget_1.tsx("span", { class: CSS.rectangleButtonIcon })),
                        widget_1.tsx("button", { class: CSS.button, title: i18n.buttons.circle, bind: this, onclick: this.drawCircle },
                            widget_1.tsx("span", { class: CSS.circleButtonIcon })),
                        widget_1.tsx("button", { class: CSS.button, title: i18n.buttons.text, bind: this, onclick: this.drawText },
                            widget_1.tsx("span", { class: CSS.textButtonIcon }))),
                    widget_1.tsx("div", { class: this.classes(CSS.buttonGroup, CSS.buttonGroupSeparator) },
                        widget_1.tsx("button", { class: CSS.button, title: i18n.buttons.undo, bind: this },
                            widget_1.tsx("span", { class: this.classes(CSS.undoRedoButtonIcon, CSS.undoButton) })),
                        widget_1.tsx("button", { class: CSS.button, title: i18n.buttons.redo, bind: this },
                            widget_1.tsx("span", { class: this.classes(CSS.undoRedoButtonIcon, CSS.redoButton) })),
                        widget_1.tsx("button", { class: CSS.button, title: i18n.buttons.zoomTo, bind: this, onclick: this._zoomAll },
                            widget_1.tsx("span", { class: CSS.zoomToButtonIcon })),
                        widget_1.tsx("button", { class: CSS.button, title: i18n.buttons.deleteAll, bind: this, onclick: this._deleteAll },
                            widget_1.tsx("span", { class: CSS.deleteButtonIcon })),
                        widget_1.tsx("button", { class: CSS.button, title: i18n.buttons.settings, bind: this, onclick: this._showSettingsPane },
                            widget_1.tsx("span", { class: CSS.settingsButtonIcon }))),
                    widget_1.tsx("div", { class: this.classes(CSS.buttonGroup, CSS.buttonGroupSeparator) },
                        widget_1.tsx("button", { class: CSS.button, title: i18n.buttons.export, bind: this, onclick: this._showExportPane },
                            widget_1.tsx("span", { class: CSS.exportButtonIcon })))),
                widget_1.tsx("section", { class: CSS.pane, bind: this, afterCreate: widget_1.storeNode, "data-node-ref": "_settingsPane", style: "display:none;" },
                    widget_1.tsx("span", { class: CSS.label }, i18n.locationLabel),
                    widget_1.tsx("select", { class: CSS.select, bind: this, onchange: this._setLocationUnit }, this._createUnitOptions(this._locationUnits, this.locationUnit)),
                    widget_1.tsx("span", { class: CSS.label }, i18n.lengthLabel),
                    widget_1.tsx("select", { class: CSS.select, bind: this, onchange: this._setLengthUnit }, this._createUnitOptions(this._lengthUnits, this.lengthUnit)),
                    widget_1.tsx("span", { class: CSS.label }, i18n.areaLabel),
                    widget_1.tsx("select", { class: CSS.select, bind: this, onchange: this._setAreaUnit }, this._createUnitOptions(this._areaUnits, this.areaUnit)),
                    widget_1.tsx("br", null),
                    widget_1.tsx("button", { class: CSS.button, title: i18n.buttons.done, bind: this, onclick: this._showDeafaultPane }, i18n.buttons.done)),
                widget_1.tsx("section", { class: CSS.pane, bind: this, afterCreate: widget_1.storeNode, "data-node-ref": "_exportPane", style: "display:none;" },
                    widget_1.tsx("span", { class: CSS.label }, "Export Format"),
                    widget_1.tsx("select", { class: CSS.select, bind: this, afterCreate: widget_1.storeNode, "data-node-ref": "_exportFormatSelect" },
                        widget_1.tsx("option", { value: "geojson" }, "GeoJSON"),
                        widget_1.tsx("option", { value: "shp" }, "Shapefile"),
                        widget_1.tsx("option", { value: "kml" }, "KML")),
                    widget_1.tsx("br", null),
                    widget_1.tsx("button", { class: CSS.button, title: "Export", bind: this, onclick: this._export }, "Export"),
                    widget_1.tsx("button", { class: CSS.button, title: i18n.buttons.done, bind: this, onclick: this._showDeafaultPane }, i18n.buttons.done))));
        };
        Markup.prototype._showDeafaultPane = function () {
            this._settingsPane.style.display = 'none';
            this._exportPane.style.display = 'none';
            this._defaultPane.style.display = 'block';
        };
        Markup.prototype._showSettingsPane = function () {
            this._defaultPane.style.display = 'none';
            this._exportPane.style.display = 'none';
            this._settingsPane.style.display = 'block';
        };
        Markup.prototype._showExportPane = function () {
            this._defaultPane.style.display = 'none';
            this._settingsPane.style.display = 'none';
            this._exportPane.style.display = 'block';
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
                symbol: this._isText ? this.textSymbol : this[tool + 'Symbol']
            });
            graphic.popupTemplate = this._createPopup(tool, graphic);
            if (this._isText) {
                this._textLayer.add(graphic);
            }
            else {
                this['_' + tool + 'Layer'].add(graphic);
            }
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
                symbol: this._editGraphic.symbol,
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
        Markup.prototype._export = function () {
            switch (this._exportFormatSelect.value) {
                case 'geojson':
                    this._exportGeoJSON();
                    break;
                default:
                    break;
            }
        };
        Markup.prototype._exportGeoJSON = function () {
            var geojson = this._parseGeoJSON();
            var file = new Blob([JSON.stringify(geojson)], {
                type: 'text/plain;charset=utf-8'
            });
            MarkupLibs_1.FileSaver.saveAs(file, 'export.geojson');
        };
        Markup.prototype._parseGeoJSON = function () {
            var _this = this;
            var geojson = {
                type: 'FeatureCollection',
                features: []
            };
            ['text', 'point', 'polyline', 'polygon'].forEach(function (lyr) {
                _this['_' + lyr + 'Layer'].graphics.forEach(function (graphic) {
                    var feature = MarkupLibs_1.ArcGIS.parse(webMercatorUtils.webMercatorToGeographic(graphic.geometry));
                    feature.symbol = graphic.symbol.toJSON();
                    feature.properties = {};
                    geojson.features.push(feature);
                });
            });
            return geojson;
        };
        Markup.prototype._parseEsriJSON = function () {
            var _this = this;
            var esrijson = {
                features: []
            };
            ['text', 'point', 'polyline', 'polygon'].forEach(function (lyr) {
                _this['_' + lyr + 'Layer'].graphics.forEach(function (graphic) {
                    esrijson.features.push(graphic.toJSON());
                });
            });
            return esrijson;
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
        ], Markup.prototype, "_coordFormat", void 0);
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
        ], Markup.prototype, "dojoRequire", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "_defaultPane", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "_settingsPane", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "_exportPane", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "locationUnit", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "_locationUnits", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "lengthUnit", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "_lengthUnits", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "areaUnit", void 0);
        __decorate([
            decorators_1.property()
        ], Markup.prototype, "_areaUnits", void 0);
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
        ], Markup.prototype, "_exportFormatSelect", void 0);
        Markup = __decorate([
            decorators_1.subclass('Markup')
        ], Markup);
        return Markup;
    }(decorators_1.declared(Widget)));
    return Markup;
});
//# sourceMappingURL=Markup.js.map