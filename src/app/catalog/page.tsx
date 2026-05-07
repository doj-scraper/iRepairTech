import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export const dynamic = 'force-dynamic';

export default async function CatalogPage() {
  const supabase = createClient();
  const { data: products } = await supabase
    .from('inventory_parts')
    .select('*')
    .eq('is_active', true)
    .order('name');

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container">
          <div className="mb-8">
            <h1 className="mb-2 text-4xl font-display font-bold">Parts Catalog</h1>
            <p className="text-muted-foreground">Browse our wholesale inventory</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products?.map((product) => (
              <div
                key={product.id}
                className="group border border-border bg-card p-6 shadow-card transition-smooth hover:shadow-elegant"
              >
                <div className="relative mb-4 aspect-square overflow-hidden bg-secondary/30">
                  <Image
                    src={product.image_url || '/placeholder.png'}
                    alt={product.name}
                    fill
                    className="object-contain transition-transform group-hover:scale-105"
                  />
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h3 className="font-display font-semibold text-lg">{product.name}</h3>
                    <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        ${(product.price_cents / 100).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        MOQ: {product.moq} units
                      </div>
                    </div>
                    
                    <Badge variant={product.stock_count > 50 ? "default" : "secondary"}>
                      {product.stock_count > 0 ? `${product.stock_count} in stock` : 'Out of stock'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(!products || products.length === 0) && (
            <div className="py-12 text-center text-muted-foreground">
              No products available at this time.
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
