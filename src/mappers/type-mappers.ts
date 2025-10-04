// ===== ADDRESS TYPE MAPPERS =====

export function mapAddressTypeToXml(
  type: string
): 'HOME' | 'WORK' | 'BILLING' | 'DELIVERY' {
  const mapping: Record<string, 'HOME' | 'WORK' | 'BILLING' | 'DELIVERY'> = {
    home: 'HOME',
    work: 'WORK',
    billing: 'BILLING',
    delivery: 'DELIVERY',
  };
  return mapping[type] || 'HOME';
}

export function mapAddressTypeFromXml(
  type: string
): 'home' | 'work' | 'billing' | 'delivery' {
  const mapping: Record<string, 'home' | 'work' | 'billing' | 'delivery'> = {
    HOME: 'home',
    WORK: 'work',
    BILLING: 'billing',
    DELIVERY: 'delivery',
  };
  return mapping[type] || 'home';
}

// ===== CONTACT TYPE MAPPERS =====

export function mapContactTypeToXml(
  type: string
): 'HOME' | 'WORK' | 'MOBILE' | 'FAX' {
  const mapping: Record<string, 'HOME' | 'WORK' | 'MOBILE' | 'FAX'> = {
    home: 'HOME',
    work: 'WORK',
    mobile: 'MOBILE',
    fax: 'FAX',
  };
  return mapping[type] || 'HOME';
}

export function mapContactTypeFromXml(
  type: string
): 'home' | 'work' | 'mobile' | 'fax' {
  const mapping: Record<string, 'home' | 'work' | 'mobile' | 'fax'> = {
    HOME: 'home',
    WORK: 'work',
    MOBILE: 'mobile',
    FAX: 'fax',
  };
  return mapping[type] || 'home';
}

export function mapEmailTypeToXml(type: string): 'HOME' | 'WORK' {
  const mapping: Record<string, 'HOME' | 'WORK'> = {
    home: 'HOME',
    work: 'WORK',
  };
  return mapping[type] || 'HOME';
}

export function mapEmailTypeFromXml(type: string): 'home' | 'work' {
  const mapping: Record<string, 'home' | 'work'> = {
    HOME: 'home',
    WORK: 'work',
  };
  return mapping[type] || 'home';
}

// ===== PASSENGER TYPE MAPPERS =====

export function mapPassengerTypeToXml(type: string): 'ADT' | 'CHD' | 'INF' {
  const mapping: Record<string, 'ADT' | 'CHD' | 'INF'> = {
    adult: 'ADT',
    child: 'CHD',
    infant: 'INF',
  };
  return mapping[type] || 'ADT';
}

export function mapPassengerTypeFromXml(
  type: string
): 'adult' | 'child' | 'infant' {
  const mapping: Record<string, 'adult' | 'child' | 'infant'> = {
    ADT: 'adult',
    CHD: 'child',
    INF: 'infant',
  };
  return mapping[type] || 'adult';
}

export function mapTitleToXml(
  title: string
): 'MR' | 'MRS' | 'MS' | 'DR' | 'PROF' {
  const mapping: Record<string, 'MR' | 'MRS' | 'MS' | 'DR' | 'PROF'> = {
    mr: 'MR',
    mrs: 'MRS',
    ms: 'MS',
    dr: 'DR',
    prof: 'PROF',
  };
  return mapping[title] || 'MR';
}

export function mapTitleFromXml(
  title: string
): 'mr' | 'mrs' | 'ms' | 'dr' | 'prof' {
  const mapping: Record<string, 'mr' | 'mrs' | 'ms' | 'dr' | 'prof'> = {
    MR: 'mr',
    MRS: 'mrs',
    MS: 'ms',
    DR: 'dr',
    PROF: 'prof',
  };
  return mapping[title] || 'mr';
}

// ===== SERVICE TYPE MAPPERS =====

export function mapServiceTypeToXml(
  type: string
): 'FLIGHT' | 'HOTEL' | 'CAR' | 'TRANSFER' | 'INSURANCE' {
  const mapping: Record<
    string,
    'FLIGHT' | 'HOTEL' | 'CAR' | 'TRANSFER' | 'INSURANCE'
  > = {
    flight: 'FLIGHT',
    hotel: 'HOTEL',
    car: 'CAR',
    transfer: 'TRANSFER',
    insurance: 'INSURANCE',
  };
  return mapping[type] || 'FLIGHT';
}

export function mapServiceTypeFromXml(
  type: string
): 'flight' | 'hotel' | 'car' | 'transfer' | 'insurance' {
  const mapping: Record<
    string,
    'flight' | 'hotel' | 'car' | 'transfer' | 'insurance'
  > = {
    FLIGHT: 'flight',
    HOTEL: 'hotel',
    CAR: 'car',
    TRANSFER: 'transfer',
    INSURANCE: 'insurance',
  };
  return mapping[type] || 'flight';
}

export function mapServiceStatusToXml(
  status: string
): 'CONFIRMED' | 'PENDING' | 'CANCELLED' {
  const mapping: Record<string, 'CONFIRMED' | 'PENDING' | 'CANCELLED'> = {
    confirmed: 'CONFIRMED',
    pending: 'PENDING',
    cancelled: 'CANCELLED',
  };
  return mapping[status] || 'PENDING';
}

export function mapServiceStatusFromXml(
  status: string
): 'confirmed' | 'pending' | 'cancelled' {
  const mapping: Record<string, 'confirmed' | 'pending' | 'cancelled'> = {
    CONFIRMED: 'confirmed',
    PENDING: 'pending',
    CANCELLED: 'cancelled',
  };
  return mapping[status] || 'pending';
}

// ===== PAYMENT TYPE MAPPERS =====

export function mapPaymentTypeToXml(
  type: string
): 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'CASH' {
  const mapping: Record<
    string,
    'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'CASH'
  > = {
    credit_card: 'CREDIT_CARD',
    debit_card: 'DEBIT_CARD',
    bank_transfer: 'BANK_TRANSFER',
    cash: 'CASH',
  };
  return mapping[type] || 'CASH';
}

export function mapPaymentTypeFromXml(
  type: string
): 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash' {
  const mapping: Record<
    string,
    'credit_card' | 'debit_card' | 'bank_transfer' | 'cash'
  > = {
    CREDIT_CARD: 'credit_card',
    DEBIT_CARD: 'debit_card',
    BANK_TRANSFER: 'bank_transfer',
    CASH: 'cash',
  };
  return mapping[type] || 'cash';
}

export function mapPaymentStatusToXml(
  status: string
): 'PENDING' | 'CONFIRMED' | 'FAILED' {
  const mapping: Record<string, 'PENDING' | 'CONFIRMED' | 'FAILED'> = {
    pending: 'PENDING',
    confirmed: 'CONFIRMED',
    failed: 'FAILED',
  };
  return mapping[status] || 'PENDING';
}

export function mapPaymentStatusFromXml(
  status: string
): 'pending' | 'confirmed' | 'failed' {
  const mapping: Record<string, 'pending' | 'confirmed' | 'failed'> = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    FAILED: 'failed',
  };
  return mapping[status] || 'pending';
}

// ===== CUSTOMER TYPE MAPPERS =====

export function mapCustomerTypeToXml(
  type: string
): 'CUSTOMER' | 'AGENT' | 'SUPPLIER' {
  const mapping: Record<string, 'CUSTOMER' | 'AGENT' | 'SUPPLIER'> = {
    customer: 'CUSTOMER',
    agent: 'AGENT',
    supplier: 'SUPPLIER',
  };
  return mapping[type] || 'CUSTOMER';
}

export function mapCustomerTypeFromXml(
  type: string
): 'customer' | 'agent' | 'supplier' {
  const mapping: Record<string, 'customer' | 'agent' | 'supplier'> = {
    CUSTOMER: 'customer',
    AGENT: 'agent',
    SUPPLIER: 'supplier',
  };
  return mapping[type] || 'customer';
}

export function mapCustomerStatusToXml(
  status: string
): 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' {
  const mapping: Record<string, 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'> = {
    active: 'ACTIVE',
    inactive: 'INACTIVE',
    suspended: 'SUSPENDED',
  };
  return mapping[status] || 'ACTIVE';
}

export function mapCustomerStatusFromXml(
  status: string
): 'active' | 'inactive' | 'suspended' {
  const mapping: Record<string, 'active' | 'inactive' | 'suspended'> = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
  };
  return mapping[status] || 'active';
}

export function mapCommunicationMethodToXml(
  method: string
): 'EMAIL' | 'SMS' | 'PHONE' {
  const mapping: Record<string, 'EMAIL' | 'SMS' | 'PHONE'> = {
    email: 'EMAIL',
    sms: 'SMS',
    phone: 'PHONE',
  };
  return mapping[method] || 'EMAIL';
}

export function mapCommunicationMethodFromXml(
  method: string
): 'email' | 'sms' | 'phone' {
  const mapping: Record<string, 'email' | 'sms' | 'phone'> = {
    EMAIL: 'email',
    SMS: 'sms',
    PHONE: 'phone',
  };
  return mapping[method] || 'email';
}

// ===== BOOKING TYPE MAPPERS =====

export function mapBookingTypeToXml(
  type: string
): 'INDIVIDUAL' | 'GROUP' | 'CORPORATE' {
  const mapping: Record<string, 'INDIVIDUAL' | 'GROUP' | 'CORPORATE'> = {
    individual: 'INDIVIDUAL',
    group: 'GROUP',
    corporate: 'CORPORATE',
  };
  return mapping[type] || 'INDIVIDUAL';
}

export function mapBookingStatusToXml(
  status: string
): 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' {
  const mapping: Record<
    string,
    'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  > = {
    pending: 'PENDING',
    confirmed: 'CONFIRMED',
    cancelled: 'CANCELLED',
    completed: 'COMPLETED',
  };
  return mapping[status] || 'PENDING';
}

export function mapBookingStatusFromXml(
  status: string
): 'pending' | 'confirmed' | 'cancelled' | 'completed' {
  const mapping: Record<
    string,
    'pending' | 'confirmed' | 'cancelled' | 'completed'
  > = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
  };
  return mapping[status] || 'pending';
}

export function mapPriorityToXml(
  priority: string
): 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' {
  const mapping: Record<string, 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'> = {
    low: 'LOW',
    normal: 'NORMAL',
    high: 'HIGH',
    urgent: 'URGENT',
  };
  return mapping[priority] || 'NORMAL';
}

// ===== SPECIAL REQUEST TYPE MAPPERS =====

export function mapSpecialRequestTypeToXml(
  type: string
): 'MEAL' | 'SEAT' | 'WHEELCHAIR' | 'OTHER' {
  const mapping: Record<string, 'MEAL' | 'SEAT' | 'WHEELCHAIR' | 'OTHER'> = {
    meal: 'MEAL',
    seat: 'SEAT',
    wheelchair: 'WHEELCHAIR',
    other: 'OTHER',
  };
  return mapping[type] || 'OTHER';
}

// ===== CANCEL REASON TYPE MAPPERS =====

export function mapCancelReasonToXml(
  reason: string
): 'CUSTOMER_REQUEST' | 'NO_SHOW' | 'OPERATIONAL' | 'OTHER' {
  const mapping: Record<
    string,
    'CUSTOMER_REQUEST' | 'NO_SHOW' | 'OPERATIONAL' | 'OTHER'
  > = {
    customer_request: 'CUSTOMER_REQUEST',
    no_show: 'NO_SHOW',
    operational: 'OPERATIONAL',
    other: 'OTHER',
  };
  return mapping[reason] || 'OTHER';
}

export function mapRefundMethodToXml(
  method: string
): 'ORIGINAL_PAYMENT' | 'CREDIT' | 'CASH' {
  const mapping: Record<string, 'ORIGINAL_PAYMENT' | 'CREDIT' | 'CASH'> = {
    original_payment: 'ORIGINAL_PAYMENT',
    credit: 'CREDIT',
    cash: 'CASH',
  };
  return mapping[method] || 'CASH';
}

// ===== DOCUMENT TYPE MAPPERS =====

export function mapDocumentTypeToXml(
  type: string
): 'CONFIRMATION' | 'INVOICE' | 'VOUCHER' | 'TICKET' | 'ALL' {
  const mapping: Record<
    string,
    'CONFIRMATION' | 'INVOICE' | 'VOUCHER' | 'TICKET' | 'ALL'
  > = {
    confirmation: 'CONFIRMATION',
    invoice: 'INVOICE',
    voucher: 'VOUCHER',
    ticket: 'TICKET',
    all: 'ALL',
  };
  return mapping[type] || 'ALL';
}

export function mapDocumentFormatToXml(format: string): 'PDF' | 'HTML' | 'XML' {
  const mapping: Record<string, 'PDF' | 'HTML' | 'XML'> = {
    pdf: 'PDF',
    html: 'HTML',
    xml: 'XML',
  };
  return mapping[format] || 'PDF';
}

export function mapDeliveryMethodToXml(
  method: string
): 'EMAIL' | 'SMS' | 'DOWNLOAD' {
  const mapping: Record<string, 'EMAIL' | 'SMS' | 'DOWNLOAD'> = {
    email: 'EMAIL',
    sms: 'SMS',
    download: 'DOWNLOAD',
  };
  return mapping[method] || 'EMAIL';
}

// ===== SEARCH OPERATOR TYPE MAPPERS =====

export function mapSearchOperatorToXml(
  operator: string
): 'EQUALS' | 'CONTAINS' | 'STARTS_WITH' | 'ENDS_WITH' {
  const mapping: Record<
    string,
    'EQUALS' | 'CONTAINS' | 'STARTS_WITH' | 'ENDS_WITH'
  > = {
    equals: 'EQUALS',
    contains: 'CONTAINS',
    starts_with: 'STARTS_WITH',
    ends_with: 'ENDS_WITH',
  };
  return mapping[operator] || 'EQUALS';
}

// ===== PRICING ITEM TYPE MAPPERS =====

export function mapPricingItemTypeFromXml(
  type: string
): 'service' | 'tax' | 'fee' | 'discount' {
  const mapping: Record<string, 'service' | 'tax' | 'fee' | 'discount'> = {
    SERVICE: 'service',
    TAX: 'tax',
    FEE: 'fee',
    DISCOUNT: 'discount',
  };
  return mapping[type] || 'service';
}

// ===== DELIVERY STATUS TYPE MAPPERS =====

export function mapDeliveryStatusFromXml(
  status: string
): 'sent' | 'pending' | 'failed' {
  const mapping: Record<string, 'sent' | 'pending' | 'failed'> = {
    SENT: 'sent',
    PENDING: 'pending',
    FAILED: 'failed',
  };
  return mapping[status] || 'pending';
}

export function mapGenderToXml(gender: string): 'M' | 'F' {
  const mapping: Record<string, 'M' | 'F'> = {
    male: 'M',
    female: 'F',
  };
  return mapping[gender] || 'M';
}

export function mapGenderFromXml(gender: string): 'male' | 'female' {
  const mapping: Record<string, 'male' | 'female'> = {
    M: 'male',
    F: 'female',
  };
  return mapping[gender] || 'male';
}
