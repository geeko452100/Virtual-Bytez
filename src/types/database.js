/**
 * @typedef {'customer' | 'admin'} ProfileRole
 */

/**
 * @typedef {Object} Profile
 * @property {string} id
 * @property {string | null} email
 * @property {string | null} full_name
 * @property {ProfileRole} role
 * @property {string} created_at
 */

/**
 * @typedef {Object} ProductRow
 * @property {string} id
 * @property {string} name
 * @property {string | null} era
 * @property {string} category
 * @property {number} base_price
 * @property {string | null} description
 * @property {string | null} condition
 * @property {number | null} condition_grade
 * @property {string | null} image_url
 * @property {unknown[]} customization_options
 * @property {number} stock_count
 * @property {boolean} active
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {'pending' | 'paid' | 'processing' | 'shipped' | 'cancelled'} OrderStatus
 */

/**
 * @typedef {Object} OrderRow
 * @property {string} id
 * @property {string} user_id
 * @property {OrderStatus} status
 * @property {number} subtotal
 * @property {Record<string, unknown>} shipping_address
 * @property {string | null} carrier
 * @property {string | null} tracking_number
 * @property {string | null} shipped_at
 * @property {Record<string, unknown> | null} tracking_status
 * @property {string | null} tracking_updated_at
 * @property {string} created_at
 */

/**
 * @typedef {Object} OrderItemRow
 * @property {string} id
 * @property {string} order_id
 * @property {string} product_id
 * @property {string} product_name
 * @property {Record<string, unknown>} selections
 * @property {number} quantity
 * @property {number} unit_price
 * @property {number} line_total
 */

/**
 * @typedef {Object} SavedBuildRow
 * @property {string} id
 * @property {string} user_id
 * @property {string} product_id
 * @property {string} name
 * @property {Record<string, unknown>} selections
 * @property {string} created_at
 */

export {}
