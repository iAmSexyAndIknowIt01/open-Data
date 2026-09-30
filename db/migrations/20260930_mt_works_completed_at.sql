-- Ажил дууссан мөчийг хадгалах: mt_works.completed_at
--   Өмнө нь "энэ сард дуусгасан" гэдгийг update_date-ээр тооцдог байсан тул дууссан ажлыг
--   дараа нь засахад өөр сард шилждэг, орлогыг бүртгэсэн огноогоор тооцдог байсан.
--   * Төлөв 'completed' болох үед completed_at = now(), өөр төлөв рүү буцвал NULL.
--     Аль ч код (ажил засах, захиалгаас ажил үүсгэх г.м.) төлөв солиход автоматаар ажиллахаар trigger-ээр хийв.
--   * Хуучин дууссан ажлын яг дууссан мөч мэдэгдэхгүй тул хамгийн ойр утга болох update_date-ээр бөглөнө.

BEGIN;

ALTER TABLE mt_works ADD COLUMN IF NOT EXISTS completed_at timestamptz;

UPDATE mt_works
SET completed_at = COALESCE(update_date, create_date)
WHERE status = 'completed' AND completed_at IS NULL;

CREATE OR REPLACE FUNCTION mt_works_set_completed_at() RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    IF TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'completed' THEN
      NEW.completed_at := now();
    END IF;
  ELSE
    NEW.completed_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS mt_works_completed_at ON mt_works;
CREATE TRIGGER mt_works_completed_at
  BEFORE INSERT OR UPDATE OF status ON mt_works
  FOR EACH ROW EXECUTE FUNCTION mt_works_set_completed_at();

CREATE INDEX IF NOT EXISTS mt_works_company_completed_at_idx
  ON mt_works (company_id, completed_at) WHERE status = 'completed';

COMMIT;
