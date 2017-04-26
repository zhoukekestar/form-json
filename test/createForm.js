window.createForm = (inputs) => {
  var form = document.createElement('form');
  form.style.display = 'none';
  form.setAttribute('enctype', 'application/form-json');
  form.innerHTML = inputs;
  document.body.appendChild(form);

  form.beforeSend = function (xhr) {
    xhr.send = () => {}
  }
  return form;
}
