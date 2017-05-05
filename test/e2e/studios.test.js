const request = require('./_request');
const db = require('./_db');
const assert = require('chai').assert;

describe('Studios API', () => {

  before(db.drop);

  it('GET / all studios', () => {
    return request.get('/api/studios')
      .then(res => {
        const studios = res.body;
        assert.deepEqual(studios, []);
      });
  });

  let paramount = {
    name: 'Paramount',
    address: {
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA'
    }
  };

  let laika = {
    name: 'Laika',
    address: {
      city: 'Portland',
      state: 'OR',
      country: 'USA'
    }
  };

  function saveStudio(studio) {
    return request.post('/api/studios')
      .send(studio)
      .then(res => res.body);
  }

  it('roundtrips a studio', () => {
    return saveStudio(paramount)
      .then(saved => {
        assert.ok(saved._id, 'saved has id');
        paramount = saved;
      })
      .then(() => {
        return request.get(`/api/studios/${paramount._id}`);
      })
      .then(res => res.body)
      .then(studio => {
        assert.deepEqual(studio, {
          _id: paramount._id,
          name: paramount.name,
          address: paramount.address,
          films: []
        });
      });
  });

  it('returns 404 if the studio does not exist', () => {
    const notId = '589d04a8b6695bbdfd3106f1';
    return request.get(`/api/studios/${notId}`)
      .then(() => { throw new Error('expected 404'); },
      res => {
        assert.equal(res.status, '404');
      });
  });

  it('returns list of all studios', () => {
    return saveStudio(laika)
      .then(saved => {
        assert.ok(saved._id, 'laika has id');
        laika = saved;
      })
      .then(() => request.get('/api/studios'))
      .then(res => res.body)
      .then(studios => {
        assert.equal(studios.length, 2);
        assert.include(studios, {
          _id: paramount._id,
          name: paramount.name
        });
        assert.include(studios, {
          _id: laika._id,
          name: laika.name
        });
      });
  });

  it('updates a studio', () => {
    laika.name = 'Stoopid Buddy';
    return request.put(`/api/studios/${laika._id}`)
      .send(laika)
      .then(res => res.body)
      .then(updated => {
        assert.equal(updated.name, 'Stoopid Buddy');
      });

  });

  it('save a film with studio', () => {

    let coraline = {
      title: 'Coraline',
      studio: laika._id,
      released: '2005',
      cast: []
    };
    return request.post('/api/films')
      .send(coraline)
      .then(res => res.body)
      .then(saved => {
        assert.ok(saved._id, 'saved has id');
        coraline = saved;
      });
  });

  it('removes a studio', () => {
    return request.delete(`/api/studios/${paramount._id}`)
      .then(res => res.body)
      .then(result => {
        assert.isTrue(result.removed);
      });
  });

  it('does not remove a studio with a film', () => {
    return request.delete(`/api/studios/${laika._id}`)
      .then(res => res.body)
      .then(() => { throw new Error('expected 401'); },
      res => {
        assert.equal(res.status, '401');
      });
  });

});