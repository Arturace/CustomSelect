"use strict";
/**
 * MIT License
 *
 * Copyright (c) 2019 Artur Madjidov
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
class CustomSelect extends HTMLElement {
    constructor() {
        super();
        this._value = null;
        this._selectedValueString = '{{selectedValue}}';
        this._selectedValueRegex = new RegExp(this._selectedValueString, 'i');
        this._contentString = '{{content}}';
        this._contentRegex = new RegExp(this._contentString, 'i');
        /* #region  Template Management */
        this.optionTemplate = new SettableTempalte();
        this.labelTemplate = new SettableTempalte();
        this.attachShadow({ mode: 'open' });
        let style = document.createElement('style');
        style.innerHTML = `
         :host {
            --arrow-height: 4px;
            --arrow-width: 8px;
            --bg: white;
            --hover-bg: aqua;
            --selected-bg: orange;
            --min-width: 130px;

            all: initial;
            display: inline-block;
            // contain: content;
            position: relative;
            overflow: visible;
            min-width: var(--min-width);
         }

         :host > * {
            width: 100%;
         }

         :host > *:not(ul):not(style)  {
            display: block;
         }

         /*:host([building]) > ul { display: none; }*/
         ul {
            list-style: none;
            margin: 0;
            padding: 0;
            display: none;
            position: absolute;
            top: 100%;
            background-color: var(--bg);
            box-sizing: border-box;
            border: 1px solid black;
         }

         ul[open] {
            display: flex;
            flex-direction: column;
         }

         ul > li {
            background-color: var(--bg);
            transition-property: background-color;
            transition-duration: 50ms;
            transition-timing-function: ease-in-out;
         }
         ul > li[selected] {
            background-color: var(--selected-bg);
         }
         ul > li:hover {
            background-color: var(--hover-bg);
         }

         .default-button {
            // background: none;
            // border: none;
            padding-right: calc(var(--arrow-width) * 2);
            position: relative;
            text-align: left;
         }

         .default-button:after {
            position: absolute;
            right: calc(var(--arrow-width) / 2);
            top: calc(50% - var(--arrow-height) / 2);
            content: '';
            border-left: calc(var(--arrow-width) / 2) solid transparent;
            border-right: calc(var(--arrow-width) / 2) solid transparent;
            border-top: var(--arrow-height) solid #2f2f2f;
            font-size: 0;
            line-height: 0;
         }
      `;
        this.shadowRoot.appendChild(style);
        this.list = document.createElement('ul');
        this.shadowRoot.appendChild(this.list);
        //The timeout is responsable for looking for options inside
        setTimeout(() => {
            this.render();
        });
    }
    _generateLi(content, value) {
        let result = document.createElement('li');
        result.innerHTML = this.optionTemplate.templateString.replace(this._contentRegex, content);
        result.addEventListener('click', () => this.value = value);
        return result;
    }
    _getTemplateFromAttribute(attrName) {
        let templateId;
        templateId = this.getAttribute(attrName);
        if (templateId != null && templateId.trim() !== '') {
            let potentialTempalteEl = document.getElementById(templateId);
            if (potentialTempalteEl) {
                return potentialTempalteEl.innerHTML.trim();
            }
            else {
                console.log('Template element with the id "' + templateId + '" was not found');
                return null;
            }
        }
        else {
            console.log(attrName + ' was left empty');
            return null;
        }
    }
    render() {
        //Template for the label
        if (!(this.labelTemplate.templateString = this._getTemplateFromAttribute('label-template-id'))) {
            this.labelTemplate.templateString = '<button class="default-button">' + this._selectedValueString + '</button>';
        }
        this.label = this.labelTemplate.getHTMLElement(this._selectedValueRegex, 'No value selected');
        //emptying things
        this.options = [];
        while (this.list.firstChild) {
            this.list.removeChild(this.list.firstChild);
        }
        //Template for the option
        if (!(this.optionTemplate.templateString = this._getTemplateFromAttribute('option-template-id'))) {
            this.optionTemplate.templateString = '{{content}}';
        }
        for (let a = 0; a < this.children.length; a++) {
            if (this.children[a] instanceof HTMLOptionElement) {
                this.options.push(this.children[a]);
                this.list.append(this._generateLi(this.options[a].innerHTML, this.options[a].value));
            }
            else {
                console.warn('A non option child was found. It will be ignored');
            }
        }
    }
    set label(newLabel) {
        if (this._label) {
            this.shadowRoot.removeChild(this._label);
        }
        this._label = newLabel;
        this._label.addEventListener('click', () => this.list.hasAttribute('open') ? this.close() : this.open());
        this.shadowRoot.appendChild(this._label);
    }
    /* #region  Visual toggles */
    open() {
        this.list.setAttribute('open', 'open');
    }
    close() {
        this.list.removeAttribute('open');
    }
    /* #endregion */
    get value() {
        return this._value;
    }
    set value(newValue) {
        for (let a = 0; a < this.options.length; a++) {
            if (this.options[a].value == newValue) {
                this.list.children[a].setAttribute('selected', 'selected');
                this._value = newValue;
                this.label = this.labelTemplate.getHTMLElement(this._selectedValueRegex, this.options[a].text);
            }
            else {
                this.list.children[a].removeAttribute('selected');
            }
        }
        this.close();
    }
}
customElements.define('custom-select', CustomSelect); //, { extends: 'select' }  
