"use strict";
class CustomSelectOld extends HTMLElement {
    constructor() {
        super();
        this.listItems = [];
        this.contents = [];
        this.values = [];
        this.templates = {
            content: null,
            show: null
        };
        this.attachShadow({ mode: 'open' });
        this.ul = null;
    }
    get placeholder() {
        return this.getAttribute('placeholder');
    }
    set Placeholder(newValue) {
        if (newValue === null) {
            this.removeAttribute('placeholder');
        }
        else {
            this.setAttribute('placeholder', newValue);
        }
    }
    get value() {
        return this.getAttribute('value');
    }
    set value(newValue) {
        if (newValue === null) {
            this.removeAttribute('value');
        }
        else {
            this.setAttribute('value', newValue);
        }
    }
    connectedCallback() {
        this.setAttribute('building', '');
        let style = document.createElement('style');
        style.innerHTML = `
      :host {
         all: initial;
         display: block;
         contain: content;
      }
      
      /*:host([building]) > ul { display: none; }*/
      ul {
         list-style: none;
         margin: 0;
         padding: 0;
         display: none;
         position: relative;
      }

      ul[open] {
         display: block;
      }

      `;
        this.shadowRoot.appendChild(style);
        setTimeout(() => {
            for (let a = 0; a < this.children.length; a++) {
                switch (this.children[a].nodeName.toLowerCase()) {
                    case 'ul':
                        this.ul = this.children[a];
                        for (let b = 0; b < this.ul.children.length; b++) {
                            let li = this.ul.children[b];
                            this.contents.push(li.innerHTML);
                            if (li.getAttribute('value')) {
                                this.values.push(li.getAttribute('value'));
                            }
                            else {
                                throw 'A list item had no value';
                            }
                            this.ul.removeChild(li);
                        }
                        break;
                    case 'template':
                        let template = this.children[a];
                        switch (template.getAttribute('for')) {
                            case 'shown':
                                this.templates.show = template.content.children[0];
                                break;
                            case 'content':
                            default:
                                this.templates.content = template.innerHTML.trim();
                                break;
                        }
                        break;
                }
            }
            this.render();
        });
    }
    adoptedCallback() {
        console.log('adoptedCallback', this.children.length, this.innerHTML);
    }
    render() {
        this.setAttribute('building', '');
        if (!this.ul) {
            this.ul = document.createElement('ul');
        }
        for (let a = 0; a < this.contents.length; a++) {
            let li = document.createElement('li');
            li.innerHTML = this.templates.content.replace(/{{content}}/g, this.contents[a]);
            if (this.values[a] == this.value) {
                li.classList.add('selected');
            }
            li.onclick = () => {
                this.value = this.values[a];
            };
            this.listItems.push(li);
            this.ul.appendChild(li);
        }
        console.log(this.templates.show);
        this.shownElement = document.importNode(this.templates.show, true);
        this.shownElement.innerHTML = this.shownElement.innerHTML.replace(/{{content}}/g, this.value);
        this.shadowRoot.appendChild(this.shownElement);
        this.shadowRoot.appendChild(this.ul);
        this.removeAttribute('building');
    }
    open() {
        this.ul.setAttribute('open', '');
    }
    close() {
        this.ul.removeAttribute('open');
    }
}
customElements.define('custom-select', CustomSelect); //, { extends: 'select' }
