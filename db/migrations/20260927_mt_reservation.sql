-- Захиалга (цаг авалт): харилцагч үйлчлүүлэх өдөр, цагаа захиална.
-- Хувь хүн бол mt_customer, байгууллага бол mt_customercompany-оос мэдээллийг
-- захиалга үүсгэх үед хуулж (snapshot) хадгална. Харилцагчийн мэдээлэл хожим
-- өөрчлөгдөх эсвэл устсан ч захиалгын түүх хэвээр үлдэнэ.

CREATE TABLE IF NOT EXISTS mt_reservation (
  reservation_id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          uuid NOT NULL REFERENCES mt_company(company_id) ON DELETE CASCADE,

  -- Харилцагч
  customer_type       varchar(20) NOT NULL CHECK (customer_type IN ('individual', 'company')),
  customer_id         uuid REFERENCES mt_customer(customer_id) ON DELETE SET NULL,
  company_customer_id uuid REFERENCES mt_customercompany(company_customer_id) ON DELETE SET NULL,
  customer_name       varchar(255) NOT NULL,
  customer_phone      varchar(50),
  customer_email      varchar(255),
  customer_address    text,
  customer_register   varchar(50), -- байгууллагын регистр / татварын дугаар

  -- Үйлчилгээ, хариуцах ажилтан
  service_id          integer REFERENCES mt_services(service_id) ON DELETE SET NULL,
  assigned_employee   uuid REFERENCES mt_user(user_id) ON DELETE SET NULL,

  -- Цаг
  reservation_date    date NOT NULL,
  start_time          time NOT NULL,
  end_time            time,

  status              varchar(20) NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  note                text,
  created_by          uuid REFERENCES mt_user(user_id) ON DELETE SET NULL,
  create_date         timestamptz DEFAULT CURRENT_TIMESTAMP,
  update_date         timestamptz DEFAULT CURRENT_TIMESTAMP,

  -- Харилцагчийн төрөлтэй тохирох ID-г л хадгална
  CONSTRAINT mt_reservation_customer_type_chk CHECK (
    (customer_type = 'individual' AND company_customer_id IS NULL) OR
    (customer_type = 'company' AND customer_id IS NULL)
  ),
  CONSTRAINT mt_reservation_time_chk CHECK (end_time IS NULL OR end_time > start_time)
);

CREATE INDEX IF NOT EXISTS mt_reservation_company_date_idx
  ON mt_reservation (company_id, reservation_date, start_time);
CREATE INDEX IF NOT EXISTS mt_reservation_employee_date_idx
  ON mt_reservation (assigned_employee, reservation_date);
