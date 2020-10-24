import Ember from 'ember';
import Service from '@ember/service';
import { htmlSafe, isHTMLSafe } from '@ember/template';
import { tracked } from '@glimmer/tracking';

import { FluentBundle, FluentResource } from "@fluent/bundle";
import fetch from 'fetch';

const { escapeExpression } = Ember.Handlebars.Utils;

export default class FluentService extends Service {
  #bundles = new Map();

  @tracked locale;

  async addResourceFromUrl(locale, url) {
    let response = await fetch(url);
    if (!response.ok) {
      let error = new Error(`Failed to load translations from ${url}`);
      error.response = response;
      throw error
    }

    let content = await response.text();
    this.addResource(locale, content);
  }

  addResource(locale, content) {
    let bundle = this.#bundles.get(locale);
    if (!bundle) {
      bundle = new FluentBundle(locale);
      this.#bundles.set(locale, bundle);
    }

    let resource = new FluentResource(content);
    let errors = bundle.addResource(resource, { allowOverrides: true });
    for (let error of errors) {
      this.onError(error);
    }
  }

  t(id, { html = false, args = {} } = {}) {
    try {
      return this._t(id, { html, args });
    } catch (error) {
      this.onError(error);
    }
  }

  _t(id, { html, args }) {
    let locale = this.locale;
    if (!locale) {
      throw new Error(`ember-fluent: Locale not set`);
    }

    let bundle = this.#bundles.get(locale);
    if (!bundle) {
      throw new Error(`ember-fluent: Bundle for locale ${locale} not found`);
    }

    let message = bundle.getMessage(id);
    if (message.value) {
      if (args) {
        args = escapeArgs(args);
      }

      let formatted = bundle.formatPattern(message.value, args);
      return html ? htmlSafe(formatted) : formatted;
    }
  }

  onError(error) {
    console.error(error);
  }
}

function escapeArgs(args) {
  const escapedArgs = {};

  let keys = Object.keys(args);
  for (let key of keys) {
    let value = args[key];

    if (isHTMLSafe(value)) {
      // If the option is an instance of Ember SafeString,
      // we don't want to pass it into the formatter, since the
      // formatter won't know what to do with it. Instead, we cast
      // the SafeString to a regular string using `toHTML`.
      // Since it was already marked as safe we should *not* escape it.
      escapedArgs[key] = value.toHTML();
    } else if (typeof value === 'string') {
      escapedArgs[key] = escapeExpression(value);
    } else {
      escapedArgs[key] = value; // copy as-is
    }
  }

  return escapedArgs;
}
