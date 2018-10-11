/// <amd-dependency path='esri/core/tsSupport/declareExtendsHelper' name='__extends' />
/// <amd-dependency path='esri/core/tsSupport/decorateHelper' name='__decorate' />

import { aliasOf, subclass, declared, property } from 'esri/core/accessorSupport/decorators';

import Widget = require('esri/widgets/Widget');

import { renderable, tsx, storeNode } from 'esri/widgets/support/widget';

import MapView = require('esri/views/MapView');
import SceneView = require('esri/views/SceneView');

import SketchViewModel = require('esri/widgets/Sketch/SketchViewModel');
import Draw = require('esri/views/2d/draw/Draw');

import GraphicsLayer = require('esri/layers/GraphicsLayer');
import Graphic = require('esri/Graphic');
import PopupTemplate = require('esri/PopupTemplate');

import * as i18n from 'dojo/i18n!./Markup/nls/Markup';

import esri = __esri;

// widet properties
interface MarkupProperties extends esri.WidgetProperties {
  view: MapView | SceneView;
  // default symbols
  pointSymbol? : any;
  polylineSymbol?: any;
  polygonSymbol?: any;
  // default units
  locationUnit?: string;
  lengthUnit?: string;
  areaUnit?: string;
}

const CSS = {
  base: 'markup-widget esri-widget esri-widget--panel',
  header: 'markup-widget__title',
  tabPanel: 'markup-widget__tab-panel',
  tab: 'markup-widget__tab',
  tabContent: 'markup-widget__tab-content',

  drawMessage: 'markup-widget__draw-message',

  button: 'esri-button',
  buttonGroup: 'markup-widget__button-group',
  pointButtonIcon: 'esri-icon-map-pin',
  polylineButtonIcon: 'esri-icon-polyline',
  polygonButtonIcon: 'esri-icon-polygon',
  rectangleButtonIcon: 'esri-icon-checkbox-unchecked',
  circleButtonIcon: 'esri-icon-radio-unchecked',
  clearButtonIcon: 'esri-icon-trash',


  label: 'markup-widget__label',
  select: 'esri-select'
};

@subclass('Markup')
class Markup extends declared(Widget) {
  /* view */
  @property()
  view: MapView | SceneView;

  /* sketch model */
  @property()
  _sketch: SketchViewModel;

  @aliasOf('_sketch.draw')
  _draw: Draw;

  /* layers */
  // graphics layer for sketch
  @property()
  _sketchLayer: GraphicsLayer;
  // points and text
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
    size: 9,
    color: 'red',
    outline: {
      color: 'white',
      width: 1.5
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
    color: [255, 0, 0, 0.1],
    style: 'solid',
    outline: {
      color: 'red',
      width: 2
    }
  };

  // draw message text
  @property()
  @renderable()
  _drawMessage: string = i18n.drawMessages.default;

  constructor(params: MarkupProperties) {
    super(params);
    // when/if view loaded init layers, sketches and events
    this.watch('view', view => {
      // create and add layers to map
      view.map.addMany([
        this._polygonLayer = new GraphicsLayer(),
        this._polylineLayer = new GraphicsLayer(),
        this._pointLayer = new GraphicsLayer(),
        this._sketchLayer = new GraphicsLayer()
      ]);
      // init sketch view model
      this._sketch = new SketchViewModel({
        view,
        layer: this._sketchLayer,
        pointSymbol: this.pointSymbol,
        polylineSymbol: this.polylineSymbol,
        polygonSymbol: this.polygonSymbol
      });
      // wire up sketch view model events
      this._sketch.on('create-complete', this._addGraphic.bind(this));
      this._sketch.on('update-complete, update-cancel', this._updateGeometry.bind(this));
      // wire up popup actions
      view.popup.viewModel.on('trigger-action', (evt: any) => {
        const id = evt.action.id;
        const graphic = view.popup.viewModel.selectedFeature;
        switch (id) {
          case 'markup-widget-edit-delete':
            this._deleteGraphic(graphic);
            break;
          case 'markup-widget-edit-geometry':
            this._editGeometry(graphic);
          default:
            break;
        }
      });
    });
    // dev
    console.log(this);
  }

  postInitialize() {}

  render() {

    const message = this._drawMessage;

    return (
      <div class={CSS.base}>
        <header class={CSS.header}>{i18n.title}</header>
        <ul class={CSS.tabPanel} role="tablist">
          <li
            afterCreate={storeNode}
            data-node-ref="_drawTab"
            id={this.id + "_drawTab"}
            bind={this}
            onclick={this._toggleContent}
            class={CSS.tab}
            role="tab"
            data-tab-id="_drawTab"
            data-content-id="_drawContent"
            aria-selected="true"
          >{i18n.draw}</li>
          <li
            afterCreate={storeNode}
            data-node-ref="_importExportTab"
            id={this.id + "_importExportTab"}
            bind={this}
            onclick={this._toggleContent}
            class={CSS.tab}
            role="tab"
            data-tab-id="_importExportTab"
            data-content-id="_importExportContent"
            aria-selected="false"
          >{i18n.importExport}</li>
          <li
            afterCreate={storeNode}
            data-node-ref="_settingsTab"
            id={this.id + "_settingsTab"}
            bind={this}
            onclick={this._toggleContent}
            class={CSS.tab}
            role="tab"
            data-tab-id="_settingsTab"
            data-content-id="_settingsContent"
            aria-selected="false"
          >{i18n.settings}</li>
        </ul>
        <section
          afterCreate={storeNode}
          data-node-ref="_drawContent"
          id={this.id + "_drawContent"}
          bind={this}
          class={CSS.tabContent}
          aria-labelledby={this.id + "_drawTab"}
          role="tabcontent"
        >
          <p class={CSS.drawMessage}>{message}</p>
          <div class={CSS.buttonGroup}>
            <button class={CSS.button} title={i18n.buttons.point} bind={this} onclick={this.drawPoint}><span class={CSS.pointButtonIcon}></span></button>
            <button class={CSS.button} title={i18n.buttons.polyline} bind={this} onclick={this.drawPolyline}><span class={CSS.polylineButtonIcon}></span></button>
            <button class={CSS.button} title={i18n.buttons.polygon} bind={this} onclick={this.drawPolygon}><span class={CSS.polygonButtonIcon}></span></button>
            <button class={CSS.button} title={i18n.buttons.rectangle} bind={this} onclick={this.drawRectangle}><span class={CSS.rectangleButtonIcon}></span></button>
            <button class={CSS.button} title={i18n.buttons.circle} bind={this} onclick={this.drawCircle}><span class={CSS.circleButtonIcon}></span></button>
          </div>
        </section>
        <section
          afterCreate={storeNode}
          data-node-ref="_importExportContent"
          id={this.id + "_importExportContent"}
          bind={this}
          class={CSS.tabContent}
          aria-labelledby={this.id + "_importExportTab"}
          role="tabcontent"
          style="display:none"
        >

        </section>
        <section
          afterCreate={storeNode}
          data-node-ref="_settingsContent"
          id={this.id + "_settingsContent"}
          bind={this}
          class={CSS.tabContent}
          aria-labelledby={this.id + "_settingsTab"}
          role="tabcontent"
          style="display:none"
        >

        </section>
      </div>
    );
  }

  /* toggle tabs */
  @property()
  _drawTab: HTMLElement;

  @property()
  _importExportTab: HTMLElement;

  @property()
  _settingsTab: HTMLElement;

  @property()
  _drawContent: HTMLElement;

  @property()
  _importExportContent: HTMLElement;

  @property()
  _settingsContent: HTMLElement;

  private _toggleContent(evt: any): void {
    this._drawContent.style.display = 'none';
    this._importExportContent.style.display = 'none';
    this._settingsContent.style.display = 'none';
    this[evt.target.getAttribute('data-content-id')].style.display = 'block';
    this._drawTab.setAttribute('aria-selected', 'false');
    this._importExportTab.setAttribute('aria-selected', 'false');
    this._settingsTab.setAttribute('aria-selected', 'false');
    this[evt.target.getAttribute('data-tab-id')].setAttribute('aria-selected', 'true');
  }

  /* units and measuring */
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

  /* init draw by geometry type */
  drawPoint(): void {
    this._sketch.create('point');
    this._drawMessage = i18n.drawMessages.point;
  }
  drawPolyline(): void {
    this._sketch.create('polyline');
  }
  drawPolygon(): void {
    this._sketch.create('polygon');
  }
  drawRectangle(): void {
    this._sketch.create('rectangle');
  }
  drawCircle(): void {
    this._sketch.create('circle');
  }

  /* editing methods */
  @property()
  _actions: any[] = [{
    title: 'Edit',
    id: 'markup-widget-edit-geometry',
    className: 'esri-icon-edit'
  }, {
    title: 'Delete',
    id: 'markup-widget-edit-delete',
    className: 'esri-icon-trash'
  }];

  @property()
  _editGraphic: Graphic;

  // add graphic
  private _addGraphic(evt: any): void {
    // geometry type
    const tool = evt.tool === 'rectangle' || evt.tool === 'circle' ? 'polygon' : evt.tool;
    // create graphic
    const graphic = new Graphic({
      geometry: evt.geometry,
      symbol: evt.target.graphic.symbol,
      popupTemplate: new PopupTemplate({
        title: 'Markup ' + tool,
        content: 'I\'m a ' + tool + '!',
        actions: this._actions
      })
    });
    // add to appropriate layer
    this['_' + tool + 'Layer'].add(graphic);
    // reset draw message
    this._drawMessage = i18n.drawMessages.default;
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

  // new graphic with updated geometry with orginal symbol and popup template
  private _updateGeometry(graphic: Graphic): void {
    this['_' + graphic.geometry.type + 'Layer'].add(new Graphic({
      geometry: graphic.geometry,
      symbol: this._editGraphic.symbol,
      popupTemplate: this._editGraphic.popupTemplate
    }));
  }

}

export = Markup;
