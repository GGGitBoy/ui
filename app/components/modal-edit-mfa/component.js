import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import { get, set, computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Component.extend(ModalBase, {
  modal:       service(),
  globalStore: service(),
  secret:      null,
  qrcode:      null,
  captcha:     null,
  classNames:  ['medium-modal'],

  table:  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
    'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
    'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
    'Y', 'Z', '2', '3', '4', '5', '6', '7'],
  user:       alias('modalOpts.user'),

  init() {
    this._super(...arguments);
    this.setQrCode()
  },

  actions: {
    cancel() {
      get(this, 'modalService').toggleModal();
    },

    goBack() {
      get(this, 'modalService').toggleModal();
    },

    changeMfa() {
      var secret = get(this, 'secret')
      var captcha = get(this, 'captcha')

      get(this, 'globalStore').request({
        url:    '/v3/users?action=changemfa',
        method: 'POST',
        data:   {
          secret,
          captcha
        }
      }).then(() => {
        get(this, 'modalService').toggleModal();
      }).catch((err) => {
        get(this, 'modalService').toggleModal();
      });
    },

    reacquire() {
      this.setQrCode()
    }
  },

  saveDisabled: computed('captcha', function() {
    if ( get(this, 'captcha') ) {
      return false;
    }

    return true;
  }),

  // errors: computed('passwordsMatch', 'confirm', 'confirmBlurred', 'serverErrors.[]', function() {
  //   let out = get(this, 'serverErrors') || [];

  //   if ( get(this, 'confirmBlurred') && get(this, 'confirm') && !get(this, 'passwordsMatch') ) {
  //     out.push(get(this, 'intl').t('modalEditPassword.mismatch'));
  //   }

  //   return out;
  // }),

  setQrCode() {
    var secret = this.createSecret(32)
    var username = get(this, 'user.username')
    var qrcode = `otpauth://totp/${ username }?secret=${ secret }`

    set(this, 'secret', secret);
    set(this, 'qrcode', qrcode);
  },

  createSecret(length) {
    var table = get(this, 'table')
    var secret = '';

    for (var i = 0; i < length; i++){
      var id = parseInt(Math.random() * table.length);

      secret += table[id];
    }

    return secret
  },
});
