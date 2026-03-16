-- 1. Ensure the Event Scheduler is running
SET GLOBAL event_scheduler = ON;

-- 2. Drop the event if it exists
DROP EVENT IF EXISTS cleanup;

-- 3. Change Delimiter
DELIMITER //

CREATE EVENT cleanup
ON SCHEDULE EVERY 1 DAY
STARTS (CURRENT_DATE + INTERVAL 1 DAY + INTERVAL 1 HOUR)
COMMENT 'Cleans up entries in the mapping table older than 90 days'
DO
BEGIN
    DELETE FROM mapping 
    WHERE created_at < NOW() - INTERVAL 90 DAY;
END//

-- 4. Reset Delimiter back to semicolon
DELIMITER ;