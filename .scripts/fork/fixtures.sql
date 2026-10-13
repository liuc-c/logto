-- Only loaded into the disposable acceptance database, never a deployment database.
insert into applications (tenant_id, id, name, secret, type, oidc_client_metadata)
values ('default', 'fork-acceptance', 'Fork acceptance', 'acceptance-only', 'MachineToMachine', '{}');
insert into applications_roles (tenant_id, id, application_id, role_id)
values ('default', 'fork-acceptance-role', 'fork-acceptance', 'admin-role');
