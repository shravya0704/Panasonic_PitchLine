import { AdminRepository } from "../repositories/AdminRepository";

/**
 * Service layer handling authentication and security for the Admin Panel.
 * * WHY THIS EXISTS: In V1 of PitchLine, the admin panel uses a simplified, single-tenant 
 * authentication model (a single global password) rather than complex role-based access control (RBAC). 
 * This service abstracts the logic for verifying and updating that shared credential.
 */
export const AdminAuthService = {
  /**
   * Authenticates an admin attempt by comparing the provided input against the stored global password.
   *
   * @param {string} password - The plaintext password entered by the user on the login screen.
   * @returns {Promise<boolean>} A promise that resolves to true if the password matches, false otherwise.
   */
  async login(password: string) {
    // We fetch the single authoritative password directly from the admin_settings table.
    // Because this is a shared password model, no username or email lookup is required.
    const actualPassword =
      await AdminRepository.getPassword();

    return password === actualPassword;
  },

  /**
   * Updates the global admin password, enforcing a security check on the current password first.
   *
   * @param {string} current - The admin's current plaintext password, used for authorization.
   * @param {string} next - The new plaintext password to be saved.
   * @returns {Promise<boolean>} A promise that resolves to true if the update succeeded, false if authorization failed.
   */
  async changePassword(
    current: string,
    next: string
  ) {
    const actualPassword =
      await AdminRepository.getPassword();

    // Guard clause: Prevent unauthorized password changes (e.g., if someone left their 
    // admin session open on a shared computer) by enforcing a strict match on the current password.
    if (current !== actualPassword)
      return false;

    await AdminRepository.updatePassword(next);

    return true;
  },
};