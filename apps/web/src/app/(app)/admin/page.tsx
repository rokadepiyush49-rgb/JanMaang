/**
 * Administration dashboard.
 *
 * Users, roles, audit log and system configuration.
 *
 * ISOLATION RULE: nothing under (app)/admin may import from another role
 * segment. That keeps Super Admin extractable into its own deployment if a
 * government security review ever requires network isolation.
 *
 * Screens compose from src/features/*, which mirror the backend modules
 * one-for-one. A developer moving between services/api/app/modules/projects
 * and src/features/projects sees the same vocabulary.
 */
export default function AdministrationDashboard() {
  return <h1>Administration</h1>;
}
