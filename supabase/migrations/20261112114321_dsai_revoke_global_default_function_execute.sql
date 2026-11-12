-- Remove PostgreSQL's global PUBLIC execute default for future functions.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
