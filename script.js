<script>
(function () {
  var $ = function (id) { return document.getElementById(id); };

  var form = $('form');
  var f = {
    name: $('name'),
    email: $('email'),
    business: $('business'),
    password: $('password'),
    terms: $('terms')
  };

  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var defaultPwMsg = 'Use 10 or more characters with a mix of letters and numbers.';

  function wrap(key) {
    return document.querySelector('[data-field="' + key + '"]');
  }

  // Password strength: 0 (empty) to 4
  function score(v) {
    var s = 0;
    if (v.length >= 10) s++;
    if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++;
    if (/\d/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v) || v.length >= 16) s++;
    return v ? Math.max(1, s) : 0;
  }

  // Each rule returns an error message, or '' when the value is valid
  var rules = {
    name: function (v) {
      return v.trim().length < 2 ? 'Enter your full name.' : '';
    },
    email: function (v) {
      if (!v.trim()) return 'Enter your work email.';
      return emailRe.test(v.trim()) ? '' : 'Enter a valid email, like name@studio.com.';
    },
    password: function (v) {
      if (v.length < 10) return 'Password needs at least 10 characters.';
      return score(v) < 2 ? 'Add numbers or capital letters to make it stronger.' : '';
    },
    terms: function () {
      return f.terms.checked ? '' : 'Accept the terms to create your account.';
    }
  };

  // Validate one field; when show is true, update the UI
  function validate(key, show) {
    var err = rules[key](key === 'terms' ? '' : f[key].value);
    if (show) {
      var w = wrap(key), msg = $(key + '-msg');
      w.classList.toggle('bad', !!err);
      w.classList.toggle('good', !err && key !== 'terms');
      f[key].setAttribute('aria-invalid', err ? 'true' : 'false');
      if (msg) {
        msg.textContent = err;
        if (!err && key === 'password') {
          msg.textContent = score(f.password.value) < 3
            ? 'Good. Add a symbol or more length for a stronger password.'
            : 'Strong enough.';
        }
      }
    }
    return err;
  }

  // Validate when leaving a field, then re-check as the user fixes it
  ['name', 'email', 'password'].forEach(function (k) {
    f[k].addEventListener('blur', function () {
      if (f[k].value || wrap(k).classList.contains('bad')) validate(k, true);
    });
    f[k].addEventListener('input', function () {
      if (wrap(k).classList.contains('bad')) validate(k, true);
    });
  });

  f.terms.addEventListener('change', function () {
    if (wrap('terms').classList.contains('bad')) validate('terms', true);
  });

  // Password strength meter
  f.password.addEventListener('input', function () {
    var meter = $('meter');
    if (meter) meter.setAttribute('data-s', score(f.password.value));
    if (!f.password.value && $('password-msg')) $('password-msg').textContent = defaultPwMsg;
  });

  // Show / hide password
  var toggle = $('toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var show = f.password.type === 'password';
      f.password.type = show ? 'text' : 'password';
      toggle.textContent = show ? 'Hide' : 'Show';
      toggle.setAttribute('aria-pressed', show);
      toggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
  }

  // Live invoice preview (optional)
  var pvName = $('pvName'), pvEmail = $('pvEmail');
  function syncPreview() {
    if (pvName) pvName.textContent = f.business.value.trim() || f.name.value.trim() || 'Your name';
    if (pvEmail) pvEmail.textContent = f.email.value.trim() || 'you@studio.com';
  }
  if (pvName || pvEmail) {
    ['name', 'email', 'business'].forEach(function (k) {
      f[k].addEventListener('input', syncPreview);
    });
  }

  // Submit
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var firstInvalid = null;
    ['name', 'email', 'password', 'terms'].forEach(function (k) {
      if (validate(k, true) && !firstInvalid) firstInvalid = f[k];
    });
    if (firstInvalid) { firstInvalid.focus(); return; }

    var btn = $('submit');
    btn.disabled = true;
    btn.textContent = 'Creating account…';

    var payload = {
      name: f.name.value.trim(),
      email: f.email.value.trim(),
      business: f.business.value.trim(),
      password: f.password.value
    };

    // Replace this block with your real sign-up request:
    // fetch('/api/register', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload)
    // })
    //   .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
    //   .then(showSuccess)
    //   .catch(showError);
    setTimeout(showSuccess, 900); // demo only

    function showSuccess() {
      var formView = $('formView'), doneView = $('doneView');
      if (formView && doneView) {
        $('doneEmail').textContent = payload.email;
        formView.hidden = true;
        doneView.hidden = false;
        $('doneTitle').focus();
      }
      btn.disabled = false;
      btn.textContent = 'Create account';
    }

    function showError() {
      btn.disabled = false;
      btn.textContent = 'Create account';
      var msg = $('email-msg');
      wrap('email').classList.add('bad');
      if (msg) msg.textContent = 'We couldn’t create your account. Check your connection and try again.';
    }
  });

  // "Use a different email" button on the success screen (optional)
  var back = $('back');
  if (back) {
    back.addEventListener('click', function () {
      $('doneView').hidden = true;
      $('formView').hidden = false;
      f.email.focus();
    });
  }
})();
</script>
