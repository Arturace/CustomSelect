"use strict";
class SettableTempalte {
    constructor() {
        this._templatestring = null;
        this._templateId = null;
        this._setFromElement = false;
    }
    getHTMLElement(toReplace, replaceWith) {
        let templateEl;
        // if (this._setFromElement && (templateEl = document.getElementById(this._templateId) as HTMLTemplateElement)) {
        //    return templateEl.content.firstChild;
        // } else {
        //    templateEl= document.createElement('template');
        //    templateEl.innerHTML = this.templateString.replace(toReplace, replaceWith);
        //    return templateEl.content.firstChild;
        // }
        templateEl = document.createElement('template');
        let newHTML = this.templateString.replace(toReplace, replaceWith);
        if (templateEl.innerHTML === newHTML) {
            console.warn('Template did not contain the following regex "' + toReplace + '"');
        }
        templateEl.innerHTML = newHTML;
        return templateEl.content.children[0];
    }
    get templateString() {
        return this._templatestring;
    }
    /* #region  Template Setters */
    set templateString(newTemplate) {
        this._setFromElement = false;
        this._templatestring = newTemplate != null && newTemplate.trim() !== '' ? newTemplate : '{{content}}';
        ;
    }
    setTemplateWElement(template) {
        if (template) {
            this._setFromElement = true;
            this.templateString = template.innerHTML.trim();
        }
        else {
            throw 'template element was empty';
        }
    }
    setTemplateWId(id) {
        this._templateId = id;
        this.setTemplateWElement(document.getElementById(id));
    }
}
