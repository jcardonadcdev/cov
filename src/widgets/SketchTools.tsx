/// <amd-dependency path='esri/core/tsSupport/declareExtendsHelper' name='__extends' />
/// <amd-dependency path='esri/core/tsSupport/decorateHelper' name='__decorate' />

import { aliasOf, subclass, declared, property } from 'esri/core/accessorSupport/decorators';

import Widget = require('esri/widgets/Widget');

import { renderable, tsx, storeNode } from 'esri/widgets/support/widget';

import Map = require('esri/Map');
import MapView = require('esri/views/MapView');
import SceneView = require('esri/views/SceneView');
import Draw = require('esri/views/2d/draw/Draw');

import SketchViewModel = require('esri/widgets/Sketch/SketchViewModel');

import GraphicsLayer = require('esri/layers/GraphicsLayer');
import Polygon = require('esri/geometry/Polygon');
import Polyline = require('esri/geometry/Polyline');
import Point = require('esri/geometry/Point');
import Graphic = require('esri/Graphic');
import PopupTemplate = require('esri/PopupTemplate');

import geometryEngine = require('esri/geometry/geometryEngine');
import webMercatorUtils = require('esri/geometry/support/webMercatorUtils');

import number = require('dojo/number');

import { decimalToDMS, polylineMidpoint } from './../geometryUtils';

import * as i18n from 'dojo/i18n!./SketchTools/nls/SketchTools';

import PointStylePopup = require('./SketchTools/PointStylePopup');

import esri = __esri;

interface SketchToolsProperties extends esri.WidgetProperties {
  view: MapView;
  locationUnit?: string;
  locationSymbol?: any;
  locationTextSymbol?: any;
  lengthUnit?: string;
  lengthSymbol?: any;
  lengthTextSymbol?: any;
  areaUnit?: string;
  areaSymbol?: any;
  areaTextSymbol?: any;
}

const CSS = {
  base: 'sketch-widget esri-widget esri-widget--panel',
  header: 'sketch-widget__title',
  tabPanel: 'sketch-widget__tab-panel',
  tab: 'sketch-widget__tab',
  tabContent: 'sketch-widget__tab-content',
  button: 'esri-button',
  pointButtonIcon: 'esri-icon-map-pin',
  lengthButtonIcon: 'esri-icon-polyline',
  areaButtonIcon: 'esri-icon-polygon',
  clearButtonIcon: 'esri-icon-trash',
  label: 'sketch-widget__label',
  select: 'esri-select'
};

@subclass('SketchTools')
class SketchTools extends declared(Widget) {

  // view and map
  @property()
  view: MapView | SceneView;

  @aliasOf('view.map')
  map: Map;

  // layers
  @property()
  _pointLayer: GraphicsLayer;

  @property()
  _polylineLayer: GraphicsLayer;

  @property()
  _polygonLayer: GraphicsLayer;

  @property()
  _tempLayer: GraphicsLayer;

  // default symbols
  @property()
  pointSymbol: any = {
    type: 'simple-marker',
    size: 10,
    color: [0,0,0,0.5],
    outline: {
      color: [0,0,0,1],
      width: 2
    }
  };


  @property()
  updatingTextSymbol: any = {
    type: 'text',
    color: 'black',
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








  // location properties
  @property()
  locationUnit: string = 'dec';

  @property()
  locationSymbol: any = {
    type: 'simple-marker',
    style: 'cross',
    size: 10,
    outline: {
      color: 'red',
      width: 1
    }
  };

  @property()
  locationTextSymbol: any = {
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

  @property()
  _locationUnits: any = {
    'dec': 'Decimal Degrees',
    'dms': 'Degrees Minutes Seconds'
  };

  // length properties
  @property()
  lengthUnit: string = 'feet';

  @property()
  lengthSymbol: any = {
    type: 'simple-line',
    style: 'solid',
    color: 'yellow',
    width: 4
  };

  @property()
  lengthTextSymbol: any = {
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

  @property()
  _lengthUnits: any = {
    'meters': 'Meters',
    'feet': 'Feet',
    'kilometers': 'Kilometers',
    'miles': 'Miles',
    'nautical-miles': 'Nautical Miles',
    'yards': 'Yard'
  };

  // area properties
  @property()
  areaUnit: string = 'acres';

  @property()
  areaSymbol: any = {
    type: 'simple-fill',
    color: [255, 255, 0, 0.1],
    style: 'solid',
    outline: {
      color: 'yellow',
      width: 4
    }
  };

  @property()
  areaTextSymbol: any = {
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

  // Draw instance
  @property()
  _draw: Draw;

  @property()
  _sketchTab: HTMLElement;

  @property()
  _settingsTab: HTMLElement;

  @property()
  _measureContent: HTMLElement;

  @property()
  _settingsContent: HTMLElement;

  @property()
  @renderable()
  _resultText: string = i18n.resultsDefault;

  @property()
  _uid: string = Date.now().toString(22);

  constructor(params: SketchToolsProperties) {
    super(params);
    // init layers and draw if/after view loaded
    this.watch('view', view => {
      this._initDraw(view);
      this._initSketchLayers();
    });

    console.log(this);
  }

  postInitialize() {}

  render() {
    const result = this._resultText;

    return (
      <div class={CSS.base}>
        <header class={CSS.header}>{i18n.title}</header>
        <ul class={CSS.tabPanel} role="tablist">
          <li afterCreate={storeNode} data-node-ref="_sketchTab" id={this.id + "_sketchTab"} bind={this} onclick={this._toggleContent} class={CSS.tab} role="tab" data-tab-id="_sketchTab" data-content-id="_measureContent" aria-selected="true">{i18n.title}</li>
          <li afterCreate={storeNode} data-node-ref="_settingsTab" id={this.id + "_settingsTab"} bind={this} onclick={this._toggleContent} class={CSS.tab} role="tab" data-tab-id="_settingsTab" data-content-id="_settingsContent" aria-selected="false">{i18n.settings}</li>
        </ul>
        <section afterCreate={storeNode} data-node-ref="_sketchContent" id={this.id + "_sketchContent"} bind={this} class={CSS.tabContent} aria-labelledby={this.id + "_sketchTab"} role="tabcontent">
          <button class={CSS.button} title={i18n.pointButton} bind={this} onclick={this._point}><span class={CSS.pointButtonIcon}></span></button>
          <button class={CSS.button} title={i18n.lengthButton} bind={this} onclick={this._length}><span class={CSS.lengthButtonIcon}></span></button>
          <button class={CSS.button} title={i18n.areaButton} bind={this} onclick={this._area}><span class={CSS.areaButtonIcon}></span></button>

          <br/><br/>

          <button class={CSS.button} title={i18n.clearButton} bind={this} onclick={this._clear}><span class={CSS.clearButtonIcon}></span></button>
          <p><b>{i18n.results}</b></p>
          <p>{result}</p>
        </section>
        <section afterCreate={storeNode} data-node-ref="_settingsContent" id={this.id + "_settingsContent"} bind={this} class={CSS.tabContent} aria-labelledby={this.id + "_settingsTab"} role="tabcontent" style="display:none">
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
        </section>
      </div>
    );
  }

  /*
   * init methods
   */
 // init draw toolbar
 private _initDraw(view: MapView): void {
   this._draw = new Draw({
     view: view
   });
  }
 // create sketch layers
  private _initSketchLayers(): void {
    this.map.addMany([
      this._pointLayer = new GraphicsLayer(),
      this._polylineLayer = new GraphicsLayer(),
      this._polygonLayer = new GraphicsLayer(),
      this._tempLayer = new GraphicsLayer()
    ]);
  }



  /*
   * sketch point methods
   */
 // init point draw action
  private _point(): void {
    const action = this._draw.create('point', {});
    this.view.focus();
    action.on('draw-complete, cursor-update', this.__point.bind(this));
  }
  // add point graphic or show updating
  private __point(evt: any): void {
    let lngLat;
    let text;
    const coords = evt.coordinates;
    const point = new Point({
      x: coords[0],
      y: coords[1],
      spatialReference: this.view.spatialReference
    });
    const graphic = new Graphic({
      geometry: point,
      symbol: this.pointSymbol
    });
    this._tempLayer.removeAll();
    if (evt.type === 'cursor-update') {
      lngLat = webMercatorUtils.xyToLngLat(coords[0], coords[1]);
      if (this.locationUnit === 'dec') {
        text = number.round(lngLat[0], 4) + ', ' + number.round(lngLat[1], 4);
        this.updatingTextSymbol.text = text;
        this._resultText = text;
      } else {
        text = decimalToDMS(point, 2) as string;
        this.updatingTextSymbol.text = text;
        this._resultText = text;
      }
      this._tempLayer.add(graphic);
      this._tempLayer.add(new Graphic({
        geometry: graphic.geometry,
        symbol: this.updatingTextSymbol
      }));
    } else {
      graphic.popupTemplate = new PopupTemplate({
        title: i18n.pointButton,
        content: this.__pointPopup
      });
      this._pointLayer.add(graphic);
    }
  }
  // point popup content
  private __pointPopup(target: any): any {
    const psp = new PointStylePopup({
      graphic: target.graphic,
      container: document.createElement('div')
    });
    return psp.container;
  }















  /*
   * common methods
   */
   // create unit options
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

  private _toggleContent(evt: any): void {
    this._measureContent.style.display = 'none';
    this._settingsContent.style.display = 'none';
    this[evt.target.getAttribute('data-content-id')].style.display = 'block';
    this._sketchTab.setAttribute('aria-selected', 'false');
    this._settingsTab.setAttribute('aria-selected', 'false');
    this[evt.target.getAttribute('data-tab-id')].setAttribute('aria-selected', 'true');
  }

   private _clear(): void {
     this._draw.reset();
     this.view.graphics.removeAll();
     this._resultText = i18n.resultsDefault;
   }

   onHide(): void {
     this._clear();
   }

   /*
    * area methods
    */
  private _setAreaUnit(evt: any): void {
    this.areaUnit = evt.target.value;
  }

  private _area(): void {
    this._clear();
    const action = this._draw.create('polygon', {});
    this.view.focus();
    action.on('vertex-add', this.__area.bind(this));
    action.on('cursor-update', this.__area.bind(this));
    action.on('vertex-remove', this.__area.bind(this));
    action.on('draw-complete', this.__area.bind(this));
  }

  private __area(evt: any): void {
    const view = this.view;
    const vertices = evt.vertices;
    view.graphics.removeAll();
    const polygon = new Polygon({
      rings: vertices,
      spatialReference: view.spatialReference
    });
    const graphic = new Graphic({
      geometry: polygon,
      symbol: this.areaSymbol
    });
    view.graphics.add(graphic);
    let area = geometryEngine.geodesicArea(polygon, this.areaUnit);
    if (area < 0) {
      const simplifiedPolygon = geometryEngine.simplify(polygon) as Polygon;
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
  }

   /*
    * length methods
    */
  private _setLengthUnit(evt: any): void {
    this.lengthUnit = evt.target.value;
  }

  private _length(): void {
    this._clear();
    const action = this._draw.create('polyline', {});
    this.view.focus();
    action.on('vertex-add', this.__length.bind(this));
    action.on('cursor-update', this.__length.bind(this));
    action.on('vertex-remove', this.__length.bind(this));
    action.on('draw-complete', this.__length.bind(this));
  }

  private __length(evt: any): void {
    const view = this.view;
    const vertices = evt.vertices;
    view.graphics.removeAll();
    const polyline = new Polyline({
      paths: vertices,
      spatialReference: view.spatialReference
    });
    const graphic = new Graphic({
      geometry: polyline,
      symbol: this.lengthSymbol
    });
    view.graphics.add(graphic);
    let length = geometryEngine.geodesicLength(polyline, this.lengthUnit);
    if (length < 0) {
      const simplifiedPolyline = geometryEngine.simplify(polyline);
      if (simplifiedPolyline) {
        length = geometryEngine.geodesicLength(simplifiedPolyline, this.lengthUnit);
      }
    }
    this._resultText = length.toFixed(2) + ' ' + this.lengthUnit;
    this.lengthTextSymbol.text = this._resultText;
    view.graphics.add(new Graphic({
      geometry: polylineMidpoint(polyline),
      symbol: this.lengthTextSymbol
    }));
  }

  /*
   * location methods
   */
  private _setLocationUnit(evt: any): void {
    this.locationUnit = evt.target.value;
  }

  private _location(): void {
    this._clear();
    const action = this._draw.create('point', {});
    this.view.focus();
    // action.on('cursor-update', this.__location.bind(this));
    action.on('draw-complete', this.__location.bind(this));
  }

  private __location(evt: any): void {
    let text;
    const view = this.view;
    const coords = evt.coordinates;
    const lngLat = webMercatorUtils.xyToLngLat(coords[0], coords[1]);
    view.graphics.removeAll();
    const point = new Point({
      x: coords[0],
      y: coords[1],
      spatialReference: view.spatialReference
    });
    const graphic = new Graphic({
      geometry: point,
      symbol: this.locationSymbol
    });
    // view.graphics.add(graphic);
    this._pointLayer.add(graphic);


    if (this.locationUnit === 'dec') {
      text = number.round(lngLat[0], 4) + ', ' + number.round(lngLat[1], 4);
      this.locationTextSymbol.text = text;
      this._resultText = text;
    } else {
      text = decimalToDMS(point, 2) as string;
      this.locationTextSymbol.text = text;
      this._resultText = text;
    }
    view.graphics.add(new Graphic({
      geometry: point,
      symbol: this.locationTextSymbol
    }));
  }

}

export = SketchTools;
