import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">iRepair</h1>
          <p className="text-xl text-muted mb-8">
            Quality phone repair parts and professional services
          </p>
          <Link
            href="/shop/catalog"
            className="inline-block bg-primary text-white px-8 py-3 rounded font-semibold hover:opacity-90"
          >
            Shop Now
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">Quality Parts</h3>
            <p className="text-muted">
              Genuine replacement parts for all major phone brands
            </p>
          </div>

          <div className="border rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">🔧</div>
            <h3 className="text-xl font-semibold mb-2">Expert Services</h3>
            <p className="text-muted">
              Professional repair services from certified technicians
            </p>
          </div>

          <div className="border rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Fast Shipping</h3>
            <p className="text-muted">
              Quick delivery to get your device back in action
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

