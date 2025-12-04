import { ArrowUpRight, ShoppingCart } from "lucide-react";
import React from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";

interface ProductCardProps {
  image: string;
  title: string;
  price: string | number;
  description: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  image,
  title,
  price,
  description,
}) => {
  const [location, setLocation] = useLocation();
  return (
    <motion.div
      className="relative rounded-2xl shadow overflow-hidden group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <img src={image} alt={title} className="aspect-square object-cover" />

      {/* Title with ellipsis */}
      <div
        className="absolute top-2 left-2 z-10 bg-black bg-opacity-50 text-white px-3 py-1 
        rounded-full text-sm font-medium max-w-[70%] overflow-hidden 
        text-ellipsis whitespace-nowrap"
      >
        {title}
      </div>

      {/* Top-right arrow */}
      <Link
        href={`${location}/product/${title.replace(/\s+/g, "-").toLowerCase()}`}
        className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm font-medium"
      >
        <ArrowUpRight />
      </Link>

      {/* Overlay */}
      <motion.div
        className="absolute inset-0 z-0 opacity-100 md:opacity-0 
          group-hover:opacity-100 flex flex-col justify-end items-start 
          p-4 gap-2 md:bg-black/50 transition-opacity"
        transition={{ duration: 0.3 }}
      >
        {/* Description with ellipsis */}
        <div className="text-sm text-white/90 mb-2 line-clamp-2">
          {description}
        </div>

        <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full font-medium">
          ${price}
        </div>

        <button className="bg-black text-white px-5 py-2 rounded-full gap-3">
          Add to Cart <ShoppingCart className="inline-block w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  );
};

export default ProductCard;
