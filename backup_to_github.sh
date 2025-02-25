#!/bin/bash
# Automated backup script for MongoDB running in Docker.
# This script will:
# 1. Dump the database using mongodump.
# 2. Archive the dump into a timestamped file.
# 3. Commit and push the backup file to your GitHub branch.
#
# Ensure that Git is already set up for passwordless commits (via SSH keys or a credential helper).

# Configuration variables (customize these as needed)
CONTAINER_NAME="mongo_container"
BACKUP_DIR="./backup"       # Directory within your repository to store backups
BRANCH="LocalDev"           # Git branch to push backups to

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting MongoDB backup..."

# 1. Run mongodump inside the container to dump the DB into /data/backup
docker exec "$CONTAINER_NAME" mongodump --out /data/backup

# 2. Copy the backup from the container to a temporary folder on the host
TEMP_BACKUP_DIR="$BACKUP_DIR/tmp_backup"
rm -rf "$TEMP_BACKUP_DIR"
docker cp "$CONTAINER_NAME":/data/backup "$TEMP_BACKUP_DIR"

# 3. Archive the backup into a timestamped tar.gz file
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
ARCHIVE_NAME="mongo-backup-$TIMESTAMP.tar.gz"
tar -czf "$BACKUP_DIR/$ARCHIVE_NAME" -C "$BACKUP_DIR" tmp_backup

# Remove the temporary folder
rm -rf "$TEMP_BACKUP_DIR"

echo "Backup archived as $ARCHIVE_NAME."

# 4. Commit and push the backup file to GitHub
echo "Committing backup to GitHub..."
git checkout "$BRANCH" || { echo "Error: Could not checkout branch $BRANCH"; exit 1; }
git add "$BACKUP_DIR/$ARCHIVE_NAME"
git commit -m "Backup: $ARCHIVE_NAME"
git push origin "$BRANCH"

echo "Backup process complete and pushed to GitHub."
