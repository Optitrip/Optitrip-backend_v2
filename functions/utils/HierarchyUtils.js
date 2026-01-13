import User from '../models/User.js';
import Route from '../models/Route.js';

/**
 * Mapeo de roles a sus capacidades de creación
 */
export const ROLE_PERMISSIONS = {
    'Super Administrador': {
        canCreate: ['Distribuidor', 'Administrador', 'Cliente', 'Conductor'],
        scope: 'all'
    },
    'Distribuidor': {
        canCreate: ['Administrador', 'Cliente', 'Conductor'],
        scope: 'hierarchical'
    },
    'Administrador': {
        canCreate: ['Cliente', 'Conductor'],
        scope: 'direct'
    },
    'Cliente': {
        canCreate: [],
        scope: 'direct'
    },
    'Conductor': {
        canCreate: [],
        scope: 'self'
    }
};

/**
 * Obtiene todos los usuarios bajo el árbol jerárquico de un usuario
 * @param {String} userEmail - Email del usuario raíz
 * @returns {Array} - Lista de emails en el árbol
 */
export async function getUserHierarchy(userEmail) {
    const hierarchy = [userEmail];
    const processed = new Set([userEmail]);

    async function getDescendants(parentEmail) {
        const children = await User.find({
            superior_account: parentEmail
        }).select('email');

        for (const child of children) {
            if (!processed.has(child.email)) {
                processed.add(child.email);
                hierarchy.push(child.email);
                await getDescendants(child.email);
            }
        }
    }

    await getDescendants(userEmail);
    return hierarchy;
}

/**
 * Obtiene IDs de conductores asignados a rutas de un cliente
 * @param {String} userId - ID del usuario cliente
 * @returns {Array} - Lista de ObjectIds de conductores
 */
async function getDriversFromRoutes(userId) {
    try {
        const routes = await Route.find({ 
            customerId: userId,
            status: { $in: ["Ruta no iniciada", "Ruta futura", "Ruta en curso"] }
        }).select('driverId');
        
        return routes.map(route => route.driverId);
    } catch (error) {
        console.error('Error obteniendo conductores:', error);
        return [];
    }
}

/**
 * Valida si un usuario puede crear otro tipo de usuario
 * @param {String} creatorRole - Rol del creador
 * @param {String} targetRole - Rol a crear
 * @returns {Boolean}
 */
export function canCreateRole(creatorRole, targetRole) {
    const permissions = ROLE_PERMISSIONS[creatorRole];
    if (!permissions) return false;
    return permissions.canCreate.includes(targetRole);
}

/**
 * Obtiene el scope de visibilidad de un usuario
 * @param {Object} user - Usuario completo
 * @returns {Object} - Query filter para MongoDB
 */
export async function getScopeFilter(user) {
    const role = user.type_user;
    const permissions = ROLE_PERMISSIONS[role];

    if (!permissions) {
        throw new Error('Rol no válido');
    }

    switch (permissions.scope) {
        case 'all':
            return {};

        case 'hierarchical':
            const hierarchy = await getUserHierarchy(user.email);
            return {
                $or: [
                    { superior_account: { $in: hierarchy } },
                    { email: { $in: hierarchy } }
                ]
            };

        case 'direct':
            const driverIds = await getDriversFromRoutes(user._id);
            
            return { 
                $or: [
                    { superior_account: user.email },
                    { _id: user._id },
                    { _id: { $in: driverIds } }  
                ]
            };

        case 'self':
            return { _id: user._id };

        default:
            return { _id: user._id };
    }
}

/**
 * Valida que no se cree un ciclo jerárquico
 * @param {String} superiorEmail - Email del superior
 * @param {String} targetEmail - Email del usuario a crear/mover
 */
export async function validateNoCircularReference(superiorEmail, targetEmail) {
    if (!superiorEmail) return true;

    const hierarchy = await getUserHierarchy(targetEmail);

    if (hierarchy.includes(superiorEmail)) {
        throw new Error('No se puede crear una referencia circular en la jerarquía');
    }
    return true;
}