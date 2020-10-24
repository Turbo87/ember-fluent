import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ApplicationController extends Controller {
  @service fluent;

  @tracked tabCount = 2;

  @action updateTabCount(event) {
    let { value } = event.target;
    this.tabCount = parseInt(value, 10);
  }

  @action async switchLocale(locale) {
    await this.fluent.addResourceFromUrl(locale, `/translations/${locale}.ftl`);
    this.fluent.locale = locale;
  }
}
