const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Lấy danh sách user
router.get('/', userController.getAllUsers);

// Vô hiệu hóa user
router.patch('/:id/disable', userController.disableUser);

// Gỡ vô hiệu hóa user
router.patch('/:id/enable', userController.enableUser);

module.exports = router; 