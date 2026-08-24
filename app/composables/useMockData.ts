import type {
  MetricData,
  InsightData,
  MovementData,
  PaymentData,
  ReviewItem,
  ExpenseChartData,
  TimelineEvent,
} from '~/types'

export function useMockData() {
  const metrics = ref<MetricData[]>([
    {
      label: 'Ingresos',
      value: 4_850_000,
      variation: 12.5,
      trend: 'up',
      icon: 'lucide:trending-up',
      format: 'currency',
    },
    {
      label: 'Gastos',
      value: 2_340_000,
      variation: -3.2,
      trend: 'down',
      icon: 'lucide:trending-down',
      format: 'currency',
    },
    {
      label: 'Ganancia',
      value: 2_510_000,
      variation: 18.7,
      trend: 'up',
      icon: 'lucide:wallet',
      format: 'currency',
    },
    {
      label: 'Margen',
      value: 51.8,
      variation: 2.1,
      trend: 'up',
      icon: 'lucide:percent',
      format: 'percent',
    },
  ])

  const operationalMetrics = ref([
    {
      label: 'Litros vendidos',
      value: 142,
      variation: 8.3,
      trend: 'up' as const,
      icon: 'lucide:glass-water',
      format: 'number' as const,
    },
    {
      label: 'Costo promedio / litro',
      value: 16_480,
      variation: 5.2,
      trend: 'up' as const,
      icon: 'lucide:calculator',
      format: 'currency' as const,
    },
    {
      label: 'Producto más vendido',
      value: 48,
      variation: 0,
      trend: 'neutral' as const,
      icon: 'lucide:star',
      format: 'number' as const,
      extra: 'Negroni',
    },
    {
      label: 'Margen objetivo',
      value: 51.8,
      variation: -3.2,
      trend: 'down' as const,
      icon: 'lucide:target',
      format: 'percent' as const,
      extra: '55%',
    },
  ])

  const insights = ref<InsightData[]>([
    {
      type: 'warning',
      message: 'El costo de frutas aumentó un 13% este mes.',
    },
    {
      type: 'info',
      message: 'El Negroni perdió 4 puntos de margen respecto al mes anterior.',
    },
    {
      type: 'warning',
      message: 'Hay 3 insumos por debajo del stock mínimo.',
      action: 'Ver inventario',
    },
    {
      type: 'success',
      message: 'El volumen vendido aumentó un 14%.',
    },
  ])

  const recentMovements = ref<MovementData[]>([
    {
      id: '1',
      concepto: 'Compra de Gin',
      categoria: 'Bebidas',
      proveedor: 'Distribuidora Premium',
      fecha: '2026-08-20',
      monto: 120_000,
      tipo: 'egreso',
    },
    {
      id: '2',
      concepto: 'Frutas para producción',
      categoria: 'Insumos',
      proveedor: 'Fruver del Sur',
      fecha: '2026-08-19',
      monto: 24_500,
      tipo: 'egreso',
    },
    {
      id: '3',
      concepto: 'Venta Negroni x12',
      categoria: 'Ventas',
      proveedor: '',
      fecha: '2026-08-19',
      monto: 504_000,
      tipo: 'ingreso',
    },
    {
      id: '4',
      concepto: 'Publicidad Meta Ads',
      categoria: 'Marketing',
      proveedor: 'Meta Platforms',
      fecha: '2026-08-18',
      monto: 30_000,
      tipo: 'egreso',
    },
    {
      id: '5',
      concepto: 'Venta Margarita x8',
      categoria: 'Ventas',
      proveedor: '',
      fecha: '2026-08-18',
      monto: 336_000,
      tipo: 'ingreso',
    },
    {
      id: '6',
      concepto: 'Packaging botellas',
      categoria: 'Packaging',
      proveedor: 'Envases & Cía',
      fecha: '2026-08-17',
      monto: 45_000,
      tipo: 'egreso',
    },
  ])

  const upcomingPayments = ref<PaymentData[]>([
    {
      id: '1',
      proveedor: 'Distribuidora Premium',
      concepto: 'Compra de gin y vermut',
      monto: 120_000,
      fecha: '2026-08-25',
      estado: 'pendiente',
    },
    {
      id: '2',
      proveedor: 'Envases & Cía',
      concepto: 'Packaging botellas',
      monto: 45_000,
      fecha: '2026-08-28',
      estado: 'pendiente',
    },
    {
      id: '3',
      proveedor: 'Meta Platforms',
      concepto: 'Publicidad agosto',
      monto: 30_000,
      fecha: '2026-08-30',
      estado: 'pendiente',
    },
    {
      id: '4',
      proveedor: 'Fruver del Sur',
      concepto: 'Frutas semanales',
      monto: 18_500,
      fecha: '2026-09-01',
      estado: 'pendiente',
    },
  ])

  const reviewItems = ref<ReviewItem[]>([
    {
      id: '1',
      type: 'stock_bajo',
      title: 'Stock bajo de Campari',
      description: 'Quedan 200 ml — mínimo requerido: 500 ml',
      action: 'Registrar compra',
      actionTo: '/compras',
    },
    {
      id: '2',
      type: 'costo_aumento',
      title: 'Aumento en Vermouth',
      description: 'El costo subió de $8.400 a $9.600 (+14,3%)',
      action: 'Ver recetas afectadas',
      actionTo: '/recetas',
    },
    {
      id: '3',
      type: 'merma_alta',
      title: 'Merma elevada en frutilla',
      description: 'Merma real: 18% — teórica: 10%',
    },
    {
      id: '4',
      type: 'gasto_inusual',
      title: 'Gasto inusual detectado',
      description: 'Publicidad este mes supera el promedio en 40%',
      action: 'Ver gastos',
      actionTo: '/gastos',
    },
  ])

  const expenseChartData = ref<ExpenseChartData>({
    labels: ['Ago 1', 'Ago 5', 'Ago 10', 'Ago 15', 'Ago 20', 'Ago 25'],
    datasets: [
      {
        label: 'Bebidas',
        data: [85_000, 120_000, 45_000, 95_000, 130_000, 60_000],
        borderColor: '#5483B3',
        backgroundColor: 'rgba(84, 131, 179, 0.1)',
      },
      {
        label: 'Frutas',
        data: [24_000, 18_000, 32_000, 22_000, 28_000, 15_000],
        borderColor: '#7DA0CA',
        backgroundColor: 'rgba(125, 160, 202, 0.1)',
      },
      {
        label: 'Otros',
        data: [30_000, 15_000, 20_000, 45_000, 10_000, 35_000],
        borderColor: '#C1E8FF',
        backgroundColor: 'rgba(193, 232, 255, 0.1)',
      },
    ],
  })

  const timelineEvents = ref<TimelineEvent[]>([
    {
      id: '1',
      time: '09:00',
      title: 'Recepción de proveedor',
      description: 'Fruver del Sur — Frutas semanales',
      color: 'brand',
    },
    {
      id: '2',
      time: '11:00',
      title: 'Revisión de inventario',
      description: 'Verificar stock mínimo de insumos',
      color: 'vanilla',
    },
    {
      id: '3',
      time: '14:00',
      title: 'Producción Negroni',
      description: 'Lote #12 — 15 litros programados',
      color: 'success',
    },
    {
      id: '4',
      time: '16:30',
      title: 'Cierre de caja',
      description: 'Conciliación diaria de ventas',
      color: 'sand',
    },
  ])

  return {
    metrics,
    operationalMetrics,
    insights,
    recentMovements,
    upcomingPayments,
    reviewItems,
    expenseChartData,
    timelineEvents,
  }
}
