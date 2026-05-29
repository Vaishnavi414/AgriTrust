import {
  Cloud,
  CloudLightning,
  CloudRain,
  Droplets,
  Gauge,
  Leaf,
  LocateFixed,
  RefreshCw,
  Search,
  SendHorizonal,
  Sun,
  ThermometerSun,
  Wind,
} from 'lucide-react'
import type { IconKey } from '../../types'

export function AppIcon(props: { name: IconKey; className?: string }) {
  const cls = props.className ?? 'h-5 w-5'
  switch (props.name) {
    case 'sun':
      return <Sun className={cls} />
    case 'cloud':
      return <Cloud className={cls} />
    case 'cloud-rain':
      return <CloudRain className={cls} />
    case 'cloud-lightning':
      return <CloudLightning className={cls} />
    case 'wind':
      return <Wind className={cls} />
    case 'haze':
      return <Cloud className={cls} />
    case 'thermometer-sun':
      return <ThermometerSun className={cls} />
  }
}

export function SearchIcon(props: { className?: string }) {
  return <Search className={props.className ?? 'h-4 w-4'} />
}

export function GpsIcon(props: { className?: string }) {
  return <LocateFixed className={props.className ?? 'h-4 w-4'} />
}

export function RefreshIcon(props: { className?: string }) {
  return <RefreshCw className={props.className ?? 'h-4 w-4'} />
}

export function SendIcon(props: { className?: string }) {
  return <SendHorizonal className={props.className ?? 'h-4 w-4'} />
}

export function LeafIcon(props: { className?: string }) {
  return <Leaf className={props.className ?? 'h-4 w-4'} />
}

export function HumidityIcon(props: { className?: string }) {
  return <Droplets className={props.className ?? 'h-4 w-4'} />
}

export function WindMetricIcon(props: { className?: string }) {
  return <Wind className={props.className ?? 'h-4 w-4'} />
}

export function PressureIcon(props: { className?: string }) {
  return <Gauge className={props.className ?? 'h-4 w-4'} />
}

