/// <amd-dependency path='esri/core/tsSupport/declareExtendsHelper' name='__extends' />
/// <amd-dependency path='esri/core/tsSupport/decorateHelper' name='__decorate' />

import { aliasOf, subclass, declared, property } from 'esri/core/accessorSupport/decorators';

import Widget = require('esri/widgets/Widget');

import { renderable, tsx, storeNode } from 'esri/widgets/support/widget';

import MapView = require('esri/views/MapView');
// import SceneView = require('esri/views/SceneView');

import SketchViewModel = require('esri/widgets/Sketch/SketchViewModel');
import Draw = require('esri/views/2d/draw/Draw');

import Collection = require('esri/core/Collection');

import GroupLayer = require('esri/layers/GroupLayer');
import GraphicsLayer = require('esri/layers/GraphicsLayer');
import Graphic = require('esri/Graphic');
import PopupTemplate = require('esri/PopupTemplate');

import TextStyler = require('./Markup/TextStyler');
import PointStyler = require('./Markup/PointStyler');
import PolylineStyler = require('./Markup/PolylineStyler');
import PolygonStyler = require('./Markup/PolygonStyler');

import Point = require('esri/geometry/Point');
import Polyline = require('esri/geometry/Polyline');
import Polygon = require('esri/geometry/Polygon');
import geometryEngine = require('esri/geometry/geometryEngine');
import webMercatorUtils = require('esri/geometry/support/webMercatorUtils');
import coordinateFormatter = require('esri/geometry/coordinateFormatter');

import number = require('dojo/number');

import { ArcGIS, FileSaver } from './Markup/libs/MarkupLibs';

import * as i18n from 'dojo/i18n!./Markup/nls/Markup';

import esri = __esri;

// widet properties
interface MarkupProperties extends esri.WidgetProperties {
  view: MapView;
  // default symbols
  pointSymbol? : any;
  polylineSymbol?: any;
  polygonSymbol?: any;
  textSymbol?: any;
  cursorTextSymbol?: any;
  // default units
  locationUnit?: string;
  lengthUnit?: string;
  areaUnit?: string;
}

const CSS = {
  base: 'markup-widget esri-widget esri-widget--panel',
  header: 'markup-widget__title',
  pane: 'markup-widget__pane',
  heading: 'markup-widget__heading',
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

@subclass('Markup')
class Markup extends declared(Widget) {
  /* view */
  @property()
  view: MapView;

  /* sketch model */
  @property()
  _sketch: SketchViewModel;

  @aliasOf('_sketch.draw')
  _draw: Draw;

  @property()
  _coordFormat: coordinateFormatter = coordinateFormatter;

  /* layers */
  // group layer containing all markup layers
  @property()
  _layer: GroupLayer;
  // graphics layer for sketch
  @property()
  _sketchLayer: GraphicsLayer;
  // text
  @property()
  _textLayer: GraphicsLayer;
  // points
  @property()
  _pointLayer: GraphicsLayer;
  // polylines
  @property()
  _polylineLayer: GraphicsLayer;
  // polygons
  @property()
  _polygonLayer: GraphicsLayer;

  /* symbols */
  @property()
  pointSymbol: any = {
    type: 'simple-marker',
    style: 'square',
    size: 10,
    color: 'red',
    outline: {
      color: 'white',
      width: 2
    }
  };

  @property()
  polylineSymbol: any = {
    type: 'simple-line',
    style: 'solid',
    color: 'red',
    width: 2
  };

  @property()
  polygonSymbol: any = {
    type: 'simple-fill',
    color: [255, 0, 0, 0.25],
    style: 'solid',
    outline: {
      color: 'red',
      width: 2
    }
  };

  @property()
  textSymbol: any = {
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

  @property()
  cursorTextSymbol: any = {
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

  @property()
  dojoRequire: Function;

  constructor(params: MarkupProperties) {
    super(params);
    // when/if view loaded init layers, sketches and events
    this.watch('view', view => {
      // create and add layers to map
      this._layer = new GroupLayer({
        id: 'markup_widget_group_layer',
        layers: [
          this._polygonLayer = new GraphicsLayer(),
          this._polylineLayer = new GraphicsLayer(),
          this._pointLayer = new GraphicsLayer(),
          this._textLayer = new GraphicsLayer(),
          this._sketchLayer = new GraphicsLayer()
        ]
      })
      view.map.add(this._layer);
      // init sketch view model
      this._sketch = new SketchViewModel({
        view,
        layer: this._sketchLayer
      });

      // wire up sketch view model events
      this._sketch.on('create-complete', this._addGraphic.bind(this));
      this._sketch.on('update-complete, update-cancel', this._updateGeometry.bind(this));
      // wire up popup actions
      view.popup.viewModel.on('trigger-action', (evt: any) => {
        const graphic = view.popup.viewModel.selectedFeature;
        switch (evt.action.id) {
          case 'markup-widget-edit-delete':
            this._deleteGraphic(graphic);
            break;
          case 'markup-widget-edit-geometry':
            this._editGeometry(graphic);
            break;
          case 'markup-widget-edit-move-up':
            this._moveUp(graphic);
            break;
          case 'markup-widget-edit-move-down':
            this._moveDown(graphic);
            break;
          default:
            break;
        }
      });

      this._coordFormat.load();

      this.dojoRequire = window['require'];
    });

    // dev
    console.log(this);
  }

  postInitialize() {}

  render() {

    return (
      <div class={CSS.base}>
        <header class={CSS.header}>{i18n.title}</header>
        <section class={CSS.pane} bind={this} afterCreate={storeNode} data-node-ref="_defaultPane">
          <span class={CSS.heading}>Draw Tools</span>
          <div class={CSS.buttonGroup}>
            <button class={CSS.button} title={i18n.buttons.point} bind={this} onclick={this.drawPoint}>
              <span class={CSS.pointButtonIcon}></span>
            </button>
            <button class={CSS.button} title={i18n.buttons.polyline} bind={this} onclick={this.drawPolyline}>
              <span class={CSS.polylineButtonIcon}></span>
            </button>
            <button class={CSS.button} title={i18n.buttons.polygon} bind={this} onclick={this.drawPolygon}>
              <span class={CSS.polygonButtonIcon}></span>
            </button>
            <button class={CSS.button} title={i18n.buttons.rectangle} bind={this} onclick={this.drawRectangle}>
              <span class={CSS.rectangleButtonIcon}></span>
            </button>
            <button class={CSS.button} title={i18n.buttons.circle} bind={this} onclick={this.drawCircle}>
              <span class={CSS.circleButtonIcon}></span>
            </button>
            <button class={CSS.button} title={i18n.buttons.text} bind={this} onclick={this.drawText}>
              <span class={CSS.textButtonIcon}></span>
            </button>
          </div>

          <span class={CSS.heading}>Edit</span>
          <div class={this.classes(CSS.buttonGroup)}>

            <button class={CSS.button} title={i18n.buttons.undo} bind={this}>
              <span class={this.classes(CSS.undoRedoButtonIcon, CSS.undoButton)}></span>
            </button>
            <button class={CSS.button} title={i18n.buttons.redo} bind={this}>
              <span class={this.classes(CSS.undoRedoButtonIcon, CSS.redoButton)}></span>
            </button>
            <button class={CSS.button} title={i18n.buttons.zoomTo} bind={this} onclick={this._zoomAll}>
              <span class={CSS.zoomToButtonIcon}></span>
            </button>
            <button class={CSS.button} title={i18n.buttons.deleteAll} bind={this} onclick={this._deleteAll}>
              <span class={CSS.deleteButtonIcon}></span>
            </button>
            <button class={CSS.button} title={i18n.buttons.settings} bind={this} onclick={this._showSettingsPane}>Units</button>
          </div>
          <div class={this.classes(CSS.buttonGroup, CSS.buttonGroupSeparator)}>
            <button class={CSS.button} title={i18n.buttons.export} bind={this} onclick={this._showExportPane}>
              {/* <span class={CSS.exportButtonIcon}></span> */}
              Import/Export
            </button>
          </div>
        </section>


        <section class={CSS.pane} bind={this} afterCreate={storeNode} data-node-ref="_settingsPane" style="display:none;">
          <span class={CSS.label}>{i18n.locationLabel}</span>
          <select class={CSS.select} bind={this} onchange={this._setLocationUnit}>
            {this._createUnitOptions(this._locationUnits, this.locationUnit)}
          </select>
          <span class={CSS.label}>{i18n.lengthLabel}</span>
          <select class={CSS.select} bind={this} onchange={this._setLengthUnit}>
            {this._createUnitOptions(this._lengthUnits, this.lengthUnit)}
          </select>
          <span class={CSS.label}>{i18n.areaLabel}</span>
          <select class={CSS.select} bind={this} onchange={this._setAreaUnit}>
            {this._createUnitOptions(this._areaUnits, this.areaUnit)}
          </select>
          <br/>
          <button class={CSS.button} title={i18n.buttons.done} bind={this} onclick={this._showDeafaultPane}>
            {i18n.buttons.done}
          </button>

        </section>

        <section class={CSS.pane} bind={this} afterCreate={storeNode} data-node-ref="_exportPane" style="display:none;">
          <span class={CSS.heading}>Import</span>


          <button class={CSS.button} title="Import">
            Import
          </button>

          <span class={CSS.heading}>Export</span>
          <span class={CSS.label}>Export Format</span>
          <select class={CSS.select} bind={this} afterCreate={storeNode} data-node-ref="_exportFormatSelect">
            <option value="geojson">GeoJSON</option>
            <option value="shp">Shapefile</option>
            <option value="kml">KML</option>
          </select>
          <br/>
          <button class={CSS.button} title="Export" bind={this} onclick={this._export}>
            Export
          </button>

          <button class={CSS.button} title={i18n.buttons.done} bind={this} onclick={this._showDeafaultPane}>
            {i18n.buttons.done}
          </button>


        </section>


      </div>
    );
  }

  /* toggle panes */
  @property()
  _defaultPane: HTMLElement;
  @property()
  _settingsPane: HTMLElement;
  @property()
  _exportPane: HTMLElement;

  private _showDeafaultPane(): void {
    this._settingsPane.style.display = 'none';
    this._exportPane.style.display = 'none';
    this._defaultPane.style.display = 'block';
  }

  private _showSettingsPane(): void {
    this._defaultPane.style.display = 'none';
    this._exportPane.style.display = 'none';
    this._settingsPane.style.display = 'block';
  }

  private _showExportPane(): void {
    this._defaultPane.style.display = 'none';
    this._settingsPane.style.display = 'none';
    this._exportPane.style.display = 'block';
  }

  /* units and measuring */
  private _createUnitOptions(units: any, defaultUnit: string): any[] {
    const options: any[] = [];
    for (var unit in units) {
      if (units.hasOwnProperty(unit)) {
        options.push(
          <option value={unit} selected={unit === defaultUnit}>{units[unit]}</option>
        );
      }
    }
    return options;
  }

  private _setLocationUnit(evt: any): void {
    this.locationUnit = evt.target.value;
  }

  private _setLengthUnit(evt: any): void {
    this.lengthUnit = evt.target.value;
  }

  private _setAreaUnit(evt: any): void {
    this.areaUnit = evt.target.value;
  }

  @property()
  locationUnit: string = 'dec';

  @property()
  _locationUnits: any = {
    'dec': 'Decimal Degrees',
    'dms': 'Degrees Minutes Seconds'
  };

  @property()
  lengthUnit: string = 'feet';

  @property()
  _lengthUnits: any = {
    'meters': 'Meters',
    'feet': 'Feet',
    'kilometers': 'Kilometers',
    'miles': 'Miles',
    'nautical-miles': 'Nautical Miles',
    'yards': 'Yard'
  };

  @property()
  areaUnit: string = 'acres';

  @property()
  _areaUnits: any = {
    'acres': 'Acres',
    'ares': 'Ares',
    'hectares': 'Hectacres',
    'square-feet': 'Square Feet',
    'square-meters': 'Square Meters',
    'square-yards': 'Square Yards',
    'square-kilometers': 'Square Kilometers',
    'square-miles': 'Square Miles'
  };

  @property()
  _cursorTextGraphic: Graphic;

  private _pointCursorEvents(): void {
    this._draw.activeAction.on('cursor-update', this._updateCursorText.bind(this, 'point'));
    this._draw.activeAction.on('draw-complete', this._clearCursorText.bind(this));
  }

  private _vertexCursorEvents(geom: string): void {
    this._draw.activeAction.on('vertex-add, vertex-remove, cursor-update', this._updateCursorText.bind(this, geom));
    this._draw.activeAction.on('draw-complete', this._clearCursorText.bind(this));
  }

  private _updateCursorText(geom: string, evt: any) {
    let text = 'geometry';
    let coords = evt.coordinates;
    const vertices = evt.vertices;
    const spatialReference = this.view.spatialReference;
    if (!coords) {
      coords = vertices[vertices.length - 1];
    }
    if (this._cursorTextGraphic) {
      this._sketchLayer.remove(this._cursorTextGraphic);
    }
    switch (geom) {
      case 'point':
        const lngLat = webMercatorUtils.xyToLngLat(coords[0], coords[1]);
        if (this.locationUnit === 'dec') {
          text = number.round(lngLat[0], 4) + ', ' + number.round(lngLat[1], 4);
        } else {
          text = this._coordFormat.toLatitudeLongitude(new Point({
            x: lngLat[0],
            y: lngLat[1],
            spatialReference: {
              wkid: 4326
            }
          }), 'dms', 2) as string;
        }
        break;
      case 'polyline':
        const polyline = new Polyline({
          paths: evt.vertices,
          spatialReference
        });
        let length = geometryEngine.geodesicLength(polyline, this.lengthUnit);
        if (length < 0) {
          const simplifiedPolyline = geometryEngine.simplify(polyline);
          if (simplifiedPolyline) {
            length = geometryEngine.geodesicLength(simplifiedPolyline, this.lengthUnit);
          }
        }
        text = length.toFixed(2) + ' ' + this.lengthUnit;
        break;
      case 'polygon':
        const polygon = new Polygon({
          rings: vertices,
          spatialReference
        });
        let area = geometryEngine.geodesicArea(polygon, this.areaUnit);
        if (area < 0) {
          const simplifiedPolygon = geometryEngine.simplify(polygon) as Polygon;
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
        spatialReference
      }),
      symbol: this.cursorTextSymbol
    });
    this._sketchLayer.add(this._cursorTextGraphic);
  }

  private _clearCursorText(): void {
    if (this._cursorTextGraphic) {
      this._sketchLayer.remove(this._cursorTextGraphic);
    }
  }

  /* init draw by geometry type */
  @property()
  _isText: boolean = false;

  drawPoint(): void {
    this._sketch.create('point');
    this._pointCursorEvents();
  }
  drawPolyline(): void {
    this._sketch.create('polyline');
    this._vertexCursorEvents('polyline');
  }
  drawPolygon(): void {
    this._sketch.create('polygon');
    this._vertexCursorEvents('polygon');
  }
  drawRectangle(): void {
    this._sketch.create('rectangle');
    // does not work - needs to construct geometry for areas
    // this._vertexCursorEvents('polygon');
  }
  drawCircle(): void {
    this._sketch.create('circle');
    // does not work - needs to construct geometry for areas
    // this._vertexCursorEvents('polygon');
  }

  drawText(): void {
    this._isText = true;
    this._sketch.create('point');
    this._pointCursorEvents();
  }

  /* editing methods */
  @property()
  _actions: any[] = [{
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

  // TODO geoprocessing
  // {
  //   title: 'Geoprocessing',
  //   id: 'markup-widget-edit-geoprocess',
  //   className: 'esri-icon-public'
  // }

  @property()
  _editGraphic: Graphic;

  private _createPopup(tool: string, graphic: Graphic): PopupTemplate {
    const title = i18n.title + ' ' + i18n.geometry[tool];
    const container = document.createElement('div') as any;
    const popupTemplate = new PopupTemplate({
      title,
      actions: this._actions
    });
    switch (tool) {
      case 'point':
        if (this._isText) {
          new TextStyler({
            graphic,
            container
          });
        } else {
          new PointStyler({
            graphic,
            container
          });
        }
        break;
      case 'polyline':
        new PolylineStyler({
          graphic,
          container
        });
        break;
      case 'polygon':
        new PolygonStyler({
          graphic,
          container
        });
        break;
      default:
        break;
    }
    popupTemplate.content = container;
    return popupTemplate;
  }

  // add graphic
  private _addGraphic(evt: any): void {
    // geometry type
    const tool = evt.tool === 'rectangle' || evt.tool === 'circle' ? 'polygon' : evt.tool;
    // create graphic
    const graphic = new Graphic({
      geometry: evt.geometry,
      symbol: this._isText ? this.textSymbol : this[tool + 'Symbol']
    });
    // add popup
    graphic.popupTemplate = this._createPopup(tool, graphic);
    // add to appropriate layer
    if (this._isText) {
      this._textLayer.add(graphic);
    } else {
      this['_' + tool + 'Layer'].add(graphic);
    }
    this._isText = false;
  }

  // delete graphic
  private _deleteGraphic(graphic: Graphic): void {
    const layer = graphic.layer as GraphicsLayer;
    this.view.popup.close();
    layer.remove(graphic);
  }

  // edit geometry
  private _editGeometry(graphic: Graphic): void {
    const updateGraphic = graphic.clone();
    const layer = graphic.layer as GraphicsLayer;
    this.view.popup.close();
    layer.remove(graphic);
    this._editGraphic = updateGraphic;
    this._sketch.update(updateGraphic);
  }

  // new graphic with updated geometry with orginal symbol and new popup template
  private _updateGeometry(graphic: Graphic): void {
    const updatedGraphic = new Graphic({
      geometry: graphic.geometry,
      symbol: this._editGraphic.symbol,
    });
    this['_' + graphic.geometry.type + 'Layer'].add(updatedGraphic);
    updatedGraphic.popupTemplate = this._createPopup(graphic.geometry.type, updatedGraphic);
  }

  private _moveUp(graphic: Graphic): void {
    const collection = graphic.get('layer.graphics') as Collection<Graphic>;
    const idx = collection.indexOf(graphic);
    if (idx < collection.length - 1) {
      collection.reorder(graphic, idx + 1);
    }
  }

  private _moveDown(graphic: Graphic): void {
    const collection = graphic.get('layer.graphics') as Collection<Graphic>;
    const idx = collection.indexOf(graphic);
    if (idx > 0) {
      collection.reorder(graphic, idx - 1);
    }
  }

  private _zoomAll(): void {
    const graphics: Graphic[] = [];
    ['text', 'point', 'polyline', 'polygon'].forEach((lyr) => {
      this['_' + lyr + 'Layer'].graphics.forEach((graphic: Graphic) => {
        graphics.push(graphic);
      });
    });
    if (graphics.length) {
      this.view.goTo(graphics);
    }
  }

  private _deleteAll(): void {
    ['text', 'point', 'polyline', 'polygon'].forEach((lyr) => {
      this['_' + lyr + 'Layer'].removeAll();
    });
  }

  @property()
  _exportFormatSelect: HTMLSelectElement;

  private _export(): void {
    switch (this._exportFormatSelect.value) {
      case 'geojson':
        this._exportGeoJSON();
        break;
      default:
        break;
    }
  }

  private _exportGeoJSON(): void {
    const geojson = this._parseGeoJSON();

    var file = new Blob([JSON.stringify(geojson)], {
      type: 'text/plain;charset=utf-8'
    });

    FileSaver.saveAs(file, 'export.geojson');
  }

  private _parseGeoJSON(): any {
    const geojson = {
      type: 'FeatureCollection',
      features: [] as any
    };
    ['text', 'point', 'polyline', 'polygon'].forEach((lyr) => {
      this['_' + lyr + 'Layer'].graphics.forEach((graphic: Graphic) => {
        const feature = ArcGIS.parse(webMercatorUtils.webMercatorToGeographic(graphic.geometry));
        feature.symbol = graphic.symbol.toJSON();
        feature.properties = {};
        geojson.features.push(feature);
      });
    });
    return geojson;
  }

  private _parseEsriJSON(): any {
    const esrijson = {
      features: [] as any
    };
    ['text', 'point', 'polyline', 'polygon'].forEach((lyr) => {
      this['_' + lyr + 'Layer'].graphics.forEach((graphic: Graphic) => {
        esrijson.features.push(graphic.toJSON());
      });
    });
    return esrijson;
  }

  // loadTerraformer(callback: Function): void {
  //   callback = callback || function(){};
  //   this.dojoRequire(['cov/widgets/Markup/libs/terraArcGIS.js'], (function (terraArcGIS: any) {
  //     this.terraArcGIS = terraArcGIS;
  //     callback();
  //   }).bind(this));
  // }




}

export = Markup;
