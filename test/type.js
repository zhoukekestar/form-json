describe('Type', () => {

  describe(':string', () => {
    it(' should equal to string', () => {
      var form = createForm('<input name="a" value="b">');
      form.beforeStringify = function(d) {
        d.a.should.equal("b");
      }
      form.submit();
    })
  })

  describe(':bool', () => {
    it(' should equal to true', () => {
      var form = createForm('<input name="a:bool" value="true">');
      form.beforeStringify = (d) => {
        d.a.should.equal(true);
      }
      form.submit();
    })
    it(' should equal to false', () => {
      var form = createForm('<input name="a:bool" value="false">');
      form.beforeStringify = (d) => {
        d.a.should.equal(false);
      }
      form.submit();
    })
    it(' should equal to false', () => {
      var form = createForm('<input name="a:bool" value="0">');
      form.beforeStringify = (d) => {
        d.a.should.equal(false);
      }
      form.submit();
    })
    it(' should equal to true', () => {
      var form = createForm('<input name="a:bool" value="1">');
      form.beforeStringify = (d) => {
        d.a.should.equal(true);
      }
      form.submit();
    })
  })

  describe(':number', () => {
    it(' should equal to 10', () => {
      var form = createForm('<input name="a:number" value="10">');
      form.beforeStringify = function(d) {
        d.a.should.equal(10)
      }
      form.submit();
    })
    it(' should equal to 0.1', () => {
      var form = createForm('<input name="a:number" value="0.1">');
      form.beforeStringify = function(d) {
        d.a.should.equal(0.1)
      }
      form.submit();
    })
  })

  describe(':object', () => {
    it(' should equal to object', () => {
      var form = createForm(`<input name="a:object" value='{"a":"a"}'>`);
      form.beforeStringify = function(d) {
        d.a.a.should.equal('a');
      }
      form.submit();
    })
  })

  describe(':timestamp', () => {
    it(' should equal to timestamp', () => {
      var form = createForm(`<input name="a:timestamp" value='2000-01-01'>`);
      form.beforeStringify = function(d) {
        d.a.should.equal(946684800000);
      }
      form.submit();
    })
  })

  describe(':custom', () => {
    it(' should equal to ISOString', () => {

      HTMLFormJSONElement.registerType('ISOString', function (value) {
        return new Date(value).toISOString();
      })

      var form = createForm(`<input name="a:ISOString" value='Fri, 31 Mar 2017 07:00:00'>`);
      form.beforeStringify = function(d) {
        d.a.should.equal('2017-03-30T23:00:00.000Z');
      }
      form.submit();
    })
  })

})
