import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service fluent;

  async beforeModel() {
    await this.fluent.addResourceFromUrl('en-US', '/translations/en-US.ftl');
    this.fluent.locale = 'en-US';
  }
}
