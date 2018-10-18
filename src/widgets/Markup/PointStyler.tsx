/// <amd-dependency path='esri/core/tsSupport/declareExtendsHelper' name='__extends' />
/// <amd-dependency path='esri/core/tsSupport/decorateHelper' name='__decorate' />

/// <amd-dependency path='esri/widgets/ColorPicker' name='ColorPicker' />

import { aliasOf, subclass, declared, property } from 'esri/core/accessorSupport/decorators';

import Widget = require('esri/widgets/Widget');

import { tsx, storeNode } from 'esri/widgets/support/widget';

import Graphic = require('esri/Graphic');

import SimpleMarkerSymbol = require('esri/symbols/SimpleMarkerSymbol');

import on = require('dojo/on');

declare const ColorPicker: any;

import * as i18n from 'dojo/i18n!./nls/Markup';

import esri = __esri;

interface PointStylerProperties extends esri.WidgetProperties {
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
  select: 'esri-select',
  input: 'esri-input'
};

@subclass('PointStyler')
class PointStyler extends declared(Widget) {

  @property()
  graphic: Graphic;

  @aliasOf('graphic.symbol')
  symbol: SimpleMarkerSymbol;

  constructor(params: PointStylerProperties) {
    super(params);
  }

  postInitialize() {}

  render() {
    return (
      <div class={CSS.base}>
        <ul class={CSS.tabPanel} role="tablist">
          <li afterCreate={storeNode} data-node-ref="_pointTab" id={this.id + "_pointTab"}
            bind={this} onclick={this._toggleTabContent} class={CSS.tab} role="tab"
            data-tab-id="_pointTab" data-content-id="_pointContent" aria-selected="true">Point</li>
          <li afterCreate={storeNode} data-node-ref="_outlineTab" id={this.id + "_outlineTab"}
            bind={this} onclick={this._toggleTabContent} class={CSS.tab} role="tab"
            data-tab-id="_outlineTab" data-content-id="_outlineContent" aria-selected="false">Outline</li>
        </ul>
        <section afterCreate={storeNode} data-node-ref="_pointContent" id={this.id + "_pointContent"}
          bind={this} class={CSS.tabContent} aria-labelledby={this.id + "_pointTab"} role="tabcontent">
          <div class={CSS.left}>
            <span class={CSS.label}>Style</span>
            <select class={CSS.select} bind={this} afterCreate={this._pointStyle}>
              <option value="circle">Circe</option>
              <option value="square">Square</option>
              <option value="diamond">Diamond</option>
              <option value="cross">Cross</option>
              <option value="x">X</option>
            </select>
            <span class={CSS.label}>Size</span>
            <select class={CSS.select} bind={this} afterCreate={this._pointSize}>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
            </select>
          </div>
          <div class={CSS.right}>
            <span class={CSS.label}>Color</span>
            <div class={CSS.colorPicker} bind={this} afterCreate={this._pointColorPicker}></div>
          </div>
        </section>
        <section afterCreate={storeNode} data-node-ref="_outlineContent" id={this.id + "_outlineContent"}
          bind={this} class={CSS.tabContent} aria-labelledby={this.id + "_outlineTab"} role="tabcontent" style="display:none">
          <div class={CSS.left}>
            <span class={CSS.label}>Outline Width</span>
            <select class={CSS.select} bind={this} afterCreate={this._outlineWidth}>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>
          <div class={CSS.right}>
            <span class={CSS.label}>Outline Color</span>
            <div class={CSS.colorPicker} bind={this} afterCreate={this._outlineColorPicker}></div>
          </div>
        </section>
      </div>
    );
  }

  // tabs
  @property()
  _pointTab: HTMLElement;
  @property()
  _outlineTab: HTMLElement;
  @property()
  _pointContent: HTMLElement;
  @property()
  _outlineContent: HTMLElement;

  private _toggleTabContent(evt: any): void {
    this._pointContent.style.display = 'none';
    this._outlineContent.style.display = 'none';
    this[evt.target.getAttribute('data-content-id')].style.display = 'block';
    this._pointTab.setAttribute('aria-selected', 'false');
    this._outlineTab.setAttribute('aria-selected', 'false');
    this[evt.target.getAttribute('data-tab-id')].setAttribute('aria-selected', 'true');
  }

  // styles
  private _pointStyle(node: HTMLSelectElement): void {
    node.value = this.symbol.style;
    on(node, 'change', (): void => {
      const newSym = this.symbol.clone();
      newSym.style = node.value;
      this.symbol = newSym;
    });
  }

  private _pointSize(node: HTMLSelectElement): void {
    node.value = this.symbol.size.toString();
    on(node, 'change', (): void => {
      const newSym = this.symbol.clone();
      newSym.size = parseInt(node.value, 10);
      this.symbol = newSym;
    });
  }

  private _pointColorPicker(node: Element): void {
    const cp = new ColorPicker({
      color: this.symbol.color
    }, document.createElement('div'));
    cp.startup();
    cp.on('color-change', (evt: any): void => {
      const newSym = this.symbol.clone();
      newSym.color = evt.color;
      this.symbol = newSym;
    });
    node.append(cp.dap_paletteContainer);
  }

  private _outlineWidth(node: HTMLSelectElement): void {
    node.value = this.symbol.outline.width.toString();
    on(node, 'change', (): void => {
      const newSym = this.symbol.clone();
      newSym.outline.width = parseInt(node.value, 10);
      this.symbol = newSym;
    });
  }

  private _outlineColorPicker(node: Element): void {
    const cp = new ColorPicker({
      color: this.symbol.outline.color
    }, document.createElement('div'));
    cp.startup();
    cp.on('color-change', (evt: any): void => {
      const newSym = this.symbol.clone();
      newSym.outline.color = evt.color;
      this.graphic.symbol = newSym;
    });
    node.append(cp.dap_paletteContainer);
  }
}

export = PointStyler;
