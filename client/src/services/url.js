/**
 * Hardcoded URLS for the application.
 * URLs should come from HATEOAS. For each entity we need at least a point of entry.
 *
 * <i>Depending on the project evolution, some of the URLs could be retrieved as links of the login response entity</i>
 *
 * @type {{LOGIN: string, FOLDERS: string}}
 */
export const URLS = {
  LOGIN: '/api/v1/application/login',
  FOLDERS: '/api/v1/folders',
  SMTP: '/api/v1/smtp'
};
