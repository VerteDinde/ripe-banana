const Router = require('express').Router;
const router = Router();
const Film = require('../models/film');

router
  .get('/', (req, res, next) => {
    Film.find()
      .lean()
      .select('title studio')
      .populate({
        path: 'studio',
        select: 'name'
      })
      .populate({
        path: 'actor',
      })
      .then(films => res.send(films))
      .catch(next);
  })

  .get('/:id', (req, res, next) => {
    const id = req.params.id;
    Film.findById(id)
      .lean()
      .select('title studio cast released')
      .populate({
        path: 'studio',
        select: 'name'
      })
      .populate({
        path: 'cast.actor',
        select: 'name'
      })
      .then(film => {
        if (!film) return res.status(404).send(`${id} not found`);
        else res.send(film);
      })
      .catch(next);
  })

  .post('/', (req, res, next) => {
    new Film(req.body)
      .save()
      .then(film => res.send(film))
      .catch(next);
  })

  .put('/:id', (req, res, next) => {
    Film.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .then(film => res.send(film))
      .catch(next);
  })

  .delete('/:id', (req, res, next) => {
    Film.findOneAndRemove(req.body)
      .then(response => {
        res.send({ removed: response ? true : false });
      })
      .catch(next);
  });

module.exports = router;