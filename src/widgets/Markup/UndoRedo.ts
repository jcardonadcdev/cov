/// <amd-dependency path='esri/core/tsSupport/declareExtendsHelper' name='__extends' />
/// <amd-dependency path='esri/core/tsSupport/decorateHelper' name='__decorate' />

import { property, declared } from 'esri/core/accessorSupport/decorators';

interface OperationProperties {
  undo: Function;
  redo: Function;
}

class Operation {
  undo(): void {}
  redo(): void {}
}

interface AddOperationProperties {
  layer: any;
  graphic: any;
}

export class AddOperation {
  @property()
  layer: any;
  @property()
  graphic: any;
  constructor(params: AddOperationProperties) {
    this.layer = params.layer;
    this.graphic = params.graphic;
  }
  undo(): void {
    this.layer.remove(this.graphic);
  }
  redo(): void {
    this.layer.add(this.graphic);
  }
}

export class RemoveOperation {
  @property()
  layer: any;
  @property()
  graphic: any;
  undo() {
    this.layer.add(this.graphic);
  }
  redo() {
    this.layer.remove(this.graphic);
  }
}

// interface UndoRedoProperties {
//   maxOperations?: number;
// }

export class UndoRedo {
  @property()
  position: number = 0;
  @property()
  length: number = 0;
  @property()
  historyStack: Operation[] = [];

  // constructor() {}

  add(operation: Operation): void {
    this.historyStack.splice(this.position, 0, operation);
    this.position++;
  }

  undo(): null | void {
    let operation;
    if (0 === this.position) {
      return null;
    }
    operation = this._undo();
    if (this.position--, operation) {
      operation.undo();
    }
  }

  private _undo(): Operation | null {
    if (this.historyStack.length > 0 && this.position > 0) {
      return this._get(this.position - 1);
    } else {
      return null;
    }
  }

  redo(): null | void {
    let operation;
    if (0 === this.position) {
      return null;
    }
    operation = this._redo();
    if (this.position++, operation) {
      operation.redo();
    }
  }

  private _redo(): Operation | null {
    if (this.historyStack.length > 0 && this.position > 0) {
      return this._get(this.position);
    } else {
      return null;
    }
  }

  private _get(position: number): Operation {
    return this.historyStack[position];
  }
}
