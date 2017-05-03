const Router = require('express').Router;
const router = Router();
const Actor = require('../models/actor');

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
      .then(result => res.send(result))
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
    Actor.findOneAndRemove(req.body)
      .then(response => {
        res.send({ removed: response ? true : false });
      })
      .catch(next);
  });

module.exports = router;