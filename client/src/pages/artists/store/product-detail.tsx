import React, { useState, useEffect } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, Star } from "lucide-react";
import ProductCard from "@/components/artist/store/ProductCard";
import { Button } from "@/components/ui/button";
import { useProduct } from "@/api/hooks/products/useProducts";

const ProductDetail = () => {
  const { username, productId } = useParams();
  const { data: product, isLoading, error } = useProduct(productId);

  // fake reviews
  const fakeReviews = [
    {
      user: "Sarah K.",
      rating: 5,
      comment:
        "Beautiful mug! The quality is outstanding and it arrived quickly.",
    },
    {
      user: "Daniel R.",
      rating: 4,
      comment: "Great design. Wish it was slightly bigger, but still love it!",
    },
    {
      user: "Mona L.",
      rating: 5,
      comment: "Exactly as described. Definitely buying another one.",
    },
  ];

  // fake relevant products
  const relevantProducts = [
    {
      image: "https://images.pexels.com/photos/734983/pexels-photo-734983.jpeg",
      title: "Ceramic Coffee Mug",
      price: "19.99",
      description:
        "A high-quality ceramic mug perfect for your morning coffee.",
    },
    {
      image:
        "https://images.pexels.com/photos/2560894/pexels-photo-2560894.jpeg",
      title: "Graphic T-Shirt",
      price: "24.99",
      description: "Soft cotton T-shirt with a stylish graphic design.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=800&q=80",
      title: "Classic Hoodie",
      price: "49.99",
      description: "Warm and comfortable hoodie for everyday wear.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
      title: "Vinyl Record",
      price: "34.99",
      description:
        "Limited edition vinyl record for collectors and music lovers.",
    },
  ];

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null
  );
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    if (!product) return;
    if (!activeImage) {
      setActiveImage(product.images?.[0] || null);
    }
    if (!selectedVariantId && product.variants.length > 0) {
      setSelectedVariantId(product.variants[0].id);
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-lg font-medium">
        Loading product...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-20 text-center text-lg font-medium text-red-500">
        Failed to load product.
      </div>
    );
  }

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) ||
    product.variants[0];

  const price = selectedVariant
    ? (selectedVariant.priceCents / 100).toFixed(2)
    : "0.00";

  const displayedReviews = showAllReviews
    ? fakeReviews
    : fakeReviews.slice(0, 2);

  return (
    <div className="px-4 md:px-10 lg:px-20 py-12 max-w-7xl mx-auto">
      {/* BACK */}
      {/* <Link href={`/store/${username}`}>
        <Button className="flex items-center gap-2 bg-gray-950 text-gray-200 hover:bg-gray-900/50 border-2 border-gray-500 transition">
          <ArrowLeft /> Back to Store
        </Button>
      </Link> */}

      {/* PRODUCT SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
        {/* LEFT — IMAGES */}
        <div>
          <div className="rounded-2xl overflow-hidden shadow-md bg-white w-full">
            <img
              src={
                activeImage ||
                product.images?.[0] ||
                "https://via.placeholder.com/600x600"
              }
              alt={product.title}
              className="w-full h-[470px] object-cover"
            />
          </div>

          {/* thumbnails */}
          <div className="flex gap-4 mt-5 overflow-x-auto pb-2">
            {product.images?.map((img, idx) => (
              <img
                key={idx}
                src={img}
                onClick={() => setActiveImage(img)}
                alt="thumbnail"
                className={`w-24 h-24 rounded-xl object-cover cursor-pointer border transition-all duration-200 shadow-sm ${
                  activeImage === img
                    ? "opacity-60 border-black scale-95"
                    : "hover:opacity-75"
                }`}
              />
            ))}
          </div>
        </div>

        {/* RIGHT — DETAILS */}
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-semibold tracking-tight">
            {product.title}
          </h1>

          {selectedVariant && <p className="text-3xl font-bold">${price}</p>}

          <p className="text-gray-400 text-lg leading-relaxed">
            {product.description}
          </p>

          {/* VARIANTS */}
          {product.variants.length > 0 && (
            <div>
              <p className="font-semibold mb-2">Variants</p>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((variant) => (
                  <Button
                    key={variant.id}
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                      selectedVariant?.id === variant.id
                        ? "bg-white/10 hover:bg-white/10 border-white"
                        : "bg-black text-white"
                    }`}
                  >
                    {variant.title}
                  </Button>
                ))}
              </div>

              {/* STOCK */}
              {selectedVariant && (
                <p className="font-semibold mt-4">
                  In stock: {selectedVariant.stockQuantity}
                </p>
              )}
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-4 mt-4">
            <Button className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-900 font-medium shadow">
              Add to Cart
            </Button>
            <Button className="border border-black px-6 py-3 rounded-xl font-medium">
              Buy Now
            </Button>
          </div>
        </div>
      </div>

      {/* REVIEWS */}
      <div className="mt-20">
        <h2 className="text-3xl font-bold mb-6">Customer Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {displayedReviews.map((review, idx) => (
            <div
              key={idx}
              className="border p-5 rounded-xl shadow-sm hover:shadow-md transition bg-gray-900"
            >
              <div className="flex items-center gap-2 mb-2">
                {[...Array(review.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill="gold"
                    className="text-yellow-500"
                  />
                ))}
                <span className="text-sm text-white">({review.rating}/5)</span>
              </div>
              <p className="font-semibold text-white mb-1">{review.user}</p>
              <p className="text-white text-sm leading-relaxed">
                {review.comment}
              </p>
            </div>
          ))}
        </div>

        {fakeReviews.length > 2 && (
          <div className="mt-6 text-center">
            <Button
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="px-6 py-2 rounded-lg border hover:bg-gray-100 transition font-medium"
            >
              {showAllReviews ? "Show Less" : "Show More"}
            </Button>
          </div>
        )}
      </div>

      {/* RELEVANT PRODUCTS */}
      <div className="mt-24">
        <h2 className="text-3xl font-bold mb-8">Relevant Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {relevantProducts.map((p, idx) => (
            <ProductCard
              key={idx}
              id={String(idx)}
              image={p.image}
              title={p.title}
              price={p.price}
              description={p.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
