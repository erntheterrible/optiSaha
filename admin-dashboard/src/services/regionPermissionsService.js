import { supabase } from '../config/supabase';

export const regionPermissionsService = {
  async getRegionPermissions(regionId) {
    const { data, error } = await supabase
      .from('region_permissions')
      .select(`
        *,
        users:user_id (
          id,
          name,
          avatar,
          role
        )
      `)
      .eq('region_id', regionId);

    if (error) throw error;
    return data;
  },

  async setRegionPermissions(regionId, permissions) {
    const { data, error } = await supabase
      .from('region_permissions')
      .upsert(
        permissions.map(p => ({
          region_id: regionId,
          user_id: p.userId,
          can_view: p.canView,
          can_edit: p.canEdit,
          can_delete: p.canDelete,
          can_assign: p.canAssign
        }))
      );

    if (error) throw error;
    return data;
  },

  async getRegionHistory(regionId) {
    const { data, error } = await supabase
      .from('region_history')
      .select(`
        *,
        users:created_by (
          id,
          name,
          avatar
        )
      `)
      .eq('region_id', regionId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createHistoryEntry(regionId, changes, userId) {
    const { data, error } = await supabase
      .from('region_history')
      .insert({
        region_id: regionId,
        changes,
        created_by: userId,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    return data;
  },

  async canUserEditRegion(regionId, userId) {
    const { data, error } = await supabase
      .from('region_permissions')
      .select('can_edit')
      .eq('region_id', regionId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No permission record found
        return false;
      }
      throw error;
    }

    return data?.can_edit || false;
  }
};

export default regionPermissionsService;
