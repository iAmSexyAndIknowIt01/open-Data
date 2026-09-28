-- Захиалгаас ажил үүсгэх: харилцагч ирэхэд бүртгэлийн ажилтан "Ажил эхлүүлэх" дарж
-- захиалгын мэдээллийг mt_works руу шилжүүлнэ.
--   * mt_works.reservation_id — аль захиалгаас үүссэн (нэг захиалгаас нэг л ажил)
--   * mt_reservation.status 'in_service' — "Ажилд шилжсэн". Үүнээс хойш захиалгын төлөвийг ажил удирдана:
--     ажил дуусвал захиалга 'completed' болно; ажил цуцлагдвал цуцлалт ажил дээр л хийгдэж,
--     захиалга өөрийн өгөгдөл, холбоосоороо үлдэнэ.

BEGIN;

ALTER TABLE mt_works
  ADD COLUMN IF NOT EXISTS reservation_id uuid REFERENCES mt_reservation(reservation_id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS mt_works_reservation_id_key ON mt_works (reservation_id) WHERE reservation_id IS NOT NULL;

ALTER TABLE mt_reservation DROP CONSTRAINT IF EXISTS mt_reservation_status_check;
ALTER TABLE mt_reservation ADD CONSTRAINT mt_reservation_status_check
  CHECK (status IN ('pending', 'confirmed', 'in_service', 'completed', 'cancelled', 'no_show'));

COMMIT;
