const express = require('express');
const router = express.Router();
const discountController = require('../controllers/discountController');

// Lấy danh sách discount
router.get('/', discountController.getAllDiscounts);

// Tạo mới discount
router.post('/', discountController.createDiscount);

// Sửa discount
router.put('/:discount_id', discountController.updateDiscount);

// Xóa discount
router.delete('/:discount_id', discountController.deleteDiscount);

module.exports = router; 