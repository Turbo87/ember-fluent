import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

export default class THelper extends Helper {
  @service fluent;

  compute([id], args) {
    return this.fluent.t(id, { html: true, args });
  }
}
