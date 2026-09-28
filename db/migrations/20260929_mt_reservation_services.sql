-- Нэг захиалга дээр олон үйлчилгээ: mt_reservation.service_id (ганц) → mt_reservation_services (олон мөр).
-- Мөр бүр үйлчилгээний нэр, үнэ, үргэлжлэх хугацааг захиалах үеийнхээр нь хуулж хадгална.
-- mt_reservation.service_id-г хуучин query-нүүдэд зориулж эхний үйлчилгээгээр үргэлжлүүлэн бөглөнө.

BEGIN;

CREATE TABLE IF NOT EXISTS mt_reservation_services (
  reservation_service_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id         uuid NOT NULL REFERENCES mt_reservation(reservation_id) ON DELETE CASCADE,
  service_id             integer REFERENCES mt_services(service_id) ON DELETE SET NULL,
  service_name           varchar(255) NOT NULL,
  price                  numeric NOT NULL DEFAULT 0 CHECK (price >= 0),
  duration               integer CHECK (duration IS NULL OR duration > 0), -- минут
  sort_order             integer NOT NULL DEFAULT 0,
  create_date            timestamptz DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS mt_reservation_services_reservation_idx ON mt_reservation_services (reservation_id, sort_order);
CREATE INDEX IF NOT EXISTS mt_reservation_services_service_idx ON mt_reservation_services (service_id);

-- Одоо байгаа захиалгуудыг шилжүүлэх
INSERT INTO mt_reservation_services (reservation_id, service_id, service_name, price, duration, sort_order)
SELECT r.reservation_id, r.service_id, s.name, COALESCE(s.price, 0), NULLIF(s.duration, 0), 0
FROM mt_reservation r
JOIN mt_services s ON s.service_id = r.service_id
WHERE NOT EXISTS (SELECT 1 FROM mt_reservation_services rs WHERE rs.reservation_id = r.reservation_id);

COMMIT;
