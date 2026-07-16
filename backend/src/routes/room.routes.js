const express = require('express');
const router = express.Router();

const roomController = require('../controllers/room.controller');
const validate = require('../middleware/validate.middleware');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { createRoomRules, updateRoomRules, searchRoomRules } = require('../validators/room.validator');

router.get('/', searchRoomRules, validate, roomController.getRooms);
router.get('/:id', roomController.getRoomById);

// Chỉ ADMIN mới được tạo/sửa/xóa phòng
router.post('/', protect, restrictTo('ADMIN'), createRoomRules, validate, roomController.createRoom);
router.put('/:id', protect, restrictTo('ADMIN'), updateRoomRules, validate, roomController.updateRoom);
router.delete('/:id', protect, restrictTo('ADMIN'), roomController.deleteRoom);

module.exports = router;
