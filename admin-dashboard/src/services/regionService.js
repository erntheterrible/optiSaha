import { supabase } from '../lib/supabaseClient';

export const regionService = {
  /**
   * Creates a new region in the database.
   * @param {string} name - The name of the region.
   * @param {string} description - The description of the region.
   * @param {string} shape_type - The type of shape (e.g., 'polygon', 'point').
   * @param {object} geometry - The GeoJSON geometry object.
   * @param {string} color - The color of the region.
   * @returns {Promise<object>} The created region data.
   */
  async createRegion(regionData) {
    const { name, description = '', shape_type, geometry, color } = regionData;
    const { data, error } = await supabase.rpc('create_region', {
      _name: name,
      _description: description,
      _shape_type: shape_type,
      _geometry: geometry,
      _color: color,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Updates an existing region in the database.
   * @param {string} region_id - The ID of the region to update.
   * @param {string} name - The new name of the region.
   * @param {string} description - The new description of the region.
   * @param {string} shape_type - The new type of shape.
   * @param {object} geometry - The new GeoJSON geometry object.
   * @param {string} color - The new color of the region.
   * @returns {Promise<object>} The updated region data.
   */
  async updateRegion(region_id, name, description, shape_type, geometry, color) {
    const { data, error } = await supabase.rpc('update_region', {
      _region_id: region_id,
      _name: name,
      _description: description,
      _shape_type: shape_type,
      _geometry: geometry,
      _color: color,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Deletes a region from the database.
   * @param {string} region_id - The ID of the region to delete.
   * @returns {Promise<void>} 
   */
  async deleteRegion(region_id) {
    const { error } = await supabase.rpc('delete_region', {
      _region_id: region_id,
    });
    if (error) throw error;
  },

  /**
   * Fetches all regions accessible to the current user.
   * @returns {Promise<Array<object>>} A list of region data.
   */
  async getRegions() {
    const { data, error } = await supabase.rpc('get_accessible_regions');
    if (error) throw error;
    return data;
  },
};
