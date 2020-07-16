import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  session:     service(),
  scope:       service(),
  globalStore: service(),

  model(params, transition) {
    var mode = {
      provider: transition.to.queryParams.provider,
      code:     transition.to.queryParams.code,
    }

    return mode
  },

  activate() {
    $('BODY').addClass('container-farm'); // eslint-disable-line
  },

  deactivate() {
    $('BODY').removeClass('container-farm'); // eslint-disable-line
  },
});
