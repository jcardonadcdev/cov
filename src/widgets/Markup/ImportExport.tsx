/// <amd-dependency path='esri/core/tsSupport/declareExtendsHelper' name='__extends' />
/// <amd-dependency path='esri/core/tsSupport/decorateHelper' name='__decorate' />

import { subclass, declared, property } from 'esri/core/accessorSupport/decorators';

import Widget = require('esri/widgets/Widget');

import { tsx, storeNode } from 'esri/widgets/support/widget';

import GraphicsLayer = require('esri/layers/GraphicsLayer');
import Graphic = require('esri/Graphic');

import webMercatorUtils = require('esri/geometry/support/webMercatorUtils');

import { ArcGIS, FileSaver } from './libs/MarkupLibs';

import * as i18n from 'dojo/i18n!./nls/Markup';

import esri = __esri;

// widet properties
interface ImportExportProperties extends esri.WidgetProperties {
  layers: GraphicsLayer[];
}

const CSS = {
  clearFix: 'esri-clearfix',
  button: 'esri-button',
  label: 'markup-widget__label',
  select: 'esri-select',
  fileUpload: 'markup-widget__file-upload',
  tabPanel: 'markup-symbol-styler__tab-panel',
  tab: 'markup-symbol-styler__tab',
  tabContent: 'markup-symbol-styler__tab-content'
};

@subclass('ImportExport')
class ImportExport extends declared(Widget) {
  @property()
  layers: GraphicsLayer[];

  constructor(params: ImportExportProperties) {
    super(params);
  }

  postInitialize() {}

  render() {
    return (
      <div>
        <ul class={CSS.tabPanel} role="tablist">
          <li afterCreate={storeNode} data-node-ref="_importTab" id={this.id + "_importTab"}
            bind={this} onclick={this._toggleTabContent} class={CSS.tab} role="tab"
            data-tab-id="_importTab" data-content-id="_importContent" aria-selected="true">Import</li>
          <li afterCreate={storeNode} data-node-ref="_exportTab" id={this.id + "_exportTab"}
            bind={this} onclick={this._toggleTabContent} class={CSS.tab} role="tab"
            data-tab-id="_exportTab" data-content-id="_exportContent" aria-selected="false">Export</li>
        </ul>
        <section afterCreate={storeNode} data-node-ref="_importContent" id={this.id + "_importContent"}
          bind={this} class={CSS.tabContent} aria-labelledby={this.id + "_importTab"} role="tabcontent">

          <span class={CSS.label}>Import Format</span>
          <select class={CSS.select} bind={this} afterCreate={this._initImportSelect} data-node-ref="_importFormatSelect">
            <option value="geojson">GeoJSON</option>
            <option value="zip">Shapefile (zipped)</option>
            <option value="kml">KML</option>
            <option value="csv">CSV (points only)</option>
          </select>
          <br/>
          <label class={this.classes(CSS.fileUpload, CSS.button)}>
            Import
            <input type="file" accept=".geojson" bind={this} afterCreate={storeNode} data-node-ref="_importFileInput"/>
          </label>

          {/* <div class={CSS.clearFix}></div> */}

        </section>
        <section afterCreate={storeNode} data-node-ref="_exportContent" id={this.id + "_exportContent"}
          bind={this} class={CSS.tabContent} aria-labelledby={this.id + "_exportTab"} role="tabcontent" style="display:none">

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

        </section>
      </div>
    );
  }

  @property()
  _importTab: HTMLElement;
  @property()
  _exportTab: HTMLElement;
  @property()
  _importContent: HTMLElement;
  @property()
  _exportContent: HTMLElement;

  private _toggleTabContent(evt: any): void {
    this._importContent.style.display = 'none';
    this._exportContent.style.display = 'none';
    this[evt.target.getAttribute('data-content-id')].style.display = 'block';
    this._importTab.setAttribute('aria-selected', 'false');
    this._exportTab.setAttribute('aria-selected', 'false');
    this[evt.target.getAttribute('data-tab-id')].setAttribute('aria-selected', 'true');
  }

  @property()
  _exportFormatSelect: HTMLSelectElement;

  @property()
  _importFormatSelect: HTMLSelectElement;

  @property()
  _importFileInput: HTMLInputElement;

  private _initImportSelect(node: HTMLSelectElement): void {
    this._importFormatSelect = node;
    node.addEventListener('change', (evt: any) => {
      const value = evt.target.value;
      this._importFileInput.setAttribute('accept', '.' + value);
    });
  }

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
    if (!geojson.features.length) {
      return;
    }
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
    this.layers.forEach((layer) => {
      layer.graphics.forEach((graphic: Graphic) => {
        const feature = ArcGIS.parse(webMercatorUtils.webMercatorToGeographic(graphic.geometry));
        feature.symbol = graphic.symbol.toJSON();
        feature.properties = feature.properties || {}; //valid geojson must have `properties`
        geojson.features.push(feature);
      });
    });
    return geojson;
  }

}

export = ImportExport;
