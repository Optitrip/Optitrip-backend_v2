import User from '../models/User.js';

/**
 * Update superior account for a list of users
 * @swagger
 * /move-account:
 *   post:
 *     summary: Update superior account
 *     description: Updates the superior account for a list of users in the database.
 *     operationId: updateSuperiorAccount
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               superiorAccount:
 *                 type: string
 *             required:
 *               - ids
 *               - superiorAccount
 *     responses:
 *       '200':
 *         description: Superior account updated successfully
 *       '400':
 *         description: Invalid input data
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 */
export const moveAccount = async (req, res) => {
    const { ids, superiorAccount } = req.body;

    // Verifica que los datos de entrada sean válidos
    if (!ids || !Array.isArray(ids) || ids.length === 0 || !superiorAccount) {
        return res.status(400).json({ message: "Invalid input data" });
    }

    try {
        // Itera sobre el arreglo de IDs para actualizar cada usuario
        const updatePromises = ids.map(async (id) => {
            const user = await User.findById(id);

            if (!user) {
                console.log(`User not found for ID: ${id}`);
                return { id, status: 'not found' };
            }

            user.superior_account = superiorAccount;
            const savedUser = await user.save();

            return { id, status: 'updated' };
        });

        // Espera a que todas las actualizaciones terminen
        const results = await Promise.all(updatePromises);

        // Filtra resultados para determinar si hubo usuarios no encontrados
        const notFound = results.filter(result => result.status === 'not found').map(result => result.id);
        const updated = results.filter(result => result.status === 'updated').map(result => result.id);

        // Envía la respuesta de éxito con detalles
        res.status(200).json({
            message: "Superior account updated successfully",
            updated,
            notFound
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
