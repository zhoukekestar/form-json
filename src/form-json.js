(function (global) {
  // polyfill for CustomEvent
  (!this.CustomEvent || typeof this.CustomEvent === "object") && (function() {
    // CustomEvent for browsers which don't natively support the Constructor method
    this.CustomEvent = function CustomEvent(type, eventInitDict) {
      var event;
      eventInitDict = eventInitDict || {bubbles: false, cancelable: false, detail: undefined};

      try {
        event = document.createEvent('CustomEvent');
        event.initCustomEvent(type, eventInitDict.bubbles, eventInitDict.cancelable, eventInitDict.detail);
      } catch (error) {
        // for browsers which don't support CustomEvent at all, we use a regular event instead
        event = document.createEvent('Event');
        event.initEvent(type, eventInitDict.bubbles, eventInitDict.cancelable);
        event.detail = eventInitDict.detail;
      }

      return event;
    };
  })();

  var empty = function () {};
  var nativeSubmit = HTMLFormElement.prototype.submit;
  /**
   * Type Parsers
   */
  var typeParsers = {
    object: function (v) {
      return JSON.parse(v);
    },
    number: function (v) {
      return Number(v);
    },
    timestamp: function (v) {
      var d = new Date(v);

      if (d.toString() === 'Invalid Date') {
        return '';
      }
      return d.getTime();
    },
    bool: function (v) {
      if (v === 'false' || v === '0') {
        return false;
      }
      return true;
    }
  };


  /**
   * Serialize form inputs to Array.
   * Code form Zepto.js @see https://github.com/madrobby/zepto/blob/master/src/form.js#files
   * @return {[type]} [description]
   */
  var serializeArray = function () {
    var name;
    var type;
    var result = [];
    var add = function (value) {
      if (value.forEach) return value.forEach(add);
      result.push({ name: name, value: value });
    };

    [].slice.apply(this.elements || this.querySelectorAll('input,select,textarea')).forEach(function (field) {
      type = field.type;
      name = field.name;
      if (name
        && field.nodeName.toLowerCase() !== 'fieldset'
        && !field.disabled
        && type !== 'submit'
        && type !== 'reset'
        && type !== 'button'
        && type !== 'file'
        && ((type !== 'radio' && type !== 'checkbox') || field.checked)
      ) {
        add(field.value);
      }
    });
    return result;
  };

  /**
   * stringify json for get
   * @param  {[JSON]} json
   * @return {[String]}
   */
  var stringifyJSONForGET = function (json) {
    var keys = Object.keys(json || {});
    var arr = [];
    var i = 0;

    for (; i < keys.length; i += 1) {
      if (typeof json[keys[i]] === 'string') {
        arr.push(encodeURIComponent(keys[i]) + '=' + encodeURIComponent(json[keys[i]]));
      } else {
        arr.push(encodeURIComponent(keys[i]) + '=' + encodeURIComponent(JSON.stringify(json[keys[i]])));
      }
    }

    return arr.join('&');
  };

  var isNotInMainDocumentBody = function (ele) {
    var body = ele;
    while (body.nodeName !== 'BODY') {
      body = body.parentNode;
    }
    return body !== document.body;
  };

    /**
   * Set obj's value by keys
   *
   * -------- Example -------
   * obj = {'a':'a'}, keys = ['b','bb'], value = 'b-value'  ===>
   * {
   *  'a': 'a',
   *  'b': {
   *    'bb': 'b-value'
   *   }
   * }
   *
   * @param  {[object]}           obj   The target you want to set.
   * @param  {[array]}            keys  The value's path.
   * @param  {[string, array...]} value Target's value.
   */
  var deepSet = function (obj, keys, value) {
    var curKey = keys[0];
    var o;

    if (keys.length === 1) {
      if (curKey === '') {
        obj.push(value);
      } else {
        obj[curKey] = value;
      }
      return;
    }

    if (keys.length > 1 && obj[curKey] === undefined) {
      obj[curKey] = keys[1] === '' ? [] : {};
    }

    o = obj[curKey];
    keys.shift();
    deepSet(o, keys, value);
  };

  /**
   * Find form.names index by keys & property.
   *
   * ------ Example ------
   * <input name='a.2.b' value='2'>
   * <input name='a.1.b' value='1'>
   * names: ['a.2.b', 'a.1.b']
   * keys: ['a', '2'], property: 'b' ==> 0
   * keys: ['a', '1'], property: 'b' ==> 1
   *
   * @param  {[Array]} names
   * @param  {[Array]} keys
   * @param  {[String]} property
   * @return {[Number]}
   */
  var findIndex = function (names, keys, property) {
    return names.findIndex(function (name) {
      return new RegExp('^' + keys.concat(property).join('\\.')).test(name);
    });
  };

  /**
   * Set object number as array index
   * @param  {[Element]} form
   * @param  {[Object]} obj   Request data which is the source
   * @param  {[String]} orderby  A flag could be element or number.
   * @param  {[Array]} keys
   * @param  {[Any]} value
   * @return {[Object]}      The final request data
   */
  var integerKeysAsArrayIndexes = function (form, obj, orderby, keys, value) {
    var allKeysIsInteger = true;
    var arr = [];
    var temp;
    var properties;

    keys = keys || [];
    value = value || obj;

    properties = Object.keys(value);

    // Sort by element
    if (orderby === 'element') {
      // Sort properties by the form.names
      properties.sort(function (a, b) {
        return findIndex(form.names, keys, a) > findIndex(form.names, keys, b);
      });
    }

    properties.forEach(function (property) {
      temp = keys.concat();

      // Check whether all keys is integer.
      if (isNaN(Number(property))) {
        allKeysIsInteger = false;
      } else {
        arr.push(value[property]);
      }
      temp.push(property);

      if ((typeof value[property] === 'object') && !Array.isArray(value[property])) {
        integerKeysAsArrayIndexes(form, obj, orderby, temp, value[property]);
      }
    });

    if (allKeysIsInteger) {
      if (keys.length === 0) {
        obj = arr;
      } else {
        deepSet(obj, keys, arr);
      }
    }
    return obj;
  };

  var fireEvent = function (form, xhr, type, data) {
    var formevent;
    var handler = form['on' + type]; // save current handler
    var detail = {
      textStatus: xhr.statusText,
      xhr: xhr
    };

    if (data) {
      detail.data = data;
    }

    formevent = new CustomEvent(type, {
      bubbles: true,
      detail: detail
    });

    // set to null to void trigger handler twice.
    form['on' + type] = null;
    form.dispatchEvent(formevent);
    form['on' + type] = handler;
  };

  /**
   * handler for form submit event.
   * @param  {[Event]} e       submit event
   * @param  {[Object]} options [description]
   * @param  {[String]} action  [description]
   */
  var submitHandler = function () {
    var form = this;

    // Attributes
    var method = (form.getAttribute('method') || 'GET').toUpperCase();
    var number2array = form.getAttribute('number2array') || 'true';
    var orderby = form.getAttribute('orderby') || 'number';
    var action = form.getAttribute('action') || location.href;

    // request data for AJAX
    var requestdata = {};
    var xhr = new XMLHttpRequest();
    var isAJAXSupportJson = true;

    // If request is running, just return before complete ajax.
    if (form.isrunning) {
      console.log('form-json is submiting, please wait.');
      return;
    }

    // All valid input names
    form.names = [];

    // Get all inputs, put its value to requestdata.
    serializeArray.call(form).forEach(function (t) {
      var keys = t.name.split('.');
      var lastkey = keys.length - 1;
      var typeindex = keys[lastkey].indexOf(':');
      var value = t.value;
      var type;

      // push all input name to form.names
      form.names.push(t.name);

      // Get type (default is string) & reset lastkey if type exist
      if (typeindex !== -1) {
        type = keys[lastkey].substr(typeindex + 1);
        keys[lastkey] = keys[lastkey].substr(0, typeindex);
      } else {
        type = 'string';
      }

      // Parse value by specified type
      if (typeParsers[type]) value = typeParsers[type](value);

      // Deep set requestdata value by input keys
      deepSet(requestdata, keys, value);
    });

    // number2array if true
    if (number2array === 'true') requestdata = integerKeysAsArrayIndexes(form, requestdata, orderby);


    // Call beforeStringify if exist
    if (global.HTMLFormJSONElement.beforeStringify) requestdata = global.HTMLFormJSONElement.beforeStringify(requestdata);
    if (form.beforeStringify) requestdata = form.beforeStringify(requestdata);

    // Stringify request data.
    if (method === 'GET') {
      requestdata = stringifyJSONForGET(requestdata);
    } else {
      requestdata = JSON.stringify(requestdata);
    }


    /**
     *
     * AJAX request
     *
     */
    if (method === 'GET') {
      action += action.indexOf('?') === -1 ? ('?' + requestdata) : ('&' + requestdata);
    }

    xhr.open(method, action, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    try {
      xhr.responseType = 'json';
    } catch (e) {
      isAJAXSupportJson = false;
    }


    xhr.onreadystatechange = function () {
      var data;
      if (xhr.readyState === 4) {
        form.isrunning = false;
        data = xhr.response;

        // If browser not support json as responseType
        if (!isAJAXSupportJson || typeof xhr.response === 'string') {
          try {
            data = JSON.parse(xhr.response);
          } catch (e) {
            data = null;
          }
        }

        // call dataFilter
        if (global.HTMLFormJSONElement.dataFilter) data = global.HTMLFormJSONElement.dataFilter(data);
        if (form.dataFilter) data = form.dataFilter(data);

        // SUCCESS
        if (xhr.status >= 200 && xhr.status < 300) {
          // call onsuccess
          if (form.onsuccess) {
            form.onsuccess(data, xhr.statusText, xhr);
          }
          // Dispatch success event
          fireEvent(form, xhr, 'success', data);

        // ERROR
        } else {
          // call onerror
          if (form.onerror) {
            form.onerror(xhr, xhr.statusText);
          }
          // Dispatch error event
          fireEvent(form, xhr, 'error', data);
        }

        // COMPLETE
        if (form.oncomplete) {
          form.oncomplete(xhr, xhr.statusText);
        }
        // Dispatch complete event
        fireEvent(form, xhr, 'complete', data);
      }
    };

    // set isrunning flag to true
    form.isrunning = true;

    // Call beforeSend
    if (global.HTMLFormJSONElement.beforeSend) global.HTMLFormJSONElement.beforeSend(xhr);
    if (form.beforeSend) form.beforeSend(xhr);

    if (method === 'GET') {
      xhr.send();
    } else {
      xhr.send(requestdata);
    }
  };


  /**
   * Add listener to document for form-json.
   * @param  {[Event]} e submit event
   */
  document.addEventListener('submit', function (e) {
    var target = e.target;
    if (target.getAttribute('enctype') === 'application/form-json') {
      e.preventDefault();
      e.stopPropagation();

      submitHandler.call(target);
    }
  });

  /**
   * A WARN message if error not handled by application.
   */
  document.addEventListener('error', function (e) {
    if (e.target.getAttribute('enctype') === 'application/form-json') {
      console.warn('form-json has an error which is not handled. ', e);
    }
  });


  /**
   * Submit hook
   */
  HTMLFormElement.prototype.submit = function () {
    var e;
    if (this.getAttribute('enctype') === 'application/form-json') {
      // Use form-json in Webcomponents
      if (isNotInMainDocumentBody(this)) {
        submitHandler.call(this);
      } else {
        e = new CustomEvent('submit', { bubbles: true });
        this.dispatchEvent(e);
      }
    } else {
      nativeSubmit.apply(this, arguments);
    }
  };

  global.HTMLFormJSONElement = global.HTMLFormJSONElement || {};
  global.HTMLFormJSONElement.registerType = function (type, parser) {
    typeParsers[type] = parser;
  };
}(window));
