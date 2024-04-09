import express from 'express';
import authPageController from '../controllers/views.controller.js';

const router = express.Router();

router.use('/', authPageController);

export default router;
