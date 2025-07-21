/**
 * @swagger
 * /api/discounts:
 *   get:
 *     summary: Lấy danh sách discount
 *     responses:
 *       200:
 *         description: Danh sách discount
 */

/**
 * @swagger
 * /api/discounts:
 *   post:
 *     summary: Tạo mới discount
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               value:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Discount đã được tạo
 */

/**
 * @swagger
 * /api/discounts/{discount_id}:
 *   put:
 *     summary: Sửa discount
 *     parameters:
 *       - in: path
 *         name: discount_id
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
 *         description: Discount đã được cập nhật
 */

/**
 * @swagger
 * /api/discounts/{discount_id}:
 *   delete:
 *     summary: Xóa discount
 *     parameters:
 *       - in: path
 *         name: discount_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Discount đã được xóa
 */