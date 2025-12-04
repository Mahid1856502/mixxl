import React, { useState } from "react";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Star } from "lucide-react";
import ProductCard from "@/components/artist/store/ProductCard";
import { Button } from "@/components/ui/button";

const ProductDetail = () => {
  const [match, params] = useRoute("/store/:id");
  const { id } = params ?? {};

  const products = [
    {
      id: "1",
      image:
        "https://images.pexels.com/photos/4065905/pexels-photo-4065905.jpeg",
      title: "Ceramic Coffee Mug",
      price: "19.99",
      description:
        "This ceramic mug delivers a solid, no-nonsense feel that holds up to everyday use. The glossy finish gives it a clean, polished look without trying too hard. Its balanced weight keeps each sip steady, and the insulation holds heat well enough for a long coffee session. Durable and scratch-resistant, it stands up to repeated washes without losing its charm. Suitable for any workspace or kitchen without clashing with anything around it.",
      fullDescription:
        "This ceramic coffee mug is crafted from premium clay and kiln-fired for maximum durability. Its smooth exterior glaze prevents cracking while the ergonomic handle ensures a comfortable grip.",
      category: { label: "Cups", value: "cups" },
      variants: [
        { label: "White", value: "white" },
        { label: "Black", value: "black" },
        { label: "Matte Brown", value: "brown" },
      ],
      images: [
        "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?auto=format&fit=crop&w=800&q=80",
        "https://images.pexels.com/photos/4065905/pexels-photo-4065905.jpeg",
        "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80",
      ],
      reviews: [
        {
          user: "Sarah K.",
          rating: 5,
          comment:
            "Beautiful mug! The quality is outstanding and it arrived quickly.",
        },
        {
          user: "Daniel R.",
          rating: 4,
          comment:
            "Great design. Wish it was slightly bigger, but still love it!",
        },
      ],
    },
  ];

  const relevantProducts = [
    {
      image: "https://images.pexels.com/photos/734983/pexels-photo-734983.jpeg",
      title: "Ceramic Coffee Mug",
      price: "19.99",
      description:
        "A high-quality ceramic mug perfect for your morning coffee.",
      category: { label: "Cups", value: "cups" },
    },
    {
      image:
        "https://images.pexels.com/photos/2560894/pexels-photo-2560894.jpeg",
      title: "Graphic T-Shirt",
      price: "24.99",
      description: "Soft cotton T-shirt with a stylish graphic design.",
      category: { label: "T Shirts", value: "tshirts" },
    },
    {
      image:
        "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=800&q=80",
      title: "Classic Hoodie",
      price: "49.99",
      description: "Warm and comfortable hoodie for everyday wear.",
      category: { label: "Hoodies", value: "hoodies" },
    },
    {
      image:
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
      title: "Vinyl Record",
      price: "34.99",
      description:
        "Limited edition vinyl record for collectors and music lovers.",
      category: { label: "CDs & Vinyl", value: "cdsvinyl" },
    },
  ];

  const product = products.find((p) => p.id === id) || products[0];
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants ? product.variants[0].value : ""
  );
  const [activeImage, setActiveImage] = useState(product.image);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const displayedReviews = showAllReviews
    ? product.reviews
    : product.reviews?.slice(0, 2);

  return (
    <div className="px-4 md:px-10 lg:px-20 py-12 max-w-7xl mx-auto">
      {/* Back */}
      <Link href="/store">
        <Button className="mb-8 text-sm">
          <ArrowLeft /> Back to Store
        </Button>
      </Link>

      {/* PRODUCT TOP SECTION — IMAGES LEFT, DETAILS RIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
        {/* LEFT: IMAGE GALLERY */}
        <div>
          <div className="rounded-2xl overflow-hidden shadow-md bg-white w-full">
            <img
              src={activeImage}
              alt={product.title}
              className="w-full h-[470px] object-cover"
            />
          </div>

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

        {/* RIGHT: DETAILS + CTA */}
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-semibold tracking-tight">
            {product.title}
          </h1>
          <p className="text-3xl font-bold">${product.price}</p>
          <p className="text-gray-400 text-lg leading-relaxed">
            {product.description}
          </p>

          {/* VARIANTS */}
          {product.variants && (
            <div>
              <p className="font-semibold mb-2">Variants</p>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((variant) => (
                  <Button
                    key={variant.value}
                    onClick={() => setSelectedVariant(variant.value)}
                    className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                      selectedVariant === variant.value
                        ? "bg-white/10 hover:bg-white/10 border-white"
                        : "bg-black text-white"
                    }`}
                  >
                    {variant.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-4 mt-4">
            <Button className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-900 font-medium shadow">
              Add to Cart
            </Button>
            <Button className="border border-black px-6 py-3 rounded-xl mixxl-gradient font-medium">
              Buy Now
            </Button>
          </div>
        </div>
      </div>

      {/* REVIEWS — GRID STRUCTURE */}
      <div className="mt-20">
        <h2 className="text-3xl font-bold mb-6">Customer Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {displayedReviews?.map((review, idx) => (
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

        {/* SHOW MORE */}
        {product.reviews && product.reviews.length > 2 && (
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
