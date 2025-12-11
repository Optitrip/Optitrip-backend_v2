import User from '../models/User.js';

/**
 * Mapeo de roles a sus capacidades de creación
 */
export const ROLE_PERMISSIONS = {
    'Super Administrador': {
        canCreate: ['Distribuidor', 'Administrador', 'Cliente', 'Conductor'],
        scope: 'all' // Ve todo el sistema
    },
    'Distribuidor': {
        canCreate: ['Administrador', 'Cliente', 'Conductor'],
        scope: 'hierarchical' // Ve su árbol jerárquico
    },
    'Administrador': {
        canCreate: ['Cliente', 'Conductor'],
        scope: 'direct' // Solo ve sus hijos directos
    },
    'Cliente': {
        canCreate: [],
        scope: 'self'
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
            // Super Admin ve todo
            return {};

        case 'hierarchical':
            // Distribuidor ve su árbol completo
            const hierarchy = await getUserHierarchy(user.email);
            return {
                $or: [
                    { superior_account: { $in: hierarchy } },
                    { email: { $in: hierarchy } }
                ]
            };

        case 'direct':
            // Administrador solo ve sus hijos directos
            return { 
                $or: [
                    { superior_account: user.email }, // Sus empleados
                    { _id: user._id }                 // Él mismo (para que cargue el panel superior)
                ]
            };

        case 'self':
            // Cliente/Conductor solo se ve a sí mismo
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