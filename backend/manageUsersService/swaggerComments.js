/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lấy danh sách user
 *     responses:
 *       200:
 *         description: Danh sách user
 */

/**
 * @swagger
 * /api/users/{id}/disable:
 *   patch:
 *     summary: Vô hiệu hóa user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User đã bị vô hiệu hóa
 */

/**
 * @swagger
 * /api/users/{id}/enable:
 *   patch:
 *     summary: Gỡ vô hiệu hóa user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User đã được kích hoạt lại
 */