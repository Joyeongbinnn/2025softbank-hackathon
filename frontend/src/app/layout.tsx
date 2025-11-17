// src/app/layout.tsx
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'yoitang - 스타트업을 위한 자동 배포 플랫폼',
  description:
    'Git 주소와 AWS 정보만 넣으면, EC2·Docker·NGINX·HTTPS까지 자동 구성해주는 스타트업 전용 배포 서비스',
  openGraph: {
    title: 'yoitang - 스타트업을 위한 자동 배포 플랫폼',
    description: '배포 버튼 한 번으로, 인프라까지 자동으로',
    type: 'website',
    images: ['https://www.yoitang.cloud/og-yoitang.png'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://www.yoitang.cloud/og-yoitang.png'],
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
