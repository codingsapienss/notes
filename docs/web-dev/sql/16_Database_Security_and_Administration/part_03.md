---
sidebar_label: "PostgreSQL Backup and Recovery Fundamentals"
sidebar_position: 1
---

# PostgreSQL Backup and Recovery Fundamentals

## 1. Introduction

Database backup and recovery are essential parts of production database administration.

A database can fail because of:

- Accidental DELETE or UPDATE operations.
- Application bugs.
- Hardware failure.
- Disk corruption.
- Database server crashes.
- Ransomware or security incidents.
- Human errors.
- Infrastructure failures.

A backup provides a recoverable copy of database data.

Recovery is the process of restoring the database to a usable state.

### Important concepts

| Concept         | Meaning                                                       |
| --------------- | ------------------------------------------------------------- |
| Backup          | A copy of database data and related information               |
| Restore         | Reconstructing database objects and data from a backup        |
| Recovery        | Bringing a database back to a consistent operational state    |
| Logical backup  | Export of database objects and data as SQL or archive entries |
| Physical backup | Copy of PostgreSQL data files                                 |
| WAL             | Write-Ahead Log containing database changes                   |
| PITR            | Point-in-Time Recovery                                        |
| RPO             | Maximum acceptable data loss                                  |
| RTO             | Maximum acceptable recovery time                              |

---

## 2. Types of PostgreSQL Backups

PostgreSQL supports two major backup approaches:

1. Logical backups.
2. Physical backups.

### Logical backup

A logical backup exports database objects and their data.

Common tools:

- `pg_dump`
- `pg_dumpall`
- `pg_restore`

Example:

```bash
pg_dump -U postgres -d techbazaar -F c -f techbazaar.backup
```

This creates a custom-format backup of the `techbazaar` database.

### Physical backup

A physical backup copies the PostgreSQL data files.

Common approaches:

- `pg_basebackup`
- Filesystem-level backups coordinated with PostgreSQL.
- Storage snapshots coordinated with PostgreSQL.

Physical backups are commonly used for:

- Large databases.
- Disaster recovery.
- Replication setup.
- Point-in-time recovery.

### Comparison

| Feature                 | Logical backup                         | Physical backup                                       |
| ----------------------- | -------------------------------------- | ----------------------------------------------------- |
| Backup level            | Database objects and data              | Database cluster files                                |
| Tool                    | `pg_dump`                              | `pg_basebackup`                                       |
| Human-readable output   | Possible with SQL format               | No                                                    |
| Selective restoration   | Easier                                 | Generally cluster-level recovery                      |
| Cross-version migration | Often useful, subject to compatibility | Normally requires compatible PostgreSQL major version |
| PITR support            | Not by itself                          | Yes, with base backup and WAL                         |
| Typical use             | Migration and selective recovery       | Disaster recovery                                     |

**Important:** Logical and physical backups solve different problems. A production backup strategy may use both.

---

## 3. Logical Backup Using pg_dump

`pg_dump` is PostgreSQL's primary logical backup utility for a single database.

### Basic syntax

```bash
pg_dump -U username -d database_name -f backup_file.sql
```

### Example

```bash
pg_dump -U postgres -d techbazaar -f techbazaar_backup.sql
```

This creates a SQL-format backup.

The SQL file contains commands to recreate database objects and restore data.

### Specify host and port

```bash
pg_dump \
  -h localhost \
  -p 5432 \
  -U postgres \
  -d techbazaar \
  -f techbazaar_backup.sql
```

### Custom format backup

```bash
pg_dump \
  -U postgres \
  -d techbazaar \
  -F c \
  -f techbazaar.backup
```

Custom format is useful because it supports selective and parallel restoration with `pg_restore`.

### Important pg_dump options

| Option | Purpose                                         |
| ------ | ----------------------------------------------- |
| `-h`   | Database server hostname                        |
| `-p`   | Database port                                   |
| `-U`   | Database username                               |
| `-d`   | Database name                                   |
| `-f`   | Output file                                     |
| `-F p` | Plain SQL format                                |
| `-F c` | Custom archive format                           |
| `-F d` | Directory archive format                        |
| `-F t` | Tar archive format                              |
| `-s`   | Schema only                                     |
| `-a`   | Data only                                       |
| `-n`   | Include a specific schema                       |
| `-t`   | Include a specific table                        |
| `-Z`   | Compression level for supported archive formats |

---

## 4. Backup Only the Schema

Sometimes you need the database structure without the data.

Example:

```bash
pg_dump \
  -U postgres \
  -d techbazaar \
  --schema-only \
  -f techbazaar_schema.sql
```

This exports definitions such as:

- Tables.
- Columns.
- Constraints.
- Indexes.
- Views.
- Functions.
- Sequences.

### When useful?

- Database structure migration.
- Reviewing schema changes.
- Setting up development environments.
- Comparing database structures.

---

## 5. Backup Only the Data

If you already have the schema and only need the data:

```bash
pg_dump \
  -U postgres \
  -d techbazaar \
  --data-only \
  -f techbazaar_data.sql
```

This exports data without the table definitions.

**Important:** Restoring data requires compatible destination tables and other required objects to exist.

---

## 6. Backup a Specific Table

You do not always need to back up the entire database.

Example:

```bash
pg_dump \
  -U postgres \
  -d techbazaar \
  -t public.customers \
  -F c \
  -f customers.backup
```

Restore it:

```bash
pg_restore \
  -U postgres \
  -d techbazaar \
  customers.backup
```

### Backup multiple tables

```bash
pg_dump \
  -U postgres \
  -d techbazaar \
  -t public.customers \
  -t public.orders \
  -F c \
  -f customer_orders.backup
```

### Important

A table-only backup may not contain all dependencies required to restore that table independently.

For example:

- Referenced tables.
- Custom types.
- Functions.
- Extensions.
- Required schemas.

Review dependencies before relying on selective restoration.

---

## 7. Backup a Specific Schema

Example:

```bash
pg_dump \
  -U postgres \
  -d techbazaar \
  -n sales \
  -F c \
  -f sales.backup
```

This exports objects belonging to the `sales` schema.

Restore:

```bash
pg_restore \
  -U postgres \
  -d techbazaar \
  sales.backup
```

A schema backup may still depend on objects outside that schema.

---

## 8. Restoring a Plain SQL Backup

A plain SQL backup is restored using `psql`.

### Step 1: Create a destination database

```sql
CREATE DATABASE techbazaar_restore;
```

### Step 2: Restore the SQL file

```bash
psql \
  -U postgres \
  -d techbazaar_restore \
  -f techbazaar_backup.sql
```

### Step 3: Verify tables

Connect:

```bash
psql -U postgres -d techbazaar_restore
```

List tables:

```sql
\dt
```

Check data:

```sql
SELECT COUNT(*) FROM customers;
```

**Important:** A plain SQL backup is a sequence of SQL commands. The restore tool executes those commands against the destination database.

---

## 9. Restoring a Custom-Format Backup

Custom-format backups are restored using `pg_restore`.

### Basic restore

```bash
pg_restore \
  -U postgres \
  -d techbazaar_restore \
  techbazaar.backup
```

### Create the database automatically

```bash
pg_restore \
  -U postgres \
  -C \
  -d postgres \
  techbazaar.backup
```

The `-C` option creates the database using the database name stored in the archive.

The connection database specified with `-d` is used to execute the database-creation command.

### Restore with clean option

```bash
pg_restore \
  -U postgres \
  -d techbazaar_restore \
  --clean \
  techbazaar.backup
```

`--clean` drops objects before recreating them.

Use this carefully because it can remove existing database objects.

### Restore in parallel

```bash
pg_restore \
  -U postgres \
  -d techbazaar_restore \
  -j 4 \
  techbazaar.backup
```

`-j 4` uses four parallel jobs where supported.

Parallel restoration is supported with custom and directory archive formats, not plain SQL format.

---

## 10. Exploring a Backup Before Restoring

You can inspect the contents of a custom-format archive.

```bash
pg_restore --list techbazaar.backup
```

This displays archive entries such as:

- Tables.
- Table data.
- Indexes.
- Constraints.
- Functions.
- Sequences.

### Restore selected objects

First, save the archive listing:

```bash
pg_restore --list techbazaar.backup > restore_list.txt
```

Edit `restore_list.txt` to select the objects you need, then:

```bash
pg_restore \
  -U postgres \
  -d techbazaar_restore \
  -L restore_list.txt \
  techbazaar.backup
```

This is useful for selective recovery.

---

## 11. Backup All Databases Using pg_dumpall

`pg_dump` backs up one database.

`pg_dumpall` can export an entire PostgreSQL cluster logically.

Example:

```bash
pg_dumpall \
  -U postgres \
  -f full_cluster_backup.sql
```

It includes:

- Database definitions.
- Database contents.
- Global objects such as roles and tablespaces.

### Why global objects matter

Suppose a database contains:

```text
techbazaar
company_hr
logging
```

The databases may use roles such as:

```text
techbazaar_app
reporting_user
developers
```

A database-only backup does not automatically provide a complete backup of all cluster-level roles and tablespaces.

`pg_dumpall` includes global objects in its output.

### Restore

```bash
psql \
  -U postgres \
  -f full_cluster_backup.sql
```

Run the restore using an appropriately privileged account.

**Important:** `pg_dumpall` produces a plain SQL script. It does not provide the same selective parallel restoration capabilities as custom-format `pg_dump` archives.

---

## 12. Backup and Restore Roles Separately

You can export global objects separately.

### Backup global objects

```bash
pg_dumpall \
  -U postgres \
  --globals-only \
  -f globals_backup.sql
```

This exports global objects such as:

- Roles.
- Role memberships.
- Tablespaces.

### Restore global objects

```bash
psql \
  -U postgres \
  -f globals_backup.sql
```

This is useful when you want database backups and global-object backups managed separately.

---

## 13. Physical Backup Using pg_basebackup

`pg_basebackup` creates a physical backup of a PostgreSQL database cluster.

Unlike `pg_dump`, it copies the cluster's physical database files.

### Basic syntax

```bash
pg_basebackup \
  -h localhost \
  -p 5432 \
  -U replication_user \
  -D /backup/postgres \
  -Fp \
  -Xs \
  -P
```

### Important options

| Option | Purpose                                           |
| ------ | ------------------------------------------------- |
| `-h`   | Source server                                     |
| `-p`   | Server port                                       |
| `-U`   | Replication user                                  |
| `-D`   | Destination directory                             |
| `-F p` | Plain directory format                            |
| `-F t` | Tar format                                        |
| `-X s` | Include required WAL using stream mode            |
| `-X f` | Include required WAL using fetch mode             |
| `-P`   | Show progress                                     |
| `-R`   | Create standby configuration for a standby server |

### Requirements

The backup role needs the `REPLICATION` attribute or equivalent superuser authority.

Example:

```sql
CREATE ROLE replication_user
WITH LOGIN REPLICATION PASSWORD 'ReplicationPassword123';
```

The server's authentication configuration must also permit the replication connection.

### Important

A physical backup represents the entire PostgreSQL cluster, not just one database.

You generally need to restore it using a compatible PostgreSQL installation and appropriate recovery configuration.

---

## 14. Understanding WAL

WAL stands for Write-Ahead Logging.

PostgreSQL uses WAL to ensure database changes can be recovered after crashes.

### How WAL works

When PostgreSQL modifies data:

1. It generates WAL records describing the changes.
2. WAL records are written ahead of corresponding data-page changes.
3. WAL is flushed according to the configured durability requirements.
4. Data pages are written to their data files over time.
5. During crash recovery, PostgreSQL replays the necessary WAL records.

### Why WAL matters

WAL supports:

- Crash recovery.
- Replication.
- Point-in-time recovery.
- Continuous archiving.
- Durability.

### Important

WAL is not a replacement for a backup.

WAL records describe changes, but a base backup or another suitable starting copy is needed for full physical recovery.

---

## 15. Point-in-Time Recovery (PITR)

Point-in-Time Recovery allows you to restore a PostgreSQL cluster to a particular point in time.

For example:

- A developer accidentally deletes customer records at 3:00 PM.
- You discover the problem at 3:20 PM.
- You want the database restored to 2:59 PM.

PITR can help recover the database to a point before the accidental deletion.

### Requirements

PITR generally requires:

1. A valid physical base backup.
2. Continuous WAL archiving.
3. Required WAL files covering the recovery period.
4. A recovery target.
5. A properly configured recovery environment.

### Step 1: Configure WAL archiving

Relevant PostgreSQL configuration parameters:

```conf
wal_level = replica
archive_mode = on
archive_command = 'test ! -f /backup/wal/%f && cp %p /backup/wal/%f'
```

This is an illustrative configuration.

The archive destination must exist, be writable by the PostgreSQL operating-system account and have sufficient storage.

The archive command should be designed carefully for production reliability. A failed archive command causes PostgreSQL to retry archiving the WAL file.

### Step 2: Take a base backup

```bash
pg_basebackup \
  -h localhost \
  -U replication_user \
  -D /backup/base \
  -Fp \
  -Xs \
  -P
```

### Step 3: Configure the recovery target

For modern PostgreSQL versions, recovery settings are configured in `postgresql.conf` or `postgresql.auto.conf`.

Example:

```conf
restore_command = 'cp /backup/wal/%f %p'
recovery_target_time = '2026-11-16 14:59:00+05:30'
recovery_target_action = 'pause'
```

The recovery environment must be prepared with the base backup and required WAL files.

### Step 4: Create the recovery signal file

```bash
touch /backup/base/recovery.signal
```

### Step 5: Start PostgreSQL in recovery mode

PostgreSQL replays WAL until the specified recovery target is reached.

After recovery, verify the data before promoting or making the restored server available.

### Important

PITR is a complete cluster recovery process, not a command that restores one deleted row directly into an existing production database.

For selective recovery, restore to a separate instance and extract the required data.

---

## 16. RPO and RTO

Two important concepts in disaster recovery are RPO and RTO.

### RPO — Recovery Point Objective

RPO describes the maximum acceptable amount of data loss measured in time.

Example:

If RPO is 15 minutes, the recovery strategy should aim to lose no more than 15 minutes of data.

### RTO — Recovery Time Objective

RTO describes the maximum acceptable time required to restore service.

Example:

If RTO is 1 hour, the database should be restored and operational within one hour.

### Comparison

| Concept | Question                                    |
| ------- | ------------------------------------------- |
| RPO     | How much data can we afford to lose?        |
| RTO     | How long can the system remain unavailable? |

### Example strategies

| Requirement        | Possible strategy                                                      |
| ------------------ | ---------------------------------------------------------------------- |
| RPO: 24 hours      | Daily backups may be sufficient for some systems                       |
| RPO: 1 hour        | Frequent backups plus WAL archiving                                    |
| RPO: Near zero     | Synchronous replication and a carefully designed recovery architecture |
| RTO: Several hours | Restore from backups                                                   |
| RTO: Minutes       | Prepared standby infrastructure and automated failover                 |

These are examples, not guarantees. Actual RPO and RTO depend on backup frequency, WAL archiving, infrastructure, restore speed and operational procedures.

---

## 17. Backup Automation

Production backups should not depend on someone remembering to execute a command manually.

You can automate backups using:

- Linux cron.
- Systemd timers.
- Backup orchestration tools.
- Cloud-managed backup services.
- PostgreSQL backup management tools.

### Example backup script

Create:

```bash
nano /home/adminuser/backup_techbazaar.sh
```

Script:

```bash
#!/bin/bash

BACKUP_DIR="/home/adminuser/postgres_backups"
DB_NAME="techbazaar"
DB_USER="postgres"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")

mkdir -p "$BACKUP_DIR"

pg_dump \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -F c \
    -f "$BACKUP_DIR/${DB_NAME}_${DATE}.backup"

if [ $? -eq 0 ]; then
    echo "Backup successful: ${DB_NAME}_${DATE}.backup"
else
    echo "Backup failed"
    exit 1
fi
```

Make it executable:

```bash
chmod +x /home/adminuser/backup_techbazaar.sh
```

Execute:

```bash
/home/adminuser/backup_techbazaar.sh
```

### Important security consideration

Avoid putting database passwords directly in scripts.

For password-based authentication, use an appropriately protected `.pgpass` file or another secure credential mechanism.

For example, `.pgpass` entries follow this format:

```text
hostname:port:database:username:password
```

On Unix-like systems, PostgreSQL expects restrictive permissions:

```bash
chmod 600 ~/.pgpass
```

---

## 18. Scheduling Backups with Cron

Open the cron editor:

```bash
crontab -e
```

Example: Run backup every day at 2 AM.

```cron
0 2 * * * /home/adminuser/backup_techbazaar.sh >> /home/adminuser/backup.log 2>&1
```

### Cron format

```text
minute hour day month weekday command
```

Example:

```text
0 2 * * *
```

Means every day at 2:00 AM.

### Other examples

Every 6 hours:

```cron
0 */6 * * * /home/adminuser/backup_techbazaar.sh
```

Every Sunday at 3 AM:

```cron
0 3 * * 0 /home/adminuser/backup_techbazaar.sh
```

### Important

A scheduled backup is not sufficient by itself.

You must also:

- Verify the backup completed successfully.
- Monitor disk space.
- Retain backups according to policy.
- Copy backups off the database server.
- Test restoration regularly.
- Protect backup files from unauthorized access.

---

## 19. Backup Retention

Keeping every backup forever is usually impractical.

A retention policy determines how long backups are stored.

Example:

| Backup type     | Retention                            |
| --------------- | ------------------------------------ |
| Daily backups   | 7 days                               |
| Weekly backups  | 4 weeks                              |
| Monthly backups | 12 months                            |
| Annual backups  | According to compliance requirements |

Example cleanup command:

```bash
find /home/adminuser/postgres_backups \
    -type f \
    -name "*.backup" \
    -mtime +7 \
    -delete
```

This deletes matching backup files older than seven days.

**Warning:** Test cleanup commands before scheduling them. Keep backups outside the directory being cleaned if you want to retain other files.

---

## 20. Backup Verification

A backup file existing on disk does not prove that it can be restored.

Verification should include:

### Check file existence

```bash
ls -lh /home/adminuser/postgres_backups/
```

### Check custom archive integrity

```bash
pg_restore --list techbazaar.backup
```

### Restore to a test database

```sql
CREATE DATABASE techbazaar_test_restore;
```

```bash
pg_restore \
  -U postgres \
  -d techbazaar_test_restore \
  techbazaar.backup
```

### Verify important tables

```sql
SELECT COUNT(*) FROM customers;

SELECT COUNT(*) FROM orders;

SELECT COUNT(*) FROM products;
```

### Check constraints and indexes

```sql
\dt
```

```sql
\di
```

### Important

A backup strategy is incomplete until you have successfully tested restoration.

---

## 21. Common Backup and Recovery Mistakes

| Mistake                                            | Correct understanding                                                               |
| -------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Assuming pg_dump is a physical backup              | pg_dump creates a logical backup                                                    |
| Assuming pg_dump backs up roles                    | Global roles require separate backup, such as pg_dumpall --globals-only             |
| Assuming WAL alone is sufficient                   | PITR needs a valid base backup and the required WAL                                 |
| Keeping backups only on the same server            | Hardware failure or compromise can destroy both                                     |
| Never testing restoration                          | A backup may be incomplete, corrupted or unusable                                   |
| Running backups without monitoring                 | Failures may remain unnoticed                                                       |
| Deleting old backups without checking              | Cleanup can remove required recovery points                                         |
| Assuming a backup provides zero data loss          | Recovery point depends on backup and WAL strategy                                   |
| Restoring directly over production without testing | Can overwrite or destroy valid data                                                 |
| Using incompatible physical backup files           | Physical recovery requires compatible PostgreSQL versions and cluster configuration |

---

## 22. Practical Backup Strategy for a Production Application

For an application such as TechBazaar, a reasonable starting architecture could include:

### Logical backups

- Daily custom-format `pg_dump`.
- Separate backup of global roles and tablespaces.
- Off-server storage.
- Defined retention policy.

### Physical backups

- Periodic base backups.
- Continuous WAL archiving.
- PITR configuration.
- Separate recovery infrastructure.

### Operational controls

- Backup success monitoring.
- Storage-capacity monitoring.
- Encryption at rest and in transit.
- Restricted backup access.
- Regular restore testing.
- Documented recovery procedures.

### Example architecture

```text
Production PostgreSQL
        |
        |---- Daily logical backup
        |          |
        |          └── Offsite backup storage
        |
        |---- Physical base backup
        |          |
        |          └── Backup storage
        |
        └---- Continuous WAL archiving
                   |
                   └── WAL archive storage

Backup + WAL
      |
      └── Recovery environment
                 |
                 └── Restored PostgreSQL cluster
```

---

## 23. Practice Exercises

### Logical backups

1. Create a plain SQL backup of TechBazaar.
2. Create a custom-format backup.
3. Back up only the schema.
4. Back up only the data.
5. Back up the `customers` table.
6. Back up the `sales` schema.
7. Inspect a custom backup using `pg_restore --list`.
8. Restore a plain SQL backup using `psql`.
9. Restore a custom backup using `pg_restore`.
10. Restore selected objects from an archive.

### Cluster backups

11. Export all databases using `pg_dumpall`.
12. Export only global objects.
13. Restore roles and global objects.
14. Explain why database backups and role backups are different.

### Physical backups and recovery

15. Create a replication role.
16. Understand the `pg_basebackup` command.
17. Explain the purpose of WAL.
18. Explain continuous WAL archiving.
19. Describe the requirements for PITR.
20. Explain how to recover from accidental data deletion.

### Production operations

21. Write a shell backup script.
22. Schedule it using cron.
23. Implement a backup retention policy.
24. Restore a backup into a separate test database.
25. Verify restored tables and indexes.
26. Define suitable RPO and RTO values for a sample production application.

---

## 24. Interview Questions

**Q1. What is a database backup?**

A copy of database data and related information used to restore the database after failure or data loss.

**Q2. What is the difference between logical and physical backups?**

Logical backups export database objects and data. Physical backups copy the database cluster's physical files.

**Q3. What is pg_dump?**

A PostgreSQL utility for creating logical backups of a single database.

**Q4. What is pg_dumpall?**

A utility for creating logical backups of all databases and cluster-wide objects such as roles and tablespaces.

**Q5. What is pg_restore?**

A utility used to restore non-plain archive formats created by PostgreSQL dump tools.

**Q6. Can pg_restore restore a plain SQL backup?**

No. Use `psql` for plain SQL backups.

**Q7. What is pg_basebackup?**

A PostgreSQL utility for creating a physical base backup of a database cluster.

**Q8. What is WAL?**

Write-Ahead Logging records database changes before corresponding data-page changes are written.

**Q9. What is PITR?**

Point-in-Time Recovery allows a PostgreSQL cluster to be restored to a selected point in time using a base backup and archived WAL.

**Q10. What is the difference between a base backup and WAL?**

A base backup provides the starting physical database copy. WAL contains the changes needed to advance that copy to a later recovery point.

**Q11. What is RPO?**

Recovery Point Objective: the maximum acceptable amount of data loss measured in time.

**Q12. What is RTO?**

Recovery Time Objective: the maximum acceptable time to restore service.

**Q13. Does pg_dump support point-in-time recovery by itself?**

No. PITR requires physical backup and WAL recovery infrastructure.

**Q14. Why should backups be stored offsite?**

To protect against server failure, accidental deletion, ransomware and infrastructure loss affecting the primary environment.

**Q15. Why is restore testing necessary?**

Because backup creation alone does not prove that the backup is complete or recoverable.

**Q16. Can you restore a single table from a full custom-format backup?**

Yes. `pg_restore` supports selective object restoration.

**Q17. Does pg_dump back up database roles?**

No. Use `pg_dumpall --globals-only` or another suitable method for global objects.

**Q18. What is the purpose of WAL archiving?**

It preserves WAL files so PostgreSQL can perform recovery beyond the point covered by the base backup.

**Q19. What happens if an archived WAL file is missing?**

Recovery may be unable to reach a target that requires that WAL segment.

**Q20. What is the difference between backup and replication?**

Backup provides recoverable copies of data. Replication maintains another copy of database changes, primarily for availability and read scaling. Replication alone does not protect against every accidental or malicious change.

---

## Key Takeaways

- PostgreSQL supports logical and physical backups.
- `pg_dump` backs up one database logically.
- `pg_dumpall` can back up all databases and global objects.
- `pg_restore` restores custom, directory and tar archives.
- `psql` restores plain SQL dumps.
- `pg_basebackup` creates physical backups.
- WAL supports crash recovery, replication and PITR.
- PITR requires a base backup and the necessary archived WAL.
- RPO measures acceptable data loss.
- RTO measures acceptable recovery time.
- Automate backups using cron or other scheduling systems.
- Keep backups offsite and apply a retention policy.
- Monitor backup success and storage capacity.
- Test restoration regularly.
- A backup that has never been restored successfully is an unverified backup.
