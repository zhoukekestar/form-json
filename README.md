# form-json
A ajax submiter with json for form. This project is based on [modules/formJSON](https://github.com/zhoukekestar/modules/tree/master/src/formJSON).

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

| syntax | input | output |
| -- | -- | -- |
| `a` | `<input name="a" value="c" />` | { a: "c" } |
| `a.` | `<input name="a." value="c" />` | { a: ["c"] } |
| `a.b` | `<input name="a.b" value="c" />` | { a: { b: "c" } } |
| `a.NUMBER.b` | `<input name="a.1.a" value="a1a" />` <br> `<input name="a.6.a" value="a6a" />` <br> `<input name="a.6.b" value="a6b" />` | { a: [<br>&nbsp;&nbsp;{a: "a1a"},<br>&nbsp;&nbsp;{a: "a6a", b: "a6b"}<br>]} |

# Type Syntax
| syntax | input | output |
| -- | -- | -- |
| `:string` | `<input name="a" value="b" />` | { a: "b" } |
| `:bool` OR `:boolean` | `<input name="a:bool" value="true" />` | { a: true } |
| `:number` | `<input name="a:number" value="10" />` | { a: 10 } |
| `:object` | `<input name="a:object" value='{"key": "value"}' />` | { a: { key: "value"}} |
| `:timestamp` | `<input name="a:timestamp" value="2000-01-01" />` | { a: 946684800000 } |

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
  // We will post
  // { "date": "2017-03-30T23:00:00.000Z" }
  // to server after submitting form.
</script>
```

# Form Methods (refer to jQuery.ajax)
* `beforeSend(xhr)`
*  `beforeStringify(data)`
* `dataFilter(data)`
* `onsuccess(data, textStatus, xhr)` OR `success` event which include infomation in `e.detail`
* `onerror(xhr, textStatus, errorThrown)` OR `error` event which include infomation in `e.detail`
* `oncomplete(xhr, textStatus)` OR `complete` event which include infomation in `e.detail`

# Form Attributes

* `number2array="true|false"`, default: true.

  ```html
  // number2array is true
  <form>
    <input name='a.2.b' value="a2b">
  </form>
  // output
  {
    a: [
      {
        b: 'a2b'
      }
    ]
  }

  // number2array is false
  <form number2array='false'>
    <input name='a.2.b' value="a2b">
  </form>
  // output
  {
    a: {
      2: {
        b: 'a2b'
      }
    }
  }
  ```
* `orderby="number|element"`, default: `number`. Attention: `number2array` must be `true`, otherwise it doesn't work.

  ```html
  // orderby number
  <form>
    <input name='a.3.b' value="a3b">
    <input name='a.2.b' value="a2b">
  </form>
  // output
  {
    a: [
      {
        b: 'a2b'
      },
      {
        b: 'a3b'
      }
    ]
  }

  // orderby element
  <form orderby='element'>
    <input name='a.3.b' value="a3b">
    <input name='a.2.b' value="a2b">
  </form>
  // output
  {
    a: [
      {
        b: 'a3b'
      },
      {
        b: 'a2b'
      }
    ]
  }
  ```


# FQA
* What we don't support ?
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
