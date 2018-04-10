import EventDispatcher from './events/EventDispatcher';
import { addClass, removeClass } from './utils/Utils';

export default class Tooltip extends EventDispatcher {
  static add(target, content, config) {
    return new Tooltip(target, content, config);
  }

  static remove(target) {
    target.__tooltip.remove();
  }

  constructor(target, content, config) {
    super();
    this.initialize(target, content, config);
  }

  target = null;
  content = null;
  visible = false;
  element = null;
  tip = null;
  currentContent = null;
  rect = null;
  config = null;
  x = -1000;
  y = -1000;
  _wait = false;

  initialize(target, content, config) {
    this.target = target;
    this.config = config = config || {};
    target.__tooltip = this;
    this.content = content;
    if (config.mode == 'press') {
      target.addEventListener('mousedown', this.handleEvent);
    } else if (config.mode == 'over' || !config.mode) {
      target.addEventListener('mouseover', this.handleEvent);
      target.addEventListener('mousemove', this.handleEvent);
    }

    if (this.config.controller) {
      this.config.controller.addEventListener('close', this.remove);
    }
  }

  handleEvent = (evt) => {
    const targ = this.target;
    if (evt.type == 'mouseout' && !targ.contains(evt.relatedTarget)) {
      this.dispatchEvent(evt);
      this.hide();
    }
    if (evt.type == 'mouseover' && !targ.contains(evt.relatedTarget)) {
      this.show();
      this.dispatchEvent(evt);
    }
    if (evt.type == 'mousemove') {
      this.dispatchEvent(evt);
    }
    if (evt.type == 'mousedown') {
      if (!this.visible) {
        this.show();
      } else if (!(evt.target instanceof HTMLObjectElement) && !this.element.contains(evt.target)) {
        // HTMLEmbedElement will be our copy text swf files.
        this.hide();
      }
    }
  }

  show(content, rect) {
    content = content || this.content;
    if (content == null || this._wait) {
      return this.hide();
    }
    if (!this.visible) {
      this.create();
      const el = this.element;
      const tip = this.tip;

      if (this.config.controller) {
        this.config.controller.show();
      }

      if (this.config.mode == 'press') {
        document.body.addEventListener('mousedown', this, true);
        addClass(this.target, 'active');
        this._wait = true;
      } else {
        document.body.addEventListener('mouseout', this);
      }

      el.style.pointerEvents = this.config.mouseEnabled !== false;

      el.className = `regexr-tooltip${
        this.config && this.config.className ? ` ${this.config.className}` : ''
      }`;
      tip.className = 'regexr-tooltip-tip';
      document.body.appendChild(this.element);
      document.body.appendChild(this.tip);

      setTimeout(() => {
        // needs to be delayed for transition to work
        el.className += ' regexr-tooltip-visible';
        tip.className += ' regexr-tooltip-visible';
      }, 0);
    }

    if (content != this.currentContent) {
      this.showContent(content);
    }
    rect = rect || (this.target && this.target.getBoundingClientRect());
    if (rect) {
      this.position(rect);
    }

    if (!this.visible) {
      this.visible = true;
      this.dispatchEvent('show');
    }
    return this;
  }

  remove = () => {
    this.hide();
    this.target.__tooltip = null;
    this.target.removeEventListener('mouseover', this);
    this.target.removeEventListener('mousemove', this);
    this.tip = this.element = null;
    return this;
  };

  hide() {
    if (!this.visible) {
      return this;
    }
    this.element.parentNode.removeChild(this.element);
    this.tip.parentNode.removeChild(this.tip);
    document.body.removeEventListener('mouseout', this);
    document.body.removeEventListener('mousedown', this, true);
    if (this.config.mode == 'press') {
      removeClass(this.target, 'active');
      const _this = this;
      setTimeout(() => {
        _this._wait = false;
      }, 0);
    }
    this.visible = false;
    this.currentContent = null;

    if (this.config.controller && this.config.controller.hide) {
      this.config.controller.hide();
    }

    this.dispatchEvent('hide');
    return this;
  }

  position(rect) {
    const el = this.element;
    const tip = this.tip;
    const elRect = el.getBoundingClientRect();
    const elW = elRect.right - elRect.left;
    const elH = elRect.bottom - elRect.top;

    const tipRect = tip.getBoundingClientRect();
    const tipW = (tipRect.right - tipRect.left) >> 1;
    const tipH = tipRect.bottom - tipRect.top;

    const docW = document.body.clientWidth;

    let elX = ((rect.right + rect.left) / 2 - elW / 2) | 0;
    let elY = rect.bottom - window.pageYOffset + tipH;

    const tipX = Math.max(3 + tipW, Math.min(docW - tipW * 2 - 10 - 3, elX + elW / 2 - tipW));
    let tipY = elY - tipH;
    let tipScaleY = 1;

    elX = Math.max(10, Math.min(docW - elW - 10, elX));

    if (elY + elH + 10 > window.innerHeight) {
      elY = rect.top - elH - window.pageYOffset - tipH;
      tipScaleY = -1;
      tipY = rect.top - window.pageYOffset - tipH;
    }
    el.style.left = `${elX}px`; // TODO: window.innerWidth doesn't account for scrollbar
    el.style.top = `${elY}px`;

    tip.style.left = `${tipX}px`;
    tip.style.top = `${tipY}px`;
    this.setPrefixedCss(tip, 'transform', `scale(1,${tipScaleY})`);

    return this;
  }

  create() {
    if (this.element) {
      return this;
    }

    this.element = document.createElement('div');
    this.tip = document.createElement('div');

    return this;
  }

  showContent(content) {
    this.currentContent = content;
    if (typeof content == 'string') {
      this.element.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      this.element.appendChild(content);
      content.style.display = 'block';
    } else {
      this.element.innerHTML = ''; // clear
    }
  }

  setPrefixedCss = (target, name, value) => {
    const n = name[0].toUpperCase() + name.substr(1);
    const style = target.style;
    style[name] = value;
    style[`webkit${n}`] = style[`Moz${n}`] = style[`ms${n}`] = style[`O${n}`] = value;
  };
}
