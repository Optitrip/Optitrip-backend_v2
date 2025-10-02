import User from '../models/User.js';

/**
 * Reset user password by ID
 * @swagger
 * /reset-password/{_id}:
 *   post:
 *     summary: Reset user password
 *     description: Resets the password of a specific user in the database.
 *     operationId: resetPassword
 *     parameters:
 *       - name: _id
 *         in: path
 *         required: true
 *         description: ID of the user whose password is to be reset
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Password reset successful
 *       '400':
 *         description: Invalid or missing user ID
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 */
export const resetPassword = async (req, res) => {
    const { id } = req.params;
    const newPassword = '111111'; // Nueva contraseña a establecer

    try {
        console.log(id)
        // Verifica que el userId sea válido
        if (!id) {
            console.log("Invalid or missing user ID");
            return res.status(400).json({ message: "Invalid or missing user ID" });
        }

        // Encuentra al usuario por ID en la base de datos
        const user = await User.findById(id);
        console.log(user)
        if (!user) {
            console.log("User not found");
            return res.status(404).json({ message: "User not found" });
        }

        // Actualiza la contraseña del usuario
        user.password = newPassword;
        await user.save();

        console.log("Password reset successful");

        // Envía respuesta de éxito
        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        // Manejo de errores
        console.error("Error resetting password:", error);
        res.status(500).json({ message: error.message });
    }
};
