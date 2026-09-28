-- Нэг ажил дээр олон үйлчилгээ: mt_works.service_id (ганц) → mt_work_services (олон мөр).
-- Мөр бүр үйлчилгээний нэр, үнийг хадгалах үеийнхээр нь хуулж хадгална. Ингэснээр үнийн
-- жагсаалт өөрчлөгдөх эсвэл үйлчилгээ устсан ч ажлын түүх, дүн хэвээр үлдэнэ.
-- mt_works.price нь мөрүүдийн нийлбэр (price * quantity) байна.
-- mt_works.service_id-г хуучин query-нүүдэд зориулж эхний үйлчилгээгээр үргэлжлүүлэн бөглөнө.

BEGIN;

CREATE TABLE IF NOT EXISTS mt_work_services (
  work_service_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id         uuid NOT NULL REFERENCES mt_works(work_id) ON DELETE CASCADE,
  service_id      integer REFERENCES mt_services(service_id) ON DELETE SET NULL,
  service_name    varchar(255) NOT NULL,
  price           numeric NOT NULL DEFAULT 0 CHECK (price >= 0),
  quantity        integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  sort_order      integer NOT NULL DEFAULT 0,
  create_date     timestamptz DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS mt_work_services_work_idx ON mt_work_services (work_id, sort_order);
CREATE INDEX IF NOT EXISTS mt_work_services_service_idx ON mt_work_services (service_id);

-- Одоо байгаа ажлуудыг шилжүүлэх. Мөрийн үнэ = ажлын үнэ тул нийт дүн өөрчлөгдөхгүй.
INSERT INTO mt_work_services (work_id, service_id, service_name, price, quantity, sort_order)
SELECT w.work_id, w.service_id, s.name, COALESCE(w.price, 0), 1, 0
FROM mt_works w
JOIN mt_services s ON s.service_id = w.service_id
WHERE NOT EXISTS (SELECT 1 FROM mt_work_services ws WHERE ws.work_id = w.work_id);

COMMIT;
