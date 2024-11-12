import type { NextConfig } from 'next'
import { withPigment } from '@pigment-css/nextjs-plugin'
import { theme } from './app/theme'


const nextConfig: NextConfig = {
  reactStrictMode: false, // Because of Swipeable Views
  output: 'export',       // Static pages
}

const pigmentConfig = {
  transformLibraries: ['@mui/material'],
  theme,
}

export default withPigment(nextConfig, pigmentConfig)
