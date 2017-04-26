var assert = chai.assert;
describe('Input', () => {

  describe('a', () => {
    it(' should equal to object', (done) => {
      var form = createForm('<input name="a" value="b">');
      form.beforeStringify = function(d) {
        assert.deepEqual(d, {a: "b"});
        form.remove();
        done();
      }
      form.submit();
    })
  })

  describe('a.', () => {
    it(' should equal to array', (done) => {
      var form = createForm('<input name="a." value="b">');
      form.beforeStringify = function(d) {
        assert.deepEqual(d, {a: ["b"]});
        form.remove();
        done();
      }
      form.submit();
    })
  })

  describe('a.b', () => {
    it(' should equal to an nested object', (done) => {
      var form = createForm('<input name="a.b" value="c">');
      form.beforeStringify = function(d) {
        assert.deepEqual(d, {a: {b: "c"}});
        form.remove();
        done();
      }
      form.submit();
    })
  })

  describe('a.NUNBER.b', () => {
    it(' should equal to an complex array', (done) => {
      var form = createForm(`
        <input name="a.1.a" value="a1a" />
        <input name="a.6.a" value="a6a" />
        <input name="a.6.b" value="a6b" />
        `);
      form.beforeStringify = function(d) {
        assert.deepEqual(d, {
          a: [
            {
              a: 'a1a',
            },
            {
              a: 'a6a',
              b: 'a6b'
            }
          ]
        });
        form.remove();
        done();
      }
      form.submit();
    })
  })
})
