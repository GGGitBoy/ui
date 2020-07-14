import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { /* , set */ } from '@ember/object';

export default Route.extend({
  session:     service(),
  scope:       service(),
  globalStore: service(),

  model(params, transition) {
    console.log(transition.to.queryParams)
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
