/**
 * @swagger
 * /api/tours:
 *   get:
 *     summary: Lấy danh sách tour
 *     responses:
 *       200:
 *         description: Danh sách tour
 */

/**
 * @swagger
 * /api/tours/{id}:
 *   get:
 *     summary: Lấy chi tiết tour
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết tour
 */

/**
 * @swagger
 * /api/tours:
 *   post:
 *     summary: Tạo mới tour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tour_id:
 *                 type: string
 *               name:
 *                 type: string
 *               departure_date:
 *                 type: string
 *                 format: date
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tour đã được tạo
 */

/**
 * @swagger
 * /api/tours/{id}:
 *   put:
 *     summary: Cập nhật tour
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
 *         description: Tour đã được cập nhật
 */

/**
 * @swagger
 * /api/tours/{id}:
 *   delete:
 *     summary: Xóa tour
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tour đã được xóa
 */