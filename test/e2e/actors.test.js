const request = require('./_request');
const db = require('./_db');
const assert = require('chai').assert;

describe('Actors API', () => {

  before(db.drop);

  it('GET / all actors', () => {
    return request.get('/api/actors')
      .then(res => {
        const actors = res.body;
        assert.deepEqual(actors, []);
      });
  });

  let cocostudios = {
    name: 'Coco Studios',
    address: {
      city: 'Portland',
      state: 'OR',
      country: 'USA'
    }
  };

  before(() => {
    return request.post('/api/studios')
      .send(cocostudios)
      .then(res => {
        cocostudios = res.body;
      });
  });

  let gbbo = {
    title: 'Great British Bake Off',
    studio: '',
    released: '2017',
    cast: []
  };

  before(() => {
    gbbo.studio = cocostudios._id;
    return request.post('/api/films')
      .send(gbbo)
      .then(res => res.body)
      .then(saved => gbbo = saved);
  });

  let kateWinslet = {
    name: 'Kate Winslet',
    dob: 1969,
    film: ''
  };

  function saveActor(actor) {
    actor.film = gbbo._id;
    return request.post('/api/actors')
      .send(actor)
      .then(res => res.body);
  }

  it.only('save an actor with a film', () => {
    kateWinslet.film = gbbo;
    return saveActor(kateWinslet)
      .then(saved => {
        assert.ok(saved._id, 'saved has id');
        kateWinslet = saved;
      });
  });

  it('returns an actor and their film by id', () => {
    return request.get(`/api/actors/${kateWinslet._id}`)
      .then(res => res.body)
      .then(actor => {
        assert.deepEqual(actor, {
          _id: kateWinslet._id,
          name: kateWinslet.name,
          dob: kateWinslet.dob,
          film: gbbo._id
        });
      });
  });

  it('updates an actor', () => {
    kateWinslet.dob = 2030;
    return request.put(`/api/actors/${kateWinslet._id}`)
      .send(kateWinslet)
      .then(res => res.body)
      .then(updated => {
        assert.equal(updated.dob, 2030);
      });

  });

  it.only('removes an actor', () => {
    let rooneyMara = {
      name: 'Rooney Mara',
      dob: 1980
    };
    return saveActor(rooneyMara)
      .then(saved => {
        assert.ok(saved._id, 'saved has id');
        rooneyMara = saved;
      })
      .then(() => {
        return request.delete(`/api/actors/${rooneyMara._id}`);
      })
      .then(res => res.body)
      .then(result => {
        assert.isTrue(result.removed);
      });
  });

  it('cannot remove an actor with film', () => {
    return request.delete(`/api/actors/${kateWinslet._id}`)
      .then(res => res.body)
      .then(result => {
        assert.isTrue(result.removed);
      });
  });

});
