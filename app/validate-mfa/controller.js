import Controller from '@ember/controller';
import { get, set, observer, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { addQueryParams } from 'shared/utils/util';
import C from 'shared/utils/constants';

export default Controller.extend({
  modal:          service(),
  globalStore:    service(),
  router:         service(),
  access:         service(),
  captcha:        null,
  userID:         null,
  mfaToken:       null,
  loginCooldown:  null,
  countdown:      null,
  cooldownTimer:  null,
  waiting:        null,
  serverErrors:   null,

  actions: {
    validate() {
      var providerType = get(this, 'model.provider')
      var code = get(this, 'model.code')

      if ( code ) {
        var captcha  = get(this, 'captcha')

        if ( providerType === 'local') {
          code = JSON.parse(get(this, 'model.code'))
          get(this, 'access').login(get(this, 'model.provider'), code, captcha).then(() => {
            get(this, 'router').replaceWith('authenticated');
          }).catch((err) => {
            if (err.loginCooldown) {
              set(this, 'loginCooldown', parseInt(err.loginCooldown, 10));
            }

            set(this, 'serverErrors', [err.message]);
          });
        } else {
          const currentProvider = get(this, 'access.providers').findBy('id', providerType);

          currentProvider.doAction('login', {
            code,
            responseType: 'cookie',
            description:  C.SESSION.DESCRIPTION,
            ttl:          C.SESSION.TTL,
            captcha,
          }).then(() => {
            get(this, 'router').replaceWith('authenticated');
          }).catch(() => {
            const authRedirect = get(currentProvider, 'redirectUrl');
            let   redirect     = `${ window.location.origin }/validate-mfa?provider=${ providerType }`;

            let url = addQueryParams(authRedirect, {
              scope:          'read:org',
              state:          this.generateLoginStateKey(providerType),
              redirect_uri:   redirect,
            });

            window.location.href = url;
          });
        }
      } else {
        set(this, 'serverErrors', ['please login first']);
      }
    },
  },

  startCountdown: observer('loginCooldown', function() {
    set(this, 'countdown', get(this, 'loginCooldown') || 0);
    this.stopCountdown();
    const countdown = () => {
      const cooldownTime = parseInt(get(this, 'countdown'), 10);

      if (cooldownTime) {
        set(this, 'countdown', cooldownTime - 1);
      } else {
        this.stopCountdown();
      }
    };
    const timer = setInterval(countdown, 1000)

    set(this, 'cooldownTimer', timer);
  }),

  errors: computed('serverErrors.[]', function() {
    let out = get(this, 'serverErrors') || [];

    return out;
  }),

  stopCountdown() {
    const timer = get(this, 'cooldownTimer');

    if (timer) {
      clearInterval(timer);
      set(this, 'cooldownTimer', null);
    }
  },

  generateLoginStateKey(authType) {
    return set(this, 'session.oauthState', `${ Math.random() }login${ authType }`)
  },
});
