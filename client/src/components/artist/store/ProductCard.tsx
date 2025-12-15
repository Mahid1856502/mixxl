import { ArrowUpRight, ShoppingCart } from "lucide-react";
import React from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Product, ProductVariant } from "@shared/product.type";
import { useCart } from "@/provider/cart-provider";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
  defaultVariant: ProductVariant;
}

const ProductCard = ({ product, defaultVariant }: ProductCardProps) => {
  const [location] = useLocation();
  const { add } = useCart();

  return (
    <Link href={`${location}/product/${product.id}`}>
      <motion.div
        className="relative rounded-2xl shadow overflow-hidden group cursor-pointer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <img
          src={product?.images?.[0]}
          alt={product?.title}
          className="aspect-square object-cover"
          loading="lazy"
        />

        {/* Title with ellipsis */}
        <div
          className="absolute top-2 left-2 z-10 bg-black bg-opacity-50 text-white px-3 py-1 
        rounded-full text-sm font-medium max-w-[70%] overflow-hidden 
        text-ellipsis whitespace-nowrap"
        >
          {product?.title}
        </div>
        {/* Overlay */}
        <motion.div
          className="absolute inset-0 z-0 opacity-100 md:opacity-0 
    group-hover:opacity-100 flex flex-col justify-end items-start 
    p-4 gap-2 bg-gradient-to-t from-black/80 to-transparent transition-opacity"
          transition={{ duration: 0.3 }}
        >
          {/* Description with ellipsis */}
          <div className="text-sm text-white/90 mb-2 line-clamp-2">
            {product?.description}
          </div>

          <div className="flex justify-between w-full items-center">
            <Button
              className="bg-black text-white px-5 py-2 rounded-full font-medium gap-3 hover:bg-white hover:text-black transition "
              onClick={(e) => {
                e.stopPropagation(); // prevents link navigation
                e.preventDefault(); // ensures browser doesn’t follow the link

                add(product, defaultVariant, 1);
              }}
            >
              Add to Cart <ShoppingCart className="inline-block w-4 h-4" />
            </Button>

            <div className="bg-black text-white px-3 py-1 rounded-full font-medium">
              ${defaultVariant?.price}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;
