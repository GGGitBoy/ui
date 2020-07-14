import Controller from '@ember/controller';
import { get, set, observer } from '@ember/object';
import { inject as service } from '@ember/service';
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

  init() {
    this._super(...arguments);
  },

  actions: {
    validate() {
      console.log(get(this, 'model.provider'))
      console.log(get(this, 'model.code'))
      // var providerType = get(this, 'model.provider')
      var providerType = get(this, 'model.provider')
      var code = get(this, 'model.code')

      if ( code ) {
        var captcha  = get(this, 'captcha')

        console.log(captcha)

        if ( providerType === 'local') {
          code = JSON.parse(get(this, 'model.code'))
          get(this, 'access').login(get(this, 'model.provider'), code, captcha).then((user) => {
            console.log(user)
            get(this, 'router').replaceWith('authenticated');
          }).catch((err) => {
            console.log(err)

            if (err.loginCooldown) {
              set(this, 'loginCooldown', parseInt(err.loginCooldown, 10));
            }
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
          })
        }
      }
    },
  },

  startCountdown: observer('loginCooldown', function() {
    console.log('jiandao-startCountdown')
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

  willDestroyElement() {
    this.stopCountdown();
  },

  stopCountdown() {
    const timer = get(this, 'cooldownTimer');

    if (timer) {
      clearInterval(timer);
      set(this, 'cooldownTimer', null);
    }
  },

});
