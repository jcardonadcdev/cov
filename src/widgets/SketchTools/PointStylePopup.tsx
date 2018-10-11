/// <amd-dependency path='esri/core/tsSupport/declareExtendsHelper' name='__extends' />
/// <amd-dependency path='esri/core/tsSupport/decorateHelper' name='__decorate' />

import { aliasOf, subclass, declared, property } from 'esri/core/accessorSupport/decorators';

import Widget = require('esri/widgets/Widget');

import { renderable, tsx, storeNode } from 'esri/widgets/support/widget';

import Polygon = require('esri/geometry/Polygon');
import Polyline = require('esri/geometry/Polyline');
import Point = require('esri/geometry/Point');
import Graphic = require('esri/Graphic');

import * as i18n from 'dojo/i18n!./nls/SketchTools';

import esri = __esri;

interface PointStylePopupProperties extends esri.WidgetProperties {
  graphic: Graphic
}

const CSS = {
  base: 'sketch-tools-style-popup esri-widget',
  button: 'esri-button',
  select: 'esri-select'
};

@subclass('PointStylePopup')
class PointStylePopup extends declared(Widget) {

  constructor(params: PointStylePopupProperties) {
    super(params);
  }

  postInitialize() {}

  render() {
    return (
      <div class={CSS.base}>
        <p>I'm a sketch point!!!</p>
      </div>
    );
  }

}

export = PointStylePopup;
