var assert = chai.assert;
describe('Type', () => {

  describe(':string', () => {
    it(' should equal to string', (done) => {
      var form = createForm('<input name="a" value="b">');
      form.beforeStringify = function(d) {
        assert.strictEqual(d.a, "b");
        form.remove();
        done();
      }
      form.submit();
    })
  })

  describe(':bool', () => {
    it(' should equal to true', (done) => {
      var form = createForm('<input name="a:bool" value="true">');
      form.beforeStringify = (d) => {
        assert.strictEqual(d.a, true);
        form.remove();
        done();
      }
      form.submit();
    })
    it(' should equal to false', (done) => {
      var form = createForm('<input name="a:bool" value="false">');
      form.beforeStringify = (d) => {
        assert.strictEqual(d.a, false);
        form.remove();
        done();
      }
      form.submit();
    })
    it(' should equal to false', (done) => {
      var form = createForm('<input name="a:bool" value="0">');
      form.beforeStringify = (d) => {
        assert.strictEqual(d.a, false);
        form.remove();
        done();
      }
      form.submit();
    })
    it(' should equal to true', (done) => {
      var form = createForm('<input name="a:bool" value="1">');
      form.beforeStringify = (d) => {
        assert.strictEqual(d.a, true);
        form.remove();
        done();
      }
      form.submit();
    })
  })

  describe(':number', () => {
    it(' should equal to 10', (done) => {
      var form = createForm('<input name="a:number" value="10">');
      form.beforeStringify = function(d) {
        assert.strictEqual(d.a, 10)
        form.remove();
        done();
      }
      form.submit();
    })
    it(' should equal to 0.1', (done) => {
      var form = createForm('<input name="a:number" value="0.1">');
      form.beforeStringify = function(d) {
        assert.strictEqual(d.a, 0.1)
        form.remove();
        done();
      }
      form.submit();
    })
  })

  describe(':object', () => {
    it(' should equal to object', (done) => {
      var form = createForm(`<input name="a:object" value='{"a":"a"}'>`);
      form.beforeStringify = function(d) {
        assert.deepEqual(d, {a: {a :'a'}});
        form.remove();
        done();
      }
      form.submit();
    })
  })

  describe(':timestamp', () => {
    it(' should equal to timestamp', (done) => {
      var form = createForm(`<input name="a:timestamp" value='2000-01-01'>`);
      form.beforeStringify = function(d) {
        assert.strictEqual(d.a, 946684800000);
        form.remove();
        done();
      }
      form.submit();
    })
  })

  describe(':custom', () => {
    it(' should equal to ISOString', (done) => {

      HTMLFormJSONElement.registerType('ISOString', function (value) {
        return new Date(value).toISOString();
      })

      var form = createForm(`<input name="a:ISOString" value='Fri, 31 Mar 2017 07:00:00'>`);
      form.beforeStringify = function(d) {
        assert.strictEqual(d.a, '2017-03-30T23:00:00.000Z');
        form.remove();
        done();
      }
      form.submit();
    })
  })

})
