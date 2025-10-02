import User from "../models/User.js";
import Role from "../models/Role.js";
import Tracking from "../models/Tracking.js";

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve a list of users
 *     description: Retrieve a list of users from the database
 *     operationId: getUsers
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   superior_account:
 *                     type: string
 *                   type_user:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   password:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   rol_id:
 *                     type: string
 */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().populate("rol_id");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /users/admin:
 *   get:
 *     summary: Retrieve a list of users
 *     description: Retrieve a list of users from the database
 *     operationId: getUsersAdmin
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   superior_account:
 *                     type: string
 *                   type_user:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   password:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   rol_id:
 *                     type: string
 */
export const getUsersAdmin = async (req, res) => {
  try {
    // Filtrar usuarios con type_user igual a 'administrador' o 'distribuidor'
    const users = await User.find({
      type_user: { $in: ["Administrador", "Distribuidor"] },
    }).populate("rol_id");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /users/driver:
 *   get:
 *     summary: Retrieve a list of drivers
 *     description: Retrieve a list of users with type_user as 'Conductor' and superior_account matching the provided email
 *     operationId: getUsersDriver
 *     parameters:
 *       - name: email
 *         in: query
 *         required: true
 *         description: Email address to filter users by superior_account
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of users with tracking status and location if available
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   superior_account:
 *                     type: string
 *                   type_user:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   password:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   rol_id:
 *                     type: string
 *                   tracking:
 *                     type: object
 *                     properties:
 *                       status:
 *                         type: string
 *                         description: Status of the user
 *                         enum: [Activo, Fuera de línea, Inactivo]
 *                       location:
 *                         type: object
 *                         properties:
 *                           latitude:
 *                             type: number
 *                             description: Latitude of the user's location
 *                           longitude:
 *                             type: number
 *                             description: Longitude of the user's location
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                             description: Timestamp of the location
 */
export const getUsersDriver = async (req, res) => {
  try {
    // Obtén el email del parámetro de consulta
    const { email } = req.query;

    // Asegúrate de que el parámetro email esté presente
    if (!email) {
      return res.status(400).json({ message: "Email parameter is required" });
    }

    // Filtrar usuarios con type_user igual a 'Conductor' y superior_account igual al email recibido
    const users = await User.find({
      type_user: "Conductor",
      superior_account: email,
    }).populate("rol_id");

    // Obtener el tracking para cada usuario
    const userTrackingPromises = users.map(async (user) => {
      const tracking = await Tracking.findOne({ userId: user._id });
      // Solo incluir el campo tracking si se encuentra
      const userWithTracking = { ...user.toObject() };
      if (tracking) {
        userWithTracking.tracking = {
          status: tracking.status,
          location: tracking.location,
        };
      }
      return userWithTracking;
    });

    const usersWithTracking = await Promise.all(userTrackingPromises);

    // Retorna los usuarios con información de tracking si está disponible
    res.json(usersWithTracking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /user/{_id}:
 *   get:
 *     summary: Retrieve a user by ID
 *     description: Retrieve a user by ID from the database
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user to retrieve
 *     operationId: getUserById
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 superior_account:
 *                   type: string
 *                 type_user:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 password:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 rol_id:
 *                   type: string
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).populate("rol_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user in the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               superior_account:
 *                 type: string
 *               type_user:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               rol_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Email already exists
 *       500:
 *         description: Internal server error
 */
export const createUser = async (req, res) => {
  try {
    const {
      superior_account,
      type_user,
      name,
      email,
      password,
      phone,
      rol_id,
    } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Create new user
    const newUser = new User({
      superior_account,
      type_user,
      name,
      email,
      password,
      phone,
      rol_id,
    });
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /user/{_id}:
 *   put:
 *     summary: Update a user
 *     description: Update a user's details in the database
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               superior_account:
 *                 type: string
 *               type_user:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               rol_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid user ID or data
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      superior_account,
      type_user,
      name,
      email,
      password,
      phone,
      rol_id,
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { superior_account, type_user, name, email, password, phone, rol_id },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /user/{_id}:
 *   delete:
 *     summary: Delete a user
 *     description: Delete a user from the database by ID
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
