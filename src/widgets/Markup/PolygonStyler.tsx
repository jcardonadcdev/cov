/// <amd-dependency path='esri/core/tsSupport/declareExtendsHelper' name='__extends' />
/// <amd-dependency path='esri/core/tsSupport/decorateHelper' name='__decorate' />

/// <amd-dependency path='esri/widgets/ColorPicker' name='ColorPicker' />

import { aliasOf, subclass, declared, property } from 'esri/core/accessorSupport/decorators';

import Widget = require('esri/widgets/Widget');

import { tsx, storeNode } from 'esri/widgets/support/widget';

import Graphic = require('esri/Graphic');

import SimpleFillSymbol = require('esri/symbols/SimpleFillSymbol');

import on = require('dojo/on');

declare const ColorPicker: any;

import * as i18n from 'dojo/i18n!./nls/Markup';

import esri = __esri;

interface PolygonStylerProperties extends esri.WidgetProperties {
  graphic: Graphic
}

const CSS = {
  base: 'markup-symbol-styler esri-widget',
  tabPanel: 'markup-symbol-styler__tab-panel',
  tab: 'markup-symbol-styler__tab',
  tabContent: 'markup-symbol-styler__tab-content',
  left: 'markup-symbol-styler__left-pane',
  right: 'markup-symbol-styler__right-pane',
  colorPicker: 'esri-color-picker',
  label: 'markup-symbol-styler__label',
  button: 'esri-button',
  select: 'esri-select'
};

@subclass('PolygonStyler')
class PolygonStyler extends declared(Widget) {

  @property()
  graphic: Graphic;

  @aliasOf('graphic.symbol')
  symbol: SimpleFillSymbol;

  constructor(params: PolygonStylerProperties) {
    super(params);
  }

  postInitialize() {}

  render() {
    return (
      <div class={CSS.base}>
        <ul class={CSS.tabPanel} role="tablist">
          <li afterCreate={storeNode} data-node-ref="_outlineTab" id={this.id + "_outlineTab"}
            bind={this} onclick={this._toggleTabContent} class={CSS.tab} role="tab"
            data-tab-id="_outlineTab" data-content-id="_outlineContent" aria-selected="true">Outline</li>
          <li afterCreate={storeNode} data-node-ref="_fillTab" id={this.id + "_fillTab"}
            bind={this} onclick={this._toggleTabContent} class={CSS.tab} role="tab"
            data-tab-id="_fillTab" data-content-id="_fillContent" aria-selected="false">Fill</li>
        </ul>
        <section afterCreate={storeNode} data-node-ref="_outlineContent" id={this.id + "_outlineContent"}
          bind={this} class={CSS.tabContent} aria-labelledby={this.id + "_outlineTab"} role="tabcontent">
          <div class={CSS.left}>
            <span class={CSS.label}>Style</span>
            <select class={CSS.select} bind={this} afterCreate={this._lineStyle}>
              <option value="solid">Solid</option>
              <option value="dash">Dashed</option>
              <option value="dot">Dotted</option>
              <option value="dashdot">Dash Dot</option>
            </select>
            <span class={CSS.label}>Width</span>
            <select class={CSS.select} bind={this} afterCreate={this._lineWidth}>
             <option value="1">1</option>
             <option value="2">2</option>
             <option value="3">3</option>
             <option value="4">4</option>
             <option value="5">5</option>
             <option value="6">6</option>
           </select>
          </div>
          <div class={CSS.right}>
            <span class={CSS.label}>Color</span>
            <div class={CSS.colorPicker} bind={this} afterCreate={this._lineColorPicker}></div>
          </div>
        </section>
        <section afterCreate={storeNode} data-node-ref="_fillContent" id={this.id + "_fillContent"}
          bind={this} class={CSS.tabContent} aria-labelledby={this.id + "_fillTab"} role="tabcontent" style="display:none">
          <div class={CSS.left}>
            <span class={CSS.label}>Color</span>
            <div class={CSS.colorPicker} bind={this} afterCreate={storeNode} data-node-ref="_fillColor"></div>
          </div>
          <div class={CSS.right}>
            <div class={CSS.colorPicker} bind={this} afterCreate={storeNode} data-node-ref="_fillTransparency"></div>
          </div>
        </section>
        <div bind={this} afterCreate={this._fillColorPicker}></div>
      </div>
    );
  }

  // tabs
  @property()
  _outlineTab: HTMLElement;
  @property()
  _fillTab: HTMLElement;
  @property()
  _outlineContent: HTMLElement;
  @property()
  _fillContent: HTMLElement;

  private _toggleTabContent(evt: any): void {
    this._outlineContent.style.display = 'none';
    this._fillContent.style.display = 'none';
    this[evt.target.getAttribute('data-content-id')].style.display = 'block';
    this._outlineTab.setAttribute('aria-selected', 'false');
    this._fillTab.setAttribute('aria-selected', 'false');
    this[evt.target.getAttribute('data-tab-id')].setAttribute('aria-selected', 'true');
  }

  // styles
  private _lineStyle(node: HTMLSelectElement): void {
    node.value = this.symbol.style;
    on(node, 'change', (): void => {
      const newSym = this.symbol.clone();
      newSym.outline.style = node.value;
      this.symbol = newSym;
    });
  }

  private _lineWidth(node: HTMLSelectElement): void {
    node.value = this.symbol.outline.width.toString();
    on(node, 'change', (): void => {
      const newSym = this.symbol.clone();
      newSym.outline.width = parseInt(node.value, 10);
      this.symbol = newSym;
    });
  }

  private _lineColorPicker(node: Element): void {
    const cp = new ColorPicker({
      color: this.symbol.outline.color
    }, document.createElement('div'));
    cp.startup();
    cp.on('color-change', (evt: any): void => {
      const newSym = this.symbol.clone();
      newSym.outline.color = evt.color;
      this.symbol = newSym;
    });
    node.append(cp.dap_paletteContainer);
  }

  @property()
  _fillColor: HTMLElement;
  @property()
  _fillTransparency: HTMLElement;

  private _fillColorPicker(): void {
    const cp = new ColorPicker({
      color: this.symbol.color
    }, document.createElement('div'));
    cp.startup();
    cp.on('color-change', (evt: any): void => {
      const newSym = this.symbol.clone();
      newSym.color = evt.color;
      this.graphic.symbol = newSym;
    });
    this._fillColor.append(cp.dap_paletteContainer);
    this._fillTransparency.append(cp.dap_transparencySection);
  }
}

export = PolygonStyler;
