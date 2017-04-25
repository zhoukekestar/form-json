import test from 'ava';

const fs = require('fs');
const path = require('path');
console.log(window)
window.eval(fs.readFileSync(path.join(__dirname, '../src/form-json.js')));

test('Insert to DOM', t => {
  var form = document.createElement('form');
  form.setAttribute('enctype', 'application/form-json');
  form.innerHTML = '<input name="a" value="b">';
  document.body.appendChild(form);
  form.onsuccess = function (d) {
    console.log(d);
  }
  form.submit();

});
