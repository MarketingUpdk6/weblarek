import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';

export class Page extends Component<HTMLElement[]> {
  protected _gallery: HTMLElement;

  constructor(container: HTMLElement) {
    super(container);
    this._gallery = ensureElement<HTMLElement>('.gallery', container);
  }

  render(cards: HTMLElement[]): HTMLElement {
    this._gallery.replaceChildren(...cards);
    return this.container;
  }
}
