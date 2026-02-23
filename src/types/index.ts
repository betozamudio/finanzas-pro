export interface Cuenta {
  id: string
  user_id: string
  nombre: string
  tipo: 'debito' | 'credito' | 'efectivo'
  banco?: string
  balance: number
  color: string
  activa: boolean
  created_at: string
}

export interface Categoria {
  id: string
  user_id: string
  nombre: string
  tipo: 'egreso' | 'ingreso' | 'ambos'
  icono: string
  color: string
  created_at: string
}

export interface Ingreso {
  id: string
  user_id: string
  fecha: string
  concepto: string
  monto: number
  fuente?: string
  cuenta_id?: string
  cuenta?: Cuenta
  notas?: string
  created_at: string
}

export interface Egreso {
  id: string
  user_id: string
  fecha: string
  concepto: string
  cantidad: number
  precio_unitario: number
  descuento: number
  total: number
  partida?: string
  categoria_id?: string
  categoria?: Categoria
  cuenta_id?: string
  cuenta?: Cuenta
  metodo_pago?: string
  proveedor?: string
  notas?: string
  created_at: string
}

export interface Transferencia {
  id: string
  user_id: string
  fecha: string
  concepto: string
  monto: number
  cuenta_origen_id?: string
  cuenta_origen?: Cuenta
  cuenta_destino_id?: string
  cuenta_destino?: Cuenta
  notas?: string
  created_at: string
}

export interface Servicio {
  id: string
  user_id: string
  nombre: string
  facturacion?: string
  costo: number
  fecha_inicio?: string
  fecha_renovacion?: string
  status: string
  icono?: string
  created_at: string
}

export interface BudgetItem {
  id: string
  user_id: string
  partida: string
  categoria_id?: string
  presupuesto_mensual: number
  mes: number
  anio: number
  created_at: string
}

export interface BalanceMensual {
  id: string
  user_id: string
  mes: number
  anio: number
  total_ingresos: number
  total_egresos: number
  saldo_final: number
  ahorro_porcentaje: number
}

export interface Imprevisto {
  id: string
  user_id: string
  concepto: string
  categoria?: string
  estado: string
  fecha?: string
  fecha_limite?: string
  saldo_total: number
  saldo_cubierto: number
  notas?: string
  created_at: string
}

export interface Credito {
  id: string
  user_id: string
  concepto: string
  entidad?: string
  tipo?: string
  monto_inicial: number
  tasa_interes: number
  plazo_meses: number
  cuota_mensual: number
  costo_total: number
  pagos_realizados: number
  total_pagado: number
  saldo_pendiente: number
  estado_credito: string
  estado_pago: string
  fecha_inicio?: string
  fecha_termino?: string
  fecha_limite_pago?: string
  cuenta_id?: string
  cuenta?: Cuenta
  created_at: string
}

export interface GiftItem {
  id: string
  user_id: string
  articulo: string
  precio: number
  marca?: string
  categoria?: string
  establecimiento?: string
  url?: string
  liquidado: boolean
  plan_pago: boolean
  pago_mensual: number
  plazo: number
  inicio?: string
  finaliza?: string
  no_pago: number
  notas?: string
  created_at: string
}

export interface ReservaMonetaria {
  id: string
  user_id: string
  nombre: string
  meta: number
  saldo_actual: number
  estado: string
  created_at: string
}

export interface ReservaHistorial {
  id: string
  user_id: string
  reserva_id: string
  fecha: string
  concepto: string
  operacion: string
  monto: number
  medio_pago?: string
  created_at: string
}
