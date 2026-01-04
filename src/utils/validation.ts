/**
 * Validation utilities for OCM
 * Pure functions for input validation at boundaries
 */

/** Valid asset name pattern: alphanumeric, dash, underscore, and forward slash for nested paths */
const VALID_NAME_PATTERN = /^[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*$/;

/** Maximum length for asset names */
const MAX_NAME_LENGTH = 100;

/**
 * Validates an asset name for security and consistency.
 * Prevents path traversal attacks and ensures filesystem compatibility.
 * 
 * @param name - The asset name to validate
 * @throws Error if name is invalid
 */
export function validateAssetName(name: string): void {
  if (!name || name.trim().length === 0) {
    throw new Error("Asset name cannot be empty");
  }

  if (name.length > MAX_NAME_LENGTH) {
    throw new Error(`Asset name too long (max ${MAX_NAME_LENGTH} characters)`);
  }

  // Check for path traversal attempts
  if (name.includes("..")) {
    throw new Error("Invalid name: path traversal not allowed (..)");
  }

  // Check for backslashes (Windows path separator)
  if (name.includes("\\")) {
    throw new Error("Invalid name: backslashes not allowed (use forward slash for nested paths)");
  }

  // Validate against allowed pattern
  if (!VALID_NAME_PATTERN.test(name)) {
    throw new Error(
      `Invalid name: "${name}". Only alphanumeric, dash, underscore, and forward slash (for nesting) allowed.`
    );
  }
}

/**
 * Checks if an asset name is valid without throwing.
 * 
 * @param name - The asset name to check
 * @returns Object with isValid boolean and optional error message
 */
export function isValidAssetName(name: string): { isValid: boolean; error?: string } {
  try {
    validateAssetName(name);
    return { isValid: true };
  } catch (error: any) {
    return { isValid: false, error: error.message };
  }
}
