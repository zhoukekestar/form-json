# form-json
A ajax submiter with json for form. This project is based on [modules/formJSON](https://github.com/zhoukekestar/modules/tree/master/src/formJSON). Online [mocha test](https://zhoukekestar.github.io/form-json/test/index.html).

# Quick Start
Import `form-json.js`, and set your form enctype to `application/form-json`. That's all what you need to do.
```html
<script src='form-json.js'></script>
<form action="/server" method="post" enctype="application/form-json">
  <input name="key" value="value">
  <input type="submit">
</form>
```

# Input Syntax
[Try it Online!](https://zhoukekestar.github.io/form-json/public/input-syntax.html)

| syntax | input | output |
| -- | -- | -- |
| `a` | `<input name="a" value="a" />` | { "a": "c" } |
| `a.` | `<input name="a." value="a." />` | {<br>&nbsp;&nbsp;"a": [<br>&nbsp;&nbsp;&nbsp;&nbsp;"a."<br>&nbsp;&nbsp;]<br>} |
| `a.b` | `<input name="a.b" value="c" />` | {<br>&nbsp;&nbsp;"a": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"b": "c"<br>&nbsp;&nbsp;}<br>} |
| `a.NUMBER.b` | `<input name="a.1.a" value="a1a" />` <br> `<input name="a.6.a" value="a6a" />` <br> `<input name="a.6.b" value="a6b" />` | {<br>&nbsp;&nbsp;"a": [<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"b": "a1a"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"a": "a6a",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"b": "a6b",<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;]<br>} |

# Type Syntax
[Try it Online!](https://zhoukekestar.github.io/form-json/public/type-syntax.html)

| syntax | input | output |
| -- | -- | -- |
| `:string` | `<input name="a" value="b" />` | { "a": "b" } |
| `:bool` | `<input name="a:bool" value="true" />` | { "a": true } |
| `:number` | `<input name="a:number" value="10" />` | { "a": 10 } |
| `:object` | `<input name="a:object" value='{"key": "value"}' />` | {<br>&nbsp;&nbsp;"a": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"key": "value"<br>&nbsp;&nbsp;}<br>} |
| `:timestamp` | `<input name="a:timestamp" value="2000-01-01" />` | { "a": 946684800000 } |

You can register a custom type parser to FormJSON for your data. Example:

```html
<form action="/server" method="post" enctype="application/form-json">
  <input name='date:ISOString' value='Fri, 31 Mar 2017 07:00:00' />
  <input type='submit' />
</form>

<script>
  HTMLFormJSONElement.registerType('ISOString', function (value) {
    return new Date(value).toISOString();
  })
  // output will be:
  // {
  //   "a": "2017-03-30T23:00:00.000Z"
  // }
</script>
```

# Form Methods (refer to jQuery.ajax)
* `beforeSend(xhr)`
* `beforeStringify(data)`
* `dataFilter(data)`
* `onsuccess(data, textStatus, xhr)` OR `success` event which include infomation in `e.detail`
* `onerror(xhr, textStatus, errorThrown)` OR `error` event which include infomation in `e.detail`
* `oncomplete(xhr, textStatus)` OR `complete` event which include infomation in `e.detail`

Example, [Try it online](https://zhoukekestar.github.io/form-json/public/methods.html):
```html
<form enctype="application/form-json" method="post">
  <input name='a' value='b' />
</form>

<script>
  var form = document.querySelector('form');

  form.beforeSend = function (xhr) {
    xhr.setRequestHeader('X-Requested-With', 'form-json');
  }

  form.beforeStringify = function (data) {
    data.beforeStringify = true;
    return data;
  }
  /**
   * POST data:
   * {
   *  "a": "b",
   *  "beforeStringify": true
   * }
   */
  form.onsuccess = function (data) {
    console.log('response:' + JSON.stringify(data));
  }
</script>
```

# Form Attributes
* [Try it online!](https://zhoukekestar.github.io/form-json/public/attributes.html)
* `number2array="true|false"`, default: true.
* `orderby="number|element"`, default: `number`. Attention: `number2array` must be `true`, otherwise it doesn't work.

# Form-json in Form

Yes, you can have an embed form-json in `form` like this:

```html
<form id='form1' method='POST' action='https://httpbin.org/post' enctype='application/form-json'>
  <div id='form2' action='https://httpbin.org/get' enctype='application/form-json'>
    <input name='embed' value='true'>
  </div>
  <input name='key' value='value'>
</form>
<button onclick='submit1()'>submit outter form</button>
<button onclick='submit2()'>submit inner form</button>
<script>
  window.submit1 = function () {
    form1.submit();
    form1.dispatchEvent(new CustomEvent('submit', { bubbles: true }));
  }
  window.submit2 = function () {
    form2.dispatchEvent(new CustomEvent('form-json-submit', { bubbles: true }));
  }
</script>
```

# Browser compatibility
`form-json.js` is support most modern browsers include `IE 10+, Android 3.0+, iOS 5.1+` as [`XMLHttpRequest`](http://caniuse.com/#feat=xhr2) is required.


# FQA
* Q: What we don't support ?
  * Do not support fill null in array.
    ```html
    <input name="a.0" value="0">
    <input name="a.3" value="3">
    ```

    ```json
    // We won't output:
    {
      "a": [
        "0", null, null, "3"
      ]
    }
    // but output this:
    {
      "a": [
        "0", "3"
      ]
    }
    ```
  * Do not support too complex syntax. I will keep syntax as simple as possible.
* Q: Why you write another form-json ? <br> A: I want simple syntax and easy to use module. Of course, it should be tiny size.
