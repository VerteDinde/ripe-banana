const Router = require('express').Router;
const router = Router();
const Actor = require('../models/actor');
const Film = require('../models/film');

router
  .get('/', (req, res, next) => {
    Actor.find()
      .lean()
      .select('name dob')
      .then(actors => res.send(actors))
      .catch(next);
  })

  .get('/:id', (req, res, next) => {
    const id = req.params.id;

    Actor.findById(id)
      .lean()
      .select('name dob film')
      .then(actor => {
        if (!actor) return res.status(404).send(`${id} not found`);
        else res.send(actor);
      })
      .catch(next);
  })

  .post('/', (req, res, next) => {
    new Actor(req.body)
      .save()
      .then(actor => res.send(actor))
      .catch(next);
  })

  .put('/:id', (req, res, next) => {
    Actor.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .then(actor => res.send(actor))
      .catch(next);
  })

  .delete('/:id', (req, res, next) => {
    const id = req.params.id;
    Promise.all([
      Actor.findById(id)
        .lean()
        .select('name id'),
      Film.find({ cast: { actor: id } })
        .lean()
        .select('name')
    ])
      .then(results => {
        if (results) return res.status(401).send(`${id} cannot be deleted`);
      });

    Actor.findOneAndRemove(req.body)
      .then(response => {
        res.send({ removed: response ? true : false });
      })
      .catch(next);
  });

module.exports = router;