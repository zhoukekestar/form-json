describe('Input', () => {

  describe('a', () => {
    it(' should equal to object', () => {
      var form = createForm('<input name="a" value="b">');
      form.beforeStringify = function(d) {
        d.a.should.equal("b");
      }
      form.submit();
    })
  })

  describe('a.', () => {
    it(' should equal to array', () => {
      var form = createForm('<input name="a." value="b">');
      form.beforeStringify = function(d) {
        d.a[0].should.equal("b");
        d.a.length.should.equal(1);
      }
      form.submit();
    })
  })

  describe('a.b', () => {
    it(' should equal to an nested object', () => {
      var form = createForm('<input name="a.b" value="c">');
      form.beforeStringify = function(d) {
        d.a.b.should.equal("c");
      }
      form.submit();
    })
  })

  describe('a.NUNBER.b', () => {
    it(' should equal to an complex array', () => {
      var form = createForm(`
        <input name="a.1.a" value="a1a" />
        <input name="a.6.a" value="a6a" />
        <input name="a.6.b" value="a6b" />
        `);
      form.beforeStringify = function(d) {
        d.a.length.should.equal(2);
        d.a[0].a.should.equal('a1a');
        d.a[1].a.should.equal('a6a');
        d.a[1].b.should.equal('a6b');
      }
      form.submit();
    })
  })
})
