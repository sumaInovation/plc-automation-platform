import { ImageResponse } from 'next/og'
import connectDB from '@/lib/db'
import Product from '@/models/Product'

export const runtime = 'edge'
export const alt = 'Suma Automation Product'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }) {
  try {
    await connectDB()
    const product = await Product.findOne({ slug: params.slug }).lean()

    if (!product) {
      return new ImageResponse(
        <div style={{ display: 'flex', fontSize: 40, background: '#131921', color: 'white', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
          SUMA AUTOMATION
        </div>,
        {...size }
      )
    }

    const price = Number(product.price || 0).toLocaleString()
    const img = product.images?.[0] || 'https://sumaautomation.lk/no-image.png'

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            background: '#131921',
            color: 'white',
          }}
        >
          {/* Left Image */}
          <div style={{ width: '50%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} style={{ width: '500px', height: '500px', objectFit: 'contain' }} />
          </div>

          {/* Right */}
          <div style={{ width: '50%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 50px' }}>
            <div style={{ fontSize: 20, color: '#febd69', fontWeight: 700, letterSpacing: 2 }}>SUMA AUTOMATION.LK</div>
            <div style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.1, marginTop: 20, display: 'flex' }}>
              {product.name.length > 80? product.name.slice(0, 80) + '...' : product.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 30, gap: 12 }}>
              <span style={{ fontSize: 28, color: '#fff' }}>LKR</span>
              <span style={{ fontSize: 70, fontWeight: 900, color: '#febd69' }}>{price}</span>
            </div>
            <div style={{ marginTop: 15, fontSize: 20, color: product.stock_qty > 0? '#22c55e' : '#ef4444', display: 'flex' }}>
              {product.stock_qty > 0? '● In Stock - Island Wide Delivery' : '● Out of Stock'}
            </div>
          </div>
        </div>
      ),
      {...size }
    )
  } catch (e) {
    return new ImageResponse(
      <div style={{ display: 'flex', fontSize: 40, background: '#131921', color: 'white', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        SUMA AUTOMATION
      </div>,
      {...size }
    )
  }
}