/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Lấy danh sách booking
 *     responses:
 *       200:
 *         description: Danh sách booking
 */

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Lấy chi tiết booking theo id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết booking
 */

/**
 * @swagger
 * /api/bookings/{id}:
 *   put:
 *     summary: Cập nhật booking (xác nhận/hủy)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Booking đã được cập nhật
 */

/**
 * @swagger
 * /api/bookings/{id}/refund:
 *   put:
 *     summary: Hoàn tiền booking
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking đã được hoàn tiền
 */ 