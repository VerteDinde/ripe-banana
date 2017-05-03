const request = require('./_request');
const db = require('./_db');
const assert = require('chai').assert;

describe('Films API', () => {

  before(db.drop);

  it('GET / all films', () => {
    return request.get('/api/films')
      .then(res => {
        const films = res.body;
        assert.deepEqual(films, []);
      });
  });

  let laika = {
    name: 'Laika',
    address: {
      city: 'Portland',
      state: 'OR',
      country: 'USA'
    }
  };

  before(() => {
    return request.post('/api/studios')
      .send(laika)
      .then(res => {
        laika = res.body;
      });
  });

  let poppyHarlow = {
    name: 'Poppy Harlow',
    dob: 1977
  };

  before(() => {
    return request.post('/api/actors')
      .send(poppyHarlow)
      .then(res => res.body)
      .then(saved => poppyHarlow = saved);
  });

  let coraline = {
    title: 'Coraline',
    studio: laika._id,
    released: '2005',
    cast: []
  };

  let kubo = {
    title: 'Kubo and the Two Strings',
    studio: laika._id,
    released: '2016',
    cast: []
  };

  function saveFilm(film) {
    film.studio = laika._id;
    return request.post('/api/films')
      .send(film)
      .then(res => res.body);
  }

  it('save a film with studio', () => {
    coraline.cast = [{
      role: 'Coraline',
      actor: poppyHarlow._id
    }];
    return saveFilm(coraline)
      .then(saved => {
        assert.ok(saved._id, 'saved has id');
        coraline = saved;
      });
  });

  it('returns a film by id', () => {
    return request.get(`/api/films/${coraline._id}`)
      .then(res => res.body)
      .then(film => {
        assert.deepEqual(film, {
          _id: coraline._id,
          title: coraline.title,
          cast: [{
            _id: coraline.cast[0]._id,
            actor: {
              _id: poppyHarlow._id,
              name: poppyHarlow.name
            },
            role: coraline.cast[0].role,
          }],
          studio: {
            _id: laika._id,
            name: laika.name
          },
          released: 2005
        });
      });
  });

  it('returns list of all films', () => {
    return Promise.all([
      saveFilm(kubo)
    ])
      .then(savedFilms => {
        kubo = savedFilms[0];
      })
      .then(() => request.get('/api/films'))
      .then(res => res.body)
      .then(films => {
        assert.equal(films.length, 2);
        assert.deepEqual(films[0], {
          _id: coraline._id,
          studio: {
            _id: laika._id,
            name: laika.name
          },
          title: coraline.title,
        });
        assert.include(films, {
          _id: kubo._id,
          studio: {
            _id: laika._id,
            name: laika.name
          },
          title: kubo.title
        });
      });
  });

  it('updates a film with cast', () => {
    //
  });

  it('deletes a film', () => {
    return request.delete(`/api/films/${kubo._id}`)
      .then(res => res.body)
      .then(result => {
        assert.isTrue(result.removed);
      });
  });

});