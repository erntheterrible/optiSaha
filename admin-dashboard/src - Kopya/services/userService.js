import { supabase } from '../lib/supabaseClient';

const userService = {
  /**
   * Get the profile of the currently authenticated user.
   */
  async getCurrentUserProfile() {
    const { data: { user }, error: sessionError } = await supabase.auth.getUser();
    if (sessionError || !user) {
      console.error('Error getting user session:', sessionError);
      throw sessionError || new Error('User not found.');
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
    return data;
  },

  /**
   * Update the profile for a given user ID.
   * @param {string} userId - The ID of the user to update.
   * @param {object} updates - An object with the fields to update.
   */
  async updateUserProfile(userId, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
    return data;
  },

  /**
   * Update the password for the currently authenticated user.
   * @param {string} newPassword - The new password.
   */
  async updateUserPassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      console.error('Error updating password:', error);
      throw error;
    }
    return data;
  },
  
  /**
   * Get all users (for admin purposes).
   */
  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
    return data;
  },

  /**
   * Placeholder for deleting a user account.
   * In a real application, this should be a secure server-side operation.
   * @param {string} userId - The ID of the user to delete.
   */
  async deleteUserAccount(userId) {
    console.warn('Account deletion is a sensitive operation and should be handled by a secure server-side function.');
    // Example of what a call to a serverless function might look like:
    // const { error } = await supabase.functions.invoke('delete-user', {
    //   body: { userId },
    // });
    // if (error) throw error;
    return { message: 'Account deletion requested. Awaiting server confirmation.' };
  },
};

export default userService;

