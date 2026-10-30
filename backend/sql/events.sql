-- =============================================================
-- UBMS — Scheduled Events
-- Run after schema.sql
-- Requires event_scheduler = ON  (set below)
-- =============================================================
USE ubms;

SET GLOBAL event_scheduler = ON;

DELIMITER $$

-- --------------------------------------------------------
-- evt_flag_overdue_tuition
-- Runs daily at midnight.
-- Marks any tuition fee as 'overdue' when due_date has passed
-- and the fee is still 'unpaid'.
-- --------------------------------------------------------
DROP EVENT IF EXISTS evt_flag_overdue_tuition $$

CREATE EVENT evt_flag_overdue_tuition
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
COMMENT 'Daily: flag past-due unpaid tuition fees as overdue'
DO
BEGIN
    UPDATE tuition_fee
    SET    payment_status = 'overdue'
    WHERE  payment_status = 'unpaid'
      AND  due_date < CURDATE();
END $$

-- --------------------------------------------------------
-- evt_flag_overdue_utility
-- Runs on the 1st of every month.
-- Marks utility bills as 'overdue' when their billing period
-- is in the past and they are still 'unpaid'.
-- --------------------------------------------------------
DROP EVENT IF EXISTS evt_flag_overdue_utility $$

CREATE EVENT evt_flag_overdue_utility
ON SCHEDULE EVERY 1 MONTH
STARTS DATE_FORMAT(NOW() + INTERVAL 1 MONTH, '%Y-%m-01')
COMMENT 'Monthly: flag past-due unpaid utility bills as overdue'
DO
BEGIN
    UPDATE utility_bill
    SET payment_status = 'overdue'
    WHERE  payment_status = 'unpaid'
      AND (
            billing_year < YEAR(CURDATE())
            OR (billing_year = YEAR(CURDATE()) AND billing_month < MONTH(CURDATE()))
          );
END $$

DELIMITER;