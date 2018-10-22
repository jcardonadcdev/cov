/// <amd-dependency path='esri/core/tsSupport/declareExtendsHelper' name='__extends' />
/// <amd-dependency path='esri/core/tsSupport/decorateHelper' name='__decorate' />

import { aliasOf, subclass, declared, property } from 'esri/core/accessorSupport/decorators';

import Widget = require('esri/widgets/Widget');

import { tsx, storeNode } from 'esri/widgets/support/widget';

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

import symUtils = require('esri/symbols/support/jsonUtils');
import geomUtils = require('esri/geometry/support/jsonUtils');
import Point = require('esri/geometry/Point');
import Polyline = require('esri/geometry/Polyline');
import Polygon = require('esri/geometry/Polygon');
import geometryEngine = require('esri/geometry/geometryEngine');
import webMercatorUtils = require('esri/geometry/support/webMercatorUtils');
import coordinateFormatter = require('esri/geometry/coordinateFormatter');

import number = require('dojo/number');
import on = require('dojo/on');

import { TerraArcGIS, FileSaver } from './Markup/libs/MarkupLibs';

import * as i18n from 'dojo/i18n!./Markup/nls/Markup';

import esri = __esri;

const CSS = {
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
  // available units - i18n for units
  locationUnits?: string;
  lengthUnits?: string;
  areaUnits?: string;
}

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

  /* layers */
  // group layer containing all markup layers
  @property()
  _layer: GroupLayer;
  // graphics layer for sketch and temp graphics
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

  /* default symbols */
  // points
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
  // polylines
  @property()
  polylineSymbol: any = {
    type: 'simple-line',
    style: 'solid',
    color: 'red',
    width: 2
  };
  // polygons
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
  // text
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
  // cursor text
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

  /* default and available units */
  // location
  @property()
  locationUnit: string = 'dec';
  @property()
  locationUnits: any = {
    'dec': 'Decimal Degrees',
    'dms': 'Degrees Minutes Seconds'
  };
  // length
  @property()
  lengthUnit: string = 'feet';
  @property()
  lengthUnits: any = {
    'meters': 'Meters',
    'feet': 'Feet',
    'kilometers': 'Kilometers',
    'miles': 'Miles',
    'nautical-miles': 'Nautical Miles',
    'yards': 'Yard'
  };
  // area
  @property()
  areaUnit: string = 'acres';
  @property()
  areaUnits: any = {
    'acres': 'Acres',
    'ares': 'Ares',
    'hectares': 'Hectacres',
    'square-feet': 'Square Feet',
    'square-meters': 'Square Meters',
    'square-yards': 'Square Yards',
    'square-kilometers': 'Square Kilometers',
    'square-miles': 'Square Miles'
  };

  /* coordinate formatter - loaded in constructor() */
  @property()
  _coordFormat: coordinateFormatter = coordinateFormatter;

  constructor(params: MarkupProperties) {
    super(params);
    // if/when view loaded init layers, sketches and events
    this.watch('view', this._initWidget.bind(this));
    // load coordinate formatter
    this._coordFormat.load();
    // dev
    console.log(this);
  }

  // postInitialize() {}

  private _initWidget(view: MapView) {
    // create and add layers to map
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
    })
    view.map.add(this._layer);
    view.map.add(this._sketchLayer = new GraphicsLayer({
      listMode: 'hide'
    }));
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
  }

  render() {
    return (
      <div class={CSS.base}>
        <header class={CSS.header}>{i18n.title}</header>
        {/* default pane - active to start */}
        <section class={this.classes(CSS.pane, 'active')} bind={this} afterCreate={storeNode} data-node-ref="_defaultPane">

          <div class={CSS.buttonGroup}>
            <button class={CSS.button} title={i18n.titles.point} bind={this} onclick={this.drawPoint}>
              <span class="esri-icon-map-pin"></span>
            </button>
            <button class={CSS.button} title={i18n.titles.polyline} bind={this} onclick={this.drawPolyline}>
              <span class="esri-icon-polyline"></span>
            </button>
            <button class={CSS.button} title={i18n.titles.polygon} bind={this} onclick={this.drawPolygon}>
              <span class="esri-icon-polygon"></span>
            </button>
            <button class={CSS.button} title={i18n.titles.rectangle} bind={this} onclick={this.drawRectangle}>
              <span class="esri-icon-checkbox-unchecked"></span>
            </button>
            <button class={CSS.button} title={i18n.titles.circle} bind={this} onclick={this.drawCircle}>
              <span class="esri-icon-radio-unchecked"></span>
            </button>
            <button class={CSS.button} title={i18n.titles.text} bind={this} onclick={this.drawText}>
              <span class="esri-icon-labels"></span>
            </button>
          </div>

          <div class={CSS.buttonGroup}>
            <button class={CSS.button} title={i18n.titles.zoomTo} bind={this} onclick={this._zoomAll}>
              Zoom To All
            </button>
            <button class={CSS.button} title={i18n.titles.deleteAll} bind={this} onclick={this._deleteAll}>
              Delete All
            </button>
            <button class={CSS.button} title={i18n.titles.units} bind={this} onclick={this._showPane} data-pane="units">
              Units
            </button>
          </div>

          <div class={CSS.buttonGroup}>
            {/* <button class={CSS.button} title="Manage markup projects">
              Projects
            </button> */}
            <button class={CSS.button} title="Save markup to file" bind={this} onclick={this._saveFile}>
              Save
            </button>
            <input bind={this} afterCreate={storeNode} data-node-ref="_openFileInput" type="file" accept=".geojson" style="display:none !important;"/>
            <button class={CSS.button} title="Open markup from file" bind={this} onclick={this._openFile}>
              Open
            </button>
          </div>
        </section>

        {/* Units sections */}
        <section class={CSS.pane} bind={this} afterCreate={storeNode} data-node-ref="_unitsPane">
          {/* <label class={CSS.label}>
            <input class={CSS.input} type="checkbox" checked bind={this} afterCreate={storeNode} data-node-ref="_showUnits"/>
            Show measurements when drawing
          </label> */}
          <span class={CSS.label}>{i18n.locationLabel}</span>
          <select class={CSS.select} bind={this} onchange={this._setLocationUnit}>
            {this._createUnitOptions(this.locationUnits, this.locationUnit)}
          </select>
          <span class={CSS.label}>{i18n.lengthLabel}</span>
          <select class={CSS.select} bind={this} onchange={this._setLengthUnit}>
            {this._createUnitOptions(this.lengthUnits, this.lengthUnit)}
          </select>
          <span class={CSS.label}>{i18n.areaLabel}</span>
          <select class={CSS.select} bind={this} onchange={this._setAreaUnit}>
            {this._createUnitOptions(this.areaUnits, this.areaUnit)}
          </select>
          <br/>
          <button class={CSS.button} title={i18n.buttons.done} bind={this} onclick={this._showPane} data-pane="default">
            {i18n.buttons.done}
          </button>
        </section>

      </div>
    );
  }

  /* toggle panes */
  @property()
  _panes: HTMLElement[];
  @property()
  _activePane: HTMLElement;
  @property()
  _defaultPane: HTMLElement;
  @property()
  _unitsPane: HTMLElement;

  private _showPane(evt: any): void {
    this._activePane = this._activePane || this._defaultPane;
    const pane = evt.target.getAttribute('data-pane');
    const activePane = this['_' + pane + 'Pane'] as HTMLElement;
    this._activePane.classList.remove('active');
    activePane.classList.add('active');
    this._activePane = activePane;
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
      attributes: {
        OBJECTID: new Date().getTime()
      },
      symbol: this._isText ? this.textSymbol : this[tool + 'Symbol']
    });
    // layer
    const layer = this._isText ? this._textLayer : this['_' + tool + 'Layer'];
    // add popup
    graphic.popupTemplate = this._createPopup(tool, graphic);
    // add to appropriate layer
    layer.add(graphic);
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
      attributes: this._editGraphic.attributes,
      symbol: this._editGraphic.symbol
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

  /* save and open files */
  private _saveFile(evt: any): void {
    let geojson = this._parseGeoJSON(false);
    evt.preventDefault();
    if (!geojson.features.length) {
      return;
    } else {
      geojson = JSON.stringify(geojson);
    }
    FileSaver.saveAs(
      new Blob([
        geojson
      ], {
        type: 'text/plain;charset=utf-8'
      }),
      'markup-export.geojson'
    );

    // how to save shp file
    // geojson = this._parseGeoJSON(false);
    // const zip = shpwrite.zip(
    //   geojson,
    //   {
    //     folder: 'shapes',
    //     types: {
    //       point: 'points',
    //       polygon: 'polygons',
    //       line: 'lines'
    //     }
    //   }
    // );
    // file = new Blob([zip], {
    //   type: 'application.zip'
    // });
    // FileSaver.saveAs(file, 'markup-export.zip');
  }


  @property()
  _openFileInput: HTMLInputElement;
  @property()
  _openFileInputHandle: any = null;

  private _openFile(evt: any): void {
    evt.preventDefault();
    if (!this._openFileInputHandle) {
      this._openFileInputHandle = on(this._openFileInput, 'change', (evt: any) => {
        const file = evt.target.files[0];
        if (!file) {
          return;
        }
        const reader = new FileReader();
        reader.onload = (res: any) => {
          this._addGeoJSON(JSON.parse(res.target.result), true);
        };
        reader.readAsText(file);
      });
    }
    this._openFileInput.click();
  }

  private _addGeoJSON(geojson: any, clear: boolean): void {
    if (clear) {
      this._deleteAll();
    }
    geojson.features.forEach((feat: any) => {
      const geometry = geomUtils.fromJSON(TerraArcGIS.convert(feat.geometry));
      const attributes = feat.properties || {};
      const symbol = feat.symbol ? symUtils.fromJSON(feat.symbol) : this['_' + geometry.type + 'Symbol'];
      const graphic = new Graphic({
        geometry,
        attributes,
        symbol
      });
      this._isText = symbol && symbol.type && (symbol.type === 'esriTS' || symbol.type === 'text');
      const layer = this._isText ? this._textLayer : this['_' + geometry.type + 'Layer'];
      graphic.popupTemplate = this._createPopup(geometry.type, graphic);
      layer.add(graphic);
      this._isText = false;
    });
  }

  private _parseGeoJSON(stringify?: boolean): any {
    const geojson = {
      type: 'FeatureCollection',
      features: [] as any
    };
    this._layer.layers.forEach((layer: GraphicsLayer) => {
      layer.graphics.forEach((graphic: Graphic) => {
        const geometry = TerraArcGIS.parse(webMercatorUtils.webMercatorToGeographic(graphic.geometry));
        const symbol = graphic.symbol.toJSON();
        const properties = graphic.attributes || {}; //valid geojson must have `properties`
        geojson.features.push({
          type: 'Feature',
          geometry,
          properties,
          symbol
        });
      });
    });
    return stringify === true ? JSON.stringify(geojson) : geojson;
  }

}

export = Markup;
